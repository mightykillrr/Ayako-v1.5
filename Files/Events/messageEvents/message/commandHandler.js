const Discord = require('discord.js');
const { statcord } = require('../../../BaseClient/Statcord');
const auth = require('../../../BaseClient/auth.json');
const cooldowns = new Discord.Collection();

module.exports = {
	async execute(msg) {
		console.log(0);
		const Constants = msg.client.constants;
		const ch = msg.client.ch;
		let prefix;
		let prefixStandard = Constants.standard.prefix;
		let prefixCustom;
		if (msg.channel.type !== 'dm') {
			const res = await ch.query(`SELECT * FROM prefix WHERE guildid = '${msg.guild.id}';`);
			if (res && res.rowCount > 0) prefixCustom = res.rows[0].prefix;
		}
		if (msg.content.toLowerCase().startsWith(prefixStandard)) prefix = prefixStandard;
		else if (msg.content.toLowerCase().startsWith(prefixCustom)) prefix = prefixCustom;
		else return;
		if (!prefix) return;
		const args = msg.content.slice(prefix.length).split(/ +/);
		const commandName = args.shift().toLowerCase();
		const command = msg.client.commands.get(commandName) || msg.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
		if (!command) return;
		msg.args = args;
		msg.command = command;
		if (msg.channel.type == 'dm') this.DMcommand(command, args, msg);
		else this.cooldownCheck(msg);
	},
	async cooldownCheck(msg) {
		console.log(1);
		if (msg.author.id == auth.ownerID) {
			cooldowns.set(msg.command.name, new Discord.Collection());
			this.categoryCheck(msg);
		} else {
			if (!cooldowns.has(msg.command.name)) cooldowns.set(msg.command.name, new Discord.Collection());
			const now = Date.now();
			let timestamps = cooldowns.get(msg.command.name);
			let cooldownAmount = (msg.command.cooldown || 0);
			const res = await msg.client.ch.query(`SELECT * FROM cooldowns WHERE channelid = '${msg.channel.id}' AND command = '${msg.command.name}';`);
			if (res && res.rowCount > 0) cooldownAmount = res.rows[0].cooldown;
			if (timestamps.has(msg.channel.id)) {
				const expirationTime = +timestamps.get(msg.channel.id) + +cooldownAmount;
				if (now < expirationTime) {
					const timeLeft = (expirationTime - now) / 1000;
					msg.language = await msg.client.ch.languageSelector(msg.guild);
					const m = await msg.client.ch.reply(msg, msg.client.ch.stp(msg.language.commands.commandHandler.PleaseWait, {time: timeLeft.toFixed(1)}), {allowedMentions: {repliedUser: true}});
					setTimeout(() => {
						m.delete().catch(() => {});
						msg.delete().catch(() => {});
					}, 5000);
				}
			}
			timestamps.set(msg.channel.id, now);
			this.categoryCheck(msg);
		}
	},
	async categoryCheck(msg) {
		console.log(2);
		let category = msg.command.category;
		if (category) {
			category = category.toLowerCase();
			const res = await msg.client.ch.query(`SELECT * FROM disabled WHERE guildid = '${msg.guild.id}';`);
			if (res && res.rowCount > 0) {
				if (category == 'moderation (advanced)') category = 'moderationAdvanced';
				if (res.rows[0][category] == false) return msg.client.ch.reply(msg, msg.client.ch.stp(msg.language.commands.commandHandler.CategoryDisabled, {category: msg.command.category}));
			}
		}
		this.thisGuildOnly(msg);
	},
	async thisGuildOnly(msg) {
		console.log(3);
		if (msg.command.thisGuildOnly && !msg.command.thisGuildOnly.includes(msg.guild.id)) return;
		this.commandCheck(msg);
	},
	async commandCheck(msg) {
		const res = await msg.client.ch.query(`SELECT * FROM disabledcommands WHERE guildid = '${msg.guild.id}';`);
		if (res && res.rowCount > 0) {
			if (res.rows[0].disabled.includes(msg.command.name.toLowerCase())); return msg.client.ch.reply(msg, msg.client.ch.stp(msg.language.commands.commandHandler.CommandDisabled, {name: msg.command.name}));
		} 
		this.permissionCheck(msg);
	},
	async permissionCheck(msg) {
		console.log(4);
		if (msg.command.perm == 0) {
			if (msg.author.id !== auth.ownerID) return msg.client.ch.reply(msg, msg.language.commands.commandHandler.creatorOnly);
			else return this.editCheck(msg);
		} else if (msg.command.perm == 1) {
			if (msg.guild.ownerID !== msg.author.id) return msg.client.ch.reply(msg, msg.language.commands.commandHandler.ownerOnly);
			else return this.editCheck(msg);
		} else if (typeof msg.command.perm == 'bigint') {
			const member = await msg.client.ch.member(msg.guild, msg.author);
			const names = ['ban', 'unban', 'mute', 'unmute', 'tempmute', 'kick', 'clear', 'announce', 'pardon', 'warn', 'edit', 'takerole', 'giverole'];
			if (names.includes(msg.command.name)) {
				const res = await msg.client.ch.query(`SELECT * FROM modroles WHERE guildid = '${msg.guild.id}';`);
				if (res && res.rowCount > 0) {
					const r = res.rows[0];
					if (r.adminrole) { 
						const role = msg.guild.roles.cache.find(role => role.id === r.adminrole);
						if (role && role.id && member.roles.cache.has(role.id)) {
							const res2 = await msg.client.ch.query(`SELECT * FROM modperms WHERE guildid = '${msg.guild.id}' AND type = 'admin' AND permission = '${msg.command.name}';`);
							if (res2 && res2.rowCount > 0) {
								const r2 = res2.rows[0];
								if (r2.granted) return this.editCheck(msg);
								else return msg.client.ch.reply(msg, msg.language.commands.commandHandler.missingPermissions);
							}
						}
					}
					if (r.modrole) { 
						const role = msg.guild.roles.cache.find(role => role.id === r.modrole);
						if (role && role.id && member.roles.cache.has(role.id)) {
							const res2 = await msg.client.ch.query(`SELECT * FROM modperms WHERE guildid = '${msg.guild.id}' AND type = 'admin' AND permission = '${msg.command.name}';`);
							if (res2 && res2.rowCount > 0) {
								const r2 = res2.rows[0];
								if (r2.granted) return this.editCheck(msg);
								else return msg.client.ch.reply(msg, msg.language.commands.commandHandler.missingPermissions);
							}
						}
					}
					if (r.trialmodrole) { 
						const role = msg.guild.roles.cache.find(role => role.id === r.trialmodrole);
						if (role && role.id && member.roles.cache.has(role.id)) {
							const res2 = await msg.client.ch.query(`SELECT * FROM modperms WHERE guildid = '${msg.guild.id}' AND type = 'admin' AND permission = '${msg.command.name}';`);
							if (res2 && res2.rowCount > 0) {
								const r2 = res2.rows[0];
								if (r2.granted) return this.editCheck(msg);
								else return msg.client.ch.reply(msg, msg.language.commands.commandHandler.missingPermissions);
							}
						}
					}
					if (!member.permissions.has(msg.command.perm)) return msg.client.ch.reply(msg, msg.language.commands.commandHandler.missingPermissions);
				} else if (!member.permissions.has(msg.command.perm)) return msg.client.ch.reply(msg, msg.language.commands.commandHandler.missingPermissions);
			} else if (!member.permissions.has(msg.command.perm)) return msg.client.ch.reply(msg, msg.language.commands.commandHandler.missingPermissions);
			this.editCheck(msg);
		}
	},
	async editCheck(msg) {
		console.log(5);
		if (msg.editedTimestamp) {
			if (msg.command.category == 'Moderation') this.editVerifier(msg);
			else this.commandExe(msg);
		} else this.commandExe(msg);
	},
	async editVerifier(msg) {
		console.log(6);
		const m = await msg.client.ch.reply(msg, msg.client.language.commands.commandHandler.verifyMessgae);
		m.react(msg.constants.emotes.tickID).catch(() => {});
		m.react(msg.constants.emotes.crossID).catch(() => {});
		msg.channel.awaitMessages(m => m.author.id == msg.author.id,
			{max: 1, time: 30000}).then(rawcollected => {
			if (!rawcollected.first()) return;
			if (rawcollected.first().content.toLowerCase() == 'y' || rawcollected.first().content.toLowerCase() == 'yes' || rawcollected.first().content.toLowerCase() == 'proceed' || rawcollected.first().content.toLowerCase() == 'continue' || rawcollected.first().content.toLowerCase() == 'go') {
				if (m.deleted == false) {
					rawcollected.first().delete().catch(() => {});
					m.delete().catch(() => {});
					this.commandExe(msg);
				}
			} else {
				m.delete().catch(() => {});
				return;
			}
		}).catch(() => {m.delete().catch(() => {});});
		m.awaitReactions((reaction, user) => (reaction.emoji.id === msg.constants.emotes.tickID || reaction.emoji.id === msg.constants.emotes.crossID) && user.id === msg.author.id,
			{max: 1, time: 60000}).then(rawcollected => {
			if (!rawcollected.first()) return;
			if (rawcollected.first()._emoji.id == msg.constants.emotes.tickID) {
				m.delete().catch(() => {});
				this.commandExe(msg);
			} else {
				m.delete().catch(() => {});
				return;
			}
		}).catch(() => {m.delete().catch(() => {});});
	},
	async DMcommand(msg) {
		console.log(7);
		if (msg.command.dm) this.commandExe(msg);
		else msg.client.ch.reply(msg, msg.language.commands.commandHandler.GuildOnly);
	},
	async commandExe(msg) {
		console.log(8);
		if (msg.channel.type !== 'dm') {
			const res = await msg.client.ch.query(`SELECT * FROM logchannel WHERE guildid = '${msg.guild.id}';`);
			if (res && res.rowCount > 0) msg.logchannel = msg.client.channels.cache.get(res.rows[0].modlogs);
		}
		if (msg.author.id == msg.client.user.id) msg.delete();
		try {
			//statcord.postCommand(msg.command.name, msg.author.id).catch(() => {});
			msg.command.exe(msg);
		} catch(e)  {
			const channel = msg.client.channels.cache.get(msg.client.constants.errorchannel);
			const embed = new Discord.MessageEmbed()
				.setAuthor('Command Error', msg.client.Constants.emotes.crossLink, msg.url)
				.setTimestamp()
				.setDescription(`\`\`\`${e.stack}\`\`\``)
				.addField('Message', `\`\`\`${msg}\`\`\``)
				.addField('Guild', `${msg.guild?.name} | ${msg.guild?.id}`)
				.addField('Channel', `${msg.channel?.name} | ${msg.channel?.id}`)
				.addField('Message Link', msg.url)
				.setColor('ff0000');
			if (channel) msg.client.ch.send(msg.channel, embed);
		}
	}
};        