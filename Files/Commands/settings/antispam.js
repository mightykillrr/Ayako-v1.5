const Discord = require('discord.js');

module.exports = {
	perm: 32n,
	type: 1,
	displayEmbed(msg, r) {
		const embed = new Discord.MessageEmbed()
			.addFields(
				{
					name: msg.lanSettings.active, 
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
	buttons(msg, r) {
		const active = new Discord.MessageButton()
			.setCustomId(`${msg.lan.edit.active.trigger[1] ? msg.lan.edit.active.trigger[1].replace(/`/g, '') : msg.lan.edit.active.trigger[0].replace(/`/g, '')}`)
			.setLabel(msg.lanSettings.active)
			.setStyle(r.active ? 'SUCCESS' : 'DANGER');
		const rw = new Discord.MessageButton()
			.setCustomId(`${msg.lan.edit.readofwarnstof.trigger[1] ? msg.lan.edit.readofwarnstof.trigger[1].replace(/`/g, '') : msg.lan.edit.readofwarnstof.trigger[0].replace(/`/g, '')}`)
			.setLabel(msg.lan.readofwarnstof.replace(/\*/g, '').slice(0, 14))
			.setStyle(r.readofwarnstof ? 'SUCCESS' : 'DANGER');
		const wm = new Discord.MessageButton()
			.setCustomId(`${msg.lan.edit.giveofficialwarnstof.trigger[1] ? msg.lan.edit.giveofficialwarnstof.trigger[1].replace(/`/g, '') : msg.lan.edit.giveofficialwarnstof.trigger[0].replace(/`/g, '')}`)
			.setLabel(msg.lan.giveofficialwarnstof)
			.setStyle(r.giveofficialwarnstof ? 'SUCCESS' : 'DANGER');
		const mm = new Discord.MessageButton()
			.setCustomId(`${msg.lan.edit.muteenabledtof.trigger[1] ? msg.lan.edit.muteenabledtof.trigger[1].replace(/`/g, '') : msg.lan.edit.muteenabledtof.trigger[0].replace(/`/g, '')}`)
			.setLabel(msg.lan.muteenabledtof)
			.setStyle(r.muteenabledtof ? 'SUCCESS' : 'DANGER');
		const km = new Discord.MessageButton()
			.setCustomId(`${msg.lan.edit.kickenabledtof.trigger[1] ? msg.lan.edit.kickenabledtof.trigger[1].replace(/`/g, '') : msg.lan.edit.kickenabledtof.trigger[0].replace(/`/g, '')}`)
			.setLabel(msg.lan.kickenabledtof)
			.setStyle(r.kickenabledtof ? 'SUCCESS' : 'DANGER');
		const bm = new Discord.MessageButton()
			.setCustomId(`${msg.lan.edit.banenabledtof.trigger[1] ? msg.lan.edit.banenabledtof.trigger[1].replace(/`/g, '') : msg.lan.edit.banenabledtof.trigger[0].replace(/`/g, '')}`)
			.setLabel(msg.lan.banenabledtof)
			.setStyle(r.banenabledtof ? 'SUCCESS' : 'DANGER');
		const channel = new Discord.MessageButton()
			.setCustomId(`${msg.lan.edit.bpchannelid.trigger[1] ? msg.lan.edit.bpchannelid.trigger[1].replace(/`/g, '') : msg.lan.edit.bpchannelid.trigger[0].replace(/`/g, '')}`)
			.setLabel(msg.lan.bpchannelid)
			.setStyle('PRIMARY');
		const user = new Discord.MessageButton()
			.setCustomId(`${msg.lan.edit.bpuserid.trigger[1] ? msg.lan.edit.bpuserid.trigger[1].replace(/`/g, '') : msg.lan.edit.bpuserid.trigger[0].replace(/`/g, '')}`)
			.setLabel(msg.lan.bpuserid)
			.setStyle('PRIMARY');
		const role = new Discord.MessageButton()
			.setCustomId(`${msg.lan.edit.bproleid.trigger[1] ? msg.lan.edit.bproleid.trigger[1].replace(/`/g, '') : msg.lan.edit.bproleid.trigger[0].replace(/`/g, '')}`)
			.setLabel(msg.lan.bproleid)
			.setStyle('PRIMARY');
		const maw = new Discord.MessageButton()
			.setCustomId(`${msg.lan.edit.muteafterwarnsamount.trigger[1] ? msg.lan.edit.muteafterwarnsamount.trigger[1].replace(/`/g, '') : msg.lan.edit.muteafterwarnsamount.trigger[0].replace(/`/g, '')}`)
			.setLabel(msg.client.ch.stp(msg.lan.muteafterwarnsamount.replace(/\*/g, ''), {amount: r.muteafterwarnsamount ? r.muteafterwarnsamount : '--'}))
			.setStyle(!r.readofwarnstof ? 'DANGER' : 'SECONDARY');
		const kaw = new Discord.MessageButton()
			.setCustomId(`${msg.lan.edit.kickafterwarnsamount.trigger[1] ? msg.lan.edit.kickafterwarnsamount.trigger[1].replace(/`/g, '') : msg.lan.edit.kickafterwarnsamount.trigger[0].replace(/`/g, '')}`)
			.setLabel(msg.client.ch.stp(msg.lan.kickafterwarnsamount.replace(/\*/g, ''), {amount: r.kickafterwarnsamount ? r.kickafterwarnsamount : '--'}))
			.setStyle(!r.readofwarnstof ? 'DANGER' : 'SECONDARY');
		const baw = new Discord.MessageButton()
			.setCustomId(`${msg.lan.edit.banafterwarnsamount.trigger[1] ? msg.lan.edit.banafterwarnsamount.trigger[1].replace(/`/g, '') : msg.lan.edit.banafterwarnsamount.trigger[0].replace(/`/g, '')}`)
			.setLabel(msg.client.ch.stp(msg.lan.banafterwarnsamount.replace(/\*/g, ''), {amount: r.banafterwarnsamount ? r.banafterwarnsamount : '--'}))
			.setStyle(!r.readofwarnstof ? 'DANGER' : 'SECONDARY');
		return [[active], [channel,user,role], [rw,maw,kaw,baw], [wm,mm,km,bm]];
	}
};