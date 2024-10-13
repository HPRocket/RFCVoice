import { AudioResource, createAudioResource } from "@discordjs/voice"
import playdl from 'play-dl'
import * as ytdl from '@distube/ytdl-core'

export async function createResource(track: Track, seekSec?: number) {

    if (track.sourceType === "YOUTUBE") {
        let stream = ytdl(track.source, { filter: "audioonly", range: {start: seekSec ?? 0} })

        const resource = createAudioResource(stream);
        resource.playStream.on('error', error => {

            console.error('Error:', error.message, 'with track', resource.metadata);
            
        })
        return resource

    } else if (track.sourceType === "DISCORD") {

        return createAudioResource(track.source);

    }

}

export default class Track {

    // Basic Track Info \\
    title: string
    author: string
    sourceType: "YOUTUBE" | "DISCORD"
    source: string // URL
    lengthSec: number // How long is the source in seconds
    shufflePlayed: boolean // Was the track already played in the shuffle queue or not?

    private resource: AudioResource<unknown> | undefined
    passedTime: number // Because the seek feature requires us to create a new resource (with not the full length of the original source), we need to compensate and display the total differently

    constructor(title: string, author: string, sourceType: "DISCORD" | "YOUTUBE", source: string, lengthSec: number, shufflePlayed?: boolean) {
        this.title = title
        this.author = author
        this.sourceType = sourceType
        this.source = source
        this.lengthSec = lengthSec
        this.shufflePlayed = shufflePlayed ?? false
        this.passedTime = 0
    }

    async load(seekSec?: number) {

        this.resource = await createResource(this, seekSec ?? 0).catch((err) => { throw err; }) as AudioResource
        return this.resource

    }
    
    async seek(seconds: number /* + is forward, - is backwards */): Promise<{ resource: AudioResource<unknown>, passedTime: number }> {
        return new Promise(async (res, rej) => {

            // Check if the operation is safe (0 < targetTime <= this.lengthSec)
            const targetTime = this.passedTime + seconds
            if (targetTime > this.lengthSec || targetTime < 0) {

                // Time is greater than the max or less than 0
                return rej("OUTOFRANGE");

            }

            // Load a new resource
            const newResource = await this.load(targetTime).catch((err) => { throw err; }) // Use the entire passed time since we're (re)loading the original resource

            // Save passed time
            this.passedTime += seconds // We add the old time plus any new time (seeking off the most recent resource)

            // Return the new resource with the passed time
            return res({
                resource: newResource,
                passedTime: this.passedTime
            })

        })
    }

}
