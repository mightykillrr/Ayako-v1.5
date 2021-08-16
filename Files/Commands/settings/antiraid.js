const Discord = require('discord.js');

module.exports = {
	perm: 32n,
	type: 0,
	displayEmbed(msg, r) {
		const embed = new Discord.MessageEmbed()
			.addFields(
				{
					name: msg.lanSettings.active, 
					value: r.active ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled, 
					inline: false
				},
				{
					name: msg.lan.logchannelid, 
					value: `${r.logchannelid ? `<#${r.logchannelid}>` : msg.language.none}`, 
					inline: false
				},
				{
					name: msg.lan.pingrole, 
					value: `${r.pingrole ? `<@&${r.pingrole}>` : msg.language.none}`, 
					inline: false
				},
			);
		return embed;
	},
	buttons(msg, r) {
		const active = new Discord.MessageButton()
			.setCustomId(msg.lan.edit.active.name)
			.setLabel(msg.lanSettings.active)
			.setStyle(r.active ? 'SUCCESS' : 'DANGER');
		const channel = new Discord.MessageButton()
			.setCustomId(msg.lan.edit.logchannelid.name)
			.setLabel(msg.lan.logchannelid)
			.setStyle('SECONDARY');
		const role = new Discord.MessageButton()
			.setCustomId(msg.lan.edit.pingrole.name)
			.setLabel(msg.lan.pingrole)
			.setStyle('SECONDARY');
		return [[active], [channel,role]];
	}
};