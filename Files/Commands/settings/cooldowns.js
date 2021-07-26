const Discord = require('discord.js');
const moment = require('moment');
require('moment-duration-format');

module.exports = {
	perm: 8192n,
	type: 1,
	setupRequired: false,
	mmrEmbed(msg, res) {
		const embed = new Discord.MessageEmbed();
		for (let i = 0; i < res.length; i++) {
			const r = res[i];
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
	displayEmbed(msg, r) {
		const embed = new Discord.MessageEmbed()
			.addFields(
				{
					name: msg.lan.type, 
					value: r.active ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled, 
					inline: false
				},
				{
					name: '\u200b', 
					value: '\u200b', 
					inline: false
				},
				{
					name: msg.lan.command, 
					value: r.command ? `\`${r.command}\`` : msg.language.none, 
					inline: true
				},
				{
					name: msg.lan.cooldown, 
					value: r.cooldown ? `\`${r.cooldown} ${msg.language.time.seconds}\`` : msg.language.none, 
					inline: true
				},
				{
					name: msg.language.number, 
					value: r.id ? `\`${r.id}\`` : msg.language.none, 
					inline: true
				},
				{
					name: '\u200b', 
					value: '\u200b', 
					inline: false
				},
				{
					name: msg.lan.activechannelid, 
					value: `${r.activechannelid && r.activechannelid.length > 0 ? r.activechannelid.map(id => ` <#${id}>`) : msg.language.none}`, 
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
			);
		return embed;
	},
	buttons(msg, r) {
		const active = new Discord.MessageButton()
			.setCustomId(`${msg.lan.edit.active.trigger[1] ? msg.lan.edit.active.trigger[1].replace(/`/g, '') : msg.lan.edit.active.trigger[0].replace(/`/g, '')}`)
			.setLabel(msg.lan.type)
			.setStyle(r.active ? 'SUCCESS' : 'DANGER');
		const command = new Discord.MessageButton()
			.setCustomId(`${msg.lan.edit.command.trigger[1] ? msg.lan.edit.command.trigger[1].replace(/`/g, '') : msg.lan.edit.command.trigger[0].replace(/`/g, '')}`)
			.setLabel(msg.client.ch.stp(msg.lan.command.replace(/\*/g, ''), {amount: r.command ? `\`${r.command}\`` : '--'}))
			.setStyle('SECONDARY');
		const cooldown = new Discord.MessageButton()
			.setCustomId(`${msg.lan.edit.cooldown.trigger[1] ? msg.lan.edit.cooldown.trigger[1].replace(/`/g, '') : msg.lan.edit.cooldown.trigger[0].replace(/`/g, '')}`)
			.setLabel(msg.client.ch.stp(msg.lan.cooldown.replace(/\*/g, ''), {amount: r.cooldown ? `${r.cooldown} ${msg.language.time.seconds}` : '--'}))
			.setStyle('SECONDARY');
		const achannel = new Discord.MessageButton()
			.setCustomId(`${msg.lan.edit.activechannelid.trigger[1] ? msg.lan.edit.activechannelid.trigger[1].replace(/`/g, '') : msg.lan.edit.activechannelid.trigger[0].replace(/`/g, '')}`)
			.setLabel(msg.lan.activechannelid)
			.setStyle('PRIMARY');
		const bchannel = new Discord.MessageButton()
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
		return [[active], [command, cooldown], [achannel,bchannel,user,role]];
	}
};