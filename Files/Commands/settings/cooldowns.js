const Discord = require('discord.js');

module.exports = {
	perm: 8192n,
	type: 1,
	setupRequired: false,
	displayEmbed(msg, r) {
		const embed = new Discord.MessageEmbed()
			.addFields(
				{
					name: msg.lan.type, 
					value: r.active ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled, 
					inline: false
				},
				{
					name: msg.lan.bpchannelid, 
					value: `${r.bpchannelid && r.bpchannelid.length > 0 ? r.bpchannelid.map(id => ` <#${id}>`) : msg.language.none}`, 
					inline: false
				},
				{
					name: msg.lan.bpuserid, 
					value: `${r.bpuserid && r.bpuserid.length > 0 ? r.bpuserid.map(id => ` <@${id}>`) : msg.language.none}`, 
					inline: false
				},
				{
					name: msg.lan.bproleid, 
					value: `${r.bproleid && r.bproleid.length > 0 ? r.bproleid.map(id => ` <@&${id}>`) : msg.language.none}`, 
					inline: false
				},
				{
					name: '\u200b', 
					value: '\u200b', 
					inline: false
				},
				{
					name: msg.language.punishments, 
					value: 
					`${msg.lan.readofwarnstof}\n${r.readofwarnstof ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled}\n\n`+
					`${msg.client.ch.stp(msg.lan.muteafterwarnsamount, {amount: r.muteafterwarnsamount ? r.muteafterwarnsamount : '--'})}\n`+
					`${msg.client.ch.stp(msg.lan.kickafterwarnsamount, {amount: r.kickafterwarnsamount ? r.kickafterwarnsamount : '--'})}\n`+
					`${msg.client.ch.stp(msg.lan.banafterwarnsamount, {amount: r.banafterwarnsamount ? r.banafterwarnsamount : '--'})}`, 
					inline: false
				},
				{
					name: '\u200b', 
					value: '\u200b', 
					inline: false
				},
				{
					name: msg.lan.giveofficialwarnstof, 
					value: r.giveofficialwarnstof ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled, 
					inline: true
				},
				{
					name: msg.lan.muteenabledtof, 
					value: r.muteenabledtof ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled, 
					inline: true
				},
				{
					name: msg.lan.kickenabledtof, 
					value: r.kickenabledtof ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled, 
					inline: true
				},
				{
					name: msg.lan.banenabledtof, 
					value: r.banenabledtof ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled, 
					inline: true
				}
			);
		return embed;
	},

};