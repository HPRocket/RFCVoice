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
            trackLoop: boolean,
            queueLoop: boolean,
        },

        shuffle: boolean

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

    add(track: Track) {

        // Add the new track to the array of tracks
        this.tracks.push(track)

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


    async goto(newTrackIndex: number): Promise<boolean> {
        return new Promise(async (res, rej) => {

            // Find the requested track
            const track = this.tracks[newTrackIndex]
                if (!track) return rej("NOTRACK");

            // Load the track
            const resource = await track.load().catch((err) => { throw err; })
            
            // Tell the player to switch resources
            this.player.play(resource)

            // Reassign the current track
            this.currentTrack = track

            // Reassign the current resource
            this.currentResource = resource

            return res(true);

        })
    }

    move(trackIndex: number, newIndex: number) {
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

        // Get the current track's index
        const currentIndex = this.tracks.findIndex(track => track == this.currentTrack)

        if (currentIndex == -1) {

            // There is no old / current track

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

    }

}
