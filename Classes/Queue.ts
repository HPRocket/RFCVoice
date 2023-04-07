import { Snowflake, VoiceState } from "discord.js";
import { AudioPlayer, AudioResource, createAudioPlayer } from '@discordjs/voice';
import { EventEmitter } from 'events';
import Track from "./Track";

export default class Queue {

    guildId: Snowflake
    channelId: Snowflake
    player: AudioPlayer

    tracks: Track[]
    currentTrackId: number
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

        this.tracks = []

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
    
    - Move Track

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


    async remove(trackId: number) {

        // Find the track
        const trackIndex = this.tracks.findIndex(track => track.Id == trackId)

        if (trackIndex != -1) {

            if (trackIndex == this.currentTrackId) {

                // The track to be removed is the current track

                // Go to the next track (if it exists)
                const nextTrack = await this.goto(trackIndex + 1).catch((err) => { throw err; })
                    if (!nextTrack) this.player.stop(); // Stop the player if there is no next track

            }

            // Delete the track
            this.tracks.splice(trackIndex, 1)

            return true;

        } else {

            // Track was not found

            return false;

        }

    }


    async goto(trackIndex: number) {

        // Find the requested track
        const track = this.tracks[trackIndex]
            if (!track) return false;

        // Load the track
        const resource = await track.load().catch((err) => { throw err; })
        
        // Tell the player to switch resources
        this.player.play(resource)

        // Reassign the current resource
        this.currentResource = resource

        return true;

    }

    listeners() {

        this.events.on(this.eventNames.voice.join, (oldState: VoiceState, newState: VoiceState) => {

            console.log(`Joined voice channel ${newState.channelId}`)

        })

    }

}