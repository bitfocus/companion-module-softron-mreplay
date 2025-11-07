import { combineRgb } from '@companion-module/base'

export function getFeedbacks() {
	const feedbacks = {}

	const ColorWhite = combineRgb(255, 255, 255)
	const ColorBlack = combineRgb(0, 0, 0)
	const ColorRed = combineRgb(200, 0, 0)
	const ColorGreen = combineRgb(0, 200, 0)
	const ColorBlue = combineRgb(0, 0, 200)
	const ColorOrange = combineRgb(255, 102, 0)
	const ColorYellow = combineRgb(200, 200, 0)

	feedbacks.inputRoutedToOutput = {
		type: 'boolean',
		name: 'Input Routed to Output',
		description: 'If the selected input is routed to the selected output, change the style of the button',
		defaultStyle: {
			color: ColorWhite,
			bgcolor: ColorGreen,
		},
		options: [
			{
				type: 'dropdown',
				label: 'Input',
				id: 'input',
				choices: this.inputList,
				default: this.inputList[0]?.id,
			},
			{
				type: 'dropdown',
				label: 'Output',
				id: 'output',
				choices: this.outputList,
				default: this.outputList[0]?.id,
			},
		],
		callback: ({ options }) => {
			return this.outputs[options.output]?.input_unique_id === options.input
		},
	}

	feedbacks.outputSelected = {
		type: 'boolean',
		name: 'Output Selected',
		description: 'If the output is selected, change the style of the button',
		defaultStyle: {
			color: ColorWhite,
			bgcolor: ColorBlue,
		},
		options: [
			{
				type: 'dropdown',
				label: 'Output',
				id: 'output',
				choices: this.outputList,
				default: this.outputList[0]?.id,
			},
		],
		callback: ({ options }) => {
			return this.outputs[options.output]?.selected === true
		},
	}

	feedbacks.outputEnabled = {
		type: 'boolean',
		name: 'Output Enabled',
		description: 'If the output is enabled, change the style of the button',
		defaultStyle: {
			color: ColorWhite,
			bgcolor: ColorGreen,
		},
		options: [
			{
				type: 'dropdown',
				label: 'Output',
				id: 'output',
				choices: this.outputList,
				default: this.outputList[0]?.id,
			},
		],
		callback: ({ options }) => {
			return this.outputs[options.output]?.enabled === true
		},
	}

	feedbacks.inputEnabled = {
		type: 'boolean',
		name: 'Input Enabled',
		description: 'If the input is enabled, change the style of the button',
		defaultStyle: {
			color: ColorWhite,
			bgcolor: ColorGreen,
		},
		options: [
			{
				type: 'dropdown',
				label: 'Input',
				id: 'input',
				choices: this.inputList,
				default: this.inputList[0]?.id,
			},
		],
		callback: ({ options }) => {
			return this.inputs[options.input]?.enabled === true
		},
	}

	feedbacks.playbackPlaying = {
		type: 'boolean',
		name: 'Playback Playing',
		description: 'If playback is active (rate > 0), change the style of the button',
		defaultStyle: {
			color: ColorWhite,
			bgcolor: ColorGreen,
		},
		options: [],
		callback: () => {
			return this.status?.playback_rate > 0
		},
	}

	feedbacks.playbackPaused = {
		type: 'boolean',
		name: 'Playback Paused',
		description: 'If playback is paused (rate = 0), change the style of the button',
		defaultStyle: {
			color: ColorWhite,
			bgcolor: ColorYellow,
		},
		options: [],
		callback: () => {
			return this.status?.playback_rate === 0
		},
	}

	feedbacks.playbackReverse = {
		type: 'boolean',
		name: 'Playback Reverse',
		description: 'If playback is in reverse (rate < 0), change the style of the button',
		defaultStyle: {
			color: ColorWhite,
			bgcolor: ColorOrange,
		},
		options: [],
		callback: () => {
			return this.status?.playback_rate < 0
		},
	}

	feedbacks.loopRecording = {
		type: 'boolean',
		name: 'Loop Recording Active',
		description: 'If loop recording is enabled, change the style of the button',
		defaultStyle: {
			color: ColorWhite,
			bgcolor: ColorRed,
		},
		options: [],
		callback: () => {
			return this.status?.loop_recording === true
		},
	}

	return feedbacks
}
