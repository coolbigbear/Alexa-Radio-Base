
const fetch = require("node-fetch")
var xmlToJson = require("xml-js")

async function getLatestRadioLink(station_url, station) {
	console.log(station_url)
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

module.exports = { getLatestRadioLink }