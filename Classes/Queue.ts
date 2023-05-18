import { Snowflake, VoiceState } from "discord.js";
import { AudioPlayer, AudioPlayerStatus, AudioResource, createAudioPlayer } from '@discordjs/voice';
import { EventEmitter } from 'events';
import Track from "./Track";
import QueueEmbed from "../Responses/Queue";
import onTrackLoad from "../Events/onTrackLoad";
import { RFClient } from "../main";
import randomNumber from "../Utils/randomNumber";

export default class Queue {

    guildId: Snowflake
    channelId: Snowflake
    player: AudioPlayer

    tracks: Track[]
    currentTrack: Track
    currentResource: AudioResource

    queueEmbeds: QueueEmbed[]

    events: EventEmitter
    eventNames: { track: { load: "trackLoad", end: "trackEnd" }, voice: { join: "joinChannel", leave: "leaveChannel" }, embed: { expire: "embedExpire" } }
    eventsChannel: Snowflake

    settings: {
        
        loop: {
            track: boolean,
            queue: boolean,
        },

        shuffle: boolean,

    }
    
    state: {

        loading: boolean,

    }

    constructor(client: RFClient, guildId: Snowflake, channelId: Snowflake) {

        this.guildId = guildId
        this.channelId = channelId
        this.player = createAudioPlayer()

        this.tracks = new Proxy([], {
            set: (target, requestedIndex, value) => {
                
                // Trigger a lifecycle check when the array is updated
                if (this.player.state.status == AudioPlayerStatus.Idle && !this.state.loading) { // The bot is not playing anything & not loading any track (playlist bug fix)

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

        this.queueEmbeds = []

        this.events = new EventEmitter()
        this.eventNames = { 
            track: { 
                load: "trackLoad", 
                end: "trackEnd",
            }, 
            voice: { 
                join: "joinChannel", 
                leave: "leaveChannel",
            },
            embed: {
                expire: "embedExpire",
            },
        }

        this.settings = {

            loop: {
                track: false,
                queue: false,
            },
    
            shuffle: false,

        }

        this.state = {

            loading: false,

        }

        // Run the listeners
        this.listeners(client)

    }

    /*
    
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
                    await this.goto(trackIndex + 1).catch(() => {})

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

    /**
     * 
     * @param force Force a specific State
     * @returns The pause state of the queue (example: true means the queue was paused).
     */
    togglePause(force?: boolean): boolean {

        // Check the player's state
        const isPaused = this.player.state.status === AudioPlayerStatus.Paused

        if (isPaused) {

            // Unpause the queue
            this.player.unpause()

            return false;

        } else {

            // Pause the queue
            this.player.pause()

            return true;

        }

    }

    async goto(newTrackIndex: number): Promise<{ oldTrack: Track, newTrack: Track }> {
        return new Promise(async (res, rej) => {

            // Find the requested track
            const track = this.tracks[newTrackIndex]
                if (!track) {
                    this.player.stop()
                    return rej("NOTRACK");
                }

            // Tell the queue it's waiting to load a track
            this.state.loading = true

            // Load the track
            const resource = await track.load().catch((err) => { throw err; })

            // Tell the queue it's done loading the track
            this.state.loading = false
            
            // Reassign the current resource
            this.currentResource = resource

            // Tell the player to switch resources
            this.player.play(this.currentResource)

            // Save the old track
            const oldTrack = this.currentTrack

            // Reassign the current track
            this.currentTrack = track

            // Signal to the module the track has changed
            this.events.emit(this.eventNames.track.load, track)

            return res({
                oldTrack: oldTrack,
                newTrack: this.currentTrack,
            })

        })
    }

    async skip(): Promise<{ oldTrack: Track, newTrack: Track }> {
        return new Promise(async (res, rej) => {

            return res(await this.advance().catch((err) => { throw err; }))

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

    async seek(seconds: number) {
        return new Promise(async (res, rej) => {

            if (!this.currentTrack) return rej("NOTRACK")

            const result = await this.currentTrack.seek(seconds).catch((err) => { rej(err); throw err; })
            
            // Save the new resource
            this.currentResource = result.resource

            // Play the new resource
            this.player.play(this.currentResource)

            // Return a success
            return res(result);

        })
    }

    setLoop(type: "TRACK" | "QUEUE", value: boolean) {

        // Turn the other one off if it's active
        if (type === "TRACK") {
            this.settings.loop.track = value
            if (value) {
                this.settings.loop.queue = false // Deactivate the queue loop
                this.settings.shuffle = false // Deactivate shuffling
            }

            return this.settings.loop.track;
        }

        if (type === "QUEUE") {
            this.settings.loop.queue = value
            if (value) {
                this.settings.loop.track = false // Deactivate the track loop
                this.settings.shuffle = false // Deactivate shuffling
            }

            return this.settings.loop.queue;
        }

    }

    setShuffle(value: boolean) {

        this.settings.shuffle = value

        if (value) {

            this.settings.loop.track = false // Deactivate the track loop
            this.settings.loop.queue = false // Deactivate the queue loop

        } else {

            // Wipe the shuffle data from all the tracks

        }

        return this.settings.shuffle;

    }

    private async advance() {

        // Get the current track's index
        const currentIndex = this.tracks.findIndex(track => track == this.currentTrack)

        /**
         * This is to jumpstart the queue when 
         * the bot is transitioning from idle to playing.
         */
        
        // There is no old / current track
        if (currentIndex == -1) {

            // Start the queue from the top
            return await this.goto(0).catch((err) => { throw err })

        }

        /**
         * Find the state of the queue. It's either:
         * Looping Track
         * Looping Queue
         * Shuffling
         * These cannot overlap.
         */
        if (this.settings.loop.track) {

            // Play the same track again
            return await this.goto(currentIndex).catch((err) => { throw err })

        } else if (this.settings.loop.queue) {
            
            // Find the next sequential track to play
            const nextTrack = this.tracks[currentIndex + 1]

            if (!nextTrack) {

                // Start the queue from the top
                return await this.goto(0).catch((err) => { throw err })

            }

        }

        let upcomingIndex = currentIndex + 1
        if (this.settings.shuffle) {

            // Get a list of all the not already played tracks in shuffle
            let unplayedShuffleTracks = this.tracks.filter(track => track.shufflePlayed === false)

            // All tracks have been played
            if (unplayedShuffleTracks.length === 0) {

                // Reset the shuffle states
                this.tracks.forEach(track => {
                    track.shufflePlayed = false
                })

                // Reset the array
                unplayedShuffleTracks = this.tracks

            }

            // Pick a random track
            const upcomingTrack = unplayedShuffleTracks[randomNumber(0, unplayedShuffleTracks.length - 1)]

            // Get the random track's index
            upcomingIndex = this.tracks.findIndex(track => track == upcomingTrack)

        }

        if (this.tracks[upcomingIndex]) {

            return await this.goto(upcomingIndex).catch((err) => { throw err })

        } else {

            return {
                oldTrack: this.currentTrack,
                newTrack: undefined,
            }

        }
        
    }

    listeners(client: RFClient) {

        this.events.on(this.eventNames.voice.join, (oldState: VoiceState, newState: VoiceState) => {
            console.log(`Joined voice channel ${newState.channelId}`)
        })

        this.events.on(this.eventNames.embed.expire, (embed: QueueEmbed) => {

            // Incase the original index changes, we use the instance to get the index instead
            const targetIndex = this.queueEmbeds.findIndex(existingEmbed => existingEmbed == embed)

            // Remove the embed from the record
            this.queueEmbeds.splice(targetIndex, 1)

        })

        this.events.on(this.eventNames.track.load, async (newTrack: Track) => {

            if (!this.eventsChannel) return;
            return await onTrackLoad(client, newTrack, this.eventsChannel)

        })

        this.player.on('stateChange', (oldState, newState) => {
            if (newState.status == AudioPlayerStatus.Idle) {

                // Go to the next track
                this.advance().catch(() => {})

            }
        })

        /*this.player.on('debug', error => {
            console.debug(error)
            //console.error(`Error: ${error.message} with resource ${(error.resource.metadata as any).title}`);
        })*/

    }

}
