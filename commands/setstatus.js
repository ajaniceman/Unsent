const { SlashCommandBuilder } = require('discord.js');
const config = require('../config/config.json'); // <--- REVERT TO CONFIG
const fs = require('node:fs');
const path = require('node:path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setstatus')
        .setDescription('Sets the bot\'s online status.')
        .addStringOption(option =>
            option.setName('status')
                .setDescription('The status to set (online, idle, dnd, invisible)')
                .setRequired(true)
                .addChoices(
                    { name: 'Online', value: 'online' },
                    { name: 'Idle', value: 'idle' },
                    { name: 'Do Not Disturb', value: 'dnd' },
                    { name: 'Invisible', value: 'invisible' }
                )),
    async execute(interaction) {
        const allowedRoleIds = config.permissions.allowed_role_ids;
        const memberRoles = interaction.member.roles.cache;
        const hasPermission = allowedRoleIds.some(roleId => memberRoles.has(roleId));

        if (!hasPermission) {
            return interaction.reply({
                content: 'You do not have permission to use this command.',
                ephemeral: true
            });
        }

        await interaction.deferReply({ ephemeral: true });

        const newStatus = interaction.options.getString('status');

        try {
            await interaction.client.user.setStatus(newStatus);
            
            // --- SAVE TO CONFIG.JSON ---
            config.bot_presence.status = newStatus;
            const configPath = path.resolve(__dirname, '../config/config.json');
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            // --- END SAVE ---

            await interaction.editReply(`Bot status set to: **${newStatus.toUpperCase()}**.`);
            console.log(`Bot status changed to ${newStatus} by ${interaction.user.tag}`);
        } catch (error) {
            console.error(`Error setting bot status to ${newStatus}:`, error);
            await interaction.editReply('Failed to set bot status. Check console for errors.');
        }
    },
};