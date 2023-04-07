import { AudioResource, createAudioResource } from "@discordjs/voice"
import playdl from 'play-dl'

export async function createResource(track: Track, seekSec?: number) {

    if (track.sourceType === "YOUTUBE") {

        let stream = await playdl.stream(track.source, {
            seek: seekSec ? seekSec : 0,
        }).catch(err => {
            throw err;
        })
        return createAudioResource(stream.stream, {
            inputType: stream.type,
        });

    } else if (track.sourceType === "DISCORD") {

        return createAudioResource(track.source);

    }

}

export default class Track {

    // Give each track an ID
    // The ID can just be a number
    // To prevent overlaps, just increment a number from the greatest number already existing in the queue; this will refer to this track.

    // Basic Track Info \\
    title: string
    author: string
    sourceType: "YOUTUBE" | "DISCORD"
    source: string // URL
    shufflePlayed: boolean // Was the track already played in the shuffle queue or not?

    private resource: AudioResource<unknown> | undefined

    constructor(title: string, author: string, sourceType: "DISCORD" | "YOUTUBE", source: string, shufflePlayed?: boolean) {
        this.title = title
        this.author = author
        this.sourceType = sourceType
        this.source = source
        this.shufflePlayed = shufflePlayed ? shufflePlayed : false
    }

    async load() {

        this.resource = await createResource(this).catch((err) => { throw err; }) as AudioResource
        return this.resource

    }
    

}