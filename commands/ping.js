const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('تحقق من استجابة البوت'),
  async execute(interaction) {
    const ping = Date.now() - interaction.createdTimestamp;
    await interaction.reply(`Pong! 🏓 (Latency: ${ping}ms)`);
  },
};
