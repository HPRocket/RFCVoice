import { ChatInputCommandInteraction } from "discord.js"
import { RFClient } from "../main"

export default class RFCommand {

    client: RFClient
    interaction: ChatInputCommandInteraction

    constructor(client: RFClient, interaction?: ChatInputCommandInteraction) {

        this.client = client
        this.interaction = interaction

    }

    info = {}

    async callback(): Promise<any> {

        // insert callback here

    }

}
