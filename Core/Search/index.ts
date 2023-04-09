import { yt_validate } from 'play-dl';
import Track from '../../Classes/Track';
import SpotifySearch from './Spotify';
import YouTubeSearch from './YouTube';

export default class Search {
    
    source: "YOUTUBE" | "DISCORD" | "SPOTIFY"
    query: string

    constructor(query: string) {

        // Filter the query to find if it's a (YouTube) Search, YouTube, Discord, or [Spotify => YouTube]
        const discordCDN = /(https?:\/\/)?(www.)?(cdn.discordapp.com\/attachments)\/(.+[0-9])\/(.+[0-9])\/(.+[a-z][0-9])/
        const spotifyLink = /(https?:\/\/)?(www.)?(open.spotify.com\/(track|playlist|album))\/.+/

        const youtubeShorts = /(https?:\/\/)?(www.)?(youtube.com\/shorts\/(.+))/ // Prevent a bug where Shorts crashes the bot
            if (query.match(youtubeShorts)) return; // Terminate the function and don't add a value to query

        // Spotify Link
        if (query.match(spotifyLink)) {

            this.source = "SPOTIFY"
            this.query = query

        } else if (query.match(discordCDN)) {

            this.source = "DISCORD"
            this.query = query

        } else {

            this.source = "YOUTUBE"
            this.query = query

        }
        
        
    }


    // Functions \\

    async getTracks(): Promise<Track[]> {
        return new Promise(async (res, rej) => {

            if (!this.query) return false; // Not a valid source (YT Shorts, etc.)

            if (this.source == "YOUTUBE") {

                // Search for it on YouTube (link or query)
                return res(await YouTubeSearch(this.query))
    
            }

            if (this.source == "SPOTIFY") {

                // Rip the info and search on YouTube
                return res(await SpotifySearch(this.query))

            }

            if (this.source == "DISCORD") {

                // Mark it as a Discord CDN link
                return res([ new Track("title", "author", "DISCORD", this.query) ])

            }

        })
    }

}