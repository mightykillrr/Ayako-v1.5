const Discord = require('discord.js');

module.exports = {
	perm: 8192n,
	type: 1,
	displayEmbed(msg, r) {
		let wordText = '';
		const wordArr = [];
		if (r.words && r.words.length > 0) {
			for (let i = 0; i < r.words.length; i++) {
				wordArr[i] = `${r.words[i]}⠀`;
				wordText += wordArr[i]+new Array(22 - wordArr[i].length).join(' ');
			}
		} else (wordText = msg.language.none);
		const embed = new Discord.MessageEmbed()
			.addFields(
				{
					name: msg.lan.type, 
					value: `${r.active ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled}`, 
					inline: false
				},
				{
					name: msg.lan.words, 
					value: `${r.words && r.words.length > 0 ? msg.client.ch.makeCodeBlock(wordText) : msg.language.none}`, 
					inline: false
				},
				{
					name: '\u200b', 
					value: '\u200b', 
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
					value: '\u200b',
					inline: false
				},
				{
					name: msg.lan.warntof, 
					value: `${r.warntof ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled}\n`,
					inline: true
				},
				{
					name: msg.lan.mutetof,
					value: `${r.mutetof ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled}`,
					inline: true
				},
				{
					name: msg.lan.kicktof,
					value: `${r.kicktof ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled}`,
					inline: true
				},
				{
					name: msg.lan.bantof,
					value: `${r.bantof ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled}`,
					inline: true
				},
				{
					name: '\u200b', 
					value: 
					`${msg.client.ch.stp(msg.lan.warnafter, {amount: r.warnafter ? r.warnafter : '--'})}\n`+
					`${msg.client.ch.stp(msg.lan.muteafter, {amount: r.muteafter ? r.muteafter : '--'})}\n`+
					`${msg.client.ch.stp(msg.lan.kickafter, {amount: r.kickafter ? r.kickafter : '--'})}\n`+
					`${msg.client.ch.stp(msg.lan.banafter, {amount: r.banafter ? r.banafter : '--'})}`, 
					inline: false
				},
			);
		return embed;
	},
	editEmbed(msg, r) {
		let wordText = '';
		const wordArr = [];
		if (r.words && r.words.length > 0) {
			for (let i = 0; i < r.words.length; i++) {
				wordArr[i] = `${r.words[i]}⠀`;
				wordText += wordArr[i]+new Array(22 - wordArr[i].length).join(' ');
			}
		} else (wordText = msg.language.none);
		const embed = new Discord.MessageEmbed()
			.addFields(
				{
					name: msg.client.ch.stp(msg.lan.edit.active.name, {trigger: msg.lan.edit.active.trigger}), 
					value: `${r.active ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled}`, 
					inline: false
				},
				{
					name: msg.client.ch.stp(msg.lan.edit.words.name, {trigger: msg.lan.edit.words.trigger}), 
					value: `${r.words && r.words.length > 0 ? msg.client.ch.makeCodeBlock(wordText) : msg.language.none}`, 
					inline: false},
				{
					name: '\u200b',
					value: '\u200b', 
					inline: false},
				{
					name: msg.client.ch.stp(msg.lan.edit.bpchannelid.name, {trigger: msg.lan.edit.bpchannelid.trigger}), 
					value: `${r.bpchannelid && r.bpchannelid.length > 0 ? r.bpchannelid.map(id => ` <#${id}>`) : msg.language.none}`, 
					inline: false
				},
				{
					name: msg.client.ch.stp(msg.lan.edit.bpuserid.name, {trigger: msg.lan.edit.bpuserid.trigger}), 
					value: `${r.bpuserid && r.bpuserid.length > 0 ? r.bpuserid.map(id => ` <@${id}>`) : msg.language.none}`, 
					inline: false
				},
				{
					name: msg.client.ch.stp(msg.lan.edit.bproleid.name, {trigger: msg.lan.edit.bproleid.trigger}),
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
					value: '\u200b',
					inline: false
				},
				{
					name: msg.client.ch.stp(msg.lan.edit.warntof.name, {trigger: msg.lan.edit.warntof.trigger}), 
					value: `${r.warntof ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled}\n`,
					inline: true
				},
				{
					name: msg.client.ch.stp(msg.lan.edit.mutetof.name, {trigger: msg.lan.edit.mutetof.trigger}),
					value: `${r.mutetof ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled}`,
					inline: true
				},
				{
					name: msg.client.ch.stp(msg.lan.edit.kicktof.name, {trigger: msg.lan.edit.kicktof.trigger}),
					value: `${r.kicktof ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled}`,
					inline: true
				},
				{
					name: msg.client.ch.stp(msg.lan.edit.bantof.name, {trigger: msg.lan.edit.bantof.trigger}),
					value: `${r.bantof ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled}`,
					inline: true
				},
				{
					name: '\u200b', 
					value: 
					`${msg.client.ch.stp(msg.lan.edit.warnafter.name, {amount: r.warnafter ? r.warnafter : '--', trigger: msg.lan.edit.warnafter.trigger})}\n`+
					`${msg.client.ch.stp(msg.lan.edit.muteafter.name, {amount: r.muteafter ? r.muteafter : '--', trigger: msg.lan.edit.muteafter.trigger})}\n`+
					`${msg.client.ch.stp(msg.lan.edit.kickafter.name, {amount: r.kickafter ? r.kickafter : '--', trigger: msg.lan.edit.kickafter.trigger})}\n`+
					`${msg.client.ch.stp(msg.lan.edit.banafter.name, {amount: r.banafter ? r.banafter : '--', trigger: msg.lan.edit.banafter.trigger})}`, 
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
		const wm = new Discord.MessageButton()
			.setCustomId(`${msg.lan.edit.warntof.trigger[1] ? msg.lan.edit.warntof.trigger[1].replace(/`/g, '') : msg.lan.edit.warntof.trigger[0].replace(/`/g, '')}`)
			.setLabel(msg.lan.mutetof)
			.setStyle(r.warntof ? 'SUCCESS' : 'DANGER');
		const mm = new Discord.MessageButton()
			.setCustomId(`${msg.lan.edit.mutetof.trigger[1] ? msg.lan.edit.mutetof.trigger[1].replace(/`/g, '') : msg.lan.edit.mutetof.trigger[0].replace(/`/g, '')}`)
			.setLabel(msg.lan.mutetof)
			.setStyle(r.mutetof ? 'SUCCESS' : 'DANGER');
		const km = new Discord.MessageButton()
			.setCustomId(`${msg.lan.edit.kicktof.trigger[1] ? msg.lan.edit.kicktof.trigger[1].replace(/`/g, '') : msg.lan.edit.kicktof.trigger[0].replace(/`/g, '')}`)
			.setLabel(msg.lan.kicktof)
			.setStyle(r.kicktof ? 'SUCCESS' : 'DANGER');
		const bm = new Discord.MessageButton()
			.setCustomId(`${msg.lan.edit.bantof.trigger[1] ? msg.lan.edit.bantof.trigger[1].replace(/`/g, '') : msg.lan.edit.bantof.trigger[0].replace(/`/g, '')}`)
			.setLabel(msg.lan.bantof)
			.setStyle(r.bantof ? 'SUCCESS' : 'DANGER');
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
			.setCustomId(`${msg.lan.edit.muteafter.trigger[1] ? msg.lan.edit.muteafter.trigger[1].replace(/`/g, '') : msg.lan.edit.muteafter.trigger[0].replace(/`/g, '')}`)
			.setLabel(msg.client.ch.stp(msg.lan.muteafter.replace(/\*/g, ''), {amount: r.muteafter ? r.muteafter : '--'}))
			.setStyle('SECONDARY');
		const kaw = new Discord.MessageButton()
			.setCustomId(`${msg.lan.edit.kickafter.trigger[1] ? msg.lan.edit.kickafter.trigger[1].replace(/`/g, '') : msg.lan.edit.kickafter.trigger[0].replace(/`/g, '')}`)
			.setLabel(msg.client.ch.stp(msg.lan.kickafter.replace(/\*/g, ''), {amount: r.kickafter ? r.kickafter : '--'}))
			.setStyle('SECONDARY');
		const baw = new Discord.MessageButton()
			.setCustomId(`${msg.lan.edit.banafter.trigger[1] ? msg.lan.edit.banafter.trigger[1].replace(/`/g, '') : msg.lan.edit.banafter.trigger[0].replace(/`/g, '')}`)
			.setLabel(msg.client.ch.stp(msg.lan.banafter.replace(/\*/g, ''), {amount: r.banafter ? r.banafter : '--'}))
			.setStyle('SECONDARY');
		const words = new Discord.MessageButton()
			.setCustomId(`${msg.lan.edit.words.trigger[1] ? msg.lan.edit.words.trigger[1].replace(/`/g, '') : msg.lan.edit.words.trigger[0].replace(/`/g, '')}`)
			.setLabel(msg.lan.words.replace(/\*/g, ''))
			.setStyle('PRIMARY');
		const waw = new Discord.MessageButton()
			.setCustomId(`${msg.lan.edit.warnafter.trigger[1] ? msg.lan.edit.warnafter.trigger[1].replace(/`/g, '') : msg.lan.edit.warnafter.trigger[0].replace(/`/g, '')}`)
			.setLabel(msg.client.ch.stp(msg.lan.warnafter.replace(/\*/g, ''), {amount: r.warnafter ? r.warnafter : '--'}))
			.setStyle('SECONDARY');
		return [[active, words], [channel,user,role], [wm,mm,km,bm], [waw, maw,kaw,baw]];
	}
};