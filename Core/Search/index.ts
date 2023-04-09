import Track from '../../Classes/Track';
import SpotifySearch from './Spotify';

export default class Search {
    
    source: "SEARCH" | "YOUTUBE" | "DISCORD" | "SPOTIFY"
    query: string

    constructor(query: string) {

        // Filter the query to find if it's a (YouTube) Search, YouTube, Discord, or [Spotify => YouTube]
        const discordCDN = /(https?:\/\/)?(www.)?(cdn.discordapp.com\/attachments)\/(.+[0-9])\/(.+[0-9])\/(.+[a-z][0-9])/
        const spotifyLink = /(https?:\/\/)?(www.)?(open.spotify.com\/(track|playlist|album))\/.+/
        const youtubeLink = /http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)?‌​[\w\?‌​=]*)?/
        const youtubeShorts = /(https?:\/\/)?(www.)?(youtube.com\/shorts\/(.+))/ // Prevent a bug where shorts crashes the bot
            if (query.match(youtubeShorts)) return; // Terminate the function and don't add a value to query

        // Discord Link
        /*if (query.match(discordCDN)){

            this.source = "DISCORD"
            this.query = query

            return new Track("title", "author", "DISCORD", query)

        // Spotify Link
        } else*/ if (query.match(spotifyLink)) {

            this.source = "SPOTIFY"
            this.query = query

        } else if (query.match(youtubeLink)) {

            this.source = "YOUTUBE"
            this.query = query

        }
        
        
    }


    // Functions \\

    async getTracks(): Promise<Track[]> {
        return new Promise(async (res, rej) => {

            if (!this.query) return false; // Not a valid source

            if (this.source == "YOUTUBE") {
    
                // Filter it (playlist or video?)

                return res([ new Track("title", "author", "YOUTUBE", this.query) ])
    
            }

            if (this.source == "SPOTIFY") {

                console.log('spot source')

                // Rip the info and search on YouTube
                return res(await SpotifySearch(this.query))

            }

            if (this.source == "DISCORD") {

                return res([ new Track("title", "author", "DISCORD", this.query) ])

            }

        })
    }

}