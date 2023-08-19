const { SlashCommandBuilder, CommandInteraction, EmbedBuilder } = require('discord.js');
const { SERVER } = require('../../../../config.json')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('createpanel')
		.setDescription('Create the verification dashboard!'),

	/**
	 * @param {CommandInteraction} interaction 
	 */
	async execute(interaction) {
		const infoEmbed = new EmbedBuilder()
        .setColor(SERVER.SERVER_EMBED_COLOR)
        .setTitle("Server Verification")
        .setDescription('To gain access to the server we kindly ask you to visit the link below to verify your account.')
        .addFields({
            name: "Website",
            value: "```🟢 " + SERVER.WEB_URL + "```"
        })
        .setFooter({ text: 'Developed by hampuiz' })

        await interaction.channel.send({ embeds: [infoEmbed] })
        await interaction.reply({ content: 'Verification panel has been sent in the channel!', ephemeral: true })
	},
};