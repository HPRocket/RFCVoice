import { getVoiceConnection, joinVoiceChannel } from "@discordjs/voice";
import { ApplicationCommandOptionType, ChannelType, ChatInputCommandInteraction, Client, GuildMember, Snowflake, VoiceChannel } from "discord.js";
import BaseCommand from "../Classes/Commands/BaseCommand";
import QueueEmbed from "../Classes/Music/Embeds/QueueEmbed";
import Search from "../Classes/Music/Queue/Actions/Search";
import { configType } from "../Configs";
import { RFClient } from "../main";

export default class Queue extends BaseCommand {

    super(client: Client) {
        this.client = client
    }

    config = {
        updateVoiceAnnouncementsChannel: false,
        sameVC: true,
        canAutoJoinVC: false,
    }

    info = {
        name: 'queue',
        description: "Lists all tracks currently in the queue.",
    }

    async callback(client: RFClient, interaction: ChatInputCommandInteraction, config: configType) {

        return new Promise(async (res, rej) => {

            const guildId = interaction.guildId as Snowflake
            const member = interaction.member as GuildMember

            let queue = client.queueMap.get(guildId)
            const queueEmbed = new QueueEmbed(undefined, member.user.id, queue)
                queue.queueEmbeds.push(queueEmbed);
            const result = queueEmbed.getEmbed()

            const message = await interaction.editReply({ embeds: [ result.embed ], components: [ result.actionRow ] })
                queueEmbed.messageId = message.id
            return res(true)

        })

    }

}
