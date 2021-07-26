/**
 * Main Module for managing all Ayako Settings.
 * @constructor
 * @param {object} answer - The interaction Object which can be updated.
 * @param {object} file - The file which is edited right now.
 * @param {object} msg - The Message Object which iniciated this message.
 * @param {number} i - Indicator for the current step of srmEditing.
 * @param {object} values - The edited values, also contains the ID of the currently edited Row if this is a multi Row edit.
 * @param {object} r - The currently edited Settings Row.
 * 
 */

const Discord = require('discord.js');
const misc = require('./misc.js');

module.exports = {
	exe(msg, answer) {
		this.edit(msg, answer, {});
	},
	redirect(msg, i, values, answer, AddRemoveEditView, fail, srmEditing, comesFromSRM) {
		repeater(msg, i?i:0, null, values, answer, AddRemoveEditView, fail, srmEditing, comesFromSRM);
	},
	async display(msg, answer) {
		if (!answer) await rower(msg);
		msg.client.constants.commands.settings.editReq.splice(2, 1);
		let res = await msg.client.ch.query(`SELECT * FROM ${msg.client.constants.commands.settings.tablenames[msg.file.name]} WHERE guildid = $1;`, [msg.guild.id], true);
		if (msg.file.perm && !msg.member.permissions.has(new Discord.Permissions(msg.file.perm))) return msg.client.ch.reply(msg, msg.language.commands.commandHandler.missingPermissions);
		msg.lanSettings = msg.language.commands.settings;
		msg.lan = msg.lanSettings[msg.file.name];
		let embed;
		if (res && res.rowCount > 0) {
			res.rows = res.rows.sort((a, b) => a.id - b.id);
			msg.rows = res.rows;
			embed = typeof(msg.file.mmrEmbed) == 'function' ? msg.file.mmrEmbed(msg, res.rows) : misc.noEmbed(msg);
		}
		else embed = misc.noEmbed(msg);
		embed.setAuthor(
			msg.client.ch.stp(msg.lanSettings.author, {type: msg.lan.type}), 
			msg.client.constants.emotes.settingsLink,
			msg.client.constants.standard.invite
		)
			.setColor(msg.client.constants.commands.settings.color);
		const edit = new Discord.MessageButton()
			.setCustomId('edit')
			.setStyle('PRIMARY')
			.setLabel(msg.language.Edit);
		const list = new Discord.MessageButton()
			.setCustomId('list')
			.setStyle('SECONDARY')
			.setLabel(msg.language.List)
			.setDisabled(embed.fields.length > 0 ? false : true);
		const rows = msg.client.ch.buttonRower([[edit, list]]);
		if (answer) answer.update({embeds: [embed], components: rows}).catch(() => {});
		else if (msg.m) msg.m.edit(msg, {embeds: [embed], components: rows}).catch(() => {});
		else msg.m = await msg.client.ch.reply(msg, {embeds: [embed], components: rows});
		const buttonsCollector = msg.m.createMessageComponentCollector({time: 60000});
		const messageCollector = msg.channel.createMessageCollector({time: 60000});
		buttonsCollector.on('collect', (clickButton) => {
			if (clickButton.user.id == msg.author.id) {
				if (clickButton.customId == 'edit') {
					buttonsCollector.stop();
					messageCollector.stop();
					this.edit(msg, clickButton, {});
				} else if (clickButton.customId == 'list') {
					buttonsCollector.stop();
					messageCollector.stop();
					this.list(msg, clickButton, 'view', []);
				}
			} else msg.client.ch.notYours(clickButton);
		});
		buttonsCollector.on('end', (collected, reason) => {if (reason == 'time') msg.m.edit({embeds: [embed], components: []});});
		messageCollector.on('collect', (message) => {
			if (message.author.id == msg.author.id && message.content.toLowerCase() == msg.language.cancel) return misc.aborted(msg, [messageCollector, buttonsCollector]);
		});
	},
	async edit(msg, answer, values, AddRemoveEditView, fail) {
		if (values && values.id) {
			const res = await msg.client.ch.query(`SELECT * FROM ${msg.client.constants.commands.settings.tablenames[msg.file.name]} WHERE id = $1;`, [values.id], true);
			if (res && res.rowCount > 0) return require('./singleRowManager').redirecter(msg, answer, AddRemoveEditView, fail, values);
		}
		msg.client.constants.commands.settings.editReq.splice(2, 1);
		msg.lanSettings = msg.language.commands.settings;
		msg.lan = msg.lanSettings[msg.file.name];
		let embed;
		await rower(msg);
		let res = await msg.client.ch.query(`SELECT * FROM ${msg.client.constants.commands.settings.tablenames[msg.file.name]} WHERE guildid = $1;`, [msg.guild.id], true);
		if (res && res.rowCount > 0) {
			res.rows = res.rows.sort((a, b) => a.id - b.id);
			msg.rows = res.rows;
			embed = typeof(msg.file.mmrEmbed) == 'function' ? msg.file.mmrEmbed(msg, res.rows) : misc.noEmbed(msg);
		}
		else embed = misc.noEmbed(msg);
		embed.setAuthor(
			msg.client.ch.stp(msg.lanSettings.authorEdit, {type: msg.lan.type}), 
			msg.client.constants.emotes.settingsLink,
			msg.client.constants.standard.invite
		)
			.setDescription(`${msg.lanSettings.howToEdit3}\n\n${embed.description ? embed.description : ''}`)
			.setColor(msg.client.constants.commands.settings.color);
		const add = new Discord.MessageButton()
			.setCustomId('add')
			.setStyle('SUCCESS')
			.setLabel(msg.language.add);
		const remove = new Discord.MessageButton()
			.setCustomId('remove')
			.setStyle('DANGER')
			.setLabel(msg.language.remove)
			.setDisabled(embed.fields.length > 0 ? false : true);
		const edit = new Discord.MessageButton()
			.setCustomId('edit')
			.setStyle('SECONDARY')
			.setLabel(msg.language.Edit)
			.setDisabled(embed.fields.length > 0 ? false : true);
		const list = new Discord.MessageButton()
			.setCustomId('list')
			.setStyle('SECONDARY')
			.setLabel(msg.language.List)
			.setDisabled(embed.fields.length > 0 ? false : true);
		const row = msg.client.ch.buttonRower([[add, remove, edit, list]]);
		if (answer) answer.update({embeds: [embed], components: row}).catch(() => {});
		else if (msg.m) msg.m.edit({embeds: [embed], components: row}).catch(() => {});
		else msg.m = await msg.client.ch.reply(msg, {embeds: [embed], components: row});
		if (!msg.m) return;
		const buttonsCollector = msg.m.createMessageComponentCollector({time: 60000});
		const messageCollector = msg.channel.createMessageCollector({time: 60000});
		buttonsCollector.on('collect', (clickButton) => {
			if (clickButton.user.id == msg.author.id) {
				if (clickButton.customId == 'add') {
					CollectorEnder([buttonsCollector, messageCollector]);
					repeater(msg, 0, null, {}, clickButton, 'add');
				} else if (clickButton.customId == 'remove') {
					CollectorEnder([buttonsCollector, messageCollector]);
					repeater(msg, 0, null, {}, clickButton, 'remove');
				} else if (clickButton.customId == 'edit') {
					CollectorEnder([buttonsCollector, messageCollector]);
					repeater(msg, 0, null, {}, clickButton, 'edit');
				} else if (clickButton.customId == 'list') {
					CollectorEnder([buttonsCollector, messageCollector]);
					this.list(msg, clickButton, 'edit', []);
				}
			} else msg.client.ch.notYours(clickButton, msg);
		});
		messageCollector.on('collect', (message) => {
			if (message.author.id == msg.author.id && message.content.toLowerCase() == msg.language.cancel) return misc.aborted(msg, [messageCollector, buttonsCollector]);
		});
		buttonsCollector.on('end', (collected, reason) => {if (reason == 'time') msg.client.ch.collectorEnd(msg);});
	},
	async list(msg, answer, AddRemoveEditView, fail) {
		let r = [], answered = [], values = {};
		const res = await msg.client.ch.query(`SELECT * FROM ${msg.client.constants.commands.settings.tablenames[msg.file.name]} WHERE guildid = $1;`, [msg.guild.id], true);
		if (res && res.rowCount > 0) r = res.rows;
		else return misc.aborted(msg);
		const options = [];
		for (let j = 0; j < r.length; j++) {
			options.push({label: `${msg.language.number}: ${r[j].id} | ${r[j][msg.client.constants.commands.settings.setupQueries[msg.file.name].removeIdent]}`, value: `${r[j].id}`});
		}
		const take = [];
		for(let j = 0; j < options.length; j++) {take.push(options[j]);}
		const menu = new Discord.MessageSelectMenu()
			.setCustomId('id')
			.addOptions(take)
			.setMinValues(1)
			.setMaxValues(1)
			.setPlaceholder(msg.language.select.id.select);
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
		const embed = new Discord.MessageEmbed()
			.setAuthor(
				msg.client.ch.stp(msg.lanSettings.author, {type: msg.lan.type}), 
				msg.client.constants.emotes.settingsLink, 
				msg.client.constants.standard.invite
			)
			.setDescription(`${msg.language.select.id.desc}\n${msg.language.page}: \`1/${Math.ceil(options.length / 25)}\``);
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
						.setCustomId('id')
						.addOptions(take)
						.setMinValues(1)
						.setMaxValues(1)
						.setPlaceholder(msg.language.select.id.select);
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
						.setDescription(`${msg.language.select.id.desc}\n${msg.language.page}: \`${page}/${Math.ceil(+options.length / 25)}\``);
					if (answered.length > 0) embed.addField(msg.language.selected, `${answered.map(c => ` ${c}`)} `);
					if (page >= Math.ceil(+options.length / 25)) next.setDisabled(true);
					else next.setDisabled(false);
					if (page > 1) prev.setDisabled(false);
					else prev.setDisabled(true);
					const rows = msg.client.ch.buttonRower([[menu], [prev, next], [back, done]]);
					clickButton.update({embeds: [embed], components: rows}).catch(() => {});
				} else if (clickButton.customId == 'done') {
					messageCollector.stop('finished');
					buttonsCollector.stop('finished');
					values.id = answered[0];
					msg.r = msg.rows.find(r => r.id == values.id);
					gotID(values.id, clickButton, AddRemoveEditView, fail);
				} else if (clickButton.customId == 'id') {
					let page = clickButton.message.embeds[0].description ? clickButton.message.embeds[0].description.split(/`+/)[1].split(/\/+/)[0] : 0;
					clickButton.values.forEach(v => {
						if (answered.includes(v)) answered.splice(answered.indexOf(v), 1);
						else answered.push(v);
					});
					const menu = new Discord.MessageSelectMenu()
						.setCustomId('id')
						.addOptions(take)
						.setMinValues(1)
						.setMaxValues(1)
						.setPlaceholder(msg.language.select.id.select);
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
					page = clickButton.message.embeds[0].description ? clickButton.message.embeds[0].description.split(/`+/)[1].split(/\/+/)[0] : 0;
					const embed = new Discord.MessageEmbed()
						.setAuthor(
							msg.client.ch.stp(msg.lanSettings.author, {type: msg.lan.type}), 
							msg.client.constants.emotes.settingsLink, 
							msg.client.constants.standard.invite
						)
						.setDescription(`${msg.language.select.id.desc}\n${msg.language.page}: \`${page}/${Math.ceil(+options.length / 25)}\``)
						.addField(msg.language.selected, `${answered.map(c => ` ${c}`)} `);
					const rows = msg.client.ch.buttonRower([[menu], [prev, next], [back, done]]);
					clickButton.update({embeds: [embed], components: rows}).catch(() => {});
				} else if (clickButton.customId == 'back') {
					messageCollector.stop();
					buttonsCollector.stop();
					return module.exports.edit(msg, clickButton, {});
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
		async function gotID(id, answer, AddRemoveEditView, fail) {
			const res = await msg.client.ch.query(`SELECT * FROM ${msg.file.name} WHERE id = $1 AND guildid = $2;`, [id, msg.guild.id], true);
			if (res && res.rowCount > 0) {
				if (AddRemoveEditView == 'edit') require('./singleRowManager').redirecter(msg, answer, AddRemoveEditView, fail, values, values.id ? 'redirecter' : null);
				else if (AddRemoveEditView == 'view') listdisplay(msg, answer, id, AddRemoveEditView, fail, values);
			}
		}
	},
};

async function listdisplay(msg, answer, id, AddRemoveEditView, fail, values) {
	let r;
	const res = await msg.client.ch.query(`SELECT * FROM ${msg.client.constants.commands.settings.tablenames[msg.file.name]} WHERE id = $1;`, [id]);
	if (res && res.rowCount > 0) r = res.rows[0];
	let embed = typeof(msg.file.displayEmbed) == 'function' ? msg.file.displayEmbed(msg, r) : misc.noEmbed(msg);
	embed.setAuthor(
		msg.client.ch.stp(msg.lanSettings.author, {type: msg.lan.type}), 
		msg.client.constants.emotes.settingsLink,
		msg.client.constants.standard.invite
	)
		.setColor(msg.client.constants.commands.settings.color);
	const button = new Discord.MessageButton()
		.setCustomId('edit')
		.setStyle('PRIMARY')
		.setLabel(msg.language.Edit);
	const back = new Discord.MessageButton()
		.setLabel(msg.language.back)
		.setEmoji(msg.client.constants.emotes.back)
		.setCustomId('back')
		.setStyle('DANGER');
	const rows = msg.client.ch.buttonRower([button, back]);
	if (answer) answer.update({embeds: [embed], components: rows}).catch(() => {});
	else msg.m.edit({embeds: [embed], components: rows}).catch(() => {});
	const buttonsCollector = msg.m.createMessageComponentCollector({time: 60000});
	const messageCollector = msg.channel.createMessageCollector({time: 60000});
	buttonsCollector.on('collect', (clickButton) => {
		if (clickButton.user.id == msg.author.id) {
			if (clickButton.customId == 'back') {
				buttonsCollector.stop();
				messageCollector.stop();
				return module.exports.display(msg, clickButton);
			} else if (clickButton.customId == 'edit') {
				buttonsCollector.stop();
				messageCollector.stop();
				return require('./singleRowManager').redirecter(msg, answer, AddRemoveEditView, fail, values);
			}
		} else msg.client.ch.notYours(clickButton);
	});
	buttonsCollector.on('end', (collected, reason) => {if (reason == 'time') msg.m.edit({embeds: [embed], components: []});});
	messageCollector.on('collect', (message) => {
		if (message.author.id == msg.author.id && message.content.toLowerCase() == msg.language.cancel) return misc.aborted(msg, [messageCollector, buttonsCollector]);
	});
}

async function repeater(msg, i, embed, values, answer, AddRemoveEditView, fail, srmEditing, comesFromSRM) {
	if (!Array.isArray(fail)) fail = new Array;
	if (typeof values !== 'object') values = new Object;
	if (i == 0) {
		embed = new Discord.MessageEmbed()
			.setAuthor(
				msg.client.ch.stp(msg.lanSettings.author, {type: msg.lan.type}),
				msg.client.constants.emotes.settingsLink,
				msg.client.constants.standard.invite
			);
	}
	if (srmEditing) msg.property = Object.entries(msg.client.constants.commands.settings.edit[msg.file.name]).find(a => a[0] == srmEditing[0])[1];
	else msg.property = AddRemoveEditView == 'edit' ? msg.client.constants.commands.settings.edit[msg.file.name][msg.client.constants.commands.settings.editReq[i]] : msg.client.constants.commands.settings.edit[msg.file.name][msg.client.constants.commands.settings.setupQueries[msg.file.name][AddRemoveEditView][i]];
	if ((srmEditing && i == 0) || (!srmEditing && (AddRemoveEditView == 'edit' ? i < msg.client.constants.commands.settings.editReq.length : i < msg.client.constants.commands.settings.setupQueries[msg.file.name][AddRemoveEditView].length))) {
		msg.compatibilityType = msg.property.includes('s') ? msg.property : msg.property+'s';
		msg.assigner = comesFromSRM ? Object.entries(msg.client.constants.commands.settings.edit[msg.file.name]).find(a => a[0] == srmEditing[0])[0] : AddRemoveEditView == 'edit' ? Object.entries(msg.client.constants.commands.settings.edit[msg.file.name]).find(a => a[1] == msg.client.constants.commands.settings.editReq[i] || a[0] == msg.client.constants.commands.settings.editReq[i])[0] : AddRemoveEditView == 'add' ? Object.entries(msg.client.constants.commands.settings.edit[msg.file.name]).find(a => a[1] == msg.client.constants.commands.settings.setupQueries[msg.file.name].add[i] || a[0] == msg.client.constants.commands.settings.setupQueries[msg.file.name].add[i])[0] : Object.entries(msg.client.constants.commands.settings.edit[msg.file.name]).find(a => a[1] == msg.client.constants.commands.settings.removeReq[i] || a[0] == msg.client.constants.commands.settings.removeReq[i])[0];
		let answered = [];
		if (msg.property == 'command') {
			let req = msg.client.commands;
			req = req.filter((command) => (!command.thisGuildOnly || command.thisGuildOnly.includes(msg.guild.id)) && command.perm !== 0);
			req = req.map(c => c.name);
			const options = [];
			req.forEach(cmd => {
				const command = msg.client.commands.get(cmd);
				options.push({label: cmd, description: command.aliases ? `${command.aliases.map(c => ` ${c}`)}` : null, value: cmd});
			});
			const take = [];
			for(let j = 0; j < 25 && j < options.length; j++) {take.push(options[j]);}
			embed.setDescription(`${AddRemoveEditView !== 'edit' ? msg.lan.otherEdits[AddRemoveEditView].name : msg.language.select[msg.property].desc}\n${AddRemoveEditView !== 'edit' ? msg.lan.otherEdits[AddRemoveEditView].process[i] : ''}\n${msg.language.page}: \`1/${Math.ceil(options.length / 25)}\``);
			const menu = new Discord.MessageSelectMenu()
				.setCustomId('cmdmenu')
				.addOptions(take)
				.setMinValues(1)
				.setMaxValues(1)
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
			const row = msg.client.ch.buttonRower([[menu], [prev, next], [back, done]]);
			if (answer) answer.update({embeds: [embed], components: row}).catch(() => {});
			else if (msg.m) msg.m.edit({embeds: [embed], components: row}).catch(() => {});
			else msg.m = await msg.client.ch.reply(msg, {embeds: [embed], components: row});
			const messageCollector = msg.channel.createMessageCollector({time: 60000});
			const buttonsCollector = msg.m.createMessageComponentCollector({time: 60000});
			messageCollector.on('collect', (message) => {
				if (message.author.id == msg.author.id && message.content.toLowerCase() == msg.language.cancel) return misc.aborted(msg, [messageCollector, buttonsCollector]);
			});
			buttonsCollector.on('collect', (clickButton) => {
				if (clickButton.user.id == msg.author.id) {
					if (clickButton.customId == 'cmdmenu') {
						clickButton.values.forEach(val => {
							answered = val;
						});
						let page = clickButton.message.embeds[0].description ? clickButton.message.embeds[0].description.split(/`+/)[1].split(/\/+/)[0] : 0;
						const menu = new Discord.MessageSelectMenu()
							.setCustomId('cmdmenu')
							.addOptions(take)
							.setMinValues(1)
							.setMaxValues(1)
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
							.addField(msg.language.selected, `${answered} `);
						const rows = msg.client.ch.buttonRower([[menu], [prev, next], [back, done]]);
						clickButton.update({embeds: [embed], components: rows}).catch(() => {});
					} else if (clickButton.customId == 'back') {
						CollectorEnder([messageCollector, buttonsCollector]);
						if (comesFromSRM) return require('./singleRowManager').redirecter(msg, clickButton, AddRemoveEditView, fail, values, values.id ? 'redirecter' : null);
						else return module.exports.edit(msg, clickButton, {});					} else if (clickButton.customId == 'done') {
						CollectorEnder([messageCollector, buttonsCollector]);
						values.command = answered;
						repeater(msg, i+1, embed, values, clickButton, AddRemoveEditView, fail, srmEditing, comesFromSRM);
					} else if (clickButton.customId == 'next' || clickButton.customId == 'prev') {
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
							.setMaxValues(1)
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
						if (answered.length > 0) embed.addField(msg.language.selected, `${answered} `);
						if (page >= Math.ceil(+options.length / 25)) next.setDisabled(true);
						else next.setDisabled(false);
						if (page > 1) prev.setDisabled(false);
						else prev.setDisabled(true);
						const rows = msg.client.ch.buttonRower([[menu], [prev, next], [back, done]]);
						clickButton.update({embeds: [embed], components: rows}).catch(() => {});
					}
				} else msg.client.ch.notYours(clickButton, msg);
			});
		} else if (msg.property == 'cooldown') {
			const req = [];
			for (let j = 1; j < 9999; j++) {req.push(j);}
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
				.setMaxValues(1)
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
			const embed = new Discord.MessageEmbed()
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
							.setMaxValues(1)
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
						if (answered.length > 0) embed.addField(msg.language.selected, `${answered} `);
						if (page >= Math.ceil(+options.length / 25)) next.setDisabled(true);
						else next.setDisabled(false);
						if (page > 1) prev.setDisabled(false);
						else prev.setDisabled(true);
						const rows = msg.client.ch.buttonRower([[menu], [prev, next], [back, done]]);
						clickButton.update({embeds: [embed], components: rows}).catch(() => {});
					} else if (clickButton.customId == 'done') {
						messageCollector.stop('finished');
						buttonsCollector.stop('finished');
						values[msg.assigner] = answered;
						repeater(msg, i+1, embed, values, clickButton, AddRemoveEditView, fail, srmEditing, comesFromSRM);
					} else if (clickButton.customId == msg.property) {
						let page = clickButton.message.embeds[0].description ? clickButton.message.embeds[0].description.split(/`+/)[1].split(/\/+/)[0] : 0;
						answered = clickButton.values[0];
						const menu = new Discord.MessageSelectMenu()
							.setCustomId(msg.property)
							.addOptions(take)
							.setMinValues(1)
							.setMaxValues(1)
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
						page = clickButton.message.embeds[0].description ? clickButton.message.embeds[0].description.split(/`+/)[1].split(/\/+/)[0] : 0;
						const embed = new Discord.MessageEmbed()
							.setAuthor(
								msg.client.ch.stp(msg.lanSettings.author, {type: msg.lan.type}), 
								msg.client.constants.emotes.settingsLink, 
								msg.client.constants.standard.invite
							)
							.setDescription(`${msg.language.select[msg.property].desc}\n${msg.language.page}: \`${page}/${Math.ceil(+options.length / 25)}\``)
							.addField(msg.language.selected, `${answered} `);
						const rows = msg.client.ch.buttonRower([[menu], [prev, next], [back, done]]);
						clickButton.update({embeds: [embed], components: rows}).catch(() => {});
					} else if (clickButton.customId == 'back') {
						messageCollector.stop();
						buttonsCollector.stop();
						if (comesFromSRM) return require('./singleRowManager').redirecter(msg, clickButton, AddRemoveEditView, fail, values, values.id ? 'redirecter' : null);
						else return module.exports.edit(msg, clickButton, {});
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
		} else if (msg.property.includes('channel') || msg.property.includes('role')) {
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
			const embed = new Discord.MessageEmbed()
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
						repeater(msg, i+1, embed, values, clickButton, AddRemoveEditView, fail, srmEditing, comesFromSRM);
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
						if (comesFromSRM) return require('./singleRowManager').redirecter(msg, clickButton, AddRemoveEditView, fail, values, values.id ? 'redirecter' : null);
						else return module.exports.edit(msg, clickButton, {});
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
		} else if (msg.property.includes('user')) {
			const embed = new Discord.MessageEmbed()
				.setAuthor(
					msg.client.ch.stp(msg.lanSettings.author, {type: msg.lan.type}), 
					msg.client.constants.emotes.settingsLink, 
					msg.client.constants.standard.invite
				)
				.setDescription(`${msg.language.select.users.select}`);
			const DANGER = new Discord.MessageButton()
				.setCustomId('back')
				.setLabel(msg.language.back)
				.setEmoji(msg.client.constants.emotes.back)
				.setStyle('DANGER');
			const rows = msg.client.ch.buttonRower([DANGER]);
			if (answer) answer.update({embeds: [embed], components: rows}).catch(() => {});
			else msg.m.edit({embeds: [embed], components: rows}).catch(() => {});
			const buttonsCollector = msg.m.createMessageComponentCollector({time: 60000});
			const messageCollector = msg.channel.createMessageCollector({time: 60000});
			messageCollector.on('collect', async (message) => {
				if (message.author.id == msg.author.id) {
					if (message.content == msg.language.cancel) return misc.aborted(msg, [messageCollector, buttonsCollector]);
					message.delete().catch(() => {});
					const args = message.content.split(/ +/);
					let answered = [];
					await Promise.all(args.map(async raw => {
						const id = raw.replace(/\D+/g, '');
						const request = await msg.client.users.fetch(id).catch(() => {});
						if ((!request || !request.id) && (!values[msg.assigner] || (values[msg.assigner] && !values[msg.assigner].includes(id)))) fail.push(`\`${raw}\` ${msg.lan.edit[msg.property].fail.no}`);
						else answered.push(id);
					}));
					message.delete().catch(() => {});
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
					messageCollector.stop();
					buttonsCollector.stop();
					repeater(msg, i+1, embed, values, null, AddRemoveEditView, fail, srmEditing, comesFromSRM);
				}
			});
			buttonsCollector.on('collect', (clickButton) => {
				if (clickButton.user.id == msg.author.id) {
					if (clickButton.customId == 'back') {
						buttonsCollector.stop();
						messageCollector.stop();
						if (comesFromSRM) return require('./singleRowManager').redirecter(msg, clickButton, AddRemoveEditView, fail, values, values.id ? 'redirecter' : null);
						else return module.exports.edit(msg, clickButton, {});
					}
				} else msg.client.ch.notYours(clickButton, msg);
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
		} else if (msg.property == 'boolean') {
			const embed = new Discord.MessageEmbed()
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
						if (comesFromSRM) return require('./singleRowManager').redirecter(msg, clickButton, AddRemoveEditView, fail, values, values.id ? 'redirecter' : null);
						else return module.exports.edit(msg, clickButton, {});
					}
					repeater(msg, i+1, embed, values, clickButton, AddRemoveEditView, fail, srmEditing, comesFromSRM);
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
					repeater(msg, i+1, embed, values, null, AddRemoveEditView, fail, srmEditing, comesFromSRM);
				}
			});
		} else if (msg.property == 'id') {
			const res = await msg.client.ch.query(`SELECT * FROM ${msg.client.constants.commands.settings.tablenames[msg.file.name]} WHERE guildid = $1;`, [msg.guild.id]);
			if (res && res.rowCount > 0) fail = res.rows;
			else return misc.aborted(msg);
			const options = [];
			fail = fail.sort((a, b) => a.id - b.id);
			for (let j = 0; j < fail.length; j++) {
				options.push({label: `${msg.language.number}: ${fail[j].id} | ${fail[j][msg.client.constants.commands.settings.setupQueries[msg.file.name].removeIdent]}`, value: `${fail[j].id}`});
			}
			const take = [];
			for(let j = 0; j < options.length; j++) {take.push(options[j]);}
			const menu = new Discord.MessageSelectMenu()
				.setCustomId(msg.property)
				.addOptions(take)
				.setMinValues(1)
				.setMaxValues(1)
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
			const embed = new Discord.MessageEmbed()
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
							.setMaxValues(1)
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
						if (answered.length > 0) embed.addField(msg.language.selected, `${answered.map(c => ` ${c}`)} `);
						if (page >= Math.ceil(+options.length / 25)) next.setDisabled(true);
						else next.setDisabled(false);
						if (page > 1) prev.setDisabled(false);
						else prev.setDisabled(true);
						const rows = msg.client.ch.buttonRower([[menu], [prev, next], [back, done]]);
						clickButton.update({embeds: [embed], components: rows}).catch(() => {});
					} else if (clickButton.customId == 'done') {
						messageCollector.stop('finished');
						buttonsCollector.stop('finished');
						values[msg.assigner] = answered[0];
						if (msg.rows) msg.r = msg.rows.filter(r => r.id = answered);
						repeater(msg, i+1, embed, values, clickButton, AddRemoveEditView, fail, srmEditing, comesFromSRM);
					} else if (clickButton.customId == msg.property) {
						let page = clickButton.message.embeds[0].description ? clickButton.message.embeds[0].description.split(/`+/)[1].split(/\/+/)[0] : 0;
						clickButton.values.forEach(v => {
							if (answered.includes(v)) answered.splice(answered.indexOf(v), 1);
							else answered.push(v);
						});
						const menu = new Discord.MessageSelectMenu()
							.setCustomId(msg.property)
							.addOptions(take)
							.setMinValues(1)
							.setMaxValues(1)
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
						page = clickButton.message.embeds[0].description ? clickButton.message.embeds[0].description.split(/`+/)[1].split(/\/+/)[0] : 0;
						const embed = new Discord.MessageEmbed()
							.setAuthor(
								msg.client.ch.stp(msg.lanSettings.author, {type: msg.lan.type}), 
								msg.client.constants.emotes.settingsLink, 
								msg.client.constants.standard.invite
							)
							.setDescription(`${msg.language.select[msg.property].desc}\n${msg.language.page}: \`${page}/${Math.ceil(+options.length / 25)}\``)
							.addField(msg.language.selected, `${answered.map(c => ` ${c}`)} `);
						const rows = msg.client.ch.buttonRower([[menu], [prev, next], [back, done]]);
						clickButton.update({embeds: [embed], components: rows}).catch(() => {});
					} else if (clickButton.customId == 'back') {
						messageCollector.stop();
						buttonsCollector.stop();
						if (comesFromSRM) return require('./singleRowManager').redirecter(msg, clickButton, AddRemoveEditView, fail, values, values.id ? 'redirecter' : null);
						else return module.exports.edit(msg, clickButton, {});					}
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
		} else if (msg.property == 'column') {
			const options = [];
			for (let j = 0; j < Object.entries(msg.lan).length; j++) {
				const name = Object.entries(msg.lan)[j][0], val = Object.entries(msg.lan)[j][1];
				if (msg.client.constants.commands.settings.setupQueries[msg.file.name].add.includes(name) || name == 'active') options.push({label: val.length > 25 ? `${val.slice(0, 24)}\u2026` : val, value: name});
			}
			const take = [];
			for(let j = 0; j < 25 && j < options.length; j++) {take.push(options[j]);}
			const menu = new Discord.MessageSelectMenu()
				.setCustomId(msg.property)
				.addOptions(take)
				.setMinValues(1)
				.setMaxValues(1)
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
			const embed = new Discord.MessageEmbed()
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
							.setMaxValues(1)
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
						if (answered.length > 0) embed.addField(msg.language.selected, `${answered}`);
						if (page >= Math.ceil(+options.length / 25)) next.setDisabled(true);
						else next.setDisabled(false);
						if (page > 1) prev.setDisabled(false);
						else prev.setDisabled(true);
						const rows = msg.client.ch.buttonRower([[menu], [prev, next], [back, done]]);
						clickButton.update({embeds: [embed], components: rows}).catch(() => {});
					} else if (clickButton.customId == 'done') {
						if (answered.length > 0) values[msg.assigner] = answered;
						msg.client.constants.commands.settings.editReq.push(answered);
						messageCollector.stop('finished');
						buttonsCollector.stop('finished');
						repeater(msg, i+1, embed, values, clickButton, AddRemoveEditView, fail, srmEditing, comesFromSRM);
					} else if (clickButton.customId == msg.property) {
						answered = clickButton.values[0];
						let page = clickButton.message.embeds[0].description ? clickButton.message.embeds[0].description.split(/`+/)[1].split(/\/+/)[0] : 0;
						const menu = new Discord.MessageSelectMenu()
							.setCustomId(msg.property)
							.addOptions(take)
							.setMinValues(1)
							.setMaxValues(1)
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
							.addField(msg.language.selected, `${answered} `);
						const rows = msg.client.ch.buttonRower([[menu], [prev, next], [back, done]]);
						clickButton.update({embeds: [embed], components: rows}).catch(() => {});
					} else if (clickButton.customId == 'back') {
						messageCollector.stop();
						buttonsCollector.stop();
						if (comesFromSRM) return require('./singleRowManager').redirecter(msg, clickButton, AddRemoveEditView, fail, values, values.id ? 'redirecter' : null);
						else return module.exports.edit(msg, clickButton, {});					}
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
		} else if (msg.property == 'number') {
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
			const embed = new Discord.MessageEmbed()
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
						let page = clickButton.message.embeds[0].description.split(/`+/)[1].split(/\/+/)[0];
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
						if (answered.length > 0) embed.addField(msg.language.selected, `${answered} `);
						if (page >= Math.ceil(+options.length / 25)) next.setDisabled(true);
						else next.setDisabled(false);
						if (page > 1) prev.setDisabled(false);
						else prev.setDisabled(true);
						const rows = msg.client.ch.buttonRower([[menu], [prev, next], [back, done]]);
						clickButton.update({embeds: [embed], components: rows}).catch(() => {});
					} else if (clickButton.customId == 'done') {
						if (answered.length > 0) values[msg.property] = answered;
						messageCollector.stop('finished');
						buttonsCollector.stop('finished');
						repeater(msg, i+1, embed, values, clickButton, AddRemoveEditView, fail, srmEditing, comesFromSRM);
					} else if (clickButton.customId == msg.property) {
						let page = clickButton.message.embeds[0].description.split(/`+/)[1].split(/\/+/)[0];
						answered = clickButton.values[0];
						const menu = new Discord.MessageSelectMenu()
							.setCustomId(msg.property)
							.addOptions(take)
							.setMinValues(1)
							.setMaxValues(msg.property.includes('s') ? take.length : 1)
							.setPlaceholder(msg.language.select[msg.property].select);
						const next = new Discord.MessageButton()
							.setCustomId('next')
							.setLabel(msg.language.next)
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
						page = clickButton.message.embeds[0].description.split(/`+/)[1].split(/\/+/)[0];
						const embed = new Discord.MessageEmbed()
							.setAuthor(
								msg.client.ch.stp(msg.lanSettings.author, {type: msg.lan.type}), 
								msg.client.constants.emotes.settingsLink, 
								msg.client.constants.standard.invite
							)
							.setDescription(`${msg.language.select[msg.property].desc}\n${msg.language.page}: \`${page}/${Math.ceil(+options.length / 25)}\``)
							.addField(msg.language.selected, `${answered} `);
						const rows = msg.client.ch.buttonRower([[menu], [prev, next], [back, done]]);
						clickButton.update({embeds: [embed], components: rows}).catch(() => {});
					} else if (clickButton.customId == 'back') {
						msg.property = undefined;
						messageCollector.stop();
						buttonsCollector.stop();
						if (comesFromSRM) return require('./singleRowManager').redirecter(msg, clickButton, AddRemoveEditView, fail, values, values.id ? 'redirecter' : null);
						else return module.exports.edit(msg, clickButton, {});					}
				} else msg.client.ch.notYours(clickButton, msg);
			});
			messageCollector.on('collect', async (message) => {
				if (msg.author.id == message.author.id) {
					if (message.content == msg.language.cancel) return misc.aborted(msg, [messageCollector, buttonsCollector]);
					message.delete().catch(() => {});
					if (isNaN(parseInt(message.content))) return misc.notValid(msg);
					answered = message.content.replace(/\D+/g, '').split(/ +/);
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
					messageCollector.stop();
					buttonsCollector.stop();
					repeater(msg, i+1, embed, values, null, AddRemoveEditView, fail, srmEditing, comesFromSRM);
				}
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
					msg.m.edit({embeds: [embed]}).catch(() => {});
				}
			});
		} else if (msg.property == 'string') {
			const button = new Discord.MessageButton()
				.setCustomId('back')
				.setLabel(msg.language.back)
				.setEmoji(msg.client.constants.emotes.back)
				.setStyle('DANGER');
			const rows = msg.client.ch.buttonRower([button]);
			if (answer) answer.update({embeds: [embed], components: rows}).catch(() => {});
			else msg.m.edit({embeds: [embed], components: rows}).catch(() => {});				
			const messageCollector = msg.channel.createMessageCollector({time: 60000});
			const buttonsCollector = msg.m.createMessageComponentCollector({time: 60000});
			messageCollector.on('collect', (message) => {
				if (message.author.id == msg.author.id) {
					if (message.content == msg.language.cancel) return misc.aborted(msg, [messageCollector, buttonsCollector]);
					messageCollector.stop();
					buttonsCollector.stop();
					message.delete().catch(() => {});
					const answered = message.content.toLowerCase().split(/#+/);
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
						repeater(msg, i+1, embed, values, null, AddRemoveEditView, fail, srmEditing, comesFromSRM);
					}
				}
			});
			buttonsCollector.on('collect', (clickButton) => {
				if (clickButton.user.id == msg.author.id) {
					if (clickButton.customId == 'back') {
						buttonsCollector.stop();
						messageCollector.stop();
						if (comesFromSRM) return require('./singleRowManager').redirecter(msg, clickButton, AddRemoveEditView, fail, values, values.id ? 'redirecter' : null);
						else return module.exports.edit(msg, clickButton, {});					}
				} else msg.client.ch.notYours(clickButton);
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
	} else {
		if (AddRemoveEditView == 'add') {
			const newSettings = {};
			Object.entries(values).forEach((arr) => {
				const name = arr[0], value = arr[1];
				newSettings[name] = value;
			});
			newSettings[msg.assigner] = values[msg.assigner];
			let valDeclaration = '';
			for (let j = 0; j < msg.client.constants.commands.settings.setupQueries[msg.file.name].vals.length; j++) {valDeclaration += `$${j+1}, `;}
			valDeclaration = valDeclaration.slice(0, valDeclaration.length-2);
			values.guild = msg.guild;
			values.date = Date.now();
			const res = await msg.client.ch.query(`SELECT * FROM ${msg.client.constants.commands.settings.tablenames[msg.file.name]};`, null, true);
			if (res && res.rowCount > 0) values.id = res.rowCount+1;
			else values.id = 1;
			msg.client.ch.query(`INSERT INTO ${msg.client.constants.commands.settings.tablenames[msg.file.name]} (${msg.client.constants.commands.settings.setupQueries[msg.file.name].cols}) VALUES (${valDeclaration});`, msg.client.ch.stp(msg.client.constants.commands.settings.setupQueries[msg.file.name].vals, {values: values}), true);
			const embed = new Discord.MessageEmbed()
				.setAuthor(
					msg.client.ch.stp(msg.lanSettings.authorEdit, {type: msg.lan.type}), 
					msg.client.constants.standard.image, msg.client.constants.standard.invite
				)
				.setColor(msg.client.constants.commands.settings.color)
				.setDescription(msg.client.ch.stp(msg.lanSettings.done, {loading: msg.client.constants.emotes.loading}));
			if (answer) answer.update({embeds: [embed], components: []}).catch(() => {});
			else if (msg.m) msg.m.edit({embeds: [embed], components: []}).catch(() => {});
			else msg.m = await msg.client.ch.reply(msg, {embeds: [embed], components: []});
			setTimeout(() => {module.exports.edit(msg, null, {});}, 3000);
			misc.log(null, msg, newSettings);
		} else if (AddRemoveEditView == 'remove') {
			let oldRow, oldSettings;
			const oldRes = await msg.client.ch.query(`SELECT * FROM ${msg.client.constants.commands.settings.tablenames[msg.file.name]} WHERE id = $1;`, [values.id], true);
			if (oldRes && oldRes.rowCount > 0) {
				oldRow = oldRes.rows[0];
				oldSettings = oldRow; 
			}
			const names = [];
			const arr = fail.find(f => f.id == values.id);
			const entries = Object.entries(arr);
			const vals = [];
			entries.forEach(e => {
				if (e[1] !== null) {
					vals.push(e[1]);
					names.push(e[0]);
				} 
			});
			let nameText = '';
			for (let j = 0; j < names.length; j++) {
				if (nameText !== '') nameText += ` AND ${names[j]} = $${j+1}`;
				else nameText += `${names[j]} = $${j+1}`;
			}
			msg.client.ch.query(`DELETE FROM ${msg.client.constants.commands.settings.tablenames[msg.file.name]} WHERE ${nameText};`, vals, true);
			const embed = new Discord.MessageEmbed()
				.setAuthor(
					msg.client.ch.stp(msg.lanSettings.authorEdit, {type: msg.lan.type}), 
					msg.client.constants.standard.image, msg.client.constants.standard.invite
				)
				.setColor(msg.client.constants.commands.settings.color)
				.setDescription(msg.client.ch.stp(msg.lanSettings.done, {loading: msg.client.constants.emotes.loading}));
			if (answer) answer.update({embeds: [embed], components: []}).catch(() => {});
			else if (msg.m) msg.m.edit({embeds: [embed], components: []}).catch(() => {});
			else msg.m = await msg.client.ch.reply(msg, {embeds: [embed], components: []});
			setTimeout(() => {module.exports.edit(msg, null, {});}, 3000);
			misc.log(oldSettings, msg, null);
		} else if (AddRemoveEditView == 'edit') {
			let oldRow, oldSettings;
			const oldRes = await msg.client.ch.query(`SELECT * FROM ${msg.client.constants.commands.settings.tablenames[msg.file.name]} WHERE id = $1;`, [values.id], true);
			if (oldRes && oldRes.rowCount > 0) {
				oldRow = oldRes.rows[0];
				oldSettings = oldRow; 
			}
			const newSettings = {};
			Object.entries(oldRow).forEach((arr) => {
				const name = arr[0], value = arr[1];
				newSettings[name] = value;
			});
			newSettings[msg.assigner] = values[msg.assigner];
			if (Array.isArray(oldSettings) && oldSettings.length > 0) {
				Promise.all(oldSettings.map(id => {
					if (values[msg.assigner].includes(id)) values[msg.assigner].splice(values[msg.assigner].indexOf(id), 1);
					else values[msg.assigner].push(id);
				}));
			}
			msg.client.constants.commands.settings.editReq.splice(2, 1);
			msg.client.ch.query(`UPDATE ${msg.client.constants.commands.settings.tablenames[msg.file.name]} SET ${msg.assigner} = $1 WHERE id = $2;`, [values[msg.assigner], values.id], true);
			const embed = new Discord.MessageEmbed()
				.setAuthor(
					msg.client.ch.stp(msg.lanSettings.authorEdit, {type: msg.lan.type}), 
					msg.client.constants.standard.image, msg.client.constants.standard.invite
				)
				.setColor(msg.client.constants.commands.settings.color)
				.setDescription(msg.client.ch.stp(msg.lanSettings.done, {loading: msg.client.constants.emotes.loading}));
			if (answer) answer.update({embeds: [embed], components: []}).catch(() => {});
			else if (msg.m) msg.m.edit({embeds: [embed], components: []}).catch(() => {});
			else msg.m = await msg.client.ch.reply(msg, {embeds: [embed], components: []});
			msg.r[msg.assigner] = values[msg.assigner];
			if (!comesFromSRM) setTimeout(() => {module.exports.edit(msg, null, {});}, 3000);
			else setTimeout(() => {require('./singleRowManager').redirecter(msg, null, AddRemoveEditView, fail, values, values.id ? 'redirecter' : null);}, 3000);
			misc.log(oldSettings, msg, newSettings);
		} else editer(msg, values, fail, answer, AddRemoveEditView, comesFromSRM);
	}
}

async function editer(msg, values, fail, answer, AddRemoveEditView, comesFromSRM) {
	let oldRes, oldSettings, oldRow;
	if (comesFromSRM) oldRes = await msg.client.ch.query(`SELECT * FROM ${msg.client.constants.commands.settings.tablenames[msg.file.name]} WHERE guildid = $1;`, [msg.guild.id], true);
	else oldRes = await msg.client.ch.query(`SELECT * FROM ${msg.client.constants.commands.settings.tablenames[msg.file.name]} WHERE id = $1;`, [values.id], true);
	if (oldRes && oldRes.rowCount > 0) {
		oldRow = oldRes.rows[0];
		oldSettings = oldRow[msg.assigner]; 
	}
	const newRow = {};
	Object.entries(oldRow).forEach((arr) => {
		const name = arr[0], value = arr[1];
		newRow[name] = value;
	});
	newRow[msg.assigner] = values[msg.assigner];
	if (Array.isArray(oldSettings) && oldSettings.length > 0) {
		Promise.all(oldSettings.map(id => {
			if (values[msg.assigner].includes(id)) values[msg.assigner].splice(values[msg.assigner].indexOf(id), 1);
			else values[msg.assigner].push(id);
		}));
	}
	const embed = new Discord.MessageEmbed()
		.setAuthor(
			msg.client.ch.stp(msg.lanSettings.authorEdit, {type: msg.lan.type}), 
			msg.client.constants.standard.image, msg.client.constants.standard.invite
		)
		.setColor(msg.client.constants.commands.settings.color)
		.setDescription(msg.client.ch.stp(msg.lanSettings.done, {loading: msg.client.constants.emotes.loading}));
	if (Array.isArray(oldSettings) && oldSettings.length > 0) embed.addField(msg.lanSettings.oldValue, `${oldSettings.map(f => msg.compatibilityType == 'channels' ? ` <#${f}>` : msg.compatibilityType == 'roles' ? ` <@&${f}>` : msg.compatibilityType == 'users' ? ` <@${f}>` : ` ${f}`)}`);
	else if (oldSettings !== null && oldSettings !== undefined) embed.addField(msg.lanSettings.oldValue, `${oldSettings}`);
	else embed.addField(msg.lanSettings.oldValue, msg.language.none);
	if (Array.isArray(values[msg.assigner]) && values[msg.assigner].length > 0) embed.addField(msg.lanSettings.newValue, `${values[msg.assigner].map(f => msg.compatibilityType == 'channels' ? ` <#${f}>` : msg.compatibilityType == 'roles' ? ` <@&${f}>` : msg.compatibilityType == 'users' ? ` <@${f}>` : ` ${f}`)}`);
	else if (values[msg.assigner] !== null && values[msg.assigner] !== undefined) embed.addField(msg.lanSettings.newValue, `${Array.isArray(values[msg.assigner]) ? msg.language.none : values[msg.assigner]}`);
	else embed.addField(msg.lanSettings.newValue, msg.language.none);		
	if (fail && fail.length > 0) {
		if (Array.isArray(fail)) embed.addField(msg.language.error, `${fail.map(f => ` ${f}`)}`);
		else embed.addField(msg.language.error, fail);
	}
	if (answer) answer.update({embeds: [embed], components: []}).catch(() => {});
	else msg.m.edit({embeds: [embed], components: []}).catch(() => {});
	if (values[msg.assigner] !== undefined && values[msg.assigner] !== null) {
		if (comesFromSRM) {
			if (Array.isArray(values[msg.assigner])) {
				if (values[msg.assigner].length > 0) await msg.client.ch.query(`UPDATE ${msg.client.constants.commands.settings.tablenames[msg.file.name]} SET ${msg.assigner} = $1 WHERE guildid = $2;`, [values[msg.assigner], msg.guild.id], true); 
				else await msg.client.ch.query(`UPDATE ${msg.client.constants.commands.settings.tablenames[msg.file.name]} SET ${msg.assigner} = $1 WHERE guildid = $2;`, [null, msg.guild.id], true); 
			} else await msg.client.ch.query(`UPDATE ${msg.client.constants.commands.settings.tablenames[msg.file.name]} SET ${msg.assigner} = $1 WHERE guildid = $2;`, [values[msg.assigner], msg.guild.id], true); 
		} else {
			if (Array.isArray(values[msg.assigner])) {
				if (values[msg.assigner].length > 0) await msg.client.ch.query(`UPDATE ${msg.client.constants.commands.settings.tablenames[msg.file.name]} SET ${msg.assigner} = $1 WHERE id = $2;`, [values[msg.assigner], values.id], true); 
				else await msg.client.ch.query(`UPDATE ${msg.client.constants.commands.settings.tablenames[msg.file.name]} SET ${msg.assigner} = $1 WHERE id = $2;`, [null, values.id], true); 
			} else await msg.client.ch.query(`UPDATE ${msg.client.constants.commands.settings.tablenames[msg.file.name]} SET ${msg.assigner} = $1 WHERE id = $2;`, [values[msg.assigner], values.id], true); 
		}
		setTimeout(() => {require('./singleRowManager').redirecter(msg, null, AddRemoveEditView, fail, values.id ? {id: values.id} : null, values.id ? 'redirecter' : null);}, 3000);
	}
	misc.log(oldRow, msg, newRow);
}

async function rower(msg) {
	const res = await msg.client.ch.query(`SELECT * FROM ${msg.client.constants.commands.settings.tablenames[msg.file.name]};`, null, true);
	if (!res || res.rowCount == 0) return;
	if (!res.rows[0].uniquetimestamp) return;
	res.rows = res.rows.sort((a,b) => a.uniquetimestamp - b.uniquetimestamp);
	for (let i = 0; i < res.rowCount; i++) {
		res.rows[i].id = i+1;
		msg.client.ch.query(`UPDATE ${msg.client.constants.commands.settings.tablenames[msg.file.name]} SET id = $1 WHERE uniquetimestamp = $2;`, [res.rows[i].id, res.rows[i].uniquetimestamp], true);
	}
	return;
}

function CollectorEnder(collectors) {
	collectors.forEach((c) => {c.stop();});
}