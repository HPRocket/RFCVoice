import { ActivityType, ChannelType, Client, GatewayIntentBits, Snowflake } from 'discord.js'
import * as dotenv from 'dotenv';
    dotenv.config()
import play from 'play-dl'
import Queue from './Classes/Queue';
import RunCommand, { RegisterCommands } from './Core/Commands';
import Configurations from './Core/Configurations';
import onChannelChange from './Events/onChannelChange';
import RunButton from './Core/Buttons';
import VoiceManager from './Core/Voice/VoiceManager';

export type RFClient = Client & {
    queueMap: Map<Snowflake, Queue>,
    findQueue: (guildId: Snowflake, channelId: Snowflake) => Queue,

    voiceManagers: Map<Snowflake, VoiceManager>,
    findVoiceManager: (guildId: Snowflake) => Promise<VoiceManager>,
}

const client = new Client({ intents: [ GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.Guilds, GatewayIntentBits.GuildPresences, GatewayIntentBits.GuildMembers ] }) as RFClient

client.on('ready', async () => {

    client.user.setActivity('🎶', { type: ActivityType.Listening })
    console.debug(`Logged in as ${client.user?.username}!`)

    // Register the commands
    await RegisterCommands(client)

    // Set the Queue Map
    client.queueMap = new Map<Snowflake, Queue>() // Queues are added to the map on voice channel join.
    client.findQueue = (guildId: Snowflake, channelId: Snowflake) => { // If we're not sure a queue exists, this is a safe way to fetch it

        const queue = client.queueMap.get(guildId)

        if (queue) {

            return queue

        } else {

            const newQueue = new Queue(client, guildId, channelId)
            client.queueMap.set(guildId, newQueue)
            return newQueue

        }

    }

    // Set the Voice Manager Map
    client.voiceManagers = new Map<Snowflake, VoiceManager>()
    client.findVoiceManager = async (guildId: Snowflake) => {

        const voiceManager = client.voiceManagers.get(guildId)

        if (voiceManager) {

            return voiceManager;

        } else {

            // Get the config
            const config = await new Configurations(guildId).get()

            // Create a the voice manager
            const newVoiceManager = new VoiceManager(guildId, config.voiceManager.createChannelId, config.voiceManager.channelCategoryId)

            // Save the voice manager
            client.voiceManagers.set(guildId, newVoiceManager)

            // Return the voice manager
            return newVoiceManager;

        }

    }
    client.guilds.cache.forEach(async (guild) => {

        // Get the config for each guild
        const config = await new Configurations(guild.id).get()

        // Create a voice manager for each guild
        client.voiceManagers.set(guild.id, new VoiceManager(guild.id, config.voiceManager.createChannelId, config.voiceManager.channelCategoryId))

    })
    
    client.on('interactionCreate', async (interaction) => {
        
        if (play.is_expired()) {
            await play.refreshToken() // Refresh Spotify Token if it's expired
        }

        if (interaction.inGuild()) {

            if (interaction.isChatInputCommand()){
    
                await RunCommand(client, interaction).catch(() => {})
    
            }

            if (interaction.isButton()) {

                await RunButton(client, interaction).catch(() => {})

            }

        }

    })

    const timeouts: { guildId: string, timeout: NodeJS.Timeout }[] = []
    // Listen for voice channel changes
    client.on('voiceStateUpdate', async (oldState, newState) => {

        // Someone left a channel with the bot inside
        if (oldState.channel?.members.has(client.user.id)) {

            // Check how many users are left
            const userCount = Array.from(oldState.channel.members).length
            if (userCount <= 1) { // 1 user because the bot is technically still inside

                // Disconnect the bot after a set amount of time
                const timeout = setTimeout(async () => {

                    const botMember = await oldState.guild.members.fetch(client.user.id)
                    
                    // Disconnect the bot
                    await botMember.voice.disconnect("Timeout").catch(() => {})

                }, Number(process.env.TIMEOUT_MS))

                // Save the timeout
                timeouts.push({
                    guildId: oldState.guild.id,
                    timeout: timeout,
                })

            }

        }

        // Someone joined a channel with the bot inside
        if (newState.channel?.members.has(client.user.id)) {

            // Get the timeout
            const timeout = timeouts.find(timeout => timeout.guildId === newState.guild.id)

            // Clear the timeout (if it exists)
            if (timeout) {
                clearTimeout(timeout.timeout)
            }

        }

        if (newState.member.user.id === client.user.id) {

            // Run queue updates when the client's voice channel changes
            onChannelChange(client, oldState, newState)

        }

        // Let the Voice Manager handle
        await (await client.findVoiceManager(newState.guild.id)).handleStateChange(oldState, newState)
        
    })

    // Listen for permissions updates
    client.on('channelUpdate', async (oldChannel, newChannel) => {
        if (oldChannel.type === ChannelType.GuildVoice && newChannel.type === ChannelType.GuildVoice) {

            // Get the voice manager
            const voiceManager = await client.findVoiceManager(oldChannel.guildId)
            await voiceManager.watchPermissions(oldChannel, newChannel)

        }
    })

})

client.login(process.env.TOKEN);

// Debugging Tools \\
process.on('unhandledRejection', (reason, p) => {
    console.warn('Unhandled Rejection at: Promise', p, 'reason:', reason)
    // console.trace(p)
})
