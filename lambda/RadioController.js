
const fetch = require("node-fetch")

const SONG_URL = "https://www.rmfon.pl/stacje/ajax_playing_main.txt"
const STATION_URL = "https://zt03.cdn.eurozet.pl/zet-tun.mp3"
const STATION_NAME = "Zet"
const STATION_CHANNEL = "Poland"
const HERE_IS = "Here is,"

let STATION = {
	name: STATION_NAME,
	channel: STATION_CHANNEL,
	url: "",
	progress: 0,
	token: `${STATION_NAME}:${STATION_CHANNEL}`
}

async function getLatestRadioLink() {
	STATION.url = STATION_URL;
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