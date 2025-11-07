import { InstanceBase, Regex, runEntrypoint } from '@companion-module/base'
import { getActions } from './actions.js'
import { getPresets } from './presets.js'
import { getVariables, updateSourceVariables } from './variables.js'
import { getFeedbacks } from './feedbacks.js'

import fetch from 'node-fetch'

class MReplayInstance extends InstanceBase {
	constructor(internal) {
		super(internal)

		this.updateSourceVariables = updateSourceVariables
	}

	async init(config) {
		if (config) {
			this.config = config
		}

		this.inputs = {}
		this.inputList = []
		this.outputs = {}
		this.outputList = []
		this.markers = {}
		this.markerList = []
		this.playlists = {}
		this.playlistList = []
		this.status = {}
		this.info = {}
		this.errorCount = 0

		this.updateStatus('connecting')
		this.errorCount = 0
		this.timeOut = 0
		this.fastPollingInterval = 5000
		this.slowPollingInterval = 60000
		this.awaitingConnection = true

		this.password = this.config?.password !== '' ? `?password=${this.config?.password}` : ''
		// Load configuration data immediately on init
		this.sendCommand('inputs', 'GET')
		this.sendCommand('outputs', 'GET')
		this.sendCommand('playlists', 'GET')
		this.sendCommand('info', 'GET')

		this.initActions()
		this.initVariables()
		this.initFeedbacks()
		this.initPresets()

		this.setupPolling()
	}

	async destroy() {
		this.inputs = {}
		this.inputList = []
		this.outputs = {}
		this.outputList = []
		this.markers = {}
		this.markerList = []
		this.playlists = {}
		this.playlistList = []
		this.status = {}
		this.info = {}
		this.stopPolling()
	}

	getConfigFields() {
		return [
			{
				type: 'textinput',
				id: 'host',
				label: 'Target IP',
				default: '127.0.0.1',
				width: 6,
			},
			{
				type: 'textinput',
				id: 'port',
				label: 'Port',
				default: 8090,
				width: 2,
				regex: Regex.PORT,
			},
			{
				type: 'textinput',
				id: 'password',
				label: 'Password (optional)',
				default: '',
				width: 6,
			},
		]
	}

	async configUpdated(config) {
		let resetConnection = false

		if (this.config.host != config.host) {
			resetConnection = true
		}
		if (this.config.port != config.port) {
			resetConnection = true
		}
		if (this.config.password != config.password) {
			this.password = config.password !== '' ? `?password=${this.config.password}` : ''
			resetConnection = true
		}
		this.config = config

		if (resetConnection === true) {
			this.updateStatus('connecting')
			this.init()
		}
	}

	initVariables() {
		const variables = getVariables.bind(this)()
		this.setVariableDefinitions(variables)
	}

	initFeedbacks() {
		const feedbacks = getFeedbacks.bind(this)()
		this.setFeedbackDefinitions(feedbacks)
	}

	initPresets() {
		const presets = getPresets.bind(this)()
		this.setPresetDefinitions(presets)
	}

	initActions() {
		const actions = getActions.bind(this)()
		this.setActionDefinitions(actions)
	}

	setupPolling() {
		this.stopPolling()
		// Fast poll: status, markers, and outputs (every 1 second when connected)
		this.poll = setInterval(() => {
			this.sendCommand('markers', 'GET')
			this.sendCommand('outputs', 'GET')
			this.sendCommand('status', 'GET')
		}, this.fastPollingInterval)

		// Slow poll: inputs, playlists, and info (every 60 seconds)
		this.slowPoll = setInterval(() => {
			this.sendCommand('inputs', 'GET')
			this.sendCommand('playlists', 'GET')
			this.sendCommand('info', 'GET')
		}, this.slowPollingInterval)
	}

	stopPolling() {
		if (this.poll) {
			clearInterval(this.poll)
			this.poll = null
		}
		if (this.slowPoll) {
			clearInterval(this.slowPoll)
			this.slowPoll = null
		}
	}

	sendCommand(cmd, type, params) {
		let url = `http://${this.config.host}:${this.config.port}/${cmd}${this.password}`
		let options = {}
		if (type == 'PUT' || type == 'POST') {
			options = {
				method: type,
				body: params != undefined ? JSON.stringify(params) : null,
				headers: { 'Content-Type': 'application/json' },
			}
		} else {
			options = {
				method: type,
				headers: { 'Content-Type': 'application/json' },
			}
		}

		fetch(url, options)
			.then((res) => {
				this.processStatus(res)
				if (res.status == 200) {
					return res.json()
				}
			})
			.then((json) => {
				let data = json
				if (data?.success) {
					//ignore success messages that do not have data
				} else if (data?.success === false) {
					this.log('warn', `Command failed: ${data.error}`)
				} else {
					this.processData(decodeURI(url), data)
				}
			})
			.catch((err) => {
				let errorText = String(err)
				if (errorText.match('ECONNREFUSED')) {
					if (this.errorCount < 1) {
						this.updateStatus('connection_failure')
						this.log('error', 'Unable to connect to M|Replay')
					}
					if (this.errorCount > 60 && this.fastPollingInterval == 1000) {
						this.fastPollingInterval = 5000
						this.setupPolling()
					}
					this.errorCount++
				} else if (errorText.match('ETIMEDOUT') || errorText.match('ENOTFOUND')) {
					if (this.timeOut < 1) {
						this.updateStatus('connection_failure')
						this.log('error', 'Unable to connect to M|Replay')
						this.timeOut++
					}
				}
			})
	}

	processStatus(result) {
		if (result.status !== undefined) {
			switch (result.status) {
				case 200: // OK
					if (this.errorCount > 0 || this.awaitingConnection == true) {
						this.errorCount = 0
						this.awaitingConnection = false
						this.fastPollingInterval = 1000
						this.setupPolling()
						this.updateStatus('ok')
						this.log('info', 'Connected to M|Replay')
					}
					break
				case 201: // Created
					this.updateStatus('ok')
					this.log('debug', result.statusText)
					break
				case 202: // Accepted
					this.updateStatus('ok')
					this.log('debug', result.statusText)
					break
				case 400: // Bad Request
					this.log('warn', result.statusText)
					break
				case 401: // Authentication Failed
					this.updateStatus('bad_config')
					if (this.errorCount == 0) {
						this.log('error', 'Authentication failed. Please check your password settings')
					}
					this.errorCount++
					break
				case 404: // Not found
					this.log('warn', result.statusText)
					break
				case 422: // Unprocessable entity
					this.log('warn', result.statusText)
					break
				default:
					// Unexpected response
					this.updateStatus('unknown_error')
					this.log('error', result.statusText)
					break
			}
		} else {
			this.log('warn', 'Unable to determine status')
		}
		if (this.errorCount > 60 && this.fastPollingInterval == 1000) {
			this.fastPollingInterval = 5000
			this.setupPolling()
		}
	}

	processData(cmd, data) {
		if (cmd.match('/inputs') && data && Array.isArray(data)) {
			let originalInputCount = Object.keys(this.inputs).length
			let newInputCount = data.length
			this.inputs = {}
			this.inputList = []

			for (let input of data) {
				if (input.unique_id) {
					this.inputs[input.unique_id] = input
					this.inputList.push({
						id: input.unique_id,
						label: input.name || input.unique_id,
					})
				}
			}
			this.checkFeedbacks()
			this.updateSourceVariables()

			if (originalInputCount != newInputCount) {
				this.initActions()
				this.initFeedbacks()
				this.initVariables()
				this.initPresets()
			}
		} else if (cmd.match('/outputs') && data && Array.isArray(data)) {
			let originalOutputCount = Object.keys(this.outputs).length
			let newOutputCount = data.length

			this.outputs = {}
			this.outputList = []

			for (let output of data) {
				if (output.unique_id) {
					this.outputs[output.unique_id] = output
					this.outputList.push({
						id: output.unique_id,
						label: output.name || output.unique_id,
					})
				}
			}

			this.checkFeedbacks()
			this.updateSourceVariables()

			if (originalOutputCount != newOutputCount) {
				this.initActions()
				this.initFeedbacks()
				this.initVariables()
				this.initPresets()
			}
		} else if (cmd.match('/markers') && data && Array.isArray(data)) {
			let originalMarkerCount = Object.keys(this.markers).length
			let newMarkerCount = data.length

			this.markers = {}
			this.markerList = []

			for (let marker of data) {
				if (marker.unique_id) {
					this.markers[marker.unique_id] = marker
					this.markerList.push({
						id: marker.unique_id,
						label: marker.name || marker.unique_id,
					})
				}
			}

			this.checkFeedbacks()
			this.updateSourceVariables()

			if (originalMarkerCount != newMarkerCount) {
				this.initActions()
				this.initFeedbacks()
				this.initVariables()
				this.initPresets()
			}
		} else if (cmd.match('/playlists') && data && Array.isArray(data)) {
			let originalPlaylistCount = Object.keys(this.playlists).length
			let newPlaylistCount = data.length

			this.playlists = {}
			this.playlistList = []

			for (let playlist of data) {
				if (playlist.unique_id) {
					this.playlists[playlist.unique_id] = playlist
					this.playlistList.push({
						id: playlist.unique_id,
						label: playlist.name || playlist.unique_id,
					})
				}
			}

			this.checkFeedbacks()

			if (originalPlaylistCount != newPlaylistCount) {
				this.initActions()
				this.initFeedbacks()
				this.initVariables()
				this.initPresets()
			}
		} else if (cmd.match('/status') && data) {
			this.status = data
			this.checkFeedbacks()
			this.updateSourceVariables()
		} else if (cmd.match('/info') && data) {
			this.info = data
			this.updateSourceVariables()
		}
	}
}

runEntrypoint(MReplayInstance, [])
