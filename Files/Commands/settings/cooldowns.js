const Discord = require('discord.js');
const moment = require('moment');
require('moment-duration-format');

module.exports = {
	perm: 8192n,
	type: 1,
	setupRequired: false,
	displayEmbed(msg, r) {
		console.log(1)
		const embed = new Discord.MessageEmbed();
		for (let i = 0; i < r.length; i++) {
			r = r[i];
			embed.addFields(
				{
					name: `${msg.language.number}:\`${r.id}\` | ${msg.language.command}: \`${r.command}\` | ${r.active ? `${msg.client.constants.emotes.tick} ${msg.language.enabled}` : `${msg.client.constants.emotes.cross} ${msg.language.disabled}`}`,
					value: `${msg.language.cooldown}: ${moment.duration(r.cooldown * 1000).format(`s [${msg.language.time.seconds}]`)} `, 
					inline: true
				}
			);
		}
		return embed;
	},

};