import * as playdl from 'play-dl'
import TrackEntry from '../../../Track';

export default class YouTube {

    link: string

    constructor(link: string) {
        this.link = link
    }

    async get() {

        const track = await playdl.video_info(this.link).catch((err) => { throw err; })
        return [
            new TrackEntry(track.video_details.title!, track.video_details.channel!.name!, track.video_details.durationInSec, "YOUTUBE", track.video_details.url, false)
        ]

    }

}