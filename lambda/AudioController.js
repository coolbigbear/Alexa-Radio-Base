class AlexaResponses {
	constructor() {

	}

	speak(speech) {
		if (speech !== "") {
			this.outputSpeech = {
				type: "SSML",
				ssml: `<speak>${speech}</speak>`,
			}
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

	playMusicWithoutMessage(station) {
		return this.speak("").play(station)
	}

	stopPlayingWithMessage(message) {
		return this.speak(message).stop()
	}
}
module.exports = new AlexaResponses()
