import { getVoiceConnection } from "@discordjs/voice";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Snowflake } from "discord.js";
import Queue from "../Queue/Queue";


type Timestamp = number


export default class QueueEmbed {
    
    authorId: Snowflake // User that requested the embed
    messageId: Snowflake // The messageId of the embed
    queue: Queue // The Queue of the Guild that the embed is tied to
    page: number // The current page of the queue
    lastUsed: Timestamp



    constructor(messageId: Snowflake, authorId: Snowflake, queue: Queue) {

        this.authorId = authorId
        this.queue = queue
        this.page = 1
        this.lastUsed = Math.floor(Date.now() / 1000)
        this.messageId = messageId

    }



    private queueToFields(startingPage?: number) {

        // Track Entries to Embed Fields
        let trackFields = [[]]
        let count = 0
        let pageCount = 1
        let currentPage = startingPage ? startingPage : 1
        let currentTrackPage

        const currentTrack = this.queue.findTrackIndex(this.queue.currentTrack) // Get the current index

        for (const [trackIndex, track] of this.queue.guildQueue.entries()) {

            count++
    
            if (count > 25) {
                pageCount++
                trackFields[pageCount - 1] = [] // make a new array for the page
                count = 0
            }

            if (trackIndex == currentTrack) currentTrackPage = pageCount

            trackFields[pageCount - 1].push({
                name: '\u200b',
                value: `${trackIndex == currentTrack ? `**>> ${trackIndex + 1}:**    [${track.title}](${track.source})` : `**${trackIndex + 1}:**    [${track.title}](${track.source})`}\nBy: ${"`"}${track.author}${"`"}`
            })
    
        }

        return {
            fields: trackFields,
            currentPage: currentPage,
            pageCount: pageCount
        }

    }



    private queueButtons(currentPage: number, pageCount: number): any { // Type Checking Error

        return new ActionRowBuilder()
        .addComponents([

            // Previous Page Button
            new ButtonBuilder()
                .setCustomId('previousQueuePage')
                .setEmoji(`⬅️`)
                .setStyle(ButtonStyle.Primary)
                .setDisabled(currentPage > 1 ? false : true),
            
            // Next Page Button 
            new ButtonBuilder()
                .setCustomId('nextQueuePage')
                .setEmoji(`➡️`)
                .setStyle(ButtonStyle.Primary)
                .setDisabled(((pageCount > 1) && (currentPage < pageCount)) ? false : true),
            
        ]);
        
    }    
    


    getEmbed(startingPage?: number) {
        const voiceChannelId = getVoiceConnection(this.queue.guildId).joinConfig.channelId
        const queueData = this.queueToFields(startingPage ? startingPage : 1)
            this.page = startingPage ? startingPage : 1

        this.queue.queueEmbeds.push(this) // Register the embed in the Guild Queue

        // Return the embed object
        return {
            embed: {
                color: 0x00000, // FEATURE: Color??
                title: "Track Queue",
                description: `Channel: <#${voiceChannelId}>\n${this.queue.getStats().status}\n${this.queue.getStats().timeRemaining}`,
                fields: queueData.fields[queueData.currentPage - 1],
                footer: {
                    text: `Page ${queueData.currentPage} of ${queueData.pageCount}.`
                }
            },
            actionRow: this.queueButtons(queueData.currentPage, queueData.pageCount),
        }
    }

}
