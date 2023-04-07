import { ChatInputCommandInteraction } from "discord.js";
import { RFClient } from "../main";
import Commands from '../Commands'

export default async function RunCommand(client: RFClient, interaction: ChatInputCommandInteraction) {

    // Get the callback
    const commandClass = Commands.find(command => command.name == interaction.commandName)?.class

    // Defer the command
    await interaction.deferReply()

    // Run the callback
    await new commandClass(client, interaction).callback()

}


export async function RegisterCommands(client: RFClient) {

    let commandsData: { name: string, description: string }[] = [] 
    for (const command of Commands) {
        const commandInfo = new command.class(client).info
        commandsData.push(commandInfo)
    }

    // Globally apply the commands
    await client.application.commands.set(commandsData).catch((err) => { throw err; });

    // Apply the commands to the test guild
    try {

        const testGuild = await client.guilds.fetch(process.env.TESTGUILD);
        testGuild.commands.set(commandsData);

    } catch (e) {

        console.error(e);

    }

}


export class RFCommand {

    client: RFClient
    interaction: ChatInputCommandInteraction

    constructor(client: RFClient, interaction?: ChatInputCommandInteraction) {

        this.client = client
        this.interaction = interaction

    }

    info = {}

    async callback() {

        // insert callback here

    }

}
