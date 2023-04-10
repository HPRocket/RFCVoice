import { ApplicationCommandOptionType, ChatInputCommandInteraction, GuildMember, VoiceBasedChannel } from "discord.js";
import { RFClient } from "../main";
import { getVoiceConnection, joinVoiceChannel } from "@discordjs/voice";
import Track from "../Classes/Track";
import ActionEmbed from "../Responses/Action";

export default class Disconnect {

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

        return new Promise(async (res, rej) => {

            const channel = (await this.interaction.guild.members.fetch(this.client.user.id)).voice.channelId
            const connection = getVoiceConnection(this.interaction.guildId)

            connection.destroy()

            // Confirm the Disconnect operation
            return res(await this.interaction.editReply({ embeds: [ new ActionEmbed({ content: `Disconnected from <#${channel}>.`, icon: "🚪" }).constructEmbed().embed ] }));

        })

    }

}
