import { ButtonInteraction } from "discord.js";
import { RFClient } from "../main";
import Locale from "../Responses/Locale";

export default async function RunButton(client: RFClient, interaction: ButtonInteraction) {

    const buttonId = interaction.customId
    const locale = new Locale(interaction)

    // Queue Page Buttons
    if (buttonId === "previousQueuePage" || buttonId === "nextQueuePage") {

        // Get the queue
        const queue = client.queueMap.get(interaction.guildId)
            if (!queue) return await interaction.reply({ content: locale.responses.queue.buttons.pageFail, ephemeral: true })
        
        // Get the message Id of the embed the button is attached to
        const messageId = interaction.message.id

        // Find the message's record within the embed
        const embed = queue.queueEmbeds.find(queueEmbed => queueEmbed.messageId === messageId)
            if (!embed) return await interaction.reply({ content: locale.responses.queue.buttons.pageExpire, ephemeral: true })
        
        // Make sure the user is authorized to use this embed
        if (embed.userId !== interaction.user.id) return await interaction.reply({ content: locale.responses.queue.buttons.permissionsFail, ephemeral: true })

        // Renew the embed's content and timer
        embed.renew()

        // Flip the page either forwards or backwards
        const queueEmbed = embed.constructEmbed(buttonId === "previousQueuePage" ? embed.pageIndex - 1 : embed.pageIndex + 1)

        // Edit the original message with the updated embed
        return await interaction.update({ embeds: [ queueEmbed.embed ], components: queueEmbed.components })

    }

}
