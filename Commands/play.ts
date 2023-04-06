import { ApplicationCommandOptionType, ChatInputCommandInteraction, Client, Snowflake } from "discord.js";
import BaseCommand from "../Classes/Commands/BaseCommand";
import Search from "../Classes/Music/Queue/Actions/Search";
import { configType } from "../Configs";
import { RFClient } from "../main";

export default class Play extends BaseCommand {

    super(client: Client) {
        this.client = client
    }

    config = {
        updateVoiceAnnouncementsChannel: true,
        sameVC: true,
        canAutoJoinVC: true,
    }

    info = {
        name: 'play',
        description: "Search for a video from YouTube, or enter a link (YouTube, Spotify, Discord Media).",
        options: [
            {
                name: "query",
                description: "Your search query.",
                type: ApplicationCommandOptionType.String,
                required: true
            },
        ]
    }

    async callback(client: RFClient, interaction: ChatInputCommandInteraction, config: configType) {

        return new Promise(async (res, rej) => {

            const query = interaction.options.getString('query')
            const guildId = interaction.guildId as Snowflake

            const track = await new Search(query!).getTrack().catch((err) => { throw err; })
                if (!track) return console.error("Could not get track!");

            // Request Queue to insert track
            const guildQueue = client.queueMap.get(guildId)
                if (!guildQueue) return console.error("Could not find guildQueue!");
            await guildQueue.insertTracks(track);
            guildQueue.voiceAnnouncementsChannel = interaction.channelId

            return res(interaction.editReply(`Playing ${track![0].title}.`)) // FEATURE: Need an embed response

        })

    }

}
