import { combineRgb } from '@companion-module/base'

export function getPresets() {
	const ColorWhite = combineRgb(255, 255, 255)
	const ColorBlack = combineRgb(0, 0, 0)
	const ColorRed = combineRgb(200, 0, 0)
	const ColorGreen = combineRgb(0, 200, 0)
	const ColorBlue = combineRgb(0, 100, 200)
	const ColorOrange = combineRgb(255, 140, 0)

	let presets = {}

	// Playback Control Presets - ordered from fastest reverse to fastest forward
	const playbackSpeeds = [
		{ speed: 32, label: '32x', order: 1 },
		{ speed: 16, label: '16x', order: 2 },
		{ speed: 8, label: '8x', order: 3 },
		{ speed: 4, label: '4x', order: 4 },
		{ speed: 2, label: '2x', order: 5 },
		{ speed: 1, label: '1x', order: 6 },
		{ speed: 0.75, label: '75%', order: 7 },
		{ speed: 0.66, label: '66%', order: 8 },
		{ speed: 0.5, label: '50%', order: 9 },
		{ speed: 0.33, label: '33%', order: 10 },
		{ speed: 0.25, label: '25%', order: 11 },
	]

	// Reverse speeds (fastest to slowest)
	playbackSpeeds.forEach((item) => {
		presets[`playback_reverse_${item.label}`] = {
			type: 'button',
			category: 'Playback Control',
			name: `Play Reverse ${item.label}`,
			order: item.order,
			options: {},
			style: {
				text: `◀\\n${item.label}`,
				size: '18',
				color: ColorWhite,
				bgcolor: ColorOrange,
			},
			steps: [
				{
					down: [
						{
							actionId: 'setPlaybackRate',
							options: {
								rate: -item.speed,
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		}
	})

	// Pause (in the middle)
	presets['playback_pause'] = {
		type: 'button',
		category: 'Playback Control',
		name: 'Pause Playback',
		order: 12,
		options: {},
		style: {
			text: '⏸\\nPAUSE',
			size: '18',
			color: ColorWhite,
			bgcolor: ColorBlue,
		},
		steps: [
			{
				down: [
					{
						actionId: 'setPlaybackRate',
						options: {
							rate: 0,
						},
					},
				],
				up: [],
			},
		],
		feedbacks: [
			{
				feedbackId: 'playbackPaused',
				options: {},
				style: {
					color: ColorWhite,
					bgcolor: combineRgb(200, 200, 0),
				},
			},
		],
	}

	// Forward speeds (slowest to fastest)
	playbackSpeeds.slice().reverse().forEach((item, index) => {
		presets[`playback_forward_${item.label}`] = {
			type: 'button',
			category: 'Playback Control',
			name: `Play Forward ${item.label}`,
			order: 13 + index,
			options: {},
			style: {
				text: `▶\\n${item.label}`,
				size: '18',
				color: ColorWhite,
				bgcolor: ColorGreen,
			},
			steps: [
				{
					down: [
						{
							actionId: 'setPlaybackRate',
							options: {
								rate: item.speed,
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		}
	})

	// Navigation presets - ordered logically
	const jumpTimes = [
		{ seconds: 10, label: '10s', order: 1 },
		{ seconds: 30, label: '30s', order: 2 },
		{ seconds: 60, label: '1m', order: 3 },
		{ seconds: 300, label: '5m', order: 4 },
	]

	// Go to Live (first)
	presets['goto_live'] = {
		type: 'button',
		category: 'Navigation',
		name: 'Go to Live',
		order: 0,
		options: {},
		style: {
			text: 'LIVE',
			size: '18',
			color: ColorWhite,
			bgcolor: ColorRed,
		},
		steps: [
			{
				down: [
					{
						actionId: 'setPosition',
						options: {
							reference: 'live',
							position: '0',
						},
					},
				],
				up: [],
			},
		],
		feedbacks: [],
	}

	// Jump back from live (ordered by time)
	jumpTimes.forEach((item) => {
		presets[`jump_back_live_${item.label}`] = {
			type: 'button',
			category: 'Navigation',
			name: `Jump Back ${item.label} (Live)`,
			order: item.order,
			options: {},
			style: {
				text: `◀◀\\n-${item.label}\\nLIVE`,
				size: '18',
				color: ColorWhite,
				bgcolor: ColorRed,
			},
			steps: [
				{
					down: [
						{
							actionId: 'setPosition',
							options: {
								reference: 'live',
								position: `-${item.seconds}`,
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		}
	})

	// Jump back from playhead (ordered by time)
	jumpTimes.forEach((item) => {
		presets[`jump_back_playhead_${item.label}`] = {
			type: 'button',
			category: 'Navigation',
			name: `Jump Back ${item.label} (Playhead)`,
			order: 5 + item.order,
			options: {},
			style: {
				text: `◀◀\\n-${item.label}`,
				size: '18',
				color: ColorWhite,
				bgcolor: ColorBlue,
			},
			steps: [
				{
					down: [
						{
							actionId: 'setPosition',
							options: {
								reference: 'playhead',
								position: `-${item.seconds}`,
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		}
	})

	// Jump forward from playhead (ordered by time)
	jumpTimes.forEach((item) => {
		presets[`jump_forward_playhead_${item.label}`] = {
			type: 'button',
			category: 'Navigation',
			name: `Jump Forward ${item.label} (Playhead)`,
			order: 10 + item.order,
			options: {},
			style: {
				text: `▶▶\\n+${item.label}`,
				size: '18',
				color: ColorWhite,
				bgcolor: ColorBlue,
			},
			steps: [
				{
					down: [
						{
							actionId: 'setPosition',
							options: {
								reference: 'playhead',
								position: `${item.seconds}`,
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		}
	})

	// Marker presets - Generic
	presets['create_marker_live'] = {
		type: 'button',
		category: 'Markers',
		name: 'Create Marker at Live',
		options: {},
		style: {
			text: 'MARK\\nLIVE',
			size: '18',
			color: ColorWhite,
			bgcolor: ColorOrange,
		},
		steps: [
			{
				down: [
					{
						actionId: 'createMarker',
						options: {
							markerName: 'Marker',
							reference: 'live',
							time: '0',
						},
					},
				],
				up: [],
			},
		],
		feedbacks: [],
	}

	presets['create_marker_playhead'] = {
		type: 'button',
		category: 'Markers',
		name: 'Create Marker at Playhead',
		options: {},
		style: {
			text: 'MARK\\nPLAY',
			size: '18',
			color: ColorWhite,
			bgcolor: ColorOrange,
		},
		steps: [
			{
				down: [
					{
						actionId: 'createMarker',
						options: {
							markerName: 'Marker',
							reference: 'playhead',
							time: '0',
						},
					},
				],
				up: [],
			},
		],
		feedbacks: [],
	}

	// Clip durations array (used by multiple preset types)
	const clipDurations = [
		{ seconds: 5, label: '5s' },
		{ seconds: 10, label: '10s' },
		{ seconds: 15, label: '15s' },
		{ seconds: 20, label: '20s' },
		{ seconds: 30, label: '30s' },
		{ seconds: 60, label: '1m' },
	]

	// Named markers - sports events
	const sportsMarkers = [
		{ name: 'Goal', color: ColorGreen },
		{ name: 'Penalty', color: ColorRed },
		{ name: 'Foul', color: ColorOrange },
		{ name: 'Red Card', color: combineRgb(150, 0, 0) },
		{ name: 'Yellow Card', color: combineRgb(200, 200, 0) },
		{ name: 'Reacts', color: ColorBlue },
		{ name: 'Crowd', color: combineRgb(100, 100, 200) },
	]

	sportsMarkers.forEach((marker) => {
		presets[`marker_${marker.name.toLowerCase().replace(' ', '_')}`] = {
			type: 'button',
			category: 'Markers',
			name: `Marker: ${marker.name}`,
			options: {},
			style: {
				text: marker.name,
				size: '18',
				color: ColorWhite,
				bgcolor: marker.color,
			},
			steps: [
				{
					down: [
						{
							actionId: 'createMarker',
							options: {
								markerName: marker.name,
								reference: 'live',
								time: '0',
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		}
	})

	// Named clips - sports events with all duration options
	const namedClipTypes = [
		{ name: 'Goal', color: ColorGreen },
		{ name: 'Penalty', color: ColorRed },
		{ name: 'Foul', color: ColorOrange },
		{ name: 'Red Card', color: combineRgb(150, 0, 0) },
		{ name: 'Yellow Card', color: combineRgb(200, 200, 0) },
		{ name: 'Reacts', color: ColorBlue },
		{ name: 'Crowd', color: combineRgb(100, 100, 200) },
	]

	namedClipTypes.forEach((clipType) => {
		clipDurations.forEach((duration) => {
			presets[`clip_${clipType.name.toLowerCase().replace(' ', '_')}_${duration.label}`] = {
				type: 'button',
				category: 'Clips',
				name: `Clip: ${clipType.name} (${duration.label})`,
				options: {},
				style: {
					text: `${clipType.name}\\n${duration.label}`,
					size: '18',
					color: ColorWhite,
					bgcolor: clipType.color,
				},
				steps: [
					{
						down: [
							{
								actionId: 'createClip',
								options: {
									clipName: clipType.name,
									clipMode: 'in_duration',
									referenceInPoint: 'live',
									inPoint: `-${duration.seconds}`,
									duration: `${duration.seconds}`,
									uniqueName: false,
								},
							},
						],
						up: [],
					},
				],
				feedbacks: [],
			}
		})
	})

	// Generic clip creation presets
	clipDurations.forEach((item) => {
		presets[`create_clip_${item.label}`] = {
			type: 'button',
			category: 'Clips',
			name: `Create Clip (Last ${item.label})`,
			options: {},
			style: {
				text: `CLIP\\n${item.label}`,
				size: '18',
				color: ColorWhite,
				bgcolor: ColorGreen,
			},
			steps: [
				{
					down: [
						{
							actionId: 'createClip',
							options: {
								clipName: 'Clip',
								clipMode: 'in_duration',
								referenceInPoint: 'live',
								inPoint: `-${item.seconds}`,
								duration: `${item.seconds}`,
								uniqueName: false,
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		}
	})

	// Output selection presets (generative)
	this.outputList.forEach((output) => {
		presets[`select_output_${output.id}`] = {
			type: 'button',
			category: 'Output Selection',
			name: `Select Output: ${output.label}`,
			options: {},
			style: {
				text: `${output.label}`,
				size: 'auto',
				color: ColorWhite,
				bgcolor: ColorBlue,
			},
			steps: [
				{
					down: [
						{
							actionId: 'selectOutput',
							options: {
								output: output.id,
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'outputSelected',
					options: {
						output: output.id,
					},
					style: {
						color: ColorWhite,
						bgcolor: ColorGreen,
					},
				},
			],
		}
	})

	// Playlist control presets (generative)
	this.playlistList.forEach((playlist) => {
		presets[`playlist_play_${playlist.id}`] = {
			type: 'button',
			category: 'Playlist Control',
			name: `Play Playlist: ${playlist.label}`,
			options: {},
			style: {
				text: `▶\\n${playlist.label}`,
				size: '18',
				color: ColorWhite,
				bgcolor: ColorGreen,
			},
			steps: [
				{
					down: [
						{
							actionId: 'playlistPlay',
							options: {
								playlist: playlist.id,
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		}

		presets[`playlist_pause_${playlist.id}`] = {
			type: 'button',
			category: 'Playlist Control',
			name: `Pause Playlist: ${playlist.label}`,
			options: {},
			style: {
				text: `⏸\\n${playlist.label}`,
				size: '18',
				color: ColorWhite,
				bgcolor: ColorBlue,
			},
			steps: [
				{
					down: [
						{
							actionId: 'playlistPause',
							options: {
								playlist: playlist.id,
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		}

		presets[`playlist_stop_${playlist.id}`] = {
			type: 'button',
			category: 'Playlist Control',
			name: `Stop Playlist: ${playlist.label}`,
			options: {},
			style: {
				text: `■\\n${playlist.label}`,
				size: '18',
				color: ColorWhite,
				bgcolor: ColorRed,
			},
			steps: [
				{
					down: [
						{
							actionId: 'playlistStop',
							options: {
								playlist: playlist.id,
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		}

		presets[`playlist_skip_next_${playlist.id}`] = {
			type: 'button',
			category: 'Playlist Control',
			name: `Skip Next: ${playlist.label}`,
			options: {},
			style: {
				text: `⏭\\n${playlist.label}`,
				size: '18',
				color: ColorWhite,
				bgcolor: ColorBlue,
			},
			steps: [
				{
					down: [
						{
							actionId: 'playlistSkipNext',
							options: {
								playlist: playlist.id,
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		}

		presets[`playlist_skip_previous_${playlist.id}`] = {
			type: 'button',
			category: 'Playlist Control',
			name: `Skip Previous: ${playlist.label}`,
			options: {},
			style: {
				text: `⏮\\n${playlist.label}`,
				size: '18',
				color: ColorWhite,
				bgcolor: ColorBlue,
			},
			steps: [
				{
					down: [
						{
							actionId: 'playlistSkipPrevious',
							options: {
								playlist: playlist.id,
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		}
	})

	return presets
}
