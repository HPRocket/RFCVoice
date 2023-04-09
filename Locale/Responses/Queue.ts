import { AudioPlayerStatus } from "@discordjs/voice";
import Queue from "../../Classes/Queue";
import Embed from "./Embed";
import { APIEmbedField, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, Snowflake } from "discord.js";

export default class QueueEmbed extends Embed {

    queue: Queue
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

    }

    constructEmbed(pageIndex?: number) {
        
        // Run an expiration timer
        this.renew()

        // Calculate the current track page
        
        // Calc page count
        // (sets of 25) Calc which set of 25 the current track is in
        const currentTrackIndex = this.queue.tracks.findIndex(track => track == this.queue.currentTrack)
        for (let i = 0; i < this.pages.length; i++) {



        }

        const currentTrackPage = 0

        if (pageIndex) {

            // Page does not exist
            if (!this.pages[pageIndex]) {

                // Set currentPage to the first one
                this.pageIndex = 0

            }

        }

        // FEATURE: if index not specified, get the page of the current track.
        this.pageIndex = pageIndex ?? currentTrackPage // Default to page 1 (index 0) // no

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
                    text: `Page ${this.pageIndex + 1} of ${this.pages.length}.`
                },
            },

            components: [ row ],

        }

    }

    private build({ queue, userId }: { queue: Queue, userId: Snowflake }) {

        // Parse description info from these criteria
        let queueStatus: string
        if (queue.settings.loop.track) {
            queueStatus = "🔂｜Looping the current track."
        } else if (queue.settings.loop.queue) {
            queueStatus = "🔁｜Looping the queue."
        } else if (queue.settings.shuffle) {
            queueStatus = "🔀｜Shuffling the queue."
        } else {
            queueStatus = "🟦｜Not looping."
        }
    
        if (queue.player.state.status === AudioPlayerStatus.Paused) {
            queueStatus = queueStatus.concat(`\n⏸️｜The queue is currently paused.`)
        }
    
        let timeRemaining: string = "`No track is currently playing.`"
        if (queue.player.state.status === AudioPlayerStatus.Playing) {
            function fmtMSS(s: number){return(s-(s%=60))/60+(9<s?':':':0')+s} // Seconds -> M:SS (Minutes: Seconds)
            timeRemaining = queue.currentTrack ? `${"`"}${fmtMSS(Math.floor(queue.currentResource.playbackDuration / 1000))}${"`"}/${"`"}${fmtMSS(Number(queue.currentTrack.lengthSec))}${"`"}` : "`No track is currently playing.`"
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
                value: `${track == queue.currentTrack ? `**>> ${trackPosition}:**    [${track.title}](${track.source})` : `**${trackPosition}:**    [${track.title}](${track.source})`}\nBy: ${"`"}${track.author}${"`"}`
            })

            if (pages[currentPage].length >= 25) {
                // Make a new page (discord limits embeds at 25 fields)
                pages.push([])
            }

            continue;

        }

        // Save all the pages
        this.pages = pages

        // Record the user who made this embed
        this.userId = userId

        // Save the Queue object
        this.queue = queue

        return {
            status: queueStatus,
            timeRemaining: timeRemaining
        }

    }

    renew() {
        
        console.log('embed renew')

        // Rebuild the pages and information
        this.build({ queue: this.queue, userId: this.userId })

        // Clear the old timer
        if (this.expire) {
            console.log('timer clear')
            clearTimeout(this.expire)
        }

        // Set the timer of the embed the embed
        this.expire = setTimeout(() => {

            this.queue.events.emit(this.queue.eventNames.embed.expire, this)

        }, 120 * 1000)

        return this.expire

    }

}
