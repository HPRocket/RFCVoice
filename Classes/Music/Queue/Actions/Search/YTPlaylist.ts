import ytpl from "ytpl"
import TrackEntry from "../../../Track"
import { filters } from "."

export default class YTPlaylist {

    playlistID: string

    constructor(playlistID: string) {
        this.playlistID = playlistID
    }

    async get() {

        const playlist = await ytpl(this.playlistID).catch((err) => { throw err })
        const tracks = playlist.items

        let entries: TrackEntry[] = []
        for (const track of tracks) {

            if (track.url.match(filters.youtubeShorts)) continue; // Block YouTube Shorts

            entries.push(new TrackEntry(track.title, track.author.name, track.durationSec!, "YOUTUBE", track.url, false))

        }

        return entries;

    }

}