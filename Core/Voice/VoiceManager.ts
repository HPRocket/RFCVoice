import { ChannelType, PermissionFlagsBits, PermissionsBitField, Snowflake, VoiceChannel, VoiceState } from "discord.js";

export default class VoiceManager {

    guildId: Snowflake
    createChannel: Snowflake
    channelsCategory: Snowflake

    oldState: VoiceState
    newState: VoiceState

    constructor(guildId: Snowflake, createChannel: Snowflake, channelsCategory: Snowflake) {

        this.guildId = guildId
        this.createChannel = createChannel
        this.channelsCategory = channelsCategory

    }

    async handleStateChange(oldState: VoiceState, newState: VoiceState) {

        this.oldState = oldState
        this.newState = newState

        if (this.newState.channelId === this.createChannel) {
            return await this.requestCreate().catch(() => {});
        }

        if (this.oldState.channel?.parentId === this.channelsCategory) {
            return await this.checkEmpty();
        }

    }

    async requestCreate() {

        const voiceChannel = await this.newState.guild.channels.create({
            name: this.newState.member.user.username,
            type: ChannelType.GuildVoice,
            permissionOverwrites: [
                {
                    id: this.newState.member.id,
                    allow: [ PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ManageRoles ] // Let the channel creator manage the channel and edit roles for the channel
                },
                {
                    id: this.newState.guild.id,
                    allow: [ PermissionFlagsBits.ViewChannel ] // Let everyone access the channel.
                }
            ]
        }).catch((err) => { throw err; });

        await voiceChannel.setParent(this.channelsCategory, { lockPermissions: false });

        // Connect the user to the new channel
        await this.newState.setChannel(voiceChannel).catch(() => {});

    }

    private async checkEmpty() {

        // Don't delete the create channel
        if (this.oldState.channelId === this.createChannel) return;

        // Get an array of all the members in the voice channel
        const channelMembers = Array.from(this.oldState.channel.members)
        if (channelMembers.length <= 0) {

            // Delete the empty channel
            await this.oldState.channel.delete().catch(() => {});

        }

    }

    /**
     * An exploit was discovered with Discord's new Voice Channel Text Chat feature where users could
     * give themselves mass ping permissions (@everyone) and mass ping the server. This function
     * is meant to watch for this permission being granted and to subsequently deny it whenever it changes.
     */
    async watchPermissions(oldChannel: VoiceChannel, newChannel: VoiceChannel) {

        // Only deny this permission for Private VCs
        if (newChannel.parentId == this.channelsCategory) {

            const permissions = newChannel.permissionOverwrites
            permissions.cache.forEach(permission => {

                if (permission.allow.has(PermissionsBitField.Flags.MentionEveryone)) {

                    newChannel.permissionOverwrites.edit(permission.id, { MentionEveryone: false })

                }

            })
                
        }

    }

}
