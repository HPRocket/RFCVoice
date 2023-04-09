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
        name: 'goto',
        description: "Go to a specific track in the queue.",
        options: [
            {
                name: "position",
                description: "The position of the track in the queue to go to.",
                type: ApplicationCommandOptionType.Number,
                required: true
            },
        ]
    }

    async callback() {

        return new Promise(async (res, rej) => {

            // Get the user passed index to query
            const trackIndex = this.interaction.options.getNumber("position", true)

            // Get the user's current voice channel
            const member = this.interaction.member as GuildMember
            const channelId = member?.voice.channelId

            // Get the queue for this guild
            const queue = this.client.findQueue(this.interaction.guildId, channelId)

            // Go to the track (if possible)
            const tracks = await queue.goto(trackIndex - 1)

            // Confirm the Play operation
            return await this.interaction.editReply(`Went to ${trackIndex}.`);

        })

    }

}
