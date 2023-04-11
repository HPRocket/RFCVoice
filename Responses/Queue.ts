import { AudioPlayerStatus } from "@discordjs/voice";
import Queue from "../Classes/Queue";
import Embed from "./Embed";
import { APIEmbedField, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, Snowflake } from "discord.js";
import fmtMSS from "../Utils/displayMSS";
import Locale from "./Locale";

export default class QueueEmbed extends Embed {

    queue: Queue
    locale: Locale
    pageIndex: number // 0-based index of the current embed page (relates to outer array below)
    pages: APIEmbedField[][] // An array of the fields for each page
    messageId: Snowflake
    userId: Snowflake
    expire: NodeJS.Timeout

    constructor({ queue, interaction }: { queue: Queue, interaction: ChatInputCommandInteraction }) {
        
        // Error suppression
        super({})
        
        this.queue = queue
        this.userId = interaction.member.user.id
        this.locale = new Locale(interaction)

    }

    constructEmbed(pageIndex?: number) {
        
        // Run an expiration timer
        this.renew()

        // Calculate the current track page
        const currentTrackIndex = this.queue.tracks.findIndex(track => track == this.queue.currentTrack)
        let currentTrackPage = 1 // Base-1 Index
        for (let page = 1; page <= this.pages.length; page++) {

            // Get the range of pages that the current track might fall under given the page number
            
            /*
                Example:
                Page 2
                25 * (2 - 1) < x < 2 * 25
            */

            const lowerRange = 25 * (page - 1)
            const higherRange = 25 * page

            const withinRange = lowerRange < currentTrackIndex && currentTrackIndex <= higherRange

            if (withinRange) {
                currentTrackPage = page
            } else {
                continue;
            }

        }

        if (pageIndex) {

            // If requested page does not exist
            if (!this.pages[pageIndex]) {

                // Set currentPage to the first one
                this.pageIndex = 0

            }

        }

        // If index not specified, use the page of the current track.
        this.pageIndex = pageIndex ?? currentTrackPage - 1

        const row = new ActionRowBuilder()
            .addComponents([

                // Previous Page Button
                new ButtonBuilder()
                    .setCustomId('previousQueuePage')
                    .setEmoji(`⬅️`)
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(this.pageIndex > 0 ? false : true),
                
                // Next Page Button 
                new ButtonBuilder()
                    .setCustomId('nextQueuePage')
                    .setEmoji(`➡️`)
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(((this.pages.length > 1) && (this.pageIndex < this.pages.length - 1 /* 0-based index fix */)) ? false : true),
                
            ]) as ActionRowBuilder<ButtonBuilder>;

        return {

            embed: {
                title: this.title,
                description: this.description,
                fields: this.pages[this.pageIndex],
                footer: {
                    text: this.locale.responses.queue.pageCount(this.pageIndex + 1, this.pages.length)
                },
            },

            components: [ row ],

        }

    }

    private build({ queue }: { queue: Queue }) {

        // Parse description info from these criteria
        let queueStatus: string
        if (queue.settings.loop.track) {
            queueStatus = this.locale.responses.queue.status.loop.track
        } else if (queue.settings.loop.queue) {
            queueStatus = this.locale.responses.queue.status.loop.queue
        } else if (queue.settings.shuffle) {
            queueStatus = this.locale.responses.queue.status.shuffle
        } else {
            queueStatus = this.locale.responses.queue.status.loop.none
        }
    
        if (queue.player.state.status === AudioPlayerStatus.Paused) {
            queueStatus = queueStatus.concat(`\n${this.locale.responses.queue.status.paused}`)
        }
    
        let timeRemaining: string = this.locale.responses.queue.playing.none
        if (queue.player.state.status === AudioPlayerStatus.Playing) {
            timeRemaining = queue.currentTrack ? `${"`"}${fmtMSS( Math.floor( queue.currentResource.playbackDuration / 1000 ) + queue.currentTrack.passedTime)}${"`"}/${"`"}${fmtMSS( Number(queue.currentTrack.lengthSec) )}${"`"}` : this.locale.responses.queue.playing.none
        }


        // Parse all the tracks into fields
        const pages: APIEmbedField[][] = [[]]
        for (const track of queue.tracks) {

            const currentPage = pages.length - 1
            const trackPosition = queue.tracks.findIndex(iteratedTrack => iteratedTrack == track) + 1

            // Make the page if it doesn't exist
            if (!pages[currentPage]) pages[currentPage] = []

            // Push a track into the current page
            pages[currentPage].push({
                name: '\u200b',
                value: this.locale.responses.queue.track(trackPosition, track.title, track.source, track.author, track == queue.currentTrack),
            })

            if (pages[currentPage].length >= 25) {
                // Make a new page (discord limits embeds at 25 fields)
                pages.push([])
            }

            continue;

        }

        // Save all the embed info
        this.title = this.locale.responses.queue.title
        this.description = `${this.locale.responses.queue.channel}: <#${queue.channelId}>\n${queueStatus}\n${timeRemaining}`

        // Save all the pages
        this.pages = pages

        // Save the Queue object
        this.queue = queue

        return {
            status: queueStatus,
            timeRemaining: timeRemaining
        }

    }

    renew() {
        
        // Rebuild the pages and information
        this.build({ queue: this.queue })

        // Clear the old timer
        if (this.expire) {
            clearTimeout(this.expire)
        }

        // Set the timer of the embed the embed
        this.expire = setTimeout(() => {

            this.queue.events.emit(this.queue.eventNames.embed.expire, this)

        }, 120 * 1000)

        return this.expire

    }

}
