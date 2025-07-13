const fs = require('node:fs');
const path = require('node:path');
const { Client, GatewayIntentBits, Collection, Events, REST, Routes } = require('discord.js'); // Add REST and Routes
const config = require('./config/config.json');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
    ],
});

// Create a Collection to store your commands
client.commands = new Collection(); // <--- NEW

// Load commands
const commandsPath = path.join(__dirname, 'commands'); // <--- NEW
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js')); // <--- NEW

for (const file of commandFiles) { // <--- NEW BLOCK FOR COMMANDS
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
        console.log(`Loaded command: ${command.data.name}`);
    } else {
        console.warn(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}


// Load event files (existing code, just showing context)
client.events = new Collection();
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if ('name' in event && 'execute' in event) {
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args, client));
        } else {
            client.on(event.name, (...args) => event.execute(...args, client));
        }
        client.events.set(event.name, event);
        console.log(`Loaded event: ${event.name}`);
    } else {
        console.warn(`[WARNING] The event at ${filePath} is missing a required "name" or "execute" property.`);
    }
}


// When the client is ready, deploy slash commands
client.once(Events.ClientReady, async c => { // <--- MODIFIED TO BE ASYNC
    console.log(`Ready! Logged in as ${c.user.tag}`);
    console.log(`Bot ID: ${c.user.id}`);
    console.log(`Currently in ${client.guilds.cache.size} guilds.`);

    // Deploy slash commands
    const commandsToDeploy = [];
    for (const command of client.commands.values()) {
        commandsToDeploy.push(command.data.toJSON());
    }

    const rest = new REST({ version: '10' }).setToken(config.bot.token);

    try {
        console.log(`Started refreshing ${commandsToDeploy.length} application (/) commands.`);

        // Register commands for a specific guild (faster for testing)
        const data = await rest.put(
            Routes.applicationGuildCommands(c.user.id, config.guild_id), // <--- Use Guild ID from config
            { body: commandsToDeploy },
        );

        console.log(`Successfully reloaded ${data.length} application (/) commands in guild ${config.guild_id}.`);
    } catch (error) {
        console.error(error);
    }
});

// Handle slash command interactions
client.on(Events.InteractionCreate, async interaction => { // <--- NEW BLOCK FOR INTERACTIONS
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }
});


client.login(config.bot.token);

process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});