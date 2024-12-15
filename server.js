const express = require('express');
const fs = require('fs');
const path = require('path');
const session = require('express-session');
const { Client, GatewayIntentBits } = require('discord.js');
const fetch = require('node-fetch');
const { token, clientId } = require('./config.json');

const app = express();
const port = 3000;


app.use(session({
    secret: '',
    resave: false,
    saveUninitialized: true
}));


app.use(express.static(path.join(__dirname, 'public')));


const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });

client.login(token);


const usersFilePath = path.join(__dirname, 'users.json');


function loadUsers() {
    if (!fs.existsSync(usersFilePath)) {
        return {}; 
    }
    const data = fs.readFileSync(usersFilePath, 'utf-8');
    return JSON.parse(data);
}
app.use(express.json());  


app.get('/', (req, res) => {
    res.send(`
        <html>
            <head><title>Login with Discord</title></head>
            <body>
                <a href="/login">Login with Discord</a>
            </body>
        </html>
    `);
});


app.get('/login', (req, res) => {
    const redirectUri = `https://discord.com/oauth2/authorize?client_id=${clientId}&redirect_uri=${web}&response_type=code&scope=identify`;
    res.redirect(redirectUri);
});


app.get('/callback', async (req, res) => {
    const code = req.query.code;

  
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        body: new URLSearchParams({
            client_id: '',
            client_secret: '',
            code: code,
            grant_type: 'authorization_code',
            redirect_uri: ``,
        }),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    });

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    
  
    const userDataResponse = await fetch('https://discord.com/api/v10/users/@me', {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    const userData = await userDataResponse.json();


    req.session.user = userData;
    res.redirect('/profile');
});


app.get('/profile', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/');
    }

    const users = loadUsers();
    const user = users[req.session.user.id];

  
    if (!user) {
        users[req.session.user.id] = { balance: 0 };
        fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
    }

    const username = req.session.user.username;
    const balance = user.balance;

    res.send(`
        <html>
            <head><title>${username}'s Profile</title></head>
            <body>
                <h1>Welcome, ${username}!</h1>
                <p>Your balance: ${balance} credits</p>
                <a href="/logout">Logout</a>
				<br>
                <a href="/images">images</a>
            </body>
        </html>
    `);
});


app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});


app.use('/commands/pic', express.static(path.join(__dirname, 'commands', 'pic')));


app.get('/images', (req, res) => {
    const picFolderPath = path.join(__dirname, 'commands', 'pic'); 
    fs.readdir(picFolderPath, (err, files) => {
        if (err) {
            return res.status(500).send('حدث خطأ أثناء قراءة المجلد');
        }

        
        const images = files.filter(file => {
            const ext = path.extname(file).toLowerCase();
            return ext === '.png' || ext === '.jpg' || ext === '.jpeg';
        });

    
        res.send(`
            <html>
                <head>
                    <title>Images</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            background-color: #f4f4f4;
                            text-align: center;
                        }
                        h1 {
                            color: #333;
                        }
                        .image-container {
                            display: flex;
                            flex-wrap: wrap;
                            justify-content: center;
                            gap: 15px;
                            padding: 20px;
                        }
                        .image-container img {
                            width: 300px;
                            height: auto;
                            border-radius: 10px;
                            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                            cursor: pointer;
                        }
                        .image-container div {
                            text-align: center;
                        }
                        .buy-button {
                            display: block;
                            margin-top: 10px;
                            padding: 10px 20px;
                            background-color: #4CAF50;
                            color: white;
                            border: none;
                            border-radius: 5px;
                            cursor: pointer;
                        }
                    </style>
                </head>
                <body>
                    <h1>Available Images</h1>
                    <div class="image-container">
                        ${images.map(image => `
                            <div>
                                <img src="/commands/pic/${image}" alt="${image}">
                                <button class="buy-button" onclick="buyImage('${image}')">Buy for 5000 credits</button>
                            </div>
                        `).join('')}
                    </div>
                    <script>
                       function buyImage(imageName) {
    fetch('/buy-image', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageName: imageName })  
    })
    .then(response => response.json())
    .then(data => alert(data.message))
    .catch(error => alert('Error buying image.'));
}

                    </script>
                </body>
            </html>
        `);
    });
});

app.post('/buy-image', (req, res) => {
    const { imageName } = req.body;  

   
    if (!imageName) {
        return res.status(400).json({ message: 'Image name is required' });
    }

    const userId = req.session.user.id;  
    const users = loadUsers();
    const user = users[userId];

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    const price = 5000;
    if (user.balance < price) {
        return res.status(400).json({ message: 'You do not have enough credits' });
    }

  
    user.balance -= price;
    user.purchasedBackground = imageName;  

   
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));

    res.json({ message: `You have successfully bought the image: ${imageName}` });
});




app.listen(port, () => {
    console.log(`Server is running `);
});
