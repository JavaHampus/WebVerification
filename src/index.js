const { Client, GatewayIntentBits, Collection, EmbedBuilder } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const { CLIENT, SERVER } = require('../config.json')
const express = require('express')
const session = require('express-session')
const bodyParser = require('body-parser')

const { router } = require('./server/routes/Auth.route.js')
const { VerifyRouter } = require('./server/routes/Verify.route.js')

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers, GatewayIntentBits.MessageContent , GatewayIntentBits.Guilds, GatewayIntentBits.GuildPresences, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildMessageTyping]
});

client.commands = new Collection();

const foldersPath = path.join(__dirname, './discord/commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

const eventsPath = path.join(__dirname, './discord/events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

const app = express()

app.use(session({
	secret: 'xsd99x02esUUUUX',
	resave: false,
	saveUninitialized: true,
}))

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './server/views'));

app.get('/', (req, res) => {
	if(!req.session.user) return res.redirect('/auth')
	res.render('index.ejs', { server: SERVER })
})

app.use('/auth', router)
app.use('/verify', VerifyRouter)
app.get('/completed', (req, res) => {
	res.render('completed')
})

app.post('/back/handle_request', async (req, res) => {
	if(!req.session.user) return res.render('error', { errorMessage: "Not logged in!"});

	const guild = client.guilds.cache.get(SERVER.SERVER_ID);
	const role = guild.roles.cache.get(SERVER.VERIFICATION_ROLE)
	const user = guild.members.cache.get(req.session.user.id)
	const channel = guild.channels.cache.get(SERVER.LOGS_CHANNEL)

	if(!user) return res.render('error', { errorMessage: "You are not a member of the server!"});
	if(user.roles.cache.has(SERVER.VERIFICATION_ROLE)) return res.render('error', { errorMessage: "You have already been verified!"});

	user.roles.add(SERVER.VERIFICATION_ROLE)

	const logEmbed = new EmbedBuilder()
	.setColor(SERVER.SERVER_EMBED_COLOR)
	.setTitle("Verification Completed")
	.setDescription('A user has completed the verification process and can now enter the server.')
	.addFields({
		name: "Username",
		value: "```" + req.session.user.username + "```",
		inline: true
	}, {
		name: "Path",
		value: "```Web Dashboard```"
	})
	.setFooter({ text: 'Developed by hampuiz' })

	await channel.send({ embeds: [logEmbed] })
	res.redirect('/completed')
})

app.listen(80, () => console.log("[SYSTEM] Web application is running."))

client.login(CLIENT.CLIENT_TOKEN);
