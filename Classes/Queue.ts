import { Snowflake, VoiceState } from "discord.js";
import { AudioPlayer, AudioResource, createAudioPlayer } from '@discordjs/voice';
import { EventEmitter } from 'events';

export default class Queue {

    guildId: Snowflake
    channelId: Snowflake
    player: AudioPlayer
    resources: AudioResource[]
    events: EventEmitter
    eventNames: { track: { load: "trackLoad", end: "trackEnd" }, voice: { join: "joinChannel", leave: "leaveChannel" } }

    constructor(guildId: Snowflake, channelId: Snowflake) {

        this.guildId = guildId
        this.channelId = channelId
        this.player = createAudioPlayer()
        this.resources = []
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

    }

    listen() {

        this.events.on(this.eventNames.voice.join, (oldState: VoiceState, newState: VoiceState) => {

            console.log(`Joined voice channel ${newState.channelId}`)

        })

    }

}