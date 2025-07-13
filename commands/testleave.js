const { SlashCommandBuilder } = require('discord.js');
const guildMemberRemoveEvent = require('../events/guildMemberRemove.js'); // Import your event handler

module.exports = {
    data: new SlashCommandBuilder()
        .setName('testleave')
        .setDescription('Simulates a user leaving the server.'),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            // Get the member who ran the command to simulate them leaving
            const memberToSimulate = interaction.member;

            // Trigger your guildMemberRemove event handler directly
            // Note: guildMemberRemove event handler currently doesn't need the client object,
            // but we'll pass it anyway for consistency if you add it later.
            await guildMemberRemoveEvent.execute(memberToSimulate, interaction.client);

            await interaction.editReply('Simulated **guildMemberRemove** event successfully!');
        } catch (error) {
            console.error('Error in testleave command:', error);
            await interaction.editReply('Failed to simulate **guildMemberRemove** event. Check console for errors.');
        }
    },
};