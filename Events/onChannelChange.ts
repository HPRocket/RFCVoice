import { VoiceState } from "discord.js";
import { RFClient } from "../main";
import Queue from "../Classes/Queue";

export default function onChannelChange(client: RFClient, oldState: VoiceState, newState: VoiceState ) {

    const guild = oldState.guild
    const disconnected = !newState.channelId



    // Left all voice channels
    if (disconnected) {

        // Destroy queue
        client.queueMap.delete(guild.id)
        return true;

    }



    // Connected to a new channel
    if (!disconnected) {

        // Check if this guild has an active queue
        const queue = client.queueMap.get(guild.id)
        if (queue) {

            // Update the Class
            queue.channelId = newState.channelId

        } else {

            // Make a new queue
            client.queueMap.set(guild.id, new Queue(guild.id, newState.channelId))

        }

    }

}