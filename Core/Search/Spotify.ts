import { SpotifyPlaylist, spotify, search, SpotifyTrack } from "play-dl";
import Track from "../../Classes/Track";

export default async function SpotifySearch(query: string): Promise<Track[]> {

    const tracks: Track[] = []

    const result = await spotify(query)
    console.log(result.type)

    if (result.type === "playlist" || result.type === "album") {

        console.log('playlist or album')

        const playlistTracks = await (result as SpotifyPlaylist).all_tracks()
        for (const track of playlistTracks) {

            const artistNames = track.artists.map(artist => artist.name).join(", ")

            // Get the YouTube source to stream
            const source = await search(`${track.name} ${artistNames}`, { source: { youtube: "video" }}).catch((err) => { throw err; })
    
            // Create the track
            tracks.push(new Track(track.name, artistNames, "YOUTUBE", source[0].url))

        }

    } else if (result.type === "track") {

        const track = result as SpotifyTrack

        const artistNames = track.artists.map(artist => artist.name).join(", ")

        // Get the YouTube source to stream
        const source = await search(`${track.name} ${artistNames}`, { source: { youtube: "video" }}).catch((err) => { throw err; })

        // Create the track
        tracks.push(new Track(track.name, artistNames, "YOUTUBE", source[0].url))

    }

    return tracks;

}
