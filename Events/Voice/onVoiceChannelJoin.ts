// Set a channel with the new state
// IF there is no player, create one. (we need to account for channel switching)

import { VoiceState } from "discord.js";
import Queue from "../../Classes/Music/Queue/Queue";
import { RFClient } from "../../main";

export default async function onVoiceChannelJoin(client: RFClient, oldState: VoiceState, newState: VoiceState) {

    const payload = client.queueMap.get(oldState.guild.id)

    if (!payload) { // No Queue for the guild

        // Create a new Queue for the guild
        let guildQueue = new Queue(client, newState.guild.id)
            // Initialize Queue Listeners
            guildQueue.listeners()

        return client.queueMap.set(newState.guild.id, guildQueue)
        
    }

    return true;

}
