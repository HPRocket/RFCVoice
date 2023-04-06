import * as unfetch from "isomorphic-unfetch"
const { getTracks } = require('spotify-url-info')(unfetch) // https://github.com/microlinkhq/spotify-url-info

import * as ytMusic from 'node-youtube-music'
import TrackEntry from "../../../Track"


export default class SpotifyPlaylist {

    link: string

    constructor(link: string) {
        this.link = link
    }

    async get() {

        let entries: TrackEntry[] = []

        const tracks = await getTracks(this.link).catch((err) => { throw err; })
        for (const track of tracks) {
            let artists = `${track.artists[0].name}`

            for (const [index, artist] of track.artists.entries()) {
                if (index == 0) continue;
                artists = `${artists}, ${artist.name}`
            }

            const resource = await ytMusic.searchMusics(`${track.name} ${artists}`)
            if (resource[0].youtubeId) {
                entries.push(
                    new TrackEntry(track.name, artists, resource[0].duration!.totalSeconds, "YOUTUBE", `https://youtube.com/watch?v=${resource[0].youtubeId}`, false)
                )
            }

            continue;
        }
        return entries;

    }

}