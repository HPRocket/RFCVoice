// Set a channel with the new state
// IF there is no player, create one. (we need to account for channel switching)

import { VoiceState } from "discord.js";
import { RFClient } from "../../main";

export default function onDisconnect(client: RFClient, oldState: VoiceState, newState: VoiceState) {

    if (!newState.channelId) {

        // Destroy the guild's Queue if there is not a new channel to stream to.
        const queue = client.queueMap.get(oldState.guild.id)    
            if (queue) {

                queue.player.stop() // Handle the disconnect as expected.

            }
        
        return client.queueMap.delete(oldState.guild.id)

    }

    return false;
    
}
