import { Client } from "discord.js";
import Commands from "../../Commands";

export default class RegisterCommands {

    client: Client

    constructor(client: Client) {
        this.client = client
    }

    async init() { // Initialize and update all Slash Commands
        return new Promise(async (resolve, reject) => {

            let slashCommandsSetData: { name: string, description: string}[] = []
            for (const Command of Commands) {
                const slashInfo = new Command(this.client).info
                slashCommandsSetData.push(slashInfo)
            }

            // Send Commands to Discord
            this.client.application!.commands.set(slashCommandsSetData).catch((err) => { throw err; })

            try {
                const testGuild = await this.client.guilds.fetch(`${process.env.TESTGUILD}`).catch((err) => { throw err; })
                testGuild.commands.set(slashCommandsSetData);
            } catch (e) {
                console.error(e);
            }


            return resolve(true);

        })
    }

}
