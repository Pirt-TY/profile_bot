const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('web')
    .setDescription('موقع ويب خاص بلبوت'),
  async execute(interaction) {
    await interaction.reply('https://3cb54df1-fc4a-445d-b907-7d5e029bdd31-00-1aguqspjsbxx6.worf.replit.dev/');
  },
};
