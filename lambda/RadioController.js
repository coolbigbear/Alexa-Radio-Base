
const fetch = require("node-fetch")
const DB = require("DynamoDB")
var xmlToJson = require("xml-js")

// const SONG_URL = "https://www.rmfon.pl/stacje/ajax_playing_main.txt"
const STATION_INFO = DB.getStationInfo()
const STATION_URL = STATION_INFO.URL
const STATION_NAME = STATION_INFO.RADIO_NAME
const STATION_CHANNEL = "Poland"
const HERE_IS = "Here is,"

let STATION = {
	name: STATION_NAME,
	channel: STATION_CHANNEL,
	url: "",
	progress: 0,
	token: `${STATION_NAME}:${STATION_CHANNEL}`
}

let ERROR = ""

async function getLatestRadioLink() {
	
	if (STATION_INFO.parse) {
		await parseRMFLink(STATION_URL)
	} else {
		STATION.url = STATION_URL
	}
	console.log(`DEV --- ${JSON.stringify(STATION)}`)
	return STATION
}

async function parseRMFLink(STATION_URL) {
	await fetch(STATION_URL)
		.then(response => {
			if (!response.ok) {
				throw new Error(`Error network response was: ${response}`)
			}
			return response
		})
		.then(res => res.text())
		.then(body => {
			var listOfRmfFmLinks = JSON.parse(xmlToJson.xml2json(body, { compact: true, spaces: 4 }))
			var rmfLink = listOfRmfFmLinks.xml.playlistMp3.item_mp3[0]._text
			STATION.url = rmfLink
			STATION.progress = 0
		})
		.catch(error => {
			ERROR = error
			console.log("Error with fetch", error)
		})
	if (ERROR.length > 0) {
		console.log(ERROR)
	}
	return STATION
}

async function getPlayingSong(song_url, song) {
	await fetch(song_url)
		.then(res => res.text())
		.then(body => {
			var listOfSongsOnRadio = JSON.parse(body)
			let currentSong = listOfSongsOnRadio.radio5
			song.artist = currentSong.name
			song.name = currentSong.utwor
			song.disc = currentSong.plyta
			song.year = currentSong.rok
		})
	return song
}

function constructCurrentSongResponse(SONG) {
	if (SONG.name === "" || SONG.artist === "") {
		return "There's no song playing, try again in a bit"
	} else {

		if (SONG.artist.includes(" / ")) {
			let split = SONG.artist.split(" / ")

			// Only 2 artists, replace / with and
			if (split.length == 2) {
				SONG.artist = SONG.artist.replace(" / ", " , and ")
			} else {
				let array = []
				for (let i = 0; i < split.length; i++) {

					array.push(split[i])
					if (i == split.length - 1) {
						continue
					}

					if (i == split.length - 2) {
						array.push(", and ")
					} else {
						array.push(", ")
					}
				}
				SONG.artist = array.join("")
			}
		}

		return `This is, ${SONG.name}, by ${SONG.artist}`

	}
}

module.exports = { getLatestRadioLink, getPlayingSong, constructCurrentSongResponse, STATION_NAME, HERE_IS }