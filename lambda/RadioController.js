
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

async function getPlayingSong(song_url) {
	var currentSong = null
	await fetch(song_url)
		.then(res => res.text())
		.then(body => {
			var listOfSongsOnRadio = JSON.parse(body)
			currentSong = listOfSongsOnRadio.radio05
			console.log(`1 Current song is: ${currentSong}`)
		})
	console.log(`2 Current song is: ${currentSong}`)
	return currentSong
}

// "radio5": {
// 	"name": "Enej",
// 		"utwor": "Grozi nam cud",
// 			"id_autor": "6483",
// 				"id_utwor": "71511",
// 					"id_plyta": "44089",
// 						"plyta": "Grozi nam cud",
// 							"rok": "2020",
// 								"cover": "https://i.static.rmf.pl/97/100_100_enej-ok-adka-grozi-nam-cud.jpg",
// 									"coverBigUrl": "https://i.static.rmf.pl/97/512_512_enej-ok-adka-grozi-nam-cud.jpg",
// 										"artist": "https://i.static.rmf.pl/97/293_220_enej.jpg",
// 											"next": []
// },

module.exports = { getLatestRadioLink, getPlayingSong }