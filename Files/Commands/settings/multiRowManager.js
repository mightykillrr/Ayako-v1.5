const Discord = require('discord.js');

module.exports = {
	exe(msg, answer) {
		edit(msg, answer);
	},
	async display(msg) {
        let r;
        const res = await msg.client.ch.query(`SELECT * FROM ${msg.client.constants.commands.settings.tablenames[msg.file.name]} WHERE guildid = $1;`, [msg.guild.id]);
        if (res && res.rowCount > 0) r = res.rows;
        if (msg.file.perm && !msg.member.permissions.has(new Discord.Permissions(msg.file.perm))) return msg.client.ch.reply(msg, msg.language.commands.commandHandler.missingPermissions);
        msg.lanSettings = msg.language.commands.settings;

	},
	edit() {

	}
};


async function manyRowsManager(msg, answer) {

	const editEmbed = typeof(msg.file.editEmbed) == 'function' ? msg.file.editEmbed(msg, r) : noEmbed(msg);
	editEmbed.setDescription(`${msg.client.ch.stp(msg.lanSettings.howToEdit2, {prefix: msg.client.constants.standard.prefix, type: file.name})}\n\n${editEmbed.description ? editEmbed.description : ''}`);
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
	if (typeof(file.buttons) == 'function') buttons = file.buttons(msg, r);
	else for (i = 0, j = rows.length; i < j; i += 5) {buttons.push(rows.slice(i, i+5));}
	const actionRows = msg.client.ch.buttonRower(buttons);
	if (answer) answer.update({embeds: [editEmbed], components: actionRows}).catch(() => {});
	else if (msg.m) msg.m.edit({embeds: [editEmbed], components: actionRows}).catch(() => {});
	else msg.m = await msg.client.ch.reply(msg, {embeds: [editEmbed], components: actionRows});


	for (let i = 0; i < Object.entries(msg.client.constants.commands.settings.edit[msg.file.name]).length; i++) {
		const currentlyEditing = Object.entries(msg.client.constants.commands.settings.edit[msg.file.name])[i];
		const currentName = currentlyEditing[0], currentType = currentlyEditing[1];
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

		if (currentType == 'command') {
			
		} 
	}
}
