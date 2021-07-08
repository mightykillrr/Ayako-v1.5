const Discord = require('discord.js');

module.exports = {
	perm: 268435456n,
	type: 2,
	displayEmbed(msg, r) {
		const embed = new Discord.MessageEmbed()
			.addFields(
				{name: `${msg.lan.type}`, value: `${r.active ? `${msg.client.constants.emotes.tick} ${msg.language.enabled}` : `${msg.client.constants.emotes.cross} ${msg.language.disabled}`}`, inline: false},
				{name: `${msg.lan.botRole}`, value: `${r.botroleid && r.botroleid.length > 0 ? r.botroleid.map(id => ` <@&${id}>`) : msg.language.none}`, inline: false},
				{name: `${msg.lan.userRole}`, value: `${r.userroleid && r.userroleid.length > 0 ? r.userroleid.map(id => ` <@&${id}>`) : msg.language.none}`, inline: false},
				{name: `${msg.lan.allRole}`, value: `${r.allroleid && r.allroleid.length > 0 ? r.allroleid.map(id => ` <@&${id}>`) : msg.language.none}`, inline: false},
			);
		return embed;
	},
	editEmbed(msg, r) {
		const embed = new Discord.MessageEmbed()
			.addFields(
				{name: msg.client.ch.stp(msg.lan.edit.active.name, {trigger: msg.lan.edit.active.trigger}), value: `${r.active ? `${msg.client.constants.emotes.tick} ${msg.language.enabled}` : `${msg.client.constants.emotes.cross} ${msg.language.disabled}`}`, inline: false},
				{name: msg.client.ch.stp(msg.lan.edit.botroleid.name, {trigger: msg.lan.edit.botroleid.trigger}), value: `${r.botroleid && r.botroleid.length > 0 ? r.botroleid.map(id => ` <@&${id}>`) : msg.language.none}`, inline: false},
				{name: msg.client.ch.stp(msg.lan.edit.userroleid.name, {trigger:  msg.lan.edit.userroleid.trigger}), value: `${r.userroleid && r.userroleid.length > 0 ? r.userroleid.map(id => ` <@&${id}>`) : msg.language.none}`, inline: false},
				{name: msg.client.ch.stp(msg.lan.edit.allroleid.name, {trigger: msg.lan.edit.allroleid.trigger}), value: `${r.allroleid && r.allroleid.length > 0 ? r.allroleid.map(id => ` <@&${id}>`) : msg.language.none}`, inline: false},
				
			);
		return embed;
	},
	buttons(msg, r) {
		const active = new Discord.MessageButton()
			.setCustomId(`${msg.lan.edit.active.trigger[1] ? msg.lan.edit.active.trigger[1].replace(/`/g, '') : msg.lan.edit.active.trigger[0].replace(/`/g, '')}`)
			.setLabel(msg.lan.type)
			.setStyle(r.active ? 'SUCCESS' : 'DANGER');
		const bot = new Discord.MessageButton()
			.setCustomId(`${msg.lan.edit.botroleid.trigger[1] ? msg.lan.edit.botroleid.trigger[1].replace(/`/g, '') : msg.lan.edit.botroleid.trigger[0].replace(/`/g, '')}`)
			.setLabel(msg.lan.botRole)
			.setStyle('PRIMARY');
		const user = new Discord.MessageButton()
			.setCustomId(`${msg.lan.edit.userroleid.trigger[1] ? msg.lan.edit.userroleid.trigger[1].replace(/`/g, '') : msg.lan.edit.userroleid.trigger[0].replace(/`/g, '')}`)
			.setLabel(msg.lan.userRole)
			.setStyle('PRIMARY');
		const all = new Discord.MessageButton()
			.setCustomId(`${msg.lan.edit.allroleid.trigger[1] ? msg.lan.edit.allroleid.trigger[1].replace(/`/g, '') : msg.lan.edit.allroleid.trigger[0].replace(/`/g, '')}`)
			.setLabel(msg.lan.allRole)
			.setStyle('PRIMARY');
		return [[active], [bot,user,all]];
	}
};