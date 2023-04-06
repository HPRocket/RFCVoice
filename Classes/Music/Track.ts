import { AudioResource, createAudioResource } from "@discordjs/voice";
import * as playdl from 'play-dl'

export async function createResource(track: TrackEntry, seekSec?: number) {
    if (track.sourceType == "YOUTUBE") {
        let stream = await playdl.stream(track.source, {
            seek: seekSec ? seekSec : 0,
        }).catch(err => {
            throw err;
        })
        return createAudioResource(stream.stream, {
            inputType: stream.type,
        });
    } else if (track.sourceType == "DISCORD") {
        return createAudioResource(track.source);
    }
}

export default class TrackEntry {

    // Basic Track Info \\
    title: string
    author: string
    durationSec: number
    sourceType: "DISCORD" | "YOUTUBE"
    source: string
    shufflePlayed: boolean
    savedTime: number

    // Internal \\
    private resource: AudioResource<any> | undefined


    constructor(title: string, author: string, durationSec: number, sourceType: "DISCORD" | "YOUTUBE", source: string, shufflePlayed?: boolean) {
        this.title = title
        this.author = author
        this.durationSec = durationSec
        this.sourceType = sourceType
        this.source = source
        this.shufflePlayed = shufflePlayed ? shufflePlayed : false
        this.savedTime = 0
    }

    async load(timeSec?: number) {
        this.resource = await createResource(this, timeSec ? timeSec : 0).catch((err) => { throw err; }) as AudioResource
        this.savedTime = timeSec ? timeSec : 0

        return {
            resource: this.resource,
            duration: this.resource.playbackDuration,
            savedTime: this.savedTime,
        }
    }

    destroy() {
        this.resource = undefined
    }

    async setTime(timeSec: number) {

        // FEATURE: How do we get current time? Where do we store it?

    }

    async move() {

        // FEATURE: Move the track around (send signal to queue module)
        
    }

    async fastForward(currentTime: number, timeSec: number) {
        return this.setTime(currentTime + timeSec)
    }

    async rewind(currentTime: number, timeSec: number) {
        return this.setTime(currentTime - timeSec)
    }

    async resume() {
        
    }

    async pause() {

    }

}
