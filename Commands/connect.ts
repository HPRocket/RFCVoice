import { ApplicationCommandOptionType, ChannelType, ChatInputCommandInteraction, Client, GuildMember, VoiceBasedChannel } from "discord.js";
import { getVoiceConnection, joinVoiceChannel } from '@discordjs/voice';
import BaseCommand from "../Classes/Commands/BaseCommand";
import { configType } from "../Configs";
import { RFClient } from "../main";

export default class Connect extends BaseCommand {

    super(client: Client) {
        this.client = client
    }

    config = {
        updateVoiceAnnouncementsChannel: false,
        sameVC: false,
        canAutoJoinVC: true,
    }

    info = {
        name: 'connect',
        description: "Ask me to connect to your channel, or a channel you select below.",
        options: [
            {
                name: "channel",
                description: "Choose a different channel for me to connect to.",
                type: ApplicationCommandOptionType.Channel,
                required: false
            },
        ]
    }

    async callback(client: RFClient, interaction: ChatInputCommandInteraction, config: configType) {

        return new Promise(async (res, rej) => {
            
            const connection = getVoiceConnection(interaction.guildId)
            return res(interaction.editReply(/*{ embeds: [ basicEmbed( `🚪｜Joined <#${voiceChannel.id}>.`, colorPalette.trackOperation ) ] })*/`Joined <#${connection.joinConfig.channelId}>.`))

        })

    }

}