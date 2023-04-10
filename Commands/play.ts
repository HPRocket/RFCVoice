import { ApplicationCommandOptionType, GuildMember } from "discord.js";
import Search from "../Core/Search";
import ActionEmbed from "../Responses/Action";
import Locale from "../Responses/Locale";
import RFCommand from "./BaseCommand";

export default class PlayCommand extends RFCommand {

    info = {
        name: 'play',
        description: "Search for a video or play a link (YouTube, Spotify, Discord).",
        options: [
            {
                name: "query",
                description: "A search query, or link to a video/playlist (YouTube, Spotify, Discord).",
                type: ApplicationCommandOptionType.String,
                required: true
            },
        ]
    }

    async callback() {

        return new Promise(async (res, rej) => {

            const locale = new Locale(this.interaction)

            // Get the user's current voice channel
            const member = this.interaction.member as GuildMember
            const channelId = member?.voice.channelId

            // Get the queue for this guild
            const queue = this.client.findQueue(this.interaction.guildId, channelId)
                queue.eventsChannel = this.interaction.channelId // Update the events channel based on this command

            // Get the user passed source to query
            const trackSource = this.interaction.options.getString("query", true)

            // Search for the track(s)
            const tracks = await new Search(trackSource).getTracks()

            // Add the new track(s)
            const result = queue.add(tracks)

            // Confirm the Play operation
            if (tracks.length > 1) {

                // Multiple Tracks
                return await this.interaction.editReply({ embeds: [ new ActionEmbed({ content: locale.responses.tracks.add.trackCount(tracks.length), icon: "📝" }).constructEmbed().embed ]});

            } else {
                
                // One Track Only
                return await this.interaction.editReply({ embeds: [ new ActionEmbed({ content: locale.responses.tracks.add.trackInfo(tracks[0].title, tracks[0].source, tracks[0].author), icon: "📝" }).constructEmbed().embed ]});
                
            }

        })

    }

}
