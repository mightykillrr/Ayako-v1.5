const Discord = require('discord.js');
const misc = require('../misc.js');

module.exports = {
	key: ['channel', 'channels', 'role', 'roles'],
	async exe(msg, i, embed, values, answer, AddRemoveEditView, fail, srmEditing, comesFromSRM, answered) {
		const req = msg.guild[msg.compatibilityType].cache;
		req.sort((a,b) => a.rawPosition - b.rawPosition);
		const options = [];
		req.forEach(r => {
			if (msg.compatibilityType == 'channels') {
				if (r.type == 'GUILD_TEXT' || r.type == 'GUILD_NEWS' || r.type == 'GUILD_NEWS_THREAD' || r.type == 'GUILD_PUBLIC_THREAD' || r.type == 'GUILD_PRIVATE_THREAD') options.push({label: r.name.length > 25 ? `${r.name.slice(0, 24)}\u2026` : r.name, value: r.id, description: r.parent ? `${r.parent.name}` : null});
			} else  if (msg.compatibilityType == 'roles') options.push({label: r.name.length > 25 ? `${r.name.slice(0, 24)}\u2026` : r.name, value: r.id});
		});
		const take = [];
		for(let j = 0; j < 25; j++) {take.push(options[j]);}
		const menu = new Discord.MessageSelectMenu()
			.setCustomId(msg.property)
			.addOptions(take)
			.setMinValues(1)
			.setMaxValues(msg.property.includes('s') ? take.length : 1)
			.setPlaceholder(msg.language.select[msg.property].select);
		const next = new Discord.MessageButton()
			.setCustomId('next')
			.setLabel(msg.language.next)
			.setDisabled(options.length < 26 ? true : false)
			.setStyle('SUCCESS');
		const prev = new Discord.MessageButton()
			.setCustomId('prev')
			.setLabel(msg.language.prev)
			.setDisabled(true)
			.setStyle('DANGER');
		const done = new Discord.MessageButton()
			.setCustomId('done')
			.setLabel(msg.language.done)
			.setDisabled(true)
			.setStyle('PRIMARY');
		const back = new Discord.MessageButton()
			.setCustomId('back')
			.setLabel(msg.language.back)
			.setEmoji(msg.client.constants.emotes.back)
			.setStyle('DANGER');
		embed = new Discord.MessageEmbed()
			.setAuthor(
				msg.client.ch.stp(msg.lanSettings.author, {type: msg.lan.type}),
				msg.client.constants.emotes.settingsLink, 
				msg.client.constants.standard.invite
			)
			.setDescription(`${msg.language.select[msg.property].desc}\n${msg.language.page}: \`1/${Math.ceil(options.length / 25)}\``);
		const rows = msg.client.ch.buttonRower([[menu], [prev, next], [back, done]]);
		if (answer) answer.update({embeds: [embed], components: rows}).catch(() => {});
		else msg.m.edit({embeds: [embed], components: rows}).catch(() => {});
		const buttonsCollector = msg.m.createMessageComponentCollector({time: 60000});
		const messageCollector = msg.channel.createMessageCollector({time: 60000});
		buttonsCollector.on('collect', (clickButton) => {
			if (clickButton.user.id == msg.author.id) {
				if (clickButton.customId == 'next' || clickButton.customId == 'prev') {
					let indexLast; let indexFirst;
					for (let j = 0; options.length > j; j++) {
						if (options[j] && options[j].value == clickButton.message.components[0].components[0].options[(clickButton.message.components[0].components[0].options.length-1)].value) indexLast = j;
						if (options[j] && options[j].value == clickButton.message.components[0].components[0].options[0].value) indexFirst = j;
					}
					take.splice(0, take.length);
					if (clickButton.customId == 'next') for (let j = indexLast+1; j < indexLast+26; j++) {if (options[j]) {take.push(options[j]);}}
					if (clickButton.customId == 'prev') for (let j = indexFirst-25; j < indexFirst; j++) {if (options[j]) {take.push(options[j]);}}
					let page = clickButton.message.embeds[0].description ? clickButton.message.embeds[0].description.split(/`+/)[1].split(/\/+/)[0] : 0;
					clickButton.customId == 'next' ? page++ : page--;
					const menu = new Discord.MessageSelectMenu()
						.setCustomId(msg.property)
						.addOptions(take)
						.setMinValues(1)
						.setMaxValues(msg.property.includes('s') ? take.length : 1)
						.setPlaceholder(msg.language.select[msg.property].select);
					const next = new Discord.MessageButton()
						.setCustomId('next')
						.setLabel(msg.language.next)
						.setDisabled(options.length < page*25+26 ? true : false)
						.setStyle('SUCCESS');
					const prev = new Discord.MessageButton()
						.setCustomId('prev')
						.setLabel(msg.language.prev)
						.setDisabled(page == 1 ? true : false)
						.setStyle('DANGER');
					const done = new Discord.MessageButton()
						.setCustomId('done')
						.setLabel(msg.language.done)
						.setStyle('PRIMARY');
					const back = new Discord.MessageButton()
						.setCustomId('back')
						.setLabel(msg.language.back)
						.setEmoji(msg.client.constants.emotes.back)
						.setStyle('DANGER');
					if (answered.length > 0) done.setDisabled(false);
					else done.setDisabled(true);
					const embed = new Discord.MessageEmbed()
						.setAuthor(
							msg.client.ch.stp(msg.lanSettings.author, {type: msg.lan.type}), 
							msg.client.constants.emotes.settingsLink, 
							msg.client.constants.standard.invite
						)
						.setDescription(`${msg.language.select[msg.property].desc}\n${msg.language.page}: \`${page}/${Math.ceil(+options.length / 25)}\``);
					if (answered.length > 0) embed.addField(msg.language.selected, `${answered.map(c => msg.compatibilityType == 'channels' ? `<#${c}>` : msg.compatibilityType == 'roles' ? `<@&${c}>` : ` ${c}`)} `);
					if (page >= Math.ceil(+options.length / 25)) next.setDisabled(true);
					else next.setDisabled(false);
					if (page > 1) prev.setDisabled(false);
					else prev.setDisabled(true);
					const rows = msg.client.ch.buttonRower([[menu], [prev, next], [back, done]]);
					clickButton.update({embeds: [embed], components: rows}).catch(() => {});
				} else if (clickButton.customId == 'done') {
					if (msg.compatibilityType == 'channels' || msg.compatibilityType == 'roles') {
						if (answered.length > 0) {
							if (Array.isArray(answered)) {
								answered.forEach(id => { 
									if (values[msg.assigner] && values[msg.assigner].includes(id)) {
										const index = values[msg.assigner].indexOf(id);
										values[msg.assigner].splice(index, 1);
									} else if (values[msg.assigner] && values[msg.assigner].length > 0) values[msg.assigner].push(id);
									else values[msg.assigner] = [id];
								});
							} else values[msg.assigner] = answered;	
						}
					} else if (msg.compatibilityType == 'number') {
						if (answered.length > 0) {
							if (Array.isArray(answered)) {
								answered.forEach(id => { 
									if (values[msg.assigner] && values[msg.assigner].includes(id)) {
										const index = values[msg.assigner].indexOf(id);
										values[msg.assigner].splice(index, 1);
									} else if (values[msg.assigner] && values[msg.assigner].length > 0) values[msg.assigner].push(id);
									else values[msg.assigner] = [id];
								});
							} else values[msg.assigner] = answered;	
						}
					}
					messageCollector.stop('finished');
					buttonsCollector.stop('finished');
					return ['repeater', msg, i+1, embed, values, clickButton, AddRemoveEditView, fail, srmEditing, comesFromSRM];
				} else if (clickButton.customId == msg.property) {
					clickButton.values.forEach(val => {
						if (!answered.includes(val)) msg.guild[msg.property].cache.get(val) ? answered.push(msg.guild[msg.property].cache.get(val).id) : '';
						else answered.splice(answered.indexOf(val), 1);
					});
					let page = clickButton.message.embeds[0].description ? clickButton.message.embeds[0].description.split(/`+/)[1].split(/\/+/)[0] : 0;
					const menu = new Discord.MessageSelectMenu()
						.setCustomId(msg.property)
						.addOptions(take)
						.setMinValues(1)
						.setMaxValues(msg.property.includes('s') ? take.length : 1)
						.setPlaceholder(msg.language.select[msg.property].select);
					const next = new Discord.MessageButton()
						.setCustomId('next')
						.setLabel(msg.language.next)
						.setDisabled(options.length < page*25+26 ? true : false)
						.setStyle('SUCCESS');
					const prev = new Discord.MessageButton()
						.setCustomId('prev')
						.setLabel(msg.language.prev)
						.setDisabled(page == 1 ? true : false)
						.setStyle('DANGER');
					const done = new Discord.MessageButton()
						.setCustomId('done')
						.setLabel(msg.language.done)
						.setStyle('PRIMARY');
					const back = new Discord.MessageButton()
						.setCustomId('back')
						.setLabel(msg.language.back)
						.setEmoji(msg.client.constants.emotes.back)
						.setStyle('DANGER');
					if (answered.length > 0) done.setDisabled(false);
					else done.setDisabled(true);
					const embed = new Discord.MessageEmbed()
						.setAuthor(
							msg.client.ch.stp(msg.lanSettings.author, {type: msg.lan.type}), 
							msg.client.constants.emotes.settingsLink, 
							msg.client.constants.standard.invite
						)
						.setDescription(`${msg.language.select[msg.property].desc}\n${msg.language.page}: \`${page}/${Math.ceil(+options.length / 25)}\``)
						.addField(msg.language.selected, `${answered.map(c => msg.property == 'channels' ? `<#${c}>` : msg.property == 'roles' ? `<@&${c}>` : ` ${c}`)} `);
					const rows = msg.client.ch.buttonRower([[menu], [prev, next], [back, done]]);
					clickButton.update({embeds: [embed], components: rows}).catch(() => {});
				} else if (clickButton.customId == 'back') {
					messageCollector.stop();
					buttonsCollector.stop();
					if (comesFromSRM) return require('../singleRowManager').redirecter(msg, clickButton, AddRemoveEditView, fail, values, values.id ? 'redirecter' : null);
					else return require('../multiRowManager').edit(msg, clickButton, {});
				}
			} else msg.client.ch.notYours(clickButton, msg);
		});
		messageCollector.on('collect', (message) => {
			if (message.author.id == msg.author.id && message.content.toLowerCase() == msg.language.cancel) return misc.aborted(msg, [messageCollector, buttonsCollector]);
		});
		buttonsCollector.on('end', (collected, reason) => {
			if (reason == 'time') {
				const embed = new Discord.MessageEmbed()
					.setAuthor(
						msg.client.ch.stp(msg.lanSettings.author, {type: msg.lan.type}),
						msg.client.constants.emotes.settingsLink, 
						msg.client.constants.standard.invite
					)
					.setDescription(msg.language.timeError);
				msg.m.edit({embeds: [embed], components: []}).catch(() => {});
			}
		});
	}
};