const Discord = require('discord.js');

module.exports = {
	perm: 32n,
	displayEmbed(msg, r) {
		const small = `${msg.client.constants.emotes.small} ${msg.language.small}`;
		const big = `${msg.client.constants.emotes.big} ${msg.language.big}`;
		if (r.prefix.startsWith('{"') && r.prefix.endsWith('"}')) r.prefix = r.prefix.slice(2, r.prefix.length-2);
		if (r.muteroleid.startsWith('{"') && r.muteroleid.endsWith('"}')) r.muteroleid = r.muteroleid.slice(2, r.muteroleid.length-2);
		const embed = new Discord.MessageEmbed()
			.addFields(
				{
					name: msg.lan.prefix,
					value: `\`${msg.client.constants.standard.prefix}\` ${r.prefix ? `/ \`${r.prefix}\`` : ''}`,
					inline: true,
				},
				{
					name: msg.lan.interactionsmode,
					value: `${r.interactionsmode == false || r.interactionsmode == true ? r.interactionsmode == true ? small : big : small }`,
					inline: true,
				},
				{
					name: msg.lan.muteroleid,
					value: `${r.muteroleid ? msg.guild.roles.cache.get(r.muteroleid) ? `<@&${r.muteroleid}>` : msg.language.none : msg.guild?.roles.cache.find(r => r.name.toLowerCase() == msg.language.muted) ? `<@&${msg.guild?.roles.cache.find(r => r.name.toLowerCase() == msg.language.muted).id}>` : msg.language.none}`,
					inline: true
				}
			);
		return embed;
	},
	buttons(msg, r) {
		const prefix = new Discord.MessageButton()
			.setCustomId(`${msg.lan.edit.prefix.trigger[1] ? msg.lan.edit.prefix.trigger[1].replace(/`/g, '') : msg.lan.edit.prefix.trigger[0].replace(/`/g, '')}`)
			.setLabel(msg.lan.prefix)
			.setStyle('SUCCESS');
		const interactionsmode = new Discord.MessageButton()
			.setCustomId(`${msg.lan.edit.interactionsmode.trigger[1] ? msg.lan.edit.interactionsmode.trigger[1].replace(/`/g, '') : msg.lan.edit.interactionsmode.trigger[0].replace(/`/g, '')}`)
			.setLabel(msg.lan.interactionsmode)
			.setStyle('SECONDARY');
		const muteroleid = new Discord.MessageButton()
			.setCustomId(`${msg.lan.edit.muteroleid.trigger[1] ? msg.lan.edit.muteroleid.trigger[1].replace(/`/g, '') : msg.lan.edit.muteroleid.trigger[0].replace(/`/g, '')}`)
			.setLabel(msg.lan.muteroleid)
			.setStyle(r.active ? 'SUCCESS' : 'DANGER');
		return [[prefix,interactionsmode,muteroleid]];
	}

};