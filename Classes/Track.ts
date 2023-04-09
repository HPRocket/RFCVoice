import { AudioResource, createAudioResource } from "@discordjs/voice"
import playdl from 'play-dl'

export async function createResource(track: Track, seekSec?: number) {

    if (track.sourceType === "YOUTUBE") {

        let stream = await playdl.stream(track.source/*, {
            seek: seekSec ? seekSec : 0,
        }*/).catch(err => {
            throw err;
        })
        console.log(stream.type)
        const resource = createAudioResource(stream.stream, {
            inputType: stream.type,
        });
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

    constructor(title: string, author: string, sourceType: "DISCORD" | "YOUTUBE", source: string, lengthSec: number, shufflePlayed?: boolean) {
        this.title = title
        this.author = author
        this.sourceType = sourceType
        this.source = source
        this.lengthSec = lengthSec
        this.shufflePlayed = shufflePlayed ?? false
    }

    async load() {

        this.resource = await createResource(this).catch((err) => { throw err; }) as AudioResource
        return this.resource

    }
    

}
