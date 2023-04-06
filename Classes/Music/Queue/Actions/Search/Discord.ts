import getVideoDurationInSeconds from 'get-video-duration';
import TrackEntry from '../../../Track';
import { filters } from '.';

export default class Discord {

    link: string

    constructor(link: string) {
        this.link = link
    }

    async get() {

        return [
            new TrackEntry(this.link.match(filters.discordCDN)![6], "Unknown", Math.floor(await getVideoDurationInSeconds(this.link)), "DISCORD", this.link, false)
        ]

    }

}