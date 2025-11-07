export function getVariables() {
	const variables = [
		{ name: 'Playback Rate', variableId: 'playback_rate' },
		{ name: 'Remaining Time', variableId: 'remaining_time' },
		{ name: 'Remaining Timecode', variableId: 'remaining_timecode' },
		{ name: 'Current Time', variableId: 'current_time' },
		{ name: 'Current Timecode', variableId: 'current_timecode' },
		{ name: 'Playhead Time', variableId: 'playhead_time' },
		{ name: 'Playhead Timecode', variableId: 'playhead_timecode' },
		{ name: 'Delay Time', variableId: 'delay_time' },
		{ name: 'Delay Timecode', variableId: 'delay_timecode' },
		{ name: 'Drop Frame', variableId: 'drop_frame' },
		{ name: 'Loop Recording', variableId: 'loop_recording' },
		{ name: 'Framerate', variableId: 'framerate' },
		{ name: 'Remaining Space', variableId: 'remaining_space' },
		{ name: 'Selected Output Name', variableId: 'selected_output_name' },
		{ name: 'Selected Output Input Name', variableId: 'selected_output_input_name' },
		{ name: 'Input Count', variableId: 'input_count' },
		{ name: 'Output Count', variableId: 'output_count' },
		{ name: 'Marker Count', variableId: 'marker_count' },
		{ name: 'Playlist Count', variableId: 'playlist_count' },
		{ name: 'Clip Count', variableId: 'clip_count' },
		{ name: 'Application Version', variableId: 'application_version' },
		{ name: 'Application Build', variableId: 'application_build_number' },
		{ name: 'Computer Name', variableId: 'computer_name' },
		{ name: 'Demo Mode', variableId: 'application_in_demo' },
	]

	return variables
}

export function updateSourceVariables() {
	let values = {}

	// Status variables
	if (this.status) {
		values.playback_rate = this.status.playback_rate ?? 0
		values.remaining_time = this.status.remaining_time ?? 0
		values.remaining_timecode = this.status.remaining_timecode ?? '00:00:00:00'
		values.current_time = this.status.current_time ?? 0
		values.current_timecode = this.status.current_timecode ?? '00:00:00:00'
		values.playhead_time = this.status.playhead_time ?? 0
		values.playhead_timecode = this.status.playhead_timecode ?? '00:00:00:00'
		values.delay_time = this.status.delay_time ?? 0
		values.delay_timecode = this.status.delay_timecode ?? '00:00:00:00'
		values.drop_frame = this.status.drop_frame ?? false
		values.loop_recording = this.status.loop_recording ?? false
		values.framerate = this.status.framerate ?? 0
		values.remaining_space = this.status.remaining_space ?? 'N/A'
	}

	// Count variables
	values.input_count = Object.keys(this.inputs).length
	values.output_count = Object.keys(this.outputs).length
	values.marker_count = Object.keys(this.markers).length
	values.playlist_count = Object.keys(this.playlists).length
	values.clip_count = Object.keys(this.clips || {}).length

	// Selected output variables
	let selectedOutput = null
	for (let outputId in this.outputs) {
		if (this.outputs[outputId]?.selected === true) {
			selectedOutput = this.outputs[outputId]
			break
		}
	}

	if (selectedOutput) {
		values.selected_output_name = selectedOutput.name ?? 'N/A'

		// Find the input name for the selected output
		if (selectedOutput.input_unique_id && this.inputs[selectedOutput.input_unique_id]) {
			values.selected_output_input_name = this.inputs[selectedOutput.input_unique_id].name ?? 'N/A'
		} else {
			values.selected_output_input_name = 'None'
		}
	} else {
		values.selected_output_name = 'None'
		values.selected_output_input_name = 'None'
	}

	// Info variables
	if (this.info) {
		values.application_version = this.info.application_version ?? 'N/A'
		values.application_build_number = this.info.application_build_number ?? 'N/A'
		values.computer_name = this.info.computer_name ?? 'N/A'
		values.application_in_demo = this.info.application_in_demo ? 'Yes' : 'No'
	}

	this.setVariableValues(values)
}
