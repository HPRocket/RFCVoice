// YouTube \\
import { yt_validate } from "play-dl"
import ytpl from "ytpl"

// Spotify \\
import * as unfetch from "isomorphic-unfetch"
const { getTracks } = require('spotify-url-info')(unfetch) // https://github.com/microlinkhq/spotify-url-info

// Internal \\
import TrackEntry from "../../../Track"
import YTPlaylist from "./YTPlaylist"
import YouTube from "./YouTube"
import Discord from "./Discord"
import Spotify from "./Spotify"
import Query from "./Query"
import SpotifyPlaylist from "./SpotifyPlaylist"

export const filters = {
    discordCDN: /(https?:\/\/)?(www.)?(cdn.discordapp.com\/attachments)\/(.+[0-9])\/(.+[0-9])\/(.+[a-z][0-9])/,
    spotify: /(https?:\/\/)?(www.)?(open.spotify.com\/(track|playlist))\/.+/,
    youtubeShorts: /(https?:\/\/)?(www.)?(youtube.com\/shorts\/(.+))/,
}

export default class Search {

    query: string
    type: "QUERY" | "YOUTUBE" | "YOUTUBEPLAYLIST" | "SPOTIFY" | "SPOTIFYPLAYLIST" | "DISCORD"

    constructor(query: string) {
        this.query = query
    }

    async findType() {

        if (this.query.match(filters.youtubeShorts)) {
            return undefined
        }

        if (this.query.match(filters.discordCDN)) {
            return this.type = "DISCORD"
        }

        if (this.query.match(filters.spotify)) {
            const tracks = await getTracks(this.query).catch((err) => { throw err; })
            const isPlaylist = tracks.length > 1
            const isTrack = tracks.length == 1

            if (isPlaylist) return this.type = "SPOTIFYPLAYLIST"
            if (isTrack) return this.type = "SPOTIFY"
        }

        if (yt_validate(this.query) == "playlist") {
            return this.type = "YOUTUBEPLAYLIST"
        }

        if (yt_validate(this.query) == 'video') {
            return this.type = "YOUTUBE"
        }

        return this.type = "QUERY"

    }


    async getTrack(): Promise<TrackEntry[] | undefined> {

        await this.findType();

        if (this.type == "YOUTUBE") {
            return await new YouTube(this.query).get().catch((err) => { throw err; })
        }

        if (this.type == "DISCORD") {
            return await new Discord(this.query).get().catch((err) => { throw err; })
        }

        if (this.type == "SPOTIFY") {
            return await new Spotify(this.query).get().catch((err) => { throw err; })
        }

        if (this.type == "SPOTIFYPLAYLIST") {
            return await new SpotifyPlaylist(this.query).get().catch((err) => { throw err; })
        }

        if (this.type == "QUERY") {
            return await new Query(this.query).get().catch((err) => { throw err; })
        }

        if (this.type = "YOUTUBEPLAYLIST") { // DEBUG: Doesn't seem to work...
            const playlistID = await ytpl.getPlaylistID(this.query).catch((err) => { throw err; })
            return await new YTPlaylist(playlistID).get().catch((err) => { throw err; })
        }

        return undefined;

    }

}
