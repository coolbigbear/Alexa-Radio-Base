
const fetch = require("node-fetch")
const DB = require("DynamoDB")
var xmlToJson = require("xml-js")

// const SONG_URL = "https://www.rmfon.pl/stacje/ajax_playing_main.txt"

let STATION_INFO = {}

async function getLatestRadioLink(secondURL = false) {

	STATION_INFO = await DB.getStationInfo()
	
	let STATION = {
		name: STATION_INFO.radio_name,
		channel: STATION_INFO.channel,
		url: null,
		progress: 0,
		token: `${STATION_INFO.radio_name}:${STATION_INFO.channel}`,
	}

	if (secondURL) {
		STATION.url = STATION_INFO.URL2
	} else {
		if (STATION_INFO.parse) {
			STATION = await parseRMFLink(STATION_INFO.URL, STATION)
		} else {
			STATION.url = STATION_INFO.URL
		}
	}

	console.log(`DEV --- ${JSON.stringify(STATION)}`)
	return STATION
}

async function parseRMFLink(STATION_URL, STATION) {
	let ERROR = ""

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

module.exports = { getLatestRadioLink, getPlayingSong, constructCurrentSongResponse }