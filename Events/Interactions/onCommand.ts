import { ChatInputCommandInteraction, GuildMember } from "discord.js";
import { configType } from "../../Configs";
import Commands from "../../Commands";
import { RFClient } from "../../main";
import { joinVoiceChannel } from "@discordjs/voice";
import { CommandConfig } from "../../Classes/Commands/BaseCommand";

export default class Command {

    client: RFClient
    command: ChatInputCommandInteraction

    constructor(client: RFClient, command: ChatInputCommandInteraction) {
        this.client = client
        this.command = command
    }



    private async canRun(config: CommandConfig): Promise<{ canRun: boolean, reason: string }> {

        const author = this.command.member as GuildMember

        if (config.sameVC) {

            // Is the bot in the same Voice Channel as the user?

            const clientMember = await this.command.guild.members.fetch(this.client.user.id).catch((err) => { throw err; })
            
            if (clientMember.voice.channelId && (clientMember.voice.channelId != author.voice.channelId)) return {
                canRun: false,
                reason: "Please disconnect me from the voice channel I am currently in, or join that voice channel to use this command.",
            }

        }

        if (config.canAutoJoinVC) {

            // Can the bot just join a Voice Channel on the invocation of this command?
            
            const joinChannel = joinVoiceChannel({
                channelId: author.voice.channelId,
                guildId: this.command.guildId,
                adapterCreator: this.command.guild.voiceAdapterCreator,
            })

                if (!joinChannel) return { // Could not join the voice channel.
                    canRun: false,
                    reason: "Please join a voice channel, or join a voice channel that I have access to."
                }

            return { // Could join the voice channel.
                canRun: true,
                reason: "Auto Joined.",
            }

        }

        // No requirements.
        return {
            canRun: true,
            reason: "No requirements."
        }

    }



    async run(config: configType) {
        const commandName = this.command.commandName
        
        for (const Command of Commands) {

            const command = new Command(this.client)

            if (command.info.name == commandName) {
                await this.command.deferReply({ ephemeral: false }).catch((err) => { throw err; })

                const commandConfig = command.config


                const runnable = await this.canRun(commandConfig)
                    if (!runnable.canRun) await this.command.editReply(runnable.reason).catch((err) => { throw err; })

                
                if (commandConfig.updateVoiceAnnouncementsChannel) { // We need to update the Voice Announcements Channel depending on where the command was run.
            
                    const guildQueue = this.client.queueMap.get(this.command.guildId)
                        if (guildQueue) guildQueue.voiceAnnouncementsChannel = this.command.channelId
            
                }


                await command.callback(this.client, this.command, config).catch((err) => { throw err; }) // Run the command
                return;

            }

            continue;

        }
    }

}
