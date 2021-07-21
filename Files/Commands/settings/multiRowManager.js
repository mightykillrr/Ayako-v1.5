const Discord = require('discord.js');
const misc = require('./misc.js');


module.exports = {
	exe(msg, answer) {
		this.edit(msg, answer);
	},
	async display(msg) {
		await rower(msg);
		msg.client.constants.commands.settings.editRequire.splice(2, 1);
		let res = await msg.client.ch.query(`SELECT * FROM ${msg.client.constants.commands.settings.tablenames[msg.file.name]} WHERE guildid = $1;`, [msg.guild.id]);
		if (msg.file.perm && !msg.member.permissions.has(new Discord.Permissions(msg.file.perm))) return msg.client.ch.reply(msg, msg.language.commands.commandHandler.missingPermissions);
		msg.lanSettings = msg.language.commands.settings;
		msg.lan = msg.lanSettings[msg.file.name];
		let embed;
		if (res && res.rowCount > 0) {
			res.rows = res.rows.sort((a, b) => a.id - b.id);
			embed = typeof(msg.file.mmrEmbed) == 'function' ? msg.file.mmrEmbed(msg, res.rows) : misc.noEmbed(msg);
		}
		else embed = misc.noEmbed(msg);
		embed.setAuthor(
			msg.client.ch.stp(msg.lanSettings.author, {type: msg.lan.type}), 
			msg.client.constants.emotes.settingsLink,
			msg.client.constants.standard.invite
		)
			.setDescription(`${msg.client.ch.stp(msg.lanSettings.howToEdit, {prefix: msg.client.constants.standard.prefix, type: msg.file.name})}\n\n${embed.description ? embed.description : ''}`)
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
		const m = await msg.client.ch.reply(msg, {embeds: [embed], components: rows});
		msg.m = m;
		const buttonsCollector = m.createMessageComponentCollector({time: 60000});
		const messageCollector = msg.channel.createMessageCollector({time: 60000});
		buttonsCollector.on('collect', (clickButton) => {
			if (clickButton.user.id == msg.author.id) {
				if (clickButton.customId == 'edit') {
					buttonsCollector.stop();
					messageCollector.stop();
					this.edit(msg, clickButton);
				} else if (clickButton.customId == 'list') {
					buttonsCollector.stop();
					messageCollector.stop();
					this.list(msg, clickButton, 'view');
				}
			} else msg.client.ch.notYours(clickButton);
		});
		buttonsCollector.on('end', (collected, reason) => {if (reason == 'time') m.edit({embeds: [embed], components: []});});
		messageCollector.on('collect', (message) => {
			if (message.author.id == msg.author.id && message.content == msg.language.edit) {
				buttonsCollector.stop();
				messageCollector.stop();
				message.delete().catch(() => {});
				this.edit(msg);
			}
		});
	},
	async edit(msg, answer) {
		msg.client.constants.commands.settings.editRequire.splice(2, 1);
		msg.lanSettings = msg.language.commands.settings;
		msg.lan = msg.lanSettings[msg.file.name];
		let embed;
		await rower(msg);
		let res = await msg.client.ch.query(`SELECT * FROM ${msg.client.constants.commands.settings.tablenames[msg.file.name]} WHERE guildid = $1;`, [msg.guild.id]);
		if (res && res.rowCount > 0) {
			res.rows = res.rows.sort((a, b) => a.id - b.id);
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
		const buttonsCollector = msg.m.createMessageComponentCollector({time: 60000});
		const messageCollector = msg.channel.createMessageCollector({time: 60000});
		buttonsCollector.on('collect', (clickButton) => {
			if (clickButton.user.id == msg.author.id) {
				if (clickButton.customId == 'add') {
					CollectorEnder([buttonsCollector, messageCollector]);
					repeater(msg, 0, null, {}, clickButton, [], 'add');
				} else if (clickButton.customId == 'remove') {
					CollectorEnder([buttonsCollector, messageCollector]);
					repeater(msg, 0, null, {}, clickButton, [], 'remove');
				} else if (clickButton.customId == 'edit') {
					CollectorEnder([buttonsCollector, messageCollector]);
					repeater(msg, 0, null, {}, clickButton, [], 'edit');
				} else if (clickButton.customId == 'list') {
					CollectorEnder([buttonsCollector, messageCollector]);
					this.list(msg, clickButton, 'edit');
				}
			} else msg.client.ch.notYours(clickButton, msg);
		});
		messageCollector.on('collect', (message) => {
			if (msg.author.id == message.author.id) {
				if (message.content.toLowerCase() == msg.language.cancel) misc.aborted(msg, [messageCollector, buttonsCollector]);
				else if (message.content.toLowerCase() == msg.language.add.toLowerCase()) {
					CollectorEnder([buttonsCollector, messageCollector]);
					message.delete().catch(() => {});
					repeater(msg, 0, null, {}, null, [], 'add');
				} else if (message.content.toLowerCase() == msg.language.remove.toLowerCase()) {
					CollectorEnder([buttonsCollector, messageCollector]);
					message.delete().catch(() => {});
					repeater(msg, 0, null, {}, null, [], 'remove');
				} else if (message.content.toLowerCase() == msg.language.edit.toLowerCase()) {
					CollectorEnder([buttonsCollector, messageCollector]);
					message.delete().catch(() => {});
					repeater(msg, 0, null, {}, null, [], 'edit');
				} 
			}
		});
		buttonsCollector.on('end', (collected, reason) => {if (reason == 'time') msg.client.ch.collectorEnd(msg);});
	},
	async list (msg, answer, origin) {
		let fail = [], answered = [], values = {};
		const res = await msg.client.ch.query(`SELECT * FROM ${msg.client.constants.commands.settings.tablenames[msg.file.name]} WHERE guildid = $1;`, [msg.guild.id]);
		if (res && res.rowCount > 0) fail = res.rows;
		else return misc.aborted(msg);
		const options = [];
		for (let j = 0; j < fail.length; j++) {
			options.push({label: `${msg.language.number}: ${fail[j].id} | ${fail[j][msg.client.constants.commands.settings.setupQueries[msg.file.name].removeIdent]}`, value: `${fail[j].id}`});
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
					gotID(values.id, clickButton, origin);
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
					return module.exports.edit(msg, clickButton);
				}
			} else msg.client.ch.notYours(clickButton, msg);
		});
		messageCollector.on('collect', async (message) => {
			if (msg.author.id == message.author.id) {
				if (message.content == msg.language.cancel) return misc.aborted(msg, [messageCollector, buttonsCollector]);
				message.delete().catch(() => {});
				if (isNaN(parseInt(message.content))) return misc.notValid(msg);
				answered.push(fail[message.content]);
				messageCollector.stop();
				buttonsCollector.stop();
				values.id = answered;
				gotID(values.id, null, origin);
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
				msg.m.edit({embeds: [embed], components: []}).catch(() => {});
			}
		});
		async function gotID(id, answer, origin) {
			const res = await msg.client.ch.query(`SELECT * FROM ${msg.file.name} WHERE id = $1 AND guildid = $2;`, [id, msg.guild.id]);
			if (res && res.rowCount > 0) {
				if (origin == 'edit') require('./singleRowManager').redirecter(msg, res.rows[0], answer, id);
				else if (origin == 'view') listdisplay(msg, res.rows[0], answer, id);
			}
		}
	},
};

async function listdisplay(msg, r, answer, id) {
	let embed = typeof(msg.file.displayEmbed) == 'function' ? msg.file.displayEmbed(msg, r) : misc.noEmbed(msg);
	embed.setAuthor(
		msg.client.ch.stp(msg.lanSettings.author, {type: msg.lan.type}), 
		msg.client.constants.emotes.settingsLink,
		msg.client.constants.standard.invite
	)
		.setDescription(`${msg.client.ch.stp(msg.lanSettings.howToEdit, {prefix: msg.client.constants.standard.prefix, type: msg.file.name})}\n\n${embed.description ? embed.description : ''}`)
		.setColor(msg.client.constants.commands.settings.color);
	const button = new Discord.MessageButton()
		.setCustomId('edit')
		.setStyle('PRIMARY')
		.setLabel(msg.language.Edit);
	const rows = msg.client.ch.buttonRower([button]);
	if (answer) answer.update({embeds: [embed], components: rows}).catch(() => {});
	else msg.m.edit({embeds: [embed], components: rows}).catch(() => {});
	const buttonsCollector = msg.m.createMessageComponentCollector({time: 60000});
	const messageCollector = msg.channel.createMessageCollector({time: 60000});
	buttonsCollector.on('collect', (clickButton) => {
		if (clickButton.user.id == msg.author.id) {
			if (clickButton.customId == 'edit') {
				buttonsCollector.stop();
				messageCollector.stop();
				require('./singleRowManager').redirecter(msg, r, clickButton, id);
			}
		} else msg.client.ch.notYours(clickButton);
	});
	buttonsCollector.on('end', (collected, reason) => {if (reason == 'time') msg.m.edit({embeds: [embed], components: []});});
	messageCollector.on('collect', (message) => {
		if (message.author.id == msg.author.id && message.content == msg.language.edit) {
			buttonsCollector.stop();
			messageCollector.stop();
			message.delete().catch(() => {});
			require('./singleRowManager').redirecter(msg, r, null, id);
		}
	});
}

async function repeater(msg, i, embed, values, answer, fail, identifier) {
	if (i == 0) {
		embed = new Discord.MessageEmbed()
			.setAuthor(
				msg.client.ch.stp(msg.lanSettings.author, {type: msg.lan.type}),
				msg.client.constants.emotes.settingsLink,
				msg.client.constants.standard.invite
			);
	}
	const property = identifier == 'edit' ? msg.client.constants.commands.settings.edit[msg.file.name][msg.client.constants.commands.settings.editRequire[i]] : msg.client.constants.commands.settings.edit[msg.file.name][msg.client.constants.commands.settings.setupQueries[msg.file.name][identifier][i]];
	if (identifier == 'edit' ? i < msg.client.constants.commands.settings.editRequire.length : i < msg.client.constants.commands.settings.setupQueries[msg.file.name][identifier].length) {
		const assinger = Object.entries(msg.client.constants.commands.settings.edit[msg.file.name]).find(a => a[1] == msg.client.constants.commands.settings.editRequire[i] || a[0] == msg.client.constants.commands.settings.editRequire[i])[0];
		let answered = [];
		if (property == 'command') {
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
			embed.setDescription(`${identifier !== 'edit' ? msg.lan.edit[identifier].name : msg.lan.edit.edit[property]}\n${identifier !== 'edit' ? msg.lan.edit[identifier].process[i] : ''}\n${msg.language.page}: \`1/${Math.ceil(options.length / 25)}\``);
			const menu = new Discord.MessageSelectMenu()
				.setCustomId('cmdmenu')
				.addOptions(take)
				.setMinValues(1)
				.setMaxValues(1)
				.setPlaceholder(msg.language.select[property].select);
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
				if (message.author.id == msg.author.id) {
					const command = msg.client.commands.get(message.content.toLowerCase()) || msg.client.commands.find(c => c.aliases && c.aliases.includes(message.content.toLowerCase()));
					if (command) values.command == command.name;
					else return;
				}
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
							.setPlaceholder(msg.language.select[property].select);
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
							.setDescription(`${msg.language.select[property].desc}\n${msg.language.page}: \`${page}/${Math.ceil(+options.length / 25)}\``)
							.addField(msg.language.selected, `${answered} `);
						const rows = msg.client.ch.buttonRower([[menu], [prev, next], [back, done]]);
						clickButton.update({embeds: [embed], components: rows}).catch(() => {});
					} else if (clickButton.customId == 'back') {
						CollectorEnder([messageCollector, buttonsCollector]);
						return module.exports.edit(msg, clickButton);
					} else if (clickButton.customId == 'done') {
						CollectorEnder([messageCollector, buttonsCollector]);
						values.command = answered;
						repeater(msg, i+1, embed, values, clickButton, null, identifier);
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
							.setCustomId(property)
							.addOptions(take)
							.setMinValues(1)
							.setMaxValues(1)
							.setPlaceholder(msg.language.select[property].select);
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
							.setDescription(`${msg.language.select[property].desc}\n${msg.language.page}: \`${page}/${Math.ceil(+options.length / 25)}\``);
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
		} else if (property == 'cooldown') {
			const req = [];
			for (let j = 1; j < 9999; j++) {req.push(j);}
			const options = [];
			req.forEach(r => {
				options.push({label: `${r}`, value: `${r}`});
			});
			const take = [];
			for(let j = 0; j < 25; j++) {take.push(options[j]);}
			const menu = new Discord.MessageSelectMenu()
				.setCustomId(property)
				.addOptions(take)
				.setMinValues(1)
				.setMaxValues(1)
				.setPlaceholder(msg.language.select[property].select);
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
				.setDescription(`${msg.language.select[property].desc}\n${msg.language.page}: \`1/${Math.ceil(options.length / 25)}\``);
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
							.setCustomId(property)
							.addOptions(take)
							.setMinValues(1)
							.setMaxValues(1)
							.setPlaceholder(msg.language.select[property].select);
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
							.setDescription(`${msg.language.select[property].desc}\n${msg.language.page}: \`${page}/${Math.ceil(+options.length / 25)}\``);
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
						values[assinger] = answered;
						repeater(msg, i+1, embed, values, clickButton, null, identifier);
					} else if (clickButton.customId == property) {
						let page = clickButton.message.embeds[0].description ? clickButton.message.embeds[0].description.split(/`+/)[1].split(/\/+/)[0] : 0;
						answered = clickButton.values[0];
						const menu = new Discord.MessageSelectMenu()
							.setCustomId(property)
							.addOptions(take)
							.setMinValues(1)
							.setMaxValues(1)
							.setPlaceholder(msg.language.select[property].select);
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
							.setDescription(`${msg.language.select[property].desc}\n${msg.language.page}: \`${page}/${Math.ceil(+options.length / 25)}\``)
							.addField(msg.language.selected, `${answered} `);
						const rows = msg.client.ch.buttonRower([[menu], [prev, next], [back, done]]);
						clickButton.update({embeds: [embed], components: rows}).catch(() => {});
					} else if (clickButton.customId == 'back') {
						messageCollector.stop();
						buttonsCollector.stop();
						return module.exports.edit(msg, clickButton);
					}
				} else msg.client.ch.notYours(clickButton, msg);
			});
			messageCollector.on('collect', async (message) => {
				if (msg.author.id == message.author.id) {
					if (message.content == msg.language.cancel) return misc.aborted(msg, [messageCollector, buttonsCollector]);
					message.delete().catch(() => {});
					if (isNaN(parseInt(message.content))) return misc.notValid(msg);
					answered = message.content.replace(/\D+/g, '').split(/ +/);
					messageCollector.stop();
					buttonsCollector.stop();
					values[assinger] = message.content;
					repeater(msg, i+1, embed, values, null, null, identifier);
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
					msg.m.edit({embeds: [embed], components: []}).catch(() => {});
				}
			});
		} else if (property.includes('channel') || property.includes('role')) {
			const settings = property;
			const compatibilityType = settings.includes('s') ? settings : settings+'s';
			const req = msg.guild[compatibilityType].cache;
			req.sort((a,b) => a.rawPosition - b.rawPosition);
			const options = [];
			req.forEach(r => {
				if (compatibilityType == 'channels') {
					if (r.type == 'GUILD_TEXT' || r.type == 'GUILD_NEWS' || r.type == 'GUILD_NEWS_THREAD' || r.type == 'GUILD_PUBLIC_THREAD' || r.type == 'GUILD_PRIVATE_THREAD') options.push({label: r.name.length > 25 ? `${r.name.slice(0, 24)}\u2026` : r.name, value: r.id, description: r.parent ? `${r.parent.name}` : null});
				} else  if (compatibilityType == 'roles') options.push({label: r.name.length > 25 ? `${r.name.slice(0, 24)}\u2026` : r.name, value: r.id});
			});
			const take = [];
			for(let j = 0; j < 25; j++) {take.push(options[j]);}
			const menu = new Discord.MessageSelectMenu()
				.setCustomId(property)
				.addOptions(take)
				.setMinValues(1)
				.setMaxValues(settings.includes('s') ? take.length : 1)
				.setPlaceholder(msg.language.select[settings].select);
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
				.setDescription(`${msg.language.select[settings].desc}\n${msg.language.page}: \`1/${Math.ceil(options.length / 25)}\``);
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
							.setCustomId(property)
							.addOptions(take)
							.setMinValues(1)
							.setMaxValues(settings.includes('s') ? take.length : 1)
							.setPlaceholder(msg.language.select[settings].select);
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
							.setDescription(`${msg.language.select[settings].desc}\n${msg.language.page}: \`${page}/${Math.ceil(+options.length / 25)}\``);
						if (answered.length > 0) embed.addField(msg.language.selected, `${answered.map(c => compatibilityType == 'channels' ? `<#${c}>` : compatibilityType == 'roles' ? `<@&${c}>` : ` ${c}`)} `);
						if (page >= Math.ceil(+options.length / 25)) next.setDisabled(true);
						else next.setDisabled(false);
						if (page > 1) prev.setDisabled(false);
						else prev.setDisabled(true);
						const rows = msg.client.ch.buttonRower([[menu], [prev, next], [back, done]]);
						clickButton.update({embeds: [embed], components: rows}).catch(() => {});
					} else if (clickButton.customId == 'done') {
						if (compatibilityType == 'channels' || compatibilityType == 'roles') {
							if (answered.length > 0) {
								if (Array.isArray(answered)) {
									answered.forEach(id => { 
										if (values[assinger] && values[assinger].includes(id)) {
											const index = values[assinger].indexOf(id);
											values[assinger].splice(index, 1);
										} else if (values[assinger] && values[assinger].length > 0) values[assinger].push(id);
										else values[assinger] = [id];
									});
								} else values[assinger] = answered;	
							}
						} else if (compatibilityType == 'number') {
							if (answered.length > 0) {
								if (Array.isArray(answered)) {
									answered.forEach(id => { 
										if (values[assinger] && values[assinger].includes(id)) {
											const index = values[assinger].indexOf(id);
											values[assinger].splice(index, 1);
										} else if (values[assinger] && values[assinger].length > 0) values[assinger].push(id);
										else values[assinger] = [id];
									});
								} else values[assinger] = answered;	
							}
						}
						messageCollector.stop('finished');
						buttonsCollector.stop('finished');
						repeater(msg, i+1, embed, values, clickButton, null, identifier);
					} else if (clickButton.customId == property) {
						clickButton.values.forEach(val => {
							if (!answered.includes(val)) msg.guild[settings].cache.get(val) ? answered.push(msg.guild[settings].cache.get(val).id) : '';
							else answered.splice(answered.indexOf(val), 1);
						});
						let page = clickButton.message.embeds[0].description ? clickButton.message.embeds[0].description.split(/`+/)[1].split(/\/+/)[0] : 0;
						const menu = new Discord.MessageSelectMenu()
							.setCustomId(property)
							.addOptions(take)
							.setMinValues(1)
							.setMaxValues(settings.includes('s') ? take.length : 1)
							.setPlaceholder(msg.language.select[settings].select);
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
							.setDescription(`${msg.language.select[settings].desc}\n${msg.language.page}: \`${page}/${Math.ceil(+options.length / 25)}\``)
							.addField(msg.language.selected, `${answered.map(c => settings == 'channels' ? `<#${c}>` : settings == 'roles' ? `<@&${c}>` : ` ${c}`)} `);
						const rows = msg.client.ch.buttonRower([[menu], [prev, next], [back, done]]);
						clickButton.update({embeds: [embed], components: rows}).catch(() => {});
					} else if (clickButton.customId == 'back') {
						messageCollector.stop();
						buttonsCollector.stop();
						return module.exports.edit(msg, clickButton);
					}
				} else msg.client.ch.notYours(clickButton, msg);
			});
			messageCollector.on('collect', async (message) => {
				if (msg.author.id == message.author.id) {
					if (message.content == msg.language.cancel) return misc.aborted(msg, [messageCollector, buttonsCollector]);
					message.delete().catch(() => {});
					if (settings == 'role' || settings == 'channel') {
						const answerContent = msg.content.replace(/\D+/g, '');
						const result = msg.guild[compatibilityType].cache.get(answerContent);
						if (result) answered = values[assinger];
						else misc.notValid(msg);
					} else if (settings == 'roles' || settings == 'channels') {
						const args = message.content.split(/ +/);
						Promise.all(args.map(async raw => {
							const id = raw.replace(/\D+/g, '');
							const request = msg.guild[compatibilityType].cache.get(id);
							if ((!request || !request.id) && (!values[assinger] || (values[assinger] && !values[assinger].includes(id)))) fail.push(`\`${raw}\` ${msg.lan.edit[property].fail.no}`);
							else answered.push(id);
						}));
						if (answered.length > 0) {
							if (Array.isArray(answered)) {
								answered.forEach(id => { 
									if (values[assinger] && values[assinger].includes(id)) {
										const index = values[assinger].indexOf(id);
										values[assinger].splice(index, 1);
									} else if (values[assinger] && values[assinger].length > 0) values[assinger].push(id);
									else values[assinger] = [id];
								});
							} else values[assinger] = answered;							
						}
						answered = values[assinger];
					} else return misc.notValid(msg);
					buttonsCollector.stop('finished');
					messageCollector.stop('finished');
					repeater(msg, i+1, embed, values, null, fail, identifier);
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
					msg.m.edit({embeds: [embed], components: []}).catch(() => {});
				}
			});
		} else if (property.includes('user')) {
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
						if ((!request || !request.id) && (!values[assinger] || (values[assinger] && !values[assinger].includes(id)))) fail.push(`\`${raw}\` ${msg.lan.edit[property].fail.no}`);
						else answered.push(id);
					}));
					message.delete().catch(() => {});
					if (answered.length > 0) {
						if (Array.isArray(answered)) {
							answered.forEach(id => { 
								if (values[assinger] && values[assinger].includes(id)) {
									const index = values[assinger].indexOf(id);
									values[assinger].splice(index, 1);
								} else if (values[assinger] && values[assinger].length > 0) values[assinger].push(id);
								else values[assinger] = [id];
							});
						} else values[assinger] = answered;	
					}
					messageCollector.stop();
					buttonsCollector.stop();
					repeater(msg, i+1, embed, values, null, fail, identifier);
				}
			});
			buttonsCollector.on('collect', (clickButton) => {
				if (clickButton.user.id == msg.author.id) {
					if (clickButton.customId == 'back') {
						buttonsCollector.stop();
						messageCollector.stop();
						return module.exports.edit(msg, clickButton);
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
		} else if (property == 'boolean') {
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
			buttonsCollector.on('collect', (buttonClick) => {
				if (buttonClick.user.id == msg.author.id) {
					buttonsCollector.stop();
					messageCollector.stop();
					if (buttonClick.customId == 'true') values[assinger] = true;
					else if (buttonClick.customId == 'false') values[assinger] = false;
					else if (buttonClick.customId == 'back') {
						messageCollector.stop();
						buttonsCollector.stop();
						return module.exports.edit(msg, buttonClick);
					}
					repeater(msg, i+1, embed, values, buttonClick, null, identifier);
				} else msg.client.ch.notYours(buttonClick, msg);
			});
			buttonsCollector.on('end', (collected, reason) => {if (reason == 'time') {msg.client.ch.collectorEnd(msg);}});
			messageCollector.on('collect', (message) => {
				if (message.author.id == msg.author.id) {
					if (message.content == msg.language.cancel) return misc.aborted(msg, [messageCollector, buttonsCollector]);
					values[assinger] = message.content.toLowerCase() == msg.language.true.toLowerCase() ? true : message.content.toLowerCase() == msg.language.false.toLowerCase() ? false : null;
					if (values[assinger] == null) return misc.notValid(msg);
					message.delete().catch(() => {});
					buttonsCollector.stop();
					messageCollector.stop();
					repeater(msg, i+1, embed, values, null, null, identifier);
				}
			});
		} else if (property == 'id') {
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
				.setCustomId(property)
				.addOptions(take)
				.setMinValues(1)
				.setMaxValues(take.length)
				.setPlaceholder(msg.language.select[property].select);
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
				.setDescription(`${msg.language.select[property].desc}\n${msg.language.page}: \`1/${Math.ceil(options.length / 25)}\``);
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
							.setCustomId(property)
							.addOptions(take)
							.setMinValues(1)
							.setMaxValues(take.length)
							.setPlaceholder(msg.language.select[property].select);
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
							.setDescription(`${msg.language.select[property].desc}\n${msg.language.page}: \`${page}/${Math.ceil(+options.length / 25)}\``);
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
						values[assinger] = answered;
						repeater(msg, i+1, embed, values, clickButton, fail, identifier);
					} else if (clickButton.customId == property) {
						let page = clickButton.message.embeds[0].description ? clickButton.message.embeds[0].description.split(/`+/)[1].split(/\/+/)[0] : 0;
						clickButton.values.forEach(v => {
							if (answered.includes(v)) answered.splice(answered.indexOf(v), 1);
							else answered.push(v);
						});
						const menu = new Discord.MessageSelectMenu()
							.setCustomId(property)
							.addOptions(take)
							.setMinValues(1)
							.setMaxValues(take.length)
							.setPlaceholder(msg.language.select[property].select);
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
							.setDescription(`${msg.language.select[property].desc}\n${msg.language.page}: \`${page}/${Math.ceil(+options.length / 25)}\``)
							.addField(msg.language.selected, `${answered.map(c => ` ${c}`)} `);
						const rows = msg.client.ch.buttonRower([[menu], [prev, next], [back, done]]);
						clickButton.update({embeds: [embed], components: rows}).catch(() => {});
					} else if (clickButton.customId == 'back') {
						messageCollector.stop();
						buttonsCollector.stop();
						return module.exports.edit(msg, clickButton);
					}
				} else msg.client.ch.notYours(clickButton, msg);
			});
			messageCollector.on('collect', async (message) => {
				if (msg.author.id == message.author.id) {
					if (message.content == msg.language.cancel) return misc.aborted(msg, [messageCollector, buttonsCollector]);
					message.delete().catch(() => {});
					if (isNaN(parseInt(message.content))) return misc.notValid(msg);
					answered.push(fail[message.content]);
					messageCollector.stop();
					buttonsCollector.stop();
					values[assinger] = answered;
					repeater(msg, i+1, embed, values, null, fail, identifier);
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
					msg.m.edit({embeds: [embed], components: []}).catch(() => {});
				}
			});
		} else if (property == 'column') {
			const req = {};
			Object.entries(msg.lan).forEach(e => {
				if (e[0] !== 'category' && e[0] !== 'type' && e[0] !== 'edit') req[e[0]] = e[1];
			});
			const options = [];
			for (let j = 0; j < Object.entries(req).length; j++) {
				const r = Object.entries(req)[j];
				options.push({label: r[1] > 25 ? `${r[1].slice(0, 24)}\u2026` : r[1], value: r[0]});
			}
			const take = [];
			for(let j = 0; j < 25 && j < options.length; j++) {take.push(options[j]);}
			const menu = new Discord.MessageSelectMenu()
				.setCustomId(property)
				.addOptions(take)
				.setMinValues(1)
				.setMaxValues(1)
				.setPlaceholder(msg.language.select[property].select);
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
				.setDescription(`${msg.language.select[property].desc}\n${msg.language.page}: \`1/${Math.ceil(options.length / 25)}\``);
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
							.setCustomId(property)
							.addOptions(take)
							.setMinValues(1)
							.setMaxValues(1)
							.setPlaceholder(msg.language.select[property].select);
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
							.setDescription(`${msg.language.select[property].desc}\n${msg.language.page}: \`${page}/${Math.ceil(+options.length / 25)}\``);
						if (answered.length > 0) embed.addField(msg.language.selected, `${answered}`);
						if (page >= Math.ceil(+options.length / 25)) next.setDisabled(true);
						else next.setDisabled(false);
						if (page > 1) prev.setDisabled(false);
						else prev.setDisabled(true);
						const rows = msg.client.ch.buttonRower([[menu], [prev, next], [back, done]]);
						clickButton.update({embeds: [embed], components: rows}).catch(() => {});
					} else if (clickButton.customId == 'done') {
						if (answered.length > 0) values[assinger] = answered;
						msg.client.constants.commands.settings.editRequire.push(answered);
						messageCollector.stop('finished');
						buttonsCollector.stop('finished');
						repeater(msg, i+1, embed, values, clickButton, null, identifier);
					} else if (clickButton.customId == property) {
						answered = clickButton.values[0];
						let page = clickButton.message.embeds[0].description ? clickButton.message.embeds[0].description.split(/`+/)[1].split(/\/+/)[0] : 0;
						const menu = new Discord.MessageSelectMenu()
							.setCustomId(property)
							.addOptions(take)
							.setMinValues(1)
							.setMaxValues(1)
							.setPlaceholder(msg.language.select[property].select);
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
							.setDescription(`${msg.language.select[property].desc}\n${msg.language.page}: \`${page}/${Math.ceil(+options.length / 25)}\``)
							.addField(msg.language.selected, `${answered} `);
						const rows = msg.client.ch.buttonRower([[menu], [prev, next], [back, done]]);
						clickButton.update({embeds: [embed], components: rows}).catch(() => {});
					} else if (clickButton.customId == 'back') {
						messageCollector.stop();
						buttonsCollector.stop();
						return module.exports.edit(msg, clickButton);
					}
				} else msg.client.ch.notYours(clickButton, msg);
			});
			messageCollector.on('collect', async (message) => {
				if (msg.author.id == message.author.id) {
					if (message.content == msg.language.cancel) return misc.aborted(msg, [messageCollector, buttonsCollector]);
					message.delete().catch(() => {});
					//values[assinger] = answered;							
					buttonsCollector.stop('finished');
					messageCollector.stop('finished');
					repeater(msg, i+1, embed, values, null, fail, identifier);
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
					msg.m.edit({embeds: [embed], components: []}).catch(() => {});
				}
			});

		}
	} else {
		if (identifier == 'add') {
			let valDeclaration = '';
			for (let j = 0; j < msg.client.constants.commands.settings.setupQueries[msg.file.name].vals.length; j++) {valDeclaration += `$${j+1}, `;}
			valDeclaration = valDeclaration.slice(0, valDeclaration.length-2);
			values.guild = msg.guild;
			values.date = Date.now();
			const res = await msg.client.ch.query(`SELECT * FROM ${msg.client.constants.commands.settings.tablenames[msg.file.name]};`);
			if (res && res.rowCount > 0) values.id = res.rowCount+1;
			else values.id = 1;
			msg.client.ch.query(`INSERT INTO ${msg.client.constants.commands.settings.tablenames[msg.file.name]} (${msg.client.constants.commands.settings.setupQueries[msg.file.name].cols}) VALUES (${valDeclaration});`, msg.client.ch.stp(msg.client.constants.commands.settings.setupQueries[msg.file.name].vals, {values: values}));
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
			setTimeout(() => {module.exports.edit(msg, null);}, 3000);
		} else if (identifier == 'remove') {
			values.id.forEach(async (id) => {
				const names = [];
				const arr = fail.find(f => f.id == id);
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
				msg.client.ch.query(`DELETE FROM ${msg.client.constants.commands.settings.tablenames[msg.file.name]} WHERE ${nameText};`, vals);
			});
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
			setTimeout(() => {module.exports.edit(msg, null);}, 3000);
		} else if (identifier == 'edit') {
			const added = msg.client.constants.commands.settings.editRequire.splice(2, 1);
			msg.client.ch.query(`UPDATE ${msg.client.constants.commands.settings.tablenames[msg.file.name]} SET ${values.column} = $1 WHERE id = $2;`, [values[added], values.id[0]]);
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
			setTimeout(() => {module.exports.edit(msg, null);}, 3000);
		}
	}
}

async function rower(msg) {
	const res = await msg.client.ch.query(`SELECT * FROM ${msg.client.constants.commands.settings.tablenames[msg.file.name]};`);
	if (!res || res.rowCount == 0) return;
	for (let i = 0; i < res.rowCount; i++) {
		res.rows[i].id = i+1;
		msg.client.ch.query(`UPDATE ${msg.client.constants.commands.settings.tablenames[msg.file.name]} SET id = $1 WHERE uniquetimestamp = $2;`, [res.rows[i].id, res.rows[i].uniquetimestamp]);
	}
	return;
}

function CollectorEnder(collectors) {
	collectors.forEach((c) => {c.stop();});
}