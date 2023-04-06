import * as ytSearch from 'yt-search'
import TrackEntry from '../../../Track';

export default class Query {

    query: string

    constructor(query: string) {
        this.query = query
    }

    async get() {

        const trackFinder = async (query) => {  
            const trackResult = await ytSearch(query).catch((err) => { throw err; })
            return (trackResult.videos.length > 1) ? trackResult.videos[0] : null;
        }


        const track = await trackFinder(this.query)
        if (track) {
            return [
                new TrackEntry(track.title, track.author.name, track.duration.seconds, "YOUTUBE", track.url, false)
            ]
        } else {
            return undefined;
        }

    }

}