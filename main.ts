import { ChatInputCommandInteraction, Client, GatewayIntentBits, InteractionType, Snowflake } from 'discord.js'
import * as dotenv from 'dotenv'
import RegisterCommands from './Classes/Commands/Initialize'
import Queue from './Classes/Music/Queue/Queue'
import Config from './Configs'
import onButton from './Events/Interactions/onButton'
import Command from './Events/Interactions/onCommand'
import onDisconnect from './Events/Voice/onDisconnect'
import onVoiceChannelJoin from './Events/Voice/onVoiceChannelJoin'
    dotenv.config()


export type RFClient = Client & {
    queueMap: Map<Snowflake, Queue>
}

const client = new Client({ intents: [GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.Guilds, GatewayIntentBits.GuildPresences, GatewayIntentBits.GuildMembers] }) as RFClient

client.on('ready', async () => {

    console.debug(`Logged in as ${client.user?.username}!`)

    await new RegisterCommands(client).init();

    client.queueMap = new Map<Snowflake, Queue>() // Queues are added to the map on voice channel join.


    client.on('interactionCreate', async (interaction) => {
        
        if (interaction.inGuild()) {

            const config = await new Config().getExisting(interaction.guildId)

            if (interaction.isChatInputCommand()){//type == InteractionType.ApplicationCommand) {
    
                await new Command(client, interaction as ChatInputCommandInteraction).run(config).catch((err) => { throw err; })
    
            }

            if (interaction.isButton()) {

                await onButton(interaction, client).catch((err) => { throw err; })

            }

        }

    })



    client.on('voiceStateUpdate', async (oldState, newState) => {

        const disconnected = newState.channelId == undefined

        if (disconnected) {

            // onDisconnect (destroy player)
            onDisconnect(client, oldState, newState)

        } else {

            // onVoiceChannelJoin (Set new channel w/ newState)
            await onVoiceChannelJoin(client, oldState, newState)
            
        }

    })

})

client.login(process.env.TOKEN);
