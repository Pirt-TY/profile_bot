const { Client, GatewayIntentBits } = require('discord.js');
const { token, clientId, guildId } = require('./config.json');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');
const { spawn } = require('child_process');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  
 
  const commands = [];
  const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

  
  console.log('الأوامر التي تم تحميلها:');
  for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
    console.log(`تم تحميل الأمر: ${file}`); 
  }

  const rest = new REST({ version: '9' }).setToken(token);

  
  rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
    .then(() => console.log('تم تحميل الأوامر إلى الـ Discord API!'))
    .catch(console.error);
});


client.login(token);


client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

 
  const command = require(`./commands/${commandName}.js`);
  if (command) {
    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'حدث خطأ أثناء تنفيذ الأمر!', ephemeral: true });
    }
  }
});

const server = spawn('node', ['server.js']);

server.on('error', (err) => {
  console.error('خطأ أثناء تشغيل server.js:', err);
});


server.stdout.on('data', (data) => {
  console.log(`server.js: ${data}`);
});


server.stderr.on('data', (data) => {
  console.error(`خطأ من server.js: ${data}`);
});


server.on('close', (code) => {
  console.log(`تم إغلاق العملية مع رمز: ${code}`);
});
