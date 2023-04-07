import { VoiceState } from "discord.js";
import { RFClient } from "../main";
import Queue from "../Classes/Queue";
import { getVoiceConnection } from "@discordjs/voice";

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

        const connection = getVoiceConnection(newState.guild.id)

        // Check if this guild has an active queue
        const queue = client.queueMap.get(guild.id)
        if (queue) {

            // Update the Class
            queue.channelId = newState.channelId

            // Add the player to the connection
            connection.subscribe(queue.player)
            
        } else {

            // Make a new queue
            const newQueue = new Queue(guild.id, newState.channelId)
                connection.subscribe(queue.player) // Add the player to the connection
            
            client.queueMap.set(guild.id, newQueue)

        }

    }

}