const Discord = require('discord.js');
const misc = require('./misc.js');
const setuper = require('./setup');

module.exports = {
	exe(msg, answer, file) {
		edit(msg, answer, file);
	}
};

async function edit(msg, answer, file) {
	msg.lanSettings = msg.language.commands.settings;
	if (!msg.file) {file.name = msg.args[0].toLowerCase(); msg.file = file;}
	const res = await msg.client.ch.query(`SELECT * FROM ${msg.client.constants.commands.settings.tablenames[msg.file.name]} WHERE guildid = $1;`, [msg.guild.id]);
	let r;
	if (msg.file.setupRequired == false) return require('./multiRowManager').exe(msg, answer);
	else if (!res || res.rowCount == 0) return setuper.execute(msg);
	else r = res.rows[0];
	let compatibilityType;
	if (msg.file.perm && !msg.member.permissions.has(new Discord.Permissions(msg.file.perm))) return msg.client.ch.reply(msg, msg.language.commands.commandHandler.missingPermissions);
	msg.lanSettings = msg.language.commands.settings;
	const editEmbed = typeof(msg.file.editEmbed) == 'function' ? msg.file.editEmbed(msg, r) : misc.noEmbed(msg);
	editEmbed.setDescription(`${msg.client.ch.stp(msg.lanSettings.howToEdit2, {prefix: msg.client.constants.standard.prefix, type: msg.file.name})}\n\n${editEmbed.description ? editEmbed.description : ''}`);
	editEmbed.setColor(msg.client.constants.commands.settings.color);
	editEmbed.setAuthor(
		msg.client.ch.stp(msg.lanSettings.authorEdit, {type: msg.lan.type}), 
		msg.client.constants.emotes.settingsLink, 
		msg.client.constants.standard.invite
	);
	let rows = [];
	for (let o = 0; o < Object.keys(msg.lan.edit).length; o++) {
		const edit = Object.entries(msg.lan.edit)[o];
		const name = edit[1];
		const button = new Discord.MessageButton()
			.setCustomId(`${name.name}`)
			.setLabel(`${name.trigger[1] ? name.trigger[1].replace(/`/g, '') : name.trigger[0].replace(/`/g, '')}`)
			.setStyle('PRIMARY');
		rows.push(button);
	}
	let i; let j;
	let buttons = [];
	if (typeof(msg.file.buttons) == 'function') buttons = msg.file.buttons(msg, r);
	else for (i = 0, j = rows.length; i < j; i += 5) {buttons.push(rows.slice(i, i+5));}
	const actionRows = msg.client.ch.buttonRower(buttons);
	if (answer) answer.update({embeds: [editEmbed], components: actionRows}).catch((e) => {console.log(e);});
	else if (msg.m) msg.m.edit({embeds: [editEmbed], components: actionRows}).catch((e) => {console.log(e);});
	else msg.m = await msg.client.ch.reply(msg, {embeds: [editEmbed], components: actionRows});
	const buttonsCollector = msg.m.createMessageComponentCollector({time: 60000});
	const messageCollector = msg.channel.createMessageCollector({time: 60000});
	buttonsCollector.on('collect', (clickButton) => {
		if (clickButton.user.id == msg.author.id) {
			let editing;
			Object.entries(msg.lan.edit).forEach(e => {e[1].trigger.forEach(trigger => {if (trigger.replace(/`/g, '') == clickButton.customId) editing = e;});});
			if (editing) {
				gotEditing(editing, clickButton);
				buttonsCollector.stop();
				messageCollector.stop();
			}
		} else msg.client.ch.notYours(clickButton, msg);
	});
	buttonsCollector.on('end', (collected, reason) => {if (reason == 'time') {msg.client.ch.collectorEnd(msg);}});
	messageCollector.on('collect', (message) => {
		if (message.author.id == msg.author.id) {
			if (message.content == msg.language.cancel) return misc.aborted(msg, [messageCollector, buttonsCollector]);
			let editing;
			Object.entries(msg.lan.edit).forEach(e => {e[1].trigger.forEach(trigger => {if (trigger.replace(/`/g, '') == message.content.toLowerCase()) editing = e;});});
			if (editing) {
				gotEditing(editing);
				message.delete().catch(() => {});
				buttonsCollector.stop();
				messageCollector.stop();
			}
		}
	});
	async function gotEditing(e, answer) {
		const propertyName = e[0];
		msg.property = propertyName;
		if (r[msg.property] && r[msg.property][0] && Array.isArray(r[msg.property][0])) r[msg.property] = r[msg.property][0];
		const editing = e[1];
		const embed = new Discord.MessageEmbed()
			.setAuthor(
				msg.client.ch.stp(msg.lanSettings.authorEdit, {type: msg.lan.type}), 
				msg.client.constants.standard.image,
				msg.client.constants.standard.invite
			)
			.setColor(msg.client.constants.commands.settings.color);
		if (editing.name) embed.setDescription(`${editing.name.replace('[{{trigger}}] ', '')}`);
		if (editing.answers) embed.addField(msg.lanSettings.valid, editing.answers);
		if (editing.recommended) embed.addField('\u200b', editing.recommended);
		const settings = msg.client.constants.commands.settings.edit[msg.file.name][propertyName];
		const type = settings == 'boolean' ? 'button' : settings == 'number' || settings == 'channel' || settings == 'channels' || settings == 'role' || settings == 'roles' ? 'select' : 'string';
		let answered = []; let fail = [];
		if (type == 'button') {
			if (settings == 'boolean') {
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
			}
			const buttonsCollector = msg.m.createMessageComponentCollector({time: 60000});
			const messageCollector = msg.channel.createMessageCollector({time: 60000});
			let newSetting;
			buttonsCollector.on('collect', (buttonClick) => {
				if (buttonClick.user.id == msg.author.id) {
					buttonsCollector.stop();
					messageCollector.stop();
					if (buttonClick.customId == 'true') newSetting = true;
					else if (buttonClick.customId == 'false') newSetting = false;
					else if (buttonClick.customId == 'back') {
						compatibilityType = undefined;
						msg.property = undefined;
						messageCollector.stop();
						buttonsCollector.stop();
						return edit(msg, buttonClick);
					}
					gotNewSettings(newSetting, null, buttonClick);
				} else msg.client.ch.notYours(buttonClick, msg);
			});
			buttonsCollector.on('end', (collected, reason) => {if (reason == 'time') {msg.client.ch.collectorEnd(msg);}});
			messageCollector.on('collect', (message) => {
				if (message.author.id == msg.author.id) {
					if (message.content == msg.language.cancel) return misc.aborted(msg, [messageCollector, buttonsCollector]);
					newSetting = message.content.toLowerCase() == msg.language.true.toLowerCase() ? true : message.content.toLowerCase() == msg.language.false.toLowerCase() ? false : null;
					if (newSetting == null) return misc.notValid(msg);
					message.delete().catch(() => {});
					buttonsCollector.stop();
					messageCollector.stop();
					gotNewSettings(newSetting);
				}
			});
		} else if (type == 'select') {
			if (settings == 'channels' || settings == 'roles' || settings == 'channel' || settings == 'role') {
				compatibilityType = settings.includes('s') ? settings : settings+'s';
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
					.setCustomId(msg.property)
					.addOptions(take)
					.setMinValues(1)
					.setMaxValues(settings.includes('s') ? take.length : 1)
					.setPlaceholder(msg.language.select[settings].select);
				const next = new Discord.MessageButton()
					.setCustomId('next')
					.setLabel(msg.language.next)
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
							let page = clickButton.message.embeds[0].description.split(/`+/)[1].split(/\/+/)[0];
							clickButton.customId == 'next' ? page++ : page--;
							const menu = new Discord.MessageSelectMenu()
								.setCustomId(msg.property)
								.addOptions(take)
								.setMinValues(1)
								.setMaxValues(settings.includes('s') ? take.length : 1)
								.setPlaceholder(msg.language.select[settings].select);
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
											if (r[msg.property] && r[msg.property].includes(id)) {
												const index = r[msg.property].indexOf(id);
												r[msg.property].splice(index, 1);
											} else if (r[msg.property] && r[msg.property].length > 0) r[msg.property].push(id);
											else r[msg.property] = [id];
										});
									} else r[msg.property] = answered;	
								}
							} else if (compatibilityType == 'number') {
								if (answered.length > 0) {
									if (Array.isArray(answered)) {
										answered.forEach(id => { 
											if (r[msg.property] && r[msg.property].includes(id)) {
												const index = r[msg.property].indexOf(id);
												r[msg.property].splice(index, 1);
											} else if (r[msg.property] && r[msg.property].length > 0) r[msg.property].push(id);
											else r[msg.property] = [id];
										});
									} else r[msg.property] = answered;	
								}
							}
							messageCollector.stop('finished');
							buttonsCollector.stop('finished');
							gotNewSettings(r[msg.property], null, clickButton);
						} else if (clickButton.customId == msg.property) {
							clickButton.values.forEach(val => {
								if (!answered.includes(val)) msg.guild[settings].cache.get(val) ? answered.push(msg.guild[settings].cache.get(val).id) : '';
								else answered.splice(answered.indexOf(val), 1);
							});
							let page = clickButton.message.embeds[0].description.split(/`+/)[1].split(/\/+/)[0];
							const menu = new Discord.MessageSelectMenu()
								.setCustomId(msg.property)
								.addOptions(take)
								.setMinValues(1)
								.setMaxValues(settings.includes('s') ? take.length : 1)
								.setPlaceholder(msg.language.select[settings].select);
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
								.setDescription(`${msg.language.select[settings].desc}\n${msg.language.page}: \`${page}/${Math.ceil(+options.length / 25)}\``)
								.addField(msg.language.selected, `${answered.map(c => settings == 'channels' ? `<#${c}>` : settings == 'roles' ? `<@&${c}>` : ` ${c}`)} `);
							const rows = msg.client.ch.buttonRower([[menu], [prev, next], [back, done]]);
							clickButton.update({embeds: [embed], components: rows}).catch(() => {});
						} else if (clickButton.customId == 'back') {
							compatibilityType = undefined;
							msg.property = undefined;
							messageCollector.stop();
							buttonsCollector.stop();
							return edit(msg, clickButton);
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
							if (result) answered = r[msg.property];
							else misc.notValid(msg);
						} else if (settings == 'roles' || settings == 'channels') {
							const args = message.content.split(/ +/);
							Promise.all(args.map(async raw => {
								const id = raw.replace(/\D+/g, '');
								const request = msg.guild[compatibilityType].cache.get(id);
								if ((!request || !request.id) && (!r[msg.property] || (r[msg.property] && !r[msg.property].includes(id)))) fail.push(`\`${raw}\` ${msg.lan.edit[msg.property].fail.no}`);
								else answered.push(id);
							}));
							if (answered.length > 0) {
								if (Array.isArray(answered)) {
									answered.forEach(id => { 
										if (r[msg.property] && r[msg.property].includes(id)) {
											const index = r[msg.property].indexOf(id);
											r[msg.property].splice(index, 1);
										} else if (r[msg.property] && r[msg.property].length > 0) r[msg.property].push(id);
										else r[msg.property] = [id];
									});
								} else r[msg.property] = answered;							
							}
							answered = r[msg.property];
						} else return misc.notValid(msg);
						buttonsCollector.stop('finished');
						messageCollector.stop('finished');
						gotNewSettings(answered, fail);
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
			} else if (settings == 'number') {
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
					.setMaxValues(settings.includes('s') ? take.length : 1)
					.setPlaceholder(msg.language.select[settings].select);
				const next = new Discord.MessageButton()
					.setCustomId('next')
					.setLabel(msg.language.next)
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
							let page = clickButton.message.embeds[0].description.split(/`+/)[1].split(/\/+/)[0];
							clickButton.customId == 'next' ? page++ : page--;
							const menu = new Discord.MessageSelectMenu()
								.setCustomId(msg.property)
								.addOptions(take)
								.setMinValues(1)
								.setMaxValues(settings.includes('s') ? take.length : 1)
								.setPlaceholder(msg.language.select[settings].select);
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
								.setDescription(`${msg.language.select[settings].desc}\n${msg.language.page}: \`${page}/${Math.ceil(+options.length / 25)}\``);
							if (answered.length > 0) embed.addField(msg.language.selected, `${answered} `);
							if (page >= Math.ceil(+options.length / 25)) next.setDisabled(true);
							else next.setDisabled(false);
							if (page > 1) prev.setDisabled(false);
							else prev.setDisabled(true);
							const rows = msg.client.ch.buttonRower([[menu], [prev, next], [back, done]]);
							clickButton.update({embeds: [embed], components: rows}).catch(() => {});
						} else if (clickButton.customId == 'done') {
							if (answered.length > 0) r[msg.property] = answered;
							messageCollector.stop('finished');
							buttonsCollector.stop('finished');
							gotNewSettings(r[msg.property], null, clickButton);
						} else if (clickButton.customId == msg.property) {
							let page = clickButton.message.embeds[0].description.split(/`+/)[1].split(/\/+/)[0];
							answered = clickButton.values[0];
							const menu = new Discord.MessageSelectMenu()
								.setCustomId(msg.property)
								.addOptions(take)
								.setMinValues(1)
								.setMaxValues(settings.includes('s') ? take.length : 1)
								.setPlaceholder(msg.language.select[settings].select);
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
								.setDescription(`${msg.language.select[settings].desc}\n${msg.language.page}: \`${page}/${Math.ceil(+options.length / 25)}\``)
								.addField(msg.language.selected, `${answered} `);
							const rows = msg.client.ch.buttonRower([[menu], [prev, next], [back, done]]);
							clickButton.update({embeds: [embed], components: rows}).catch(() => {});
						} else if (clickButton.customId == 'back') {
							compatibilityType = undefined;
							msg.property = undefined;
							messageCollector.stop();
							buttonsCollector.stop();
							return edit(msg, clickButton);
						}
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
									if (r[msg.property] && r[msg.property].includes(id)) {
										const index = r[msg.property].indexOf(id);
										r[msg.property].splice(index, 1);
									} else if (r[msg.property] && r[msg.property].length > 0) r[msg.property].push(id);
									else r[msg.property] = [id];
								});
							} else r[msg.property] = answered;	
						}
						messageCollector.stop();
						buttonsCollector.stop();
						gotNewSettings(r[msg.property], fail);
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
			}
		}  else if (type == 'string') {
			if (settings == 'users') {
				const embed = new Discord.MessageEmbed()
					.setAuthor(
						msg.client.ch.stp(msg.lanSettings.author, {type: msg.lan.type}), 
						msg.client.constants.emotes.settingsLink, 
						msg.client.constants.standard.invite
					)
					.setDescription(`${msg.language.select[settings].select}`);
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
							if ((!request || !request.id) && (!r[msg.property] || (r[msg.property] && !r[msg.property].includes(id)))) fail.push(`\`${raw}\` ${msg.lan.edit[msg.property].fail.no}`);
							else answered.push(id);
						}));
						message.delete().catch(() => {});
						if (answered.length > 0) {
							if (Array.isArray(answered)) {
								answered.forEach(id => { 
									if (r[msg.property] && r[msg.property].includes(id)) {
										const index = r[msg.property].indexOf(id);
										r[msg.property].splice(index, 1);
									} else if (r[msg.property] && r[msg.property].length > 0) r[msg.property].push(id);
									else r[msg.property] = [id];
								});
							} else r[msg.property] = answered;	
						}
						messageCollector.stop();
						buttonsCollector.stop();
						gotNewSettings(r[msg.property], fail);
					}
				});
				buttonsCollector.on('collect', (clickButton) => {
					if (clickButton.user.id == msg.author.id) {
						if (clickButton.customId == 'back') {
							buttonsCollector.stop();
							messageCollector.stop();
							return edit(msg, clickButton);
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
						msg.m.edit({embeds: [embed]}).catch(() => {});
					}
				});
			} else if (settings == 'string') {
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
						const answer = message.content.toLowerCase().split(/#+/);
						if (answer.length > 0) {
							answer.forEach(word => {
								if (word.endsWith(' ')) word = word.slice(0, word.length-1);
								if (word.startsWith(' ')) word = word.slice(1, word.length);
								if (Array.isArray(answer)) {
									if (r[msg.property] && r[msg.property].includes(word)) {
										const index = r[msg.property].indexOf(word);
										r[msg.property].splice(index, 1);
									} else if (r[msg.property] && r[msg.property].length > 0) r[msg.property].push(word);
									else r[msg.property] = [word];
								} else r[msg.property] = word;		
							});
							gotNewSettings(r[msg.property]);
						}
					}
				});
				buttonsCollector.on('collect', (clickButton) => {
					if (clickButton.user.id == msg.author.id) {
						if (clickButton.customId == 'back') {
							buttonsCollector.stop();
							messageCollector.stop();
							return edit(msg, clickButton);
						}
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
		}
	}
	async function gotNewSettings(answered, fail, answer) {
		let oldSettings;
		let oldRow;
		const oldRes = await msg.client.ch.query(`SELECT * FROM ${msg.client.constants.commands.settings.tablenames[msg.file.name]} WHERE guildid = $1;`, [msg.guild.id]);
		if (oldRes && oldRes.rowCount > 0) {
			oldSettings = oldRes.rows[0][msg.property]; 
			oldRow = oldRes.rows[0];
		}
		const embed = new Discord.MessageEmbed()
			.setAuthor(
				msg.client.ch.stp(msg.lanSettings.authorEdit, {type: msg.lan.type}), 
				msg.client.constants.standard.image, msg.client.constants.standard.invite
			)
			.setColor(msg.client.constants.commands.settings.color)
			.setDescription(msg.client.ch.stp(msg.lanSettings.done, {loading: msg.client.constants.emotes.loading}));
		if (Array.isArray(oldSettings) && oldSettings.length > 0) embed.addField(msg.lanSettings.oldValue, `${oldSettings.map(f => compatibilityType == 'channels' ? ` <#${f}>` : compatibilityType == 'roles' ? ` <@&${f}>` : compatibilityType == 'users' ? ` <@${f}>` : ` ${f}`)}`);
		else if (oldSettings !== null && oldSettings !== undefined) embed.addField(msg.lanSettings.oldValue, `${oldSettings}`);
		else embed.addField(msg.lanSettings.oldValue, msg.language.none);
		if (Array.isArray(answered) && answered.length > 0) embed.addField(msg.lanSettings.newValue, `${answered.map(f => compatibilityType == 'channels' ? ` <#${f}>` : compatibilityType == 'roles' ? ` <@&${f}>` : compatibilityType == 'users' ? ` <@${f}>` : ` ${f}`)}`);
		else if (answered !== null && answered !== undefined) embed.addField(msg.lanSettings.newValue, `${Array.isArray(answered) ? msg.language.none : answered}`);
		else embed.addField(msg.lanSettings.newValue, msg.language.none);		
		if (fail && fail.length > 0) {
			if (Array.isArray(fail)) embed.addField(msg.language.error, `${fail.map(f => ` ${f}`)}`);
			else embed.addField(msg.language.error, fail);
		}
		if (answer) answer.update({embeds: [embed], components: []}).catch(() => {});
		else msg.m.edit({embeds: [embed], components: []}).catch(() => {});
		r[msg.property] = answered;
		if (r[msg.property] !== undefined && r[msg.property] !== null) {
			if (Array.isArray(r[msg.property])) {
				if (r[msg.property].length > 0) await msg.client.ch.query(`UPDATE ${msg.client.constants.commands.settings.tablenames[msg.file.name]} SET ${msg.property} = $1 WHERE guildid = $2;`, [r[msg.property], msg.guild.id]); 
				else await msg.client.ch.query(`UPDATE ${msg.client.constants.commands.settings.tablenames[msg.file.name]} SET ${msg.property} = $1 WHERE guildid = $2;`, [null, msg.guild.id]); 
			} else await msg.client.ch.query(`UPDATE ${msg.client.constants.commands.settings.tablenames[msg.file.name]} SET ${msg.property} = $1 WHERE guildid = $2;`, [r[msg.property], msg.guild.id]); 
			setTimeout(() => {edit(msg, null, file);}, 3000);
		}
		if (oldSettings && (answered !== undefined && answered !== null) || (answered !== undefined && answered !== null && answered.length > 0 && Array.isArray(answered))) misc.log(oldRow, msg);
		else if ((answered !== undefined && answered !== null) || (answered.length > 0 && Array.isArray(answered))) misc.log(oldRow, msg);
		else if (oldSettings) misc.log(oldRow, msg);
	}
}
