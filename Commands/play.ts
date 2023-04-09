import { ApplicationCommandOptionType, ChatInputCommandInteraction, GuildMember, VoiceBasedChannel } from "discord.js";
import { RFClient } from "../main";
import { joinVoiceChannel } from "@discordjs/voice";
import Track from "../Classes/Track";
import Search from "../Core/Search";

export default class Connect {

    client: RFClient
    interaction: ChatInputCommandInteraction

    constructor(client: RFClient, interaction?: ChatInputCommandInteraction) {

        this.client = client
        this.interaction = interaction

    }

    info = {
        name: 'play',
        description: "Play a video (YouTube URL).",
        options: [
            {
                name: "url",
                description: "YouTube URL for the track.",
                type: ApplicationCommandOptionType.String,
                required: true
            },
        ]
    }

    async callback() {

        return new Promise(async (res, rej) => {

            // Get the user's current voice channel
            const member = this.interaction.member as GuildMember
            const channelId = member?.voice.channelId

            // Get the queue for this guild
            const queue = this.client.findQueue(this.interaction.guildId, channelId)

            // Get the user passed source to query
            const trackSource = this.interaction.options.getString("url", true)

            // Search for the track(s)
            const tracks = await new Search(trackSource).getTracks()

            // Add the new track(s)
            queue.add(tracks)

            // Confirm the Play operation
            return await this.interaction.editReply(`Playing ${trackSource}!`);

        })

    }

}
