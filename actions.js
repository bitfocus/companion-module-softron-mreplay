export function getActions() {
	let actions = {}

	// Sort lists and set defaults
	if (this.inputList[0]) {
		this.inputList.sort((a, b) =>
			a.label.localeCompare(b.label, undefined, {
				numeric: true,
			}),
		)
		this.inputListDefault = this.inputList[0].id
	} else {
		this.inputListDefault = ''
	}

	if (this.outputList[0]) {
		this.outputList.sort((a, b) =>
			a.label.localeCompare(b.label, undefined, {
				numeric: true,
			}),
		)
		this.outputListDefault = this.outputList[0].id
	} else {
		this.outputListDefault = ''
	}

	if (this.playlistList[0]) {
		this.playlistList.sort((a, b) =>
			a.label.localeCompare(b.label, undefined, {
				numeric: true,
			}),
		)
		this.playlistListDefault = this.playlistList[0].id
	} else {
		this.playlistListDefault = ''
	}

	let cmd
	let type
	let params

	// Output Selection
	actions['selectOutput'] = {
		name: 'Select Output',
		options: [
			{
				type: 'dropdown',
				label: 'Output',
				id: 'output',
				default: this.outputListDefault,
				choices: this.outputList,
				required: true,
			},
		],
		callback: (action) => {
			if (action.options.output !== null) {
				cmd = `outputs/${action.options.output}`
				type = 'PUT'
				params = {
					selected: true,
				}

				this.sendCommand(cmd, type, params)

				// Immediately refresh outputs for instant feedback
				setTimeout(() => {
					this.sendCommand('outputs', 'GET')
				}, 100)
			}
		},
	}

	// Assign Input to Output
	actions['assignInputToOutput'] = {
		name: 'Assign Input to Output',
		options: [
			{
				type: 'dropdown',
				label: 'Output',
				id: 'output',
				default: this.outputListDefault,
				choices: this.outputList,
				required: true,
			},
			{
				type: 'dropdown',
				label: 'Input',
				id: 'input',
				default: this.inputListDefault,
				choices: this.inputList,
				required: true,
			},
		],
		callback: (action) => {
			if (action.options.output !== null && action.options.input !== null) {
				cmd = `outputs/${action.options.output}`
				type = 'PUT'
				params = {
					input_unique_id: action.options.input,
				}

				this.sendCommand(cmd, type, params)
			}
		},
	}

	// Create Marker
	actions['createMarker'] = {
		name: 'Create Marker',
		options: [
			{
				type: 'textinput',
				useVariables: true,
				label: 'Marker Name',
				id: 'markerName',
				default: 'New Marker',
				required: true,
			},
			{
				type: 'dropdown',
				label: 'Reference',
				id: 'reference',
				default: 'live',
				choices: [
					{ id: 'live', label: 'Live' },
					{ id: 'playhead', label: 'Playhead' },
					{ id: 'absolute', label: 'Absolute' },
				],
				required: true,
			},
			{
				type: 'textinput',
				label: 'Time/Offset (timecode or seconds)',
				id: 'time',
				default: '0',
				isVisible: (options) => options.reference !== undefined,
			},
			{
				type: 'dropdown',
				label: 'Input',
				id: 'input',
				default: this.inputListDefault,
				choices: this.inputList,
			},
		],
		callback: async (action) => {
			const markerName = await this.parseVariablesInString(action.options.markerName)
			cmd = `markers`
			type = 'POST'
			params = {
				name: markerName.length ? markerName : 'New Marker',
				reference: action.options.reference,
			}

			// Add time or offset based on reference type
			if (action.options.reference === 'absolute') {
				params.time = action.options.time || '0'
			} else {
				params.offset = action.options.time || '0'
			}

			if (action.options.input) {
				params.input_unique_id = action.options.input
			}

			this.sendCommand(cmd, type, params)
		},
	}

	// Create Clip
	actions['createClip'] = {
		name: 'Create Clip',
		options: [
			{
				type: 'textinput',
				useVariables: true,
				label: 'Clip Name',
				id: 'clipName',
				default: 'New Clip',
				required: true,
			},
			{
				type: 'dropdown',
				label: 'Clip Mode',
				id: 'clipMode',
				default: 'in_duration',
				choices: [
					{ id: 'in_duration', label: 'In Point + Duration' },
					{ id: 'in_out', label: 'In Point + Out Point' },
					{ id: 'out_duration', label: 'Out Point + Duration' },
				],
				required: true,
			},
			{
				type: 'dropdown',
				label: 'In Point Reference',
				id: 'referenceInPoint',
				default: 'live',
				choices: [
					{ id: 'live', label: 'Live' },
					{ id: 'playhead', label: 'Playhead' },
					{ id: 'absolute', label: 'Absolute' },
					{ id: 'in_point', label: 'In Point' },
					{ id: 'out_point', label: 'Out Point' },
				],
				isVisible: (options) => options.clipMode === 'in_duration' || options.clipMode === 'in_out',
			},
			{
				type: 'textinput',
				label: 'In Point (timecode or seconds)',
				id: 'inPoint',
				default: '0',
				isVisible: (options) => options.clipMode === 'in_duration' || options.clipMode === 'in_out',
			},
			{
				type: 'dropdown',
				label: 'Out Point Reference',
				id: 'referenceOutPoint',
				default: 'live',
				choices: [
					{ id: 'live', label: 'Live' },
					{ id: 'playhead', label: 'Playhead' },
					{ id: 'absolute', label: 'Absolute' },
					{ id: 'in_point', label: 'In Point' },
					{ id: 'out_point', label: 'Out Point' },
				],
				isVisible: (options) => options.clipMode === 'in_out' || options.clipMode === 'out_duration',
			},
			{
				type: 'textinput',
				label: 'Out Point (timecode or seconds)',
				id: 'outPoint',
				default: '0',
				isVisible: (options) => options.clipMode === 'in_out' || options.clipMode === 'out_duration',
			},
			{
				type: 'textinput',
				label: 'Duration (timecode or seconds)',
				id: 'duration',
				default: '10',
				isVisible: (options) => options.clipMode === 'in_duration' || options.clipMode === 'out_duration',
			},
			{
				type: 'checkbox',
				label: 'Unique Name',
				id: 'uniqueName',
				default: false,
			},
			{
				type: 'dropdown',
				label: 'Input',
				id: 'input',
				default: this.inputListDefault,
				choices: this.inputList,
			},
		],
		callback: async (action) => {
			const clipName = await this.parseVariablesInString(action.options.clipName)
			cmd = `clips`
			type = 'POST'
			params = {
				name: clipName.length ? clipName : 'New Clip',
				unique_name: action.options.uniqueName,
			}

			// Add parameters based on clip mode
			if (action.options.clipMode === 'in_duration' || action.options.clipMode === 'in_out') {
				params.reference_in_point = action.options.referenceInPoint
				params.in_point = action.options.inPoint || '0'
			}

			if (action.options.clipMode === 'in_out' || action.options.clipMode === 'out_duration') {
				params.reference_out_point = action.options.referenceOutPoint
				params.out_point = action.options.outPoint || '0'
			}

			if (action.options.clipMode === 'in_duration' || action.options.clipMode === 'out_duration') {
				params.duration = action.options.duration || '10'
			}

			if (action.options.input) {
				params.input_unique_id = action.options.input
			}

			this.sendCommand(cmd, type, params)
		},
	}

	// Playback Rate
	actions['setPlaybackRate'] = {
		name: 'Set Playback Rate',
		options: [
			{
				type: 'number',
				label: 'Playback Rate',
				id: 'rate',
				default: 1,
				min: -32,
				max: 32,
				step: 0.01,
				range: true,
				tooltip:
					'Range: -32 to 32. Use decimals for speeds between -1 and 1 (e.g., 0.33, 0.5). 0 = stop, 1 = normal, -1 = reverse',
				required: true,
			},
		],
		callback: (action) => {
			let rate = action.options.rate
			// Clamp rate between -32 and 32
			if (rate < -32) rate = -32
			if (rate > 32) rate = 32

			cmd = `set_playback_rate?rate=${rate}`
			type = 'GET'
			this.sendCommand(cmd, type)
		},
	}

	// Go to Position
	actions['setPosition'] = {
		name: 'Go to Position',
		options: [
			{
				type: 'dropdown',
				label: 'Reference',
				id: 'reference',
				default: 'live',
				choices: [
					{ id: 'live', label: 'Live' },
					{ id: 'playhead', label: 'Playhead' },
					{ id: 'absolute', label: 'Absolute' },
					{ id: 'in_point', label: 'In Point' },
					{ id: 'out_point', label: 'Out Point' },
				],
				required: true,
			},
			{
				type: 'textinput',
				label: 'Position (timecode or seconds)',
				id: 'position',
				default: '0',
				tooltip: 'Use positive/negative numbers for offset, or timecode (e.g., 01:00:00:00)',
				required: true,
			},
		],
		callback: (action) => {
			// Encode timecode colons as %3A for URL
			let position = action.options.position.replace(/:/g, '%3A')
			cmd = `set_position?position=${position}&reference=${action.options.reference}`
			type = 'GET'
			this.sendCommand(cmd, type)
		},
	}

	// Playlist Controls
	actions['playlistPlay'] = {
		name: 'Playlist - Play',
		options: [
			{
				type: 'dropdown',
				label: 'Playlist',
				id: 'playlist',
				default: this.playlistListDefault,
				choices: this.playlistList,
				required: true,
			},
		],
		callback: (action) => {
			cmd = `playlists/${action.options.playlist}/play`
			type = 'GET'
			this.sendCommand(cmd, type)
		},
	}

	actions['playlistPause'] = {
		name: 'Playlist - Pause',
		options: [
			{
				type: 'dropdown',
				label: 'Playlist',
				id: 'playlist',
				default: this.playlistListDefault,
				choices: this.playlistList,
				required: true,
			},
		],
		callback: (action) => {
			cmd = `playlists/${action.options.playlist}/pause`
			type = 'GET'
			this.sendCommand(cmd, type)
		},
	}

	actions['playlistStop'] = {
		name: 'Playlist - Stop',
		options: [
			{
				type: 'dropdown',
				label: 'Playlist',
				id: 'playlist',
				default: this.playlistListDefault,
				choices: this.playlistList,
				required: true,
			},
		],
		callback: (action) => {
			cmd = `playlists/${action.options.playlist}/stop`
			type = 'GET'
			this.sendCommand(cmd, type)
		},
	}

	actions['playlistSkipPrevious'] = {
		name: 'Playlist - Skip Previous',
		options: [
			{
				type: 'dropdown',
				label: 'Playlist',
				id: 'playlist',
				default: this.playlistListDefault,
				choices: this.playlistList,
				required: true,
			},
		],
		callback: (action) => {
			cmd = `playlists/${action.options.playlist}/skip_previous`
			type = 'GET'
			this.sendCommand(cmd, type)
		},
	}

	actions['playlistSkipNext'] = {
		name: 'Playlist - Skip Next',
		options: [
			{
				type: 'dropdown',
				label: 'Playlist',
				id: 'playlist',
				default: this.playlistListDefault,
				choices: this.playlistList,
				required: true,
			},
		],
		callback: (action) => {
			cmd = `playlists/${action.options.playlist}/skip_next`
			type = 'GET'
			this.sendCommand(cmd, type)
		},
	}

	actions['playlistPlayItem'] = {
		name: 'Playlist - Play Specific Clip',
		options: [
			{
				type: 'dropdown',
				label: 'Playlist',
				id: 'playlist',
				default: this.playlistListDefault,
				choices: this.playlistList,
				required: true,
			},
			{
				type: 'textinput',
				label: 'Clip Index/ID/Name',
				id: 'item',
				default: '0',
				required: true,
			},
		],
		callback: (action) => {
			cmd = `playlists/${action.options.playlist}/items/${action.options.item}/play`
			type = 'GET'
			this.sendCommand(cmd, type)
		},
	}

	actions['playlistPauseItem'] = {
		name: 'Playlist - Pause Specific Clip',
		options: [
			{
				type: 'dropdown',
				label: 'Playlist',
				id: 'playlist',
				default: this.playlistListDefault,
				choices: this.playlistList,
				required: true,
			},
			{
				type: 'textinput',
				label: 'Clip Index/ID/Name',
				id: 'item',
				default: '0',
				required: true,
			},
		],
		callback: (action) => {
			cmd = `playlists/${action.options.playlist}/items/${action.options.item}/pause`
			type = 'GET'
			this.sendCommand(cmd, type)
		},
	}

	return actions
}
