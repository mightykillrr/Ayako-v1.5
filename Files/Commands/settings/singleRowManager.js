const Discord = require('discord.js');
const misc = require('./misc.js');
const setuper = require('./setup');

module.exports = {
	exe(msg, answer, file) {
		edit(msg, answer, file);
	},
	redirecter(msg, r, answer, origin, identifier) {
	console.log(2, origin)
		edit(msg, answer, msg.file, origin, r, identifier);
	}
};

async function edit(msg, answer, file, origin, r, identifier) {
	msg.lanSettings = msg.language.commands.settings;
	if (!msg.file) {file.name = msg.args[0].toLowerCase(); msg.file = file;}
	if (!origin) {
		const res = await msg.client.ch.query(`SELECT * FROM ${msg.client.constants.commands.settings.tablenames[msg.file.name]} WHERE guildid = $1;`, [msg.guild.id]);
		if (msg.file.setupRequired == false) return require('./multiRowManager').exe(msg, answer);
		else if (!res || res.rowCount == 0) return setuper.execute(msg);
		else r = res.rows[0];
	}
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
	const back = new Discord.MessageButton()
		.setLabel(msg.language.back)
		.setEmoji(msg.client.constants.emotes.back)
		.setCustomId('back')
		.setStyle('DANGER');
	if (origin) buttons.push(back);
	const actionRows = msg.client.ch.buttonRower(buttons);
	if (answer) answer.update({embeds: [editEmbed], components: actionRows}).catch((e) => {console.log(e);});
	else if (msg.m) msg.m.edit({embeds: [editEmbed], components: actionRows}).catch((e) => {console.log(e);});
	else msg.m = await msg.client.ch.reply(msg, {embeds: [editEmbed], components: actionRows});
	const buttonsCollector = msg.m.createMessageComponentCollector({time: 60000});
	const messageCollector = msg.channel.createMessageCollector({time: 60000});
	buttonsCollector.on('collect', (clickButton) => {
		if (clickButton.user.id == msg.author.id) {
			if (clickButton.customId == 'back') {
				buttonsCollector.stop();
				messageCollector.stop();
				require('./multiRowManager').edit(msg, clickButton, msg.file);
				return;
			}
			let editing;
			Object.entries(msg.lan.edit).forEach(e => {e[1].trigger.forEach(trigger => {if (trigger.replace(/`/g, '') == clickButton.customId) editing = e;});});
			if (editing) {
				require('./multiRowManager').redirect(msg, null, clickButton, 'srm', editing, identifier, origin);
				buttonsCollector.stop();
				messageCollector.stop();
			}
		} else msg.client.ch.notYours(clickButton, msg);
	});
	buttonsCollector.on('end', (collected, reason) => {if (reason == 'time') {msg.client.ch.collectorEnd(msg);}});
	messageCollector.on('collect', (message) => {
		if (message.author.id == msg.author.id) {
			if (message.content.toLowerCase() == msg.language.cancel) return misc.aborted(msg, [messageCollector, buttonsCollector]);
			if (message.content.toLowerCase() == msg.language.back.toLowerCase()) {
				buttonsCollector.stop();
				messageCollector.stop();
				require('./multiRowManager').edit(msg, null, msg.file);
				return;
			}
			let editing;
			Object.entries(msg.lan.edit).forEach(e => {e[1].trigger.forEach(trigger => {if (trigger.replace(/`/g, '') == message.content.toLowerCase()) editing = e;});});
			if (editing) {
				require('./multiRowManager').redirect(msg, null, null, 'srm', editing, identifier, origin);
				message.delete().catch(() => {});
				buttonsCollector.stop();
				messageCollector.stop();
			}
		}
	});
}
