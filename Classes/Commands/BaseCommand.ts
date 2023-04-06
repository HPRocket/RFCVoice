import { ApplicationCommandOptionType, ChatInputCommandInteraction, Client } from "discord.js"
import { configType } from "../../Configs"
import { RFClient } from "../../main"

type CommandInfo = {
    name: string,
    description: string,
    options?: {
        name: string,
        description: string,
        type: ApplicationCommandOptionType,
        required?: boolean
    }[],
}

export type CommandConfig = {
    updateVoiceAnnouncementsChannel: boolean, // Does this command change the channel where "Now Playing" notifications are sent?
    sameVC: boolean, // Is the bot in the same Voice Channel as the user who used the command?
    canAutoJoinVC: boolean, // Can the bot join a Voice Channel on the invocation of this command?
}

export default class BaseCommand {

    client: Client

    constructor(client: Client) {
        this.client = client
    }

    config = {} as CommandConfig

    info = {} as CommandInfo

    callback(client: RFClient, interaction: ChatInputCommandInteraction, config: configType) {}
    
}
