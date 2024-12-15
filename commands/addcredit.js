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


function saveUsers(users) {
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addcredit')
        .setDescription('إضافة كريدت إلى حساب مستخدم')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('المستخدم الذي سيتم إضافة الكريدت إليه')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('المبلغ الذي سيتم إضافته')
                .setRequired(true)),
    async execute(interaction) {
        const targetUser = interaction.options.getUser('user');
        const amount = interaction.options.getInteger('amount');

       
        if (amount <= 0) {
            return interaction.reply('يجب أن يكون المبلغ أكبر من 0.');
        }

        const users = loadUsers();

       
        if (!users[targetUser.id]) {
            users[targetUser.id] = { balance: 0 };
        }

       
        users[targetUser.id].balance += amount;

     
        saveUsers(users);

      
        await interaction.reply(`تم إضافة ${amount} كريدت إلى حساب ${targetUser.username}.`);
    },
};
