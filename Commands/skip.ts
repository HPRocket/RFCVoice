import { ApplicationCommandOptionType, ChatInputCommandInteraction, GuildMember, VoiceBasedChannel } from "discord.js";
import { RFClient } from "../main";
import { joinVoiceChannel } from "@discordjs/voice";
import ActionEmbed from "../Responses/Action";

export default class Connect {

    client: RFClient
    interaction: ChatInputCommandInteraction

    constructor(client: RFClient, interaction?: ChatInputCommandInteraction) {

        this.client = client
        this.interaction = interaction

    }

    info = {
        name: 'skip',
        description: "Skip the track currently playing.",
    }

    async callback() {

        return new Promise(async (res, rej) => {

            // Get the queue
            const queue = this.client.queueMap.get(this.interaction.guildId)

            // Skip the track
            const result = await queue.skip()

            // Confirm the Skip operation
            return res(await this.interaction.editReply({ embeds: [ new ActionEmbed({ content: `Skipped [${result.newTrack.title}](${result.newTrack.source}) by ${"`"}${result.newTrack.author}${"`"}.`, icon: "⏭️" }).constructEmbed().embed ] }));

        })

    }

}
