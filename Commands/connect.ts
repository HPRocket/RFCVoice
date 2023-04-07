import { ApplicationCommandOptionType, ChatInputCommandInteraction, GuildMember, VoiceBasedChannel } from "discord.js";
import { RFClient } from "../main";
import { joinVoiceChannel } from "@discordjs/voice";

export default class Connect {

    client: RFClient
    interaction: ChatInputCommandInteraction

    constructor(client: RFClient, interaction?: ChatInputCommandInteraction) {

        this.client = client
        this.interaction = interaction

    }

    info = {
        name: 'connect',
        description: "Ask me to connect to your channel.",
        options: [
            {
                name: "channel",
                description: "Choose a different channel for me to connect to.",
                type: ApplicationCommandOptionType.Channel,
                required: false
            },
        ]
    }

    async callback() {

        return new Promise((res, rej) => {

            let channel = this.interaction.options.getChannel("channel") as VoiceBasedChannel

            if (!channel?.id) {

                // Assume we join member's current channel
                const member = this.interaction.member as GuildMember
                channel = member?.voice.channel

                // If the channel is STILL undefined
                if (!channel?.id) {
                    return this.interaction.editReply(`Please join or specify a voice channel!`);
                }

            }

            const queue = this.client.findQueue(this.interaction.guildId, channel.id)
                queue.channelId = channel.id // Update the voice channel Id

            // Create a voice connection
            joinVoiceChannel({
                channelId: channel.id,
                guildId: channel.guildId,
                adapterCreator: channel.guild.voiceAdapterCreator,
            })

            // Confirm the Connect operation
            return this.interaction.editReply(`Joined <#${channel.id}>`);

        })

    }

}
