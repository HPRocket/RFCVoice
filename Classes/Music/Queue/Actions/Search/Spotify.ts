import * as unfetch from "isomorphic-unfetch"
const { getTracks } = require('spotify-url-info')(unfetch) // https://github.com/microlinkhq/spotify-url-info

import * as ytMusic from 'node-youtube-music'
import TrackEntry from "../../../Track"


export default class Spotify {

    link: string

    constructor(link: string) {
        this.link = link
    }

    async get() {

        const tracks = await getTracks(this.link).catch((err) => { throw err; })
        const track = tracks[0]

        let artists = `${track.artists[0].name}`

        for (const [index, artist] of track.artists.entries()) {
            if (index == 0) continue;
            artists = `${artists}, ${artist.name}`
        }

        const resource = await ytMusic.searchMusics(`${track.name} ${artists}`).catch((err) => { throw err; })
        if (resource) {
            return [
                new TrackEntry(track.name, artists, resource[0].duration!.totalSeconds, "YOUTUBE", `https://youtube.com/watch?v=${resource[0].youtubeId}`, false)
            ]
        }

    }

}