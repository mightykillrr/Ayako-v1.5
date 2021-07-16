const Discord = require('discord.js');
const misc = require('./misc.js');


module.exports = {
	exe(msg, answer) {
		this.edit(msg, answer);
	},
	async display(msg) {
		const res = await msg.client.ch.query(`SELECT * FROM ${msg.client.constants.commands.settings.tablenames[msg.file.name]} WHERE guildid = $1;`, [msg.guild.id]);
		if (msg.file.perm && !msg.member.permissions.has(new Discord.Permissions(msg.file.perm))) return msg.client.ch.reply(msg, msg.language.commands.commandHandler.missingPermissions);
		msg.lanSettings = msg.language.commands.settings;
		msg.lan = msg.lanSettings[msg.file.name];
		let embed;
		if (res && res.rowCount > 0) embed = typeof(msg.file.displayEmbed) == 'function' ? msg.file.displayEmbed(msg, res.rows) : misc.noEmbed(msg);
		else embed = misc.noEmbed(msg);
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
		msg.lanSettings = msg.language.commands.settings;
		msg.lan = msg.lanSettings[msg.file.name];
		let embed;
		const res = await msg.client.ch.query(`SELECT * FROM ${msg.client.constants.commands.settings.tablenames[msg.file.name]} WHERE guildid = $1;`, [msg.guild.id]);
		if (res && res.rowCount > 0) embed = typeof(msg.file.displayEmbed) == 'function' ? msg.file.displayEmbed(msg, res.rows) : misc.noEmbed(msg);
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
			.setLabel(msg.language.edit)
			.setDisabled(embed.fields.length > 0 ? false : true);
		const row = msg.client.ch.buttonRower([add, remove, edit]);
		if (answer) answer.update({embeds: [embed], components: row}).catch(() => {});
		else if (msg.m) msg.m.edit({embeds: [embed], components: row}).catch(() => {});
		else msg.m = await msg.client.ch.reply(msg, {embeds: [embed], components: row});
		const buttonsCollector = msg.m.createMessageComponentCollector({time: 60000});
		const messageCollector = msg.channel.createMessageCollector({time: 60000});
		buttonsCollector.on('collect', (clickButton) => {
			if (clickButton.user.id == msg.author.id) {
				if (clickButton.customId == 'add') {
					CollectorEnder([buttonsCollector, messageCollector]);
					this.add(msg, clickButton);
				} else if (clickButton.customId == 'remove') {
					CollectorEnder([buttonsCollector, messageCollector]);
					this.remove(msg, clickButton);
				} else if (clickButton.customId == 'edit') {
					CollectorEnder([buttonsCollector, messageCollector]);
					this.edit(msg, clickButton);
				}
			} else msg.client.ch.notYours(clickButton, msg);
		});
		messageCollector.on('collect', (message) => {
			if (msg.author.id == message.author.id) {
				message.delete().catch(() => {});
				if (message.content.toLowerCase() == msg.language.cancel) misc.aborted(msg, [messageCollector, buttonsCollector]);
				else if (message.content.toLowerCase() == msg.language.add.toLowerCase()) {
					CollectorEnder([buttonsCollector, messageCollector]);
					this.add(msg);
				} else if (message.content.toLowerCase() == msg.language.remove.toLowerCase()) {
					CollectorEnder([buttonsCollector, messageCollector]);
					this.remove(msg);
				} else if (message.content.toLowerCase() == msg.language.edit.toLowerCase()) {
					CollectorEnder([buttonsCollector, messageCollector]);
					this.edit(msg);
				} 
			}
		});
		buttonsCollector.on('end', (collected, reason) => {if (reason == 'time') msg.client.ch.collectorEnd(msg);});
	},
	async add(msg, answer) {
		const embed = new Discord.MessageEmbed()
			.setAuthor(
				msg.client.ch.stp(msg.lanSettings.author, {type: msg.lan.type}),
				msg.client.constants.emotes.settingsLink,
				msg.client.constants.standard.invite
			);
		repeater(msg, 0, embed, {}, answer, [], 'add');
	},
	async remove(msg, answer) {
		const embed = new Discord.MessageEmbed()
			.setAuthor(
				msg.client.ch.stp(msg.lanSettings.author, {type: msg.lan.type}),
				msg.client.constants.emotes.settingsLink,
				msg.client.constants.standard.invite
			);
		repeater(msg, 0, embed, {}, answer, [], 'remove');
	}
};

async function repeater(msg, i, embed, values, answer, fail, identifier) {
	const property = msg.client.constants.commands.settings.edit[msg.file.name][msg.client.constants.commands.settings.setupQueries[msg.file.name][identifier][i]];
	if (i < msg.client.constants.commands.settings.setupQueries[msg.file.name].required.length) {
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
			embed.setDescription(`${msg.lan.edit[identifier].name}\n${msg.lan.edit[identifier].process[i]}\n${msg.language.page}: \`1/${Math.ceil(options.length / 25)}\``);
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
						values[property] = answered;
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
					values[property] = message.content;
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
										if (values[property] && values[property].includes(id)) {
											const index = values[property].indexOf(id);
											values[property].splice(index, 1);
										} else if (values[property] && values[property].length > 0) values[property].push(id);
										else values[property] = [id];
									});
								} else values[property] = answered;	
							}
						} else if (compatibilityType == 'number') {
							if (answered.length > 0) {
								if (Array.isArray(answered)) {
									answered.forEach(id => { 
										if (values[property] && values[property].includes(id)) {
											const index = values[property].indexOf(id);
											values[property].splice(index, 1);
										} else if (values[property] && values[property].length > 0) values[property].push(id);
										else values[property] = [id];
									});
								} else values[property] = answered;	
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
						if (result) answered = values[property];
						else misc.notValid(msg);
					} else if (settings == 'roles' || settings == 'channels') {
						const args = message.content.split(/ +/);
						Promise.all(args.map(async raw => {
							const id = raw.replace(/\D+/g, '');
							const request = msg.guild[compatibilityType].cache.get(id);
							if ((!request || !request.id) && (!values[property] || (values[property] && !values[property].includes(id)))) fail.push(`\`${raw}\` ${msg.lan.edit[property].fail.no}`);
							else answered.push(id);
						}));
						if (answered.length > 0) {
							if (Array.isArray(answered)) {
								answered.forEach(id => { 
									if (values[property] && values[property].includes(id)) {
										const index = values[property].indexOf(id);
										values[property].splice(index, 1);
									} else if (values[property] && values[property].length > 0) values[property].push(id);
									else values[property] = [id];
								});
							} else values[property] = answered;							
						}
						answered = values[property];
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
						if ((!request || !request.id) && (!values[property] || (values[property] && !values[property].includes(id)))) fail.push(`\`${raw}\` ${msg.lan.edit[property].fail.no}`);
						else answered.push(id);
					}));
					message.delete().catch(() => {});
					if (answered.length > 0) {
						if (Array.isArray(answered)) {
							answered.forEach(id => { 
								if (values[property] && values[property].includes(id)) {
									const index = values[property].indexOf(id);
									values[property].splice(index, 1);
								} else if (values[property] && values[property].length > 0) values[property].push(id);
								else values[property] = [id];
							});
						} else values[property] = answered;	
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
			const actionRows = msg.client.ch.buttonRower([PRIMARY, SECONDARY, DANGER]);
			if (answer) answer.update({embeds: [embed], components: actionRows}).catch(() => {});
			else msg.m.edit({embeds: [embed], components: actionRows}).catch(() => {});
			const buttonsCollector = msg.m.createMessageComponentCollector({time: 60000});
			const messageCollector = msg.channel.createMessageCollector({time: 60000});
			buttonsCollector.on('collect', (buttonClick) => {
				if (buttonClick.user.id == msg.author.id) {
					buttonsCollector.stop();
					messageCollector.stop();
					if (buttonClick.customId == 'true') values[property] = true;
					else if (buttonClick.customId == 'false') values[property] = false;
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
					values[property] = message.content.toLowerCase() == msg.language.true.toLowerCase() ? true : message.content.toLowerCase() == msg.language.false.toLowerCase() ? false : null;
					if (values[property] == null) return misc.notValid(msg);
					message.delete().catch(() => {});
					buttonsCollector.stop();
					messageCollector.stop();
					repeater(msg, i+1, embed, values, null, null, identifier);
				}
			});

		} else if (property == 'id') {
			const req = [];
			let r;
			const res = await msg.client.ch.query(`SELECT * FROM ${msg.client.cconstants.commands.settings.tablenames[msg.file.name]} WHERE guildid = $1;`, [msg.guild.id]);
			if (res && res.rowCount > 0) r = res.rows;
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
						values[property] = answered;
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
					values[property] = message.content;
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
		} 
	} else {
		if (identifier == 'add') {
			let valDeclaration = '';
			for (let j = 0; j < msg.client.constants.commands.settings.setupQueries[msg.file.name].vals.length; j++) {valDeclaration += `$${j+1}, `;}
			valDeclaration = valDeclaration.slice(0, valDeclaration.length-2);
			values.guild = msg.guild;
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

		} else if (identifier == 'edit') {

		}
	}
}

function CollectorEnder(collectors) {
	collectors.forEach((c) => {c.stop();});
}