بوت البروفايل
مقدمة
بوت البروفايل هو بوت ديسكورد يسمح للمستخدمين بعرض وتخصيص صور البروفايل الخاصة بهم. يقوم البوت بجلب بيانات المستخدم، وعرض معلومات البروفايل، والسماح للمستخدمين بشراء وتطبيق خلفيات مخصصة لبروفايلاتهم. هذا الملف يشرح ميزات البوت، كيفية إعداده، وكيفية استخدام أمر /profile لتغيير خلفية البروفايل بعد شرائها.

الميزات
عرض معلومات بروفايل المستخدم بما في ذلك اسم المستخدم، تاريخ إنشاء الحساب، ورصيد الحساب.
جلب وعرض صور رمزية للمستخدم والخادم.
شراء وتطبيق خلفيات مخصصة لبروفايل المستخدم.
عرض أزرار مخصصة للانضمام إلى خادم الديسكورد وزيارة قناة اليوتيوب.
الإعداد
المتطلبات
تثبيت Node.js على جهازك.
حساب ديسكورد وخادم لإضافة البوت إليه.
التثبيت
استنساخ المستودع:

bash
Copy code
git clone <repository-url>
cd Profail_bot
تثبيت التبعيات:

bash
Copy code
npm install
تكوين البوت:

قم بتحرير ملف config.json وإضافة رمز البوت الخاص بك والإعدادات الأخرى المطلوبة.
بدء تشغيل البوت:

bash
Copy code
node index.js
الأمر: /profile
يتيح الأمر /profile للمستخدمين عرض معلومات بروفايلاتهم وتطبيق الخلفيات المخصصة. تتضمن صورة البروفايل صورة المستخدم الرمزية، أيقونة الخادم، اسم المستخدم، تاريخ إنشاء الحساب، ورصيد الحساب.

الاستخدام
لاستخدام الأمر /profile:

اكتب /profile في دردشة الديسكورد.
إذا كنت تريد عرض بروفايل مستخدم آخر، قم بذكر المستخدم مثل /profile @username.
مثال
إليك مثال لكيفية عمل الأمر /profile:

javascript
Copy code
const { SlashCommandBuilder } = require('discord.js');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch');
const { AttachmentBuilder } = require('discord.js');

const usersFilePath = path.join(__dirname, '../users.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('عرض بروفايل المستخدم')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('المستخدم لعرض البروفايل الخاص به')),
    async execute(interaction) {
        const user = interaction.options.getUser('user') || interaction.user; 
        const guild = interaction.guild; 

        const users = JSON.parse(fs.readFileSync(usersFilePath, 'utf8'));
        const userData = users[user.id];

        const backgroundImagePath = userData && userData.purchasedBackground
            ? path.join(__dirname, 'pic', userData.purchasedBackground) 
            : path.join(__dirname, 'pic', 'profile_background.png');  

        const avatarURL = user.displayAvatarURL({ format: 'png', size: 256 });
        const avatarBuffer = await fetch(avatarURL).then(res => res.buffer());

        const serverIconURL = guild.iconURL({ format: 'png', size: 64 });
        const serverIconBuffer = await fetch(serverIconURL).then(res => res.buffer());

        const userBalance = userData ? userData.balance : 0;

        const circleSvg = Buffer.from(`
            <svg width="256" height="256">
                <circle cx="128" cy="128" r="128" />
            </svg>
        `);

        const circleSvg1 = Buffer.from(`
            <svg width="64" height="64">
                <circle cx="32" cy="32" r="32" />
            </svg>
        `);

        const circularAvatarBuffer = await sharp(avatarBuffer)
            .resize(256, 256)
            .composite([{ input: circleSvg, blend: 'dest-in' }])
            .png()
            .toBuffer();

        const circularServerIconBuffer = await sharp(serverIconBuffer)
            .resize(64, 64)
            .composite([{ input: circleSvg1, blend: 'dest-in' }])
            .png()
            .toBuffer();

        const accountCreated = user.createdAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        const textName = `${user.username}`;
        const textCreatedAt = `${accountCreated}`;
        const textBalance = `Balance: ${userBalance} Credits`;

        const finalImage = await sharp(backgroundImagePath)
            .resize(700, 800) 
            .composite([
                { input: circularAvatarBuffer, top: 50, left: 30, width: 256, height: 256 },
                { input: circularServerIconBuffer, top: 20, left: 340, width: 64, height: 64 }, 
                {
                    input: Buffer.from(`<svg width="600" height="800">
                        <text x="23%" y="380" font-size="40" fill="white" font-family="Arial" text-anchor="middle" font-weight="bold">${textName}</text>
                        <text x="35%" y="455" font-size="40" fill="white" font-family="Arial" text-anchor="middle" font-weight="bold">Account created:</text>
                        <text x="35%" y="505" font-size="30" fill="white" font-family="Arial" text-anchor="middle" font-weight="bold">${textCreatedAt}</text>
                        <text x="35%" y="555" font-size="30" fill="white" font-family="Arial" text-anchor="middle" font-weight="bold">${textBalance}</text>
                    </svg>`), 
                    top: 0,
                    left: 0,
                },
            ])
            .toBuffer();

        const attachment = new AttachmentBuilder(finalImage, { name: 'profile-image.png' });
        await interaction.reply({ content: 'Here is your profile:', files: [attachment] });
    },
};
تكامل الموقع الإلكتروني
يتضمن البوت أيضًا واجهة ويب حيث يمكن للمستخدمين شراء الخلفيات لبروفايلاتهم. بمجرد شراء الخلفية، سيتم تطبيقها تلقائيًا على بروفايل المستخدم.

إضافة أزرار لوسائل التواصل الاجتماعي
لزيادة التفاعل مع المستخدمين، يمكنك إضافة أزرار لخادم الديسكورد وقناة اليوتيوب. إليك مثال على كيفية إضافة هذه الأزرار في HTML:

html
Copy code
<a href="https://discord.gg/yourserver" class="button">انضم إلى خادم الديسكورد</a>
<a href="https://youtube.com/yourchannel" class="button">زيارة قناة اليوتيوب</a>
الخاتمة
بوت البروفايل هو أداة قوية لتعزيز تفاعل المستخدمين في خادم الديسكورد الخاص بك. من خلال السماح للمستخدمين بعرض وتخصيص بروفايلاتهم، يمكنك إنشاء تجربة أكثر تفاعلية وشخصية لمجتمعك.
