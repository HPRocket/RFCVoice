import { ApplicationCommandOptionType, ChatInputCommandInteraction, GuildMember } from "discord.js";
import { RFClient } from "../main";
import ActionEmbed from "../Responses/Action";

export default class GoTo {

    client: RFClient
    interaction: ChatInputCommandInteraction

    constructor(client: RFClient, interaction?: ChatInputCommandInteraction) {

        this.client = client
        this.interaction = interaction

    }

    info = {
        name: 'goto',
        description: "Go to a specific track in the queue.",
        options: [
            {
                name: "position",
                description: "The position of the track in the queue to go to.",
                type: ApplicationCommandOptionType.Number,
                required: true
            },
        ]
    }

    async callback() {

        return new Promise(async (res, rej) => {

            // Get the user passed index to query (Base 1)
            const trackIndex = this.interaction.options.getNumber("position", true)

            // Get the user's current voice channel
            const member = this.interaction.member as GuildMember
            const channelId = member?.voice.channelId

            // Get the queue for this guild
            const queue = this.client.findQueue(this.interaction.guildId, channelId)
                queue.eventsChannel = this.interaction.channelId // Update the events channel based on this command

            // Go to the track (if possible)
            const track = await queue.goto(trackIndex - 1).catch(async (err) => {

                await this.interaction.editReply({ embeds: [ new ActionEmbed({ content: `Could not go to ${"`"}${trackIndex}${"`"}.`, icon: "🛑" }).constructEmbed(true).embed ] })
                throw err;

            })

            // Confirm the Go To operation
            return res(await this.interaction.editReply({ embeds: [ new ActionEmbed({ content: `Went to ${"`"}${trackIndex}${"`"}\n[${track.newTrack.title}](${track.newTrack.source}) by ${"`"}${track.newTrack.author}${"`"}.`, icon: "⏭️" }).constructEmbed().embed ] }));

        })

    }

}
