import { Snowflake, TextChannel } from "discord.js";
import { RFClient } from "../main";
import Track from "../Classes/Track";
import EventEmbed from "../Responses/Event";

export default async function onTrackLoad(client: RFClient, newTrack: Track, eventsChannel: Snowflake) {
    
    // Display the information needed
    const embed = new EventEmbed({ content: `🔊｜Now playing: [${newTrack.title}](${newTrack.source}) by ${"`"}${newTrack.author}${"`"}` }).constructEmbed().embed

    // Get the channel
    const channel = await client.channels.fetch(eventsChannel).catch(() => {}) as TextChannel
        if (!channel) return;

    // Send the embed
    channel.send({ embeds: [ embed ] })

}