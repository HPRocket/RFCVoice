import { Snowflake } from "discord.js";
import { AudioPlayer, AudioResource, createAudioPlayer } from '@discordjs/voice';
import { EventEmitter } from 'events';

export default class Queue {

    guildId: Snowflake
    channelId: Snowflake
    player: AudioPlayer
    resources: AudioResource[]
    events: EventEmitter
    eventNames: { track: ["trackLoad", "trackEnd"], voice: ["joinChannel", "leaveChannel"] }

    constructor(guildId: Snowflake, channelId: Snowflake) {

        this.guildId = guildId
        this.channelId = channelId
        this.player = createAudioPlayer()
        this.resources = []
        this.events = new EventEmitter()
        this.eventNames = { 
            track: ["trackLoad", "trackEnd"], 
            voice: ["joinChannel", "leaveChannel"],
        }

    }

}