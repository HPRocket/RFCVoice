import { ButtonInteraction } from "discord.js";
import QueueEmbed from "../../Classes/Music/Embeds/QueueEmbed";
import { RFClient } from "../../main";

export default async function onButton(interaction: ButtonInteraction, client: RFClient) {
    const guildQueue = client.queueMap.get(interaction.guildId)

    // Global Cleanup for Inactive Embeds
    const timestamp = Math.floor(Date.now() / 1000)
    let currentInactive = false
    for (const [index, embedObj] of Array.from(guildQueue.queueEmbeds.entries())) {

        if (embedObj.lastUsed + 120 < timestamp) { // It's been more than 2 minutes since it was last used

            guildQueue.queueEmbeds.splice(index, 1) // Remove the embed
            if (embedObj.messageId == interaction.message.id) currentInactive = true
            
        }
        
    }
    

    const currentQueueEmbed = guildQueue.queueEmbeds.find((embed) => { return embed.messageId == interaction.message.id })

        if (currentInactive || !currentQueueEmbed) return await interaction.reply({ content: `This message is inactive! Run ${"`"}/queue${"`"} to get another one.`, ephemeral: true }).catch((err) => { throw err });
    


    // Next Page Button
    if (interaction.customId == "nextQueuePage") {

        const newQueueEmbed = new QueueEmbed(interaction.message.id, interaction.user.id, guildQueue)
        const newQueueEmbedObject = newQueueEmbed.getEmbed(currentQueueEmbed.page + 1);
            if (!newQueueEmbedObject) return await interaction.reply({ content: `🛑｜Can't go to the next page.`, ephemeral: true }).catch((err) => { throw err; });
        
        newQueueEmbed.lastUsed = timestamp // Mark so it will expire properly later.
        currentQueueEmbed.page++

        
        await interaction.update({ embeds: [ newQueueEmbedObject.embed ], components: [ newQueueEmbedObject.actionRow ] }).catch((err) => { throw err; });
        


    // Previous Page Button
    } else if (interaction.customId == "previousQueuePage") {

        const newQueueEmbed = new QueueEmbed(interaction.message.id, interaction.user.id, guildQueue)
        const newQueueEmbedObject = newQueueEmbed.getEmbed(currentQueueEmbed.page - 1);
            if (!newQueueEmbedObject) return await interaction.reply({ content: `🛑｜Can't go to the previous page.`, ephemeral: true }).catch((err) => { throw err; });
        
        newQueueEmbed.lastUsed = timestamp // Mark so it will expire properly later.
        currentQueueEmbed.page--
        
        
        await interaction.update({ embeds: [ newQueueEmbedObject.embed ], components: [ newQueueEmbedObject.actionRow ] }).catch((err) => { throw err; });

    }
}
