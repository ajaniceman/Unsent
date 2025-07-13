const { SlashCommandBuilder } = require('discord.js');
const guildMemberAddEvent = require('../events/guildMemberAdd.js'); // Import your event handler

module.exports = {
    // SlashCommandBuilder helps build the command structure for Discord
    data: new SlashCommandBuilder()
        .setName('testjoin')
        .setDescription('Simulates a user joining the server.'),
    async execute(interaction) {
        // Defer reply immediately, as event handling might take a moment
        await interaction.deferReply({ ephemeral: true }); // ephemeral: true makes the reply visible only to the user who ran the command

        try {
            // Get the member who ran the command to simulate them joining
            const memberToSimulate = interaction.member;

            // Trigger your guildMemberAdd event handler directly
            // Pass the member object and the client object (your bot instance)
            await guildMemberAddEvent.execute(memberToSimulate, interaction.client);

            await interaction.editReply('Simulated **guildMemberAdd** event successfully!');
        } catch (error) {
            console.error('Error in testjoin command:', error);
            await interaction.editReply('Failed to simulate **guildMemberAdd** event. Check console for errors.');
        }
    },
};