const { Events } = require('discord.js');
const chalk = require('chalk')

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute() {
		console.log(`[SYSTEM] Authenticated with Discord Web Socket!`);
		console.log(chalk.redBright("[DEVELOPER] Developed by hampuiz (Discord username)"))
		console.log(chalk.bgRedBright("Contact on discord for help!"))
	},
};