
const fetch = require("node-fetch")
var xmlToJson = require("xml-js")

async function getLatestRadioLink(station_url, station) {
	await fetch(station_url)
		.then(res => res.text())
		.then(body => {
			var listOfRmfFmLinks = JSON.parse(xmlToJson.xml2json(body, { compact: true, spaces: 4 }))
			var rmfLink = listOfRmfFmLinks.xml.playlistMp3.item_mp3[0]._text
			station.url = rmfLink
			station.progress = 0
		})
	return station
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
			console.log(`1 Current song is: ${currentSong}`)
			console.log(currentSong)
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