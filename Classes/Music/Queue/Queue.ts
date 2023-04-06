import { AudioPlayer, AudioPlayerStatus, AudioResource, createAudioPlayer, getVoiceConnection, NoSubscriberBehavior } from '@discordjs/voice'
import { Snowflake } from 'discord.js'
import onTrackEnd from '../../../Events/Tracks/onTrackEnd'
import { RFClient } from '../../../main'
import QueueEmbed from '../Embeds/QueueEmbed'
import TrackEntry from '../Track'

type RFResource = {
    resource: AudioResource | undefined,
    savedPassedTimeSec: number,
}

type ShuffleState = boolean

// Queues are made only when a bot joins a voice channel, after which it is destroyed on disconnect.
export default class Queue {

    // Add mutation functions in here to move tracks around
    // Managing a guild, and its respective queue/other things that have been initialized by the GuildQueues module

    client: RFClient
    guildId: Snowflake
    guildQueue: TrackEntry[]
    currentTrack: TrackEntry | undefined
    currentResource: RFResource
    queueEmbeds: QueueEmbed[]
    player: AudioPlayer
    settings: {
        loop: {
            trackLoop: boolean,
            queueLoop: boolean,
        },
        shuffle: boolean
    }
    voiceAnnouncementsChannel: Snowflake



    constructor(client: RFClient, guildId: Snowflake) {
        this.client = client
        this.guildId = guildId
        this.guildQueue = []
        this.currentTrack = undefined
        this.currentResource = {
            resource: undefined,
            savedPassedTimeSec: 0
        }
        this.queueEmbeds = []
        this.player = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Pause,
            }
        })
        this.settings = {
            loop: {
                trackLoop: false,
                queueLoop: false,
            },
            shuffle: false
        }
        this.voiceAnnouncementsChannel = undefined
    }


    
    toggleShuffle(forcedState?: boolean): ShuffleState | undefined {

        if (forcedState) {
            this.settings.shuffle = forcedState
            return forcedState;
        }

        if (this.settings.shuffle == false) {

            this.settings.shuffle = true;
            return true;

        } else if (this.settings.shuffle == true) {

            this.settings.shuffle = false;
            return false;

        }

    }



    async goto(index: number, timeSec?: number) {
        
        const validTrack = this.guildQueue[index]
            if (!validTrack) return false;

        const track = await this.guildQueue[index].load(timeSec ? timeSec : 0)
        
        // Subscribe Player to Voice Connection
        const connection = getVoiceConnection(this.guildId)
        connection.subscribe(this.player)

        this.player.play(track.resource)

        this.currentTrack = this.guildQueue[index]
        this.currentResource.resource = track.resource
        return track;
        
    }



    findTrackIndex(Track: TrackEntry) {

        for (const [index, track] of this.guildQueue.entries()) {
            if (track == Track) return index;
        }

        return undefined; // No track found.

    }



    async moveTrack(index: number, newIndex: number) {
        let track = this.guildQueue[index]

        if (track) { // There is actually a track at this index

            if (newIndex > this.guildQueue.length) return false; // Will create an empty gap.

            this.guildQueue.splice(index, 1)
            this.guildQueue.splice(newIndex, 0, track)
            this.currentTrack = track

            return true;
        
        } else {
        
            return false;
        
        }

    }



    async insertTracks(tracks: TrackEntry | TrackEntry[], index?: number) { // If no index, move to bottom of the queue

        if (tracks instanceof Array<TrackEntry>) { // Loop through and Insert multiple tracks.

            for (const track of tracks) {
                this.guildQueue.push(track)
                continue;
            }

        } else if (tracks instanceof TrackEntry) { // Insert just one track.

            if (index) { // Insert at index (if it will not create empty gaps)

                if (index > this.guildQueue.length) return false; // Will create an empty gap.
                this.guildQueue.splice(index, 0, tracks)

            }
            
            this.guildQueue.push(tracks)

        }

        if (this.player.state.status == AudioPlayerStatus.Idle) {

            await this.goto(0)

        }

        return true;
    }
    


    getStats() {
        function fmtMSS(s: number){return(s-(s%=60))/60+(9<s?':':':0')+s} // Seconds -> M:SS (Minutes: Seconds)

        let queueStatus: string
        if (this.settings.loop.trackLoop) {
            queueStatus = "🔂｜Looping the current track."
        } else if (this.settings.loop.queueLoop) {
            queueStatus = "🔁｜Looping the queue."
        } else if (this.settings.shuffle) {
            queueStatus = "🔀｜Shuffling the queue."
        } else {
            queueStatus = "🟦｜Not looping."
        }
    
        if (this.player.state.status === AudioPlayerStatus.Paused) {
            queueStatus = queueStatus.concat(`\n⏸️｜The queue is currently paused.`)
        }

        return {
            timeRemaining: this.currentTrack ? `${"`"}${fmtMSS(Math.floor(this.currentResource.resource.playbackDuration / 1000) + this.currentResource.savedPassedTimeSec)}${"`"}/${"`"}${fmtMSS(Number(this.currentTrack.durationSec))}${"`"}` : "`No track is currently playing.`",
            status: queueStatus,
        }

    }



    async listeners() { // Initialize the Listeners
        
        onTrackEnd(this)
    
    }

}
