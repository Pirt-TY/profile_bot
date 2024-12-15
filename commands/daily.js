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
        .setName('daily')
        .setDescription('تحصل على مكافأة يومية'),
    async execute(interaction) {
        const userId = interaction.user.id;
        const users = loadUsers();

        
        const currentDate = new Date();

       
        if (users[userId]) {
            const lastClaimedDate = new Date(users[userId].lastClaimedDaily);

            
            const timeDifference = currentDate - lastClaimedDate;
            const hoursDifference = timeDifference / (1000 * 60 * 60); 

            if (hoursDifference < 24) {
                return interaction.reply("لقد حصلت على مكافأتك اليومية مؤخراً. يرجى الانتظار 24 ساعة.");
            }
        }

      
        const dailyReward = Math.floor(Math.random() * (5000 - 1000 + 1)) + 1000;

       
        if (!users[userId]) {
            users[userId] = { balance: 0 }; 
        }
        users[userId].balance += dailyReward;

    
        users[userId].lastClaimedDaily = currentDate.toISOString();

   
        saveUsers(users);

      
        await interaction.reply(`لقد حصلت على مكافأتك اليومية بقيمة ${dailyReward} كريدت.`);
    },
};
