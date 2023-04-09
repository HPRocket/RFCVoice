import { AudioPlayerStatus } from "@discordjs/voice";
import Queue from "../../Classes/Queue";
import Track from "../../Classes/Track";
import Embed from "./Embed";
import { APIEmbedField } from "discord.js";

export default class QueueEmbed extends Embed {

    pageIndex: number // 0-based index of the current embed page (relates to outer array below)
    pages: APIEmbedField[][] // An array of the fields for each page

    constructor({ queue }: { queue: Queue }) {
        
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

        // Set the embed info into the class
        super({ title: "Queue", description: `Channel: <#${queue.channelId}>\n${queueStatus}\n${timeRemaining}`, fields: pages[0] /* Default to the first page */ })
        
        // Save all the pages
        this.pages = pages

    }

    constructEmbed(pageIndex?: number) {
        
        this.pageIndex = pageIndex ?? 0 // Default to page 1 (index 0)

        return {

            title: this.title,
            description: this.description,
            fields: this.pages[this.pageIndex],
            footer: {
                text: `Page ${this.pageIndex + 1} of ${this.pages.length}.`
            },

        }

    }

}
