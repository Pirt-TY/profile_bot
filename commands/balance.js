const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');


const usersFilePath = path.join(__dirname, '../users.json');

function loadUsers() {
    if (!fs.existsSync(usersFilePath)) {
        return {};
    }
    const data = fs.readFileSync(usersFilePath, 'utf-8');
    return JSON.parse(data);
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('عرض رصيد المستخدم')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('المستخدم لعرض رصيده')
                .setRequired(false)), 
    async execute(interaction) {
        const user = interaction.options.getUser('user') || interaction.user;
        const users = loadUsers();

        if (!users[user.id]) {
            return interaction.reply(`${user.username} ليس لديه رصيد بعد.`);
        }

        const balance = users[user.id].balance || 0;
        await interaction.reply(`${user.username} رصيدك هو: ${balance} كريدت.`);
    },
};
