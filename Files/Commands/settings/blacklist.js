const Discord = require('discord.js');
const ms = require('ms');

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
			.setDescription(msg.lan.words+'\n\n'+msg.client.ch.makeCodeBlock(wordText))
			.addFields(
				{
					name: msg.lan.blacklist, 
					value: `${r.active ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled}`, 
					inline: false
				},
				{
					name: msg.lan.words, 
					value: `${r.words && r.words.length  > 0 ? `${r.words.map(word => `\`${word}\``)}`.replace(/\n/, ' ') : msg.language.none}`, 
					inline: false},
				{
					name: '\u200b', value: '\u200b', inline: false},
				{
					name: msg.lan.bpchannels,
					value: `${r.bpchannelid && r.bpchannelid.length  > 0 ? r.bpchannelid.map(id => ` <#${id}>`) : msg.language.none}`, 
					inline: false},
				{
					name: msg.lan.bpusers, 
					value: `${r.bpuserid && r.bpuserid.length  > 0 ? r.bpuserid.map(id => ` <@${id}>`) : msg.language.none}`, 
					inline: false},
				{
					name: msg.lan.bproles,
					value: `${r.bproleid && r.bproleid.length  > 0 ? r.bproleid.map(id => ` <@&${id}>`) : msg.language.none}`, 
					inline: false},
				{
					name: '\u200b', 
					value: '\u200b', 
					inline: false},
				{
					name: msg.lan.punishments, 
					value: 
						`${msg.lan.warn}\n`+
						`${r.warntof ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled}\n`+
						`${msg.lan.mute}\n`+
						`${r.mutetof ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled}\n`+
						`${msg.lan.kick}\n`+
						`${r.kicktof ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled}\n`+
						`${msg.lan.ban}\n`+
						`${r.bantof ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled}`, 
					inline: false},
				{
					name: '\u200b', 
					value: 
					`${msg.client.ch.stp(msg.lan.warnAfter, {amount: r.warnafter})}\n`+
					`${msg.client.ch.stp(msg.lan.muteAfter, {amount: r.muteafter})}\n`+
					`${msg.client.ch.stp(msg.lan.kickAfter, {amount: r.kickafter})}\n`+
					`${msg.client.ch.stp(msg.lan.banAfter, {amount: r.banafter})}`, 
					inline: false},
				{
					name: msg.lan.clearInt, 
					value: `${msg.lan.clearInt2+`\`${ms(parseInt(r.clearint))}\``}`, inline: false},
			);
		return embed;
	},
	editEmbed(msg, r) {
		const embed = new Discord.MessageEmbed()
			.addFields(
				{
					name: msg.client.ch.stp(msg.lan.edit.active.name, {trigger: msg.lan.edit.active.trigger}), 
					value: `${r.active ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled}`, 
					inline: false
				},
				{
					name: msg.client.ch.stp(msg.lan.edit.words.name, {trigger: msg.lan.edit.words.trigger}), 
					value: `${r.words && r.words.length  > 0 ? `${r.words.map(word => `\`${word}\``)}`.replace(/\n/, ' ') : msg.language.none}`, 
					inline: false},
				{
					name: '\u200b',
					value: '\u200b', 
					inline: false},
				{
					name: msg.client.ch.stp(msg.lan.edit.bpchannelid.name, {trigger: msg.lan.edit.bpchannelid.trigger}), 
					value: `${r.bpchannelid && r.bpchannelid.length  > 0 ? r.bpchannelid.map(id => ` <#${id}>`) : msg.language.none}`, 
					inline: false
				},
				{
					name: msg.client.ch.stp(msg.lan.edit.bpuserid.name, {trigger: msg.lan.edit.bpuserid.trigger}), 
					value: `${r.bpuserid && r.bpuserid.length  > 0 ? r.bpuserid.map(id => ` <@${id}>`) : msg.language.none}`, 
					inline: false
				},
				{
					name: msg.client.ch.stp(msg.lan.edit.bproleid.name, {trigger: msg.lan.edit.bproleid.trigger}),
					value: `${r.bproleid && r.bproleid.length  > 0 ? r.bproleid.map(id => ` <@&${id}>`) : msg.language.none}`, 
					inline: false
				},
				{
					name: '\u200b', 
					value: '\u200b', 
					inline: false
				},
				{
					name: msg.lan.punishments, 
					value: 
						`${msg.client.ch.stp(msg.lan.edit.warntof.name, {trigger: msg.lan.edit.warntof.trigger})}\n`+
						`${r.warntof ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled}\n`+
						`${msg.client.ch.stp(msg.lan.edit.mutetof.name, {trigger: msg.lan.edit.mutetof.trigger})}\n`+
						`${r.mutetof ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled}\n`+
						`${msg.client.ch.stp(msg.lan.edit.kicktof.name, {trigger: msg.lan.edit.kicktof.trigger})}\n`+
						`${r.kicktof ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled}\n`+
						`${msg.client.ch.stp(msg.lan.edit.bantof.name, {trigger: msg.lan.edit.bantof.trigger})}\n`+
						`${r.bantof ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled}`, 
					inline: false
				},
				{
					name: '\u200b', 
					value: 
					`${msg.client.ch.stp(msg.lan.edit.warnafter.name, {amount: r.warnafter, trigger: msg.lan.edit.warnafter.trigger})}\n`+
					`${msg.client.ch.stp(msg.lan.edit.muteafter.name, {amount: r.muteafter, trigger: msg.lan.edit.muteafter.trigger})}\n`+
					`${msg.client.ch.stp(msg.lan.edit.kickafter.name, {amount: r.kickafter, trigger: msg.lan.edit.kickafter.trigger})}\n`+
					`${msg.client.ch.stp(msg.lan.edit.banafter.name, {amount: r.banafter, trigger: msg.lan.edit.banafter.trigger})}`, 
					inline: false
				},
				{
					name: msg.client.ch.stp(msg.lan.edit.clearint.name, {trigger: msg.lan.edit.clearint.trigger}),
					value: `\`${ms(parseInt(r.clearint))}\``, 
					inline: false
				},
			);
		return embed;
	}
};