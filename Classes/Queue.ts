import { Snowflake, VoiceState } from "discord.js";
import { AudioPlayer, AudioPlayerStatus, AudioResource, createAudioPlayer } from '@discordjs/voice';
import { EventEmitter } from 'events';
import Track from "./Track";

export default class Queue {

    guildId: Snowflake
    channelId: Snowflake
    player: AudioPlayer

    tracks: Track[]
    currentTrack: Track
    currentResource: AudioResource

    events: EventEmitter
    eventNames: { track: { load: "trackLoad", end: "trackEnd" }, voice: { join: "joinChannel", leave: "leaveChannel" } }

    settings : {
        
        loop: {
            track: boolean,
            queue: boolean,
        },

        shuffle: boolean,

    }

    constructor(guildId: Snowflake, channelId: Snowflake) {

        this.guildId = guildId
        this.channelId = channelId
        this.player = createAudioPlayer()

        this.tracks = new Proxy([], {
            set: (target, requestedIndex, value) => {
                
                // Trigger a lifecycle check when the array is updated
                console.log(`${this.guildId} || Track array updated`)

                // The bot is not playing anything
                if (this.player.state.status == AudioPlayerStatus.Idle) {

                    // Get the bot to go to the next track
                    this.advance().catch((err) => {})

                }

                // Check if the new index is safe
                let index = requestedIndex as any as number

                if (index - 1 >= target.length) { // ex: index is 4 (fifth item), array is length 3 (fourth item missing)
                
                    // Shift the index to the last in the array
                    index = target.length - 1

                }

                // Modify the array
                target[index] = value;

                // Return true to accept the changes
                return true;

            }
        })

        this.events = new EventEmitter()
        this.eventNames = { 
            track: { 
                load: "trackLoad", 
                end: "trackEnd" 
            }, 
            voice: { 
                join: "joinChannel", 
                leave: "leaveChannel" 
            } 
        }

        this.settings = {

            loop: {
                track: false,
                queue: false,
            },
    
            shuffle: false,

        }

        // Run the listeners
        this.listeners()

    }

    /*
    
    - Visualize Queue

    (Later)
    - Toggle Shuffle
    - Loop
    - Seek

    */

    add(tracks: Track[]) {

        for (const track of tracks) {

            // Add the new track to the array of tracks
            this.tracks.push(track)

        }

    }


    async remove(trackIndex: number): Promise<Track> {
        return new Promise(async (res, rej) => {
            
            // Find the track
            const track = this.tracks[trackIndex]

            if (track) {

                if (track == this.currentTrack) {

                    // The track to be removed is the current track

                    // Go to the next track (if it exists)
                    await this.goto(trackIndex + 1).catch((err) => {
                        this.player.stop() // Stop the player if there is no next track
                    })

                }

                // Delete the track
                this.tracks.splice(trackIndex, 1)

                return res(track); // Return the track that was deleted

            } else {

                // Track was not found
                return rej("NOTRACK");

            }

        })
    }

    clear() {

        // Reset to original state
        this.player.stop()
        this.currentTrack = undefined
        this.currentResource = undefined

        // Wipe the tracks array
        this.tracks.splice(0, this.tracks.length)

        return true;

    }

    async goto(newTrackIndex: number): Promise<{ oldTrack: Track, newTrack: Track }> {
        return new Promise(async (res, rej) => {

            // Find the requested track
            const track = this.tracks[newTrackIndex]
                if (!track) return rej("NOTRACK");

            // Load the track
            const resource = await track.load().catch((err) => { throw err; })
            
            // Reassign the current resource
            this.currentResource = resource

            // Tell the player to switch resources
            this.player.play(this.currentResource)

            // Save the old track
            const oldTrack = this.currentTrack

            // Reassign the current track
            this.currentTrack = track

            return res({
                oldTrack: oldTrack,
                newTrack: this.currentTrack,
            })

        })
    }

    async skip(): Promise<{ oldTrack: Track, newTrack: Track }> {
        return new Promise(async (res, rej) => {

            // Find if the next track exists
            const nextIndex = this.tracks.findIndex(track => track == this.currentTrack) + 1
            const nextTrack = this.tracks[nextIndex]
                if (nextIndex === 0 /* -1 + 1 = 0 */ || !nextTrack) {
                    // End the current track
                    this.player.stop()

                    // Return there was no new track played
                    return res({
                        oldTrack: this.currentTrack,
                        newTrack: undefined,
                    })
                }
            
            // Go to the next track
            return res(await this.goto(nextIndex));

        })
    }

    move(trackIndex: number, newIndex: number): Promise<boolean> {
        return new Promise(async (res, rej) => {

            // Find the requested track to move
            const track = this.tracks[trackIndex]
                if (!track) return rej("NOTRACK");
            
            // Remove the track
            this.tracks.splice(trackIndex, 1)

            // Add the track at the new index
            this.tracks.splice(newIndex, 0, track)

            return res(true)

        })
    }

    async advance() {

        console.debug('advancing')

        // Get the current track's index
        const currentIndex = this.tracks.findIndex(track => track == this.currentTrack)

        // There is no old / current track
        if (currentIndex == -1) {

            // Start the queue from the top
            return await this.goto(0).catch((err) => { throw err })

        }

        // Find the next track to play
        const nextTrack = this.tracks[currentIndex + 1]
        if (nextTrack) {

            return await this.goto(currentIndex + 1).catch((err) => { throw err })

        } else {

            return false;

        }
        
    }

    listeners() {

        this.events.on(this.eventNames.voice.join, (oldState: VoiceState, newState: VoiceState) => {
            console.log(`Joined voice channel ${newState.channelId}`)
        })

        this.player.on('stateChange', (oldState, newState) => {
            if (newState.status == AudioPlayerStatus.Idle) {

                // Go to the next track
                this.advance().catch((err) => {})

            }
        })

        this.player.on('debug', error => {
            console.debug(error)
            //console.error(`Error: ${error.message} with resource ${(error.resource.metadata as any).title}`);
        })

    }

}
