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

            const queueDisplay = new QueueEmbed({ queue: queue, interaction: this.interaction })
            const queueEmbed = queueDisplay.constructEmbed()

            // Send the queue's embed
            const message = await this.interaction.editReply({ embeds: [ queueEmbed?.embed ], components: queueEmbed?.components })

            // Register the resulting message with the embed internally
            queueDisplay.messageId = message.id
            queue.queueEmbeds.push(queueDisplay)

            return res(message);

        })

    }

}
