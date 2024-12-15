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
        .setName('transfer')
        .setDescription('تحويل رصيد إلى مستخدم آخر')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('المستخدم الذي سيتم التحويل إليه')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('المبلغ الذي سيتم تحويله')
                .setRequired(true)),
    async execute(interaction) {
        const sender = interaction.user;
        const recipient = interaction.options.getUser('user');
        const amount = interaction.options.getInteger('amount');

        if (amount <= 0) {
            return interaction.reply('يجب أن يكون المبلغ أكبر من 0.');
        }

        const users = loadUsers();

        
        if (!users[sender.id]) {
            users[sender.id] = { balance: 0 };
        }
        if (!users[recipient.id]) {
            users[recipient.id] = { balance: 0 };
        }

        const senderBalance = users[sender.id].balance;

       
        if (senderBalance < amount) {
            return interaction.reply(`ليس لديك رصيد كافٍ لتحويل ${amount} كريدت.`);
        }

        
        users[sender.id].balance -= amount;
        users[recipient.id].balance += amount;

      
        saveUsers(users);

      
        await interaction.reply(`تم تحويل ${amount} كريدت من حسابك إلى ${recipient.username}.`);
    },
};
