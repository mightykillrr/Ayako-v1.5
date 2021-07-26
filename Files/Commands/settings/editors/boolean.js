const Discord = require('discord.js');
const misc = require('../misc.js');

module.exports = {
	key: ['boolean'],
	async exe(msg, i, embed, values, answer, AddRemoveEditView, fail, srmEditing, comesFromSRM) {
		embed = new Discord.MessageEmbed()
			.setAuthor(
				msg.client.ch.stp(msg.lanSettings.author, {type: msg.lan.type}), 
				msg.client.constants.emotes.settingsLink, 
				msg.client.constants.standard.invite
			)
			.setDescription(`${msg.lan.edit[msg.assigner].answers}\n${msg.lan.edit[msg.assigner].recommended}`);
		const PRIMARY = new Discord.MessageButton()
			.setCustomId('true')
			.setLabel(msg.language.true)
			.setStyle('SUCCESS');
		const SECONDARY = new Discord.MessageButton()
			.setCustomId('false')
			.setLabel(msg.language.false)
			.setStyle('SECONDARY');
		const DANGER = new Discord.MessageButton()
			.setCustomId('back')
			.setLabel(msg.language.back)
			.setEmoji(msg.client.constants.emotes.back)
			.setStyle('DANGER');
		const actionRows = msg.client.ch.buttonRower([[PRIMARY, SECONDARY], DANGER]);
		if (answer) answer.update({embeds: [embed], components: actionRows}).catch(() => {});
		else msg.m.edit({embeds: [embed], components: actionRows}).catch(() => {});
		const buttonsCollector = msg.m.createMessageComponentCollector({time: 60000});
		const messageCollector = msg.channel.createMessageCollector({time: 60000});
		buttonsCollector.on('collect', (clickButton) => {
			if (clickButton.user.id == msg.author.id) {
				buttonsCollector.stop();
				messageCollector.stop();
				if (clickButton.customId == 'true') values[msg.assigner] = true;
				else if (clickButton.customId == 'false') values[msg.assigner] = false;
				else if (clickButton.customId == 'back') {
					messageCollector.stop();
					buttonsCollector.stop();
					if (comesFromSRM) return require('../singleRowManager').redirecter(msg, clickButton, AddRemoveEditView, fail, values, values.id ? 'redirecter' : null);
					else return require('../multiRowManager').edit(msg, clickButton, {});
				}
				return ['repeater', msg, i+1, embed, values, clickButton, AddRemoveEditView, fail, srmEditing, comesFromSRM];
			} else msg.client.ch.notYours(clickButton, msg);
		});
		buttonsCollector.on('end', (collected, reason) => {if (reason == 'time') {msg.client.ch.collectorEnd(msg);}});
		messageCollector.on('collect', (message) => {
			if (message.author.id == msg.author.id) {
				if (message.content == msg.language.cancel) return misc.aborted(msg, [messageCollector, buttonsCollector]);
				values[msg.assigner] = message.content.toLowerCase() == msg.language.true.toLowerCase() ? true : message.content.toLowerCase() == msg.language.false.toLowerCase() ? false : null;
				if (values[msg.assigner] == null) return misc.notValid(msg);
				message.delete().catch(() => {});
				buttonsCollector.stop();
				messageCollector.stop();
				return ['repeater', msg, i+1, embed, values, null, AddRemoveEditView, fail, srmEditing, comesFromSRM];
			}
		});
	}
};