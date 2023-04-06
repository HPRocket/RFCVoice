import { ChatInputCommandInteraction, Client, GuildMember, Snowflake } from "discord.js";
import BaseCommand from "../Classes/Commands/BaseCommand";
import QueueEmbed from "../Classes/Music/Embeds/QueueEmbed";
import { configType } from "../Configs";
import { RFClient } from "../main";

export default class Clear extends BaseCommand {

    super(client: Client) {
        this.client = client
    }

    config = {
        updateVoiceAnnouncementsChannel: false,
        sameVC: true,
        canAutoJoinVC: false,
    }

    info = {
        name: 'clear',
        description: "Clears all tracks currently in the queue.",
    }

    async callback(client: RFClient, interaction: ChatInputCommandInteraction, config: configType) {

        return new Promise(async (res, rej) => {

            const guildId = interaction.guildId as Snowflake
            const member = interaction.member as GuildMember

            client.queueMap.get(guildId).guildQueue = []
            
            return interaction.editReply("Cleared the queue."/*{ embeds: [ basicEmbed( `🗑️｜Cleared the queue.`, colorPalette.trackOperation ) ] }*/)

        })

    }

}
