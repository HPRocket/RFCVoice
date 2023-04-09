import { ChatInputCommandInteraction, GuildMember, VoiceBasedChannel } from "discord.js";
import { RFClient } from "../main";
import { joinVoiceChannel } from "@discordjs/voice";
import QueueEmbed from "../Locale/Responses/Queue";

export default class QueueCommand {

    client: RFClient
    interaction: ChatInputCommandInteraction

    constructor(client: RFClient, interaction?: ChatInputCommandInteraction) {

        this.client = client
        this.interaction = interaction

    }

    info = {
        name: 'queue',
        description: "Get a list of tracks currently playing.",
    }

    async callback() {

        return new Promise(async (res, rej) => {

            const queue = this.client.queueMap.get(this.interaction.guildId)

            const embed = new QueueEmbed({ queue: queue }).constructEmbed(0)
            console.log(embed)

            // Send the queue's embed
            return res(await this.interaction.editReply({ embeds: [ embed ]}));

        })

    }

}
