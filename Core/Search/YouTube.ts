import { playlist_info, search, video_basic_info, yt_validate } from "play-dl"
import Track from "../../Classes/Track"

const youtubeVideoLink = /http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)?‌​[\w\?‌​=]*)?/

export default async function YouTubeSearch(query: string): Promise<Track[]> {

    const tracks: Track[] = []

    const queryType = yt_validate(query)

    if (queryType === "playlist") {

        const source = await playlist_info(query).catch((err) => { throw err; })
        const videos = await source.all_videos()

        for (const video of videos) {
            // Push the track
            tracks.push(new Track(video.title, video.channel.name, "YOUTUBE", video.url, video.durationInSec))
        }

    } else if (queryType == "video" && query.match(youtubeVideoLink) /* May incorrectly validate https://play-dl.github.io/modules.html#yt_validate */) {

        const source = await video_basic_info(query).catch((err) => { throw err; })
        const video = source.video_details

        // Push the link only
        tracks.push(new Track(video.title, video.channel.name, "YOUTUBE", query, video.durationInSec))

    } else { // queryType is a search / other

        // Search for the track
        const source = await search(query, { source: { youtube: "video" }}).catch((err) => { throw err; })
        
        // Take the first result
        const video = source[0]

        // Push the first result of the search
        tracks.push(new Track(video.title, video.channel.name, "YOUTUBE", source[0].url, video.durationInSec))

    }

    return tracks;

}
