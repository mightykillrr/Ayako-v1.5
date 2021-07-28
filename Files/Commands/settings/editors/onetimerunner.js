const Discord = require('discord.js');
const misc = require('../misc.js');
const ms = require('ms');

module.exports = {
	key: ['onetimerunner'],
	async exe(msg, i, embed, values, answer, AddRemoveEditView, fail, srmEditing, comesFromSRM, answered) {
		const req = [];
		for (let i = 0; i < 9999; i++) {req.push(i);}
		const options = [];
		req.forEach(r => {
			options.push({label: `${r}`, value: `${r}`});
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
			.setCustomId('yes')
			.setLabel(msg.language.yes)
			.setDisabled(options.length < 26 ? true : false)
			.setStyle('SUCCESS');
		const prev = new Discord.MessageButton()
			.setCustomId('no')
			.setLabel(msg.language.no)
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
		let interaction;
		const resolved = await new Promise((resolve,) => {
			buttonsCollector.on('collect', async (clickButton) => {
				if (clickButton.user.id == msg.author.id) {
					if (clickButton.customId == 'yes') {
						const result = await require('../../Events/guildEvents/guildMemberUpdate/separator').oneTimeRunner(msg);
						if (!result) {
							embed
								.setAuthor(
									msg.client.ch.stp(msg.lanSettings.author, {type: msg.lan.type}), 
									msg.client.constants.emotes.settingsLink, 
									msg.client.constants.standard.invite
								)
								.setDescription(msg.lan.edit.oneTimeRunner.time);
						} else {
							embed
								.setAuthor(
									msg.client.ch.stp(msg.lanSettings.author, {type: msg.lan.type}), 
									msg.client.constants.emotes.settingsLink, 
									msg.client.constants.standard.invite
								)								
								.setDescription(msg.client.ch.stp(msg.lan.edit[msg.property].stats, {amount: result.length, time: ms(result.length*1500*10)}));
							msg.m.edit({embeds: [embed]}).catch(() => {});
						}
					} else if (clickButton.customId == 'no') {
						resolve(false);
						return misc.aborted(msg, [messageCollector, buttonsCollector]);
					} else if (clickButton.customId == 'back') {
						msg.property = undefined;
						messageCollector.stop();
						buttonsCollector.stop();
						interaction = clickButton;
						resolve(false);
						if (comesFromSRM) return require('../singleRowManager').redirecter(msg, clickButton, AddRemoveEditView, fail, values, values.id ? 'redirecter' : null);
						else return require('../multiRowManager').edit(msg, clickButton, {});					
					}
				} else msg.client.ch.notYours(clickButton, msg);
			});
			messageCollector.on('collect', async (message) => {
				if (msg.author.id == message.author.id) {
					if (message.content == msg.language.cancel) {
						resolve(false);
						return misc.aborted(msg, [messageCollector, buttonsCollector]);
					}
				}
			});
			buttonsCollector.on('end', (collected, reason) => {
				if (reason == 'time') {
					msg.client.ch.collectorEnd(msg);
					resolve(false);
				}
			});	
		});
		if (resolved) return ['repeater', msg, i+1, embed, values, interaction, AddRemoveEditView, fail, srmEditing, comesFromSRM, answered];
		else return null;
	}
};