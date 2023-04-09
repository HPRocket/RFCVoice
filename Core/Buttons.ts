import { ButtonInteraction } from "discord.js";
import { RFClient } from "../main";

export default async function RunButton(client: RFClient, interaction: ButtonInteraction) {

    const buttonId = interaction.customId

    // Queue Page Buttons
    if (buttonId === "previousQueuePage" || buttonId === "nextQueuePage") {

        // Get the queue
        const queue = client.queueMap.get(interaction.guildId)
            if (!queue) return await interaction.reply({ content: "Could not go to the requested page.", ephemeral: true })
        
        // Get the message Id of the embed the button is attached to
        const messageId = interaction.message.id

        // Find the message's record within the embed
        const embed = queue.queueEmbeds.find(queueEmbed => queueEmbed.messageId === messageId)
            if (!embed) return await interaction.reply({ content: "This embed has expired! You can make a new one using `/queue`.", ephemeral: true })
        
        // Make sure the user is authorized to use this embed
        if (embed.userId !== interaction.user.id) return await interaction.reply({ content: "Make your own embed using `/queue` to use this feature.", ephemeral: true })

        // Flip the page either forwards or backwards
        const queueEmbed = embed.constructEmbed(buttonId === "previousQueuePage" ? embed.pageIndex - 1 : embed.pageIndex + 1)

        // Renew the embed's timer
        embed.renew()

        // Edit the original message with the updated embed
        return await interaction.update({ embeds: [ queueEmbed.embed ], components: queueEmbed.components })

    }

    // Get the Button's ID
    // (assume queue button)
    // Get the Queue
    // Validate the user
    // Flip the page
    // Reconstruct the embed
    // Send the embed 

}