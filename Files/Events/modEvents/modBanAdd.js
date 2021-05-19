const Discord = require('discord.js');

module.exports = {
	async execute(executor, target, reason, msg) {
		const language = await msg.client.ch.languageSelector(msg.guild);
		const lan = language.mod.banAdd;
		const con = msg.client.constants.mod.banAdd;
		const em = new Discord.MessageEmbed()
			.setColor(con.color)
			.setDescription(msg.client.constants.emotes.loading, lan.loading);
		const emMsg = await msg.client.ch.reply(msg, em);
		const member = await msg.client.ch.member(msg.guild, target);
		const exec = await msg.client.ch.member(msg.guild, executor);
		if (exec?.roles.highest.rawPosition < member?.roles.highest.rawPosition || exec?.roles.highest.rawPosition == member?.roles.highest.rawPosition) {
			em.setDescription(msg.client.constants.emotes.cross, lan.exeNoPerms);
			emMsg?.edit(em);
			return false;
		}
		if (!member?.bannable) {
			em.setDescription(msg.client.constants.emotes.cross, lan.permissionError);
			emMsg?.edit(em);
			return false;
		}
		else {
			const banned = await msg.guild.bans.fetch(target).catch(() => {});
			if (banned) {
				em.setDescription(msg.client.constants.emotes.cross, lan.alreadyBanned);
				emMsg?.edit(em);
				return false;
			}
			const dmChannel = await target.createDM().catch(() => {});
			const DMembed = new Discord.MessageEmbed()
				.setDescription(`${language.reason}: \`\`\`${reason}\`\`\``)
				.setColor(con.color)
				.setTimestamp()
				.setAuthor(lan.dm.author, lan.author.image, msg.client.ch.stp(lan.author.link), {guild: msg.guild});
			const m = await msg.client.ch.send(dmChannel, DMembed);
			let err;
			const ban = await member.ban({reason: reason, days: 1}).catch((e) => {err = e;});
			if (ban) {
				const res = await msg.client.ch.query(`SELECT * FROM logchannels WHERE guildid = '${msg.guild.id}';`);
				let logchannel;
				if (res && res.rowCount > 0) logchannel = msg.client.channels.cache.get(res.rows[0].guildEvents);
				const embed = new Discord.MessageEmbed()
					.setColor(con.color)
					.setAuthor(lan.author, msg.client.ch.displayAvatarURL(executor), msg.client.constants.standard.invite)
					.setDescription(msg.client.ch.stp(lan.description, {user: executor, target: target}))
					.setTimestamp()
					.setThumbnail(msg.client.ch.displayAvatarURL(target))
					.addField(language.reason, `\`\`\`${reason}\`\`\``)
					.setFooter(msg.client.ch.stp(lan.footer, {user: executor, target: target}));
				if (logchannel) msg.client.ch.send(logchannel, embed);
			} else {
				m?.delete().catch(()  => {});
				em.setDescription(msg.client.constants.emotes.cross, lan.error+` \`\`\`${err}\`\`\``);
				emMsg?.edit(em);
				return false;
			}
		}
		em.setDescription(msg.client.constants.emotes.tick, lan.success);
		emMsg?.edit(em);
		return true;
	}
};