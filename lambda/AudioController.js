class AlexaResponses {
	constructor() {

	}

	speak(speech) {
		this.outputSpeech = {
			type: "SSML",
			ssml: `<speak>${speech}</speak>`,
		}
		return this
	}

	prompt(speech) {
		this.response.reprompt = {
			outputSpeech: {
				type: "SSML",
				ssml: `<speak>${speech}</speak>`,
			},
		}

		return this
	}

	card(title, content = "", image_url = "") {
		this.response.card = {
			type: "Standard",
			title: `${title}`,
			content: `${content}`,
			text: `${content}`,
			image: {
				smallImageUrl: `${image_url}`,
				largeImageUrl: `${image_url}`,
			},
		}
		return this
	}

	play(station) {
		this.directives = [
			{
				type: "AudioPlayer.Play",
				playBehavior: "REPLACE_ALL",
				audioItem: {
					stream: {
						url: `${station.url}`,
						token: `${station.token}`,
						offsetInMilliseconds: `${station.progress}`,
					},
				},
			},
		]

		return this
	}

	enqueue(station) {
		this.directives = [
			{
				type: "AudioPlayer.Play",
				playBehavior: "ENQUEUE",
				audioItem: {
					stream: {
						url: `${station.url}`,
						token: `${station.token}`,
						offsetInMilliseconds: `${station.progress}`,
						expectedPreviousToken: `${station.token}`,
					},
				},
			},
		]

		return this
	}

	stop() {
		this.directives = [
			{
				type: "AudioPlayer.Stop",
			},
		]

		this.shouldEndSession = true

		return this
	}

	playMusicWithMessage(station, message) {
		return this.speak(message).play(station)
	}

	enqueueNextStreamWithoutMessage(station) {
		let response = this.enqueue(station)
		delete response["outputSpeech"]
		return response
	}

	playMusicWithoutMessage(station) {
		let response = this.play(station)
		delete response["outputSpeech"]
		return response
	}

	stopPlayingWithMessage(message) {
		return this.speak(message).stop()
	}

	stopPlayingWithoutMessage() {
		let response = this.stop()
		delete response["outputSpeech"]
		return response
	}
}
module.exports = new AlexaResponses()
