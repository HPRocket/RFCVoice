import { ApplicationCommandOptionType, ChatInputCommandInteraction, GuildMember, VoiceBasedChannel } from "discord.js";
import { RFClient } from "../main";
import { getVoiceConnection, joinVoiceChannel } from "@discordjs/voice";
import Track from "../Classes/Track";

export default class Connect {

    client: RFClient
    interaction: ChatInputCommandInteraction

    constructor(client: RFClient, interaction?: ChatInputCommandInteraction) {

        this.client = client
        this.interaction = interaction

    }

    info = {
        name: 'disconnect',
        description: "Disconnect me from your channel.",
    }

    async callback() {

        return new Promise((res, rej) => {

            const connection = getVoiceConnection(this.interaction.guildId)

            connection.destroy()

            // Confirm the Disconnect operation
            return this.interaction.editReply(`Disconnected from the voice channel.`);

        })

    }

}
