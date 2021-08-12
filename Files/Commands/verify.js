const Discord = require('discord.js');
const { CaptchaGenerator } = require('captcha-canvas');
const fs = require('fs'); 

module.exports = {
	name: 'verify',
	perm: null,
	dm: true,
	takesFirstArg: false,
	category: 'Automation',
	description: 'Verify on a Server',
	usage: ['verify'],
	aliases: [],
	async exe(msg) {
		msg.lan = msg.language.verification;
		const res = await msg.client.ch.query('SELECT * FROM verification WHERE guildid = $1 && active = $2;', [msg.guild.id, true]);
		if (res && res.rowCount > 0) {
			const r = res.rows[0];
			if (r.startchannel !== msg.channel.id) return;
			if (r.pendingrole && !msg.member.roles.cache.has(r.pendingrole)) return;
			if (r.logchannel) msg.logchannel = msg.guild.channels.cache.get(r.logchannel);
			if (msg.logchannel) {
				const log = new Discord.MessageEmbed()
					.setDescription(msg.client.ch.stp(msg.lan.log.start, {user: msg.author}))
					.setAuthor(msg.author.tag, msg.client.ch.displayAvatarURL(msg.author))
					.setTimestamp()
					.setColor();
				msg.client.ch.send(msg.logchannel, {embeds: [log]});
			}
			msg.delete().catch(() => {});
			if (!msg.member.roles.cache.has(r.finishedrole)) {
				const DM = await msg.author.createDM().catch(() => {});
				if (DM && DM.id) {
					msg.DM = DM, msg.r = r;
					this.startProcess(msg);
				} else return msg.client.ch.reply(msg, msg.lan.openDMs);
			} else return msg.client.ch.reply(msg, msg.lan.alreadyVerified);
		}
	},
	async startProcess(msg, answer) {
		const file = await this.generateImage(), lan = msg.lan, r = msg.r;
		const embed = new Discord.MessageEmbed()
			.setThumbnail(`attachment://${file.now}`)
			.setTitle(lan.author.name, msg.client.constants.standard.image, msg.client.constants.standard.invite)
			.setDescription(r.greetdesc ? msg.client.ch.stp(r.greetdesc, {user: msg.author}) : msg.client.ch.stp(lan.description, {guild: msg.guild}))
			.addField(msg.language.hint, lan.hintmsg)
			.addField(lan.field, '\u200b')
			.setColor(msg.client.constants.standard.color)
		const regenerate = new Discord.MessageButton()
			.setCustomId('regenerate')
			.setLabel(lan.regenerate)
			.setStyle('SECONDARY');        
		if (answer) answer.update({embeds: [embed], components: msg.client.ch.buttonRower(regenerate), files: [file.path]}).catch(() => {});
		else if (msg.m) msg.m.edit({embeds: [embed], components: msg.client.ch.buttonRower(regenerate), files: [file.path]}).catch(() => {});
		else msg.m = await msg.client.ch.send(msg.DM, {embeds: [embed], components: msg.client.client.buttonRower(regenerate), files: [file.path]});
		const buttonsCollector = msg.m.createMessageComponentCollector({time: 120000});
		const messageCollector = msg.channel.createMessageCollector({time: 120000});
		buttonsCollector.on('collect', (clickButton) => {
			if (clickButton.customId == 'regenerate') {
				buttonsCollector.stop();
				messageCollector.stop();
				return this.startProcess(msg, clickButton);
			}
		});
		messageCollector.on('collect', (message) => {
			if (message.content.toLowerCase() == file.captcha.text.toLowerCase()) {
				buttonsCollector.stop();
				messageCollector.stop();
				return this.finished(msg);
			} else {
				buttonsCollector.stop();
				messageCollector.stop();
				message.delete().catch(() => {});
				msg.client.ch.send(msg.DM, {content: msg.client.ch.stp(msg.lan.wrongInput, {solution: file.captcha.text})});
				return this.startProcess(msg);
			}
		});
		buttonsCollector.on('end', (collected, reason) => {
			if (reason == 'time') {
				buttonsCollector.stop();
				messageCollector.stop();
				return this.startProcess(msg);
			}
		});
	},
	async generateImage() {
		const captcha = new CaptchaGenerator({height: 200, width: 600}); 
		captcha.text;
		const buffer = await captcha.generate();
		const now = Date.now();
		const path = `./Files/Downloads/Captchas/${now}.png`;
		fs.writeFileSync(path, buffer);
		const file = new Object;
		file.path = path, file.now = now, file.captcha = captcha;
		return file;
	},
	async finished(msg) {
		if (msg.logchannel) {
			const log = new Discord.MessageEmbed()
				.setDescription(msg.client.ch.stp(msg.lan.log.end, {user: msg.author}))
				.setAuthor(msg.author.tag, msg.client.ch.displayAvatarURL(msg.author))
				.setTimestamp()
				.setColor();
			msg.client.ch.send(msg.logchannel, {embeds: [log]});
		}
		const embed = new Discord.MessageEmbed()
			.setTitle(msg.lan.author.name, msg.client.constants.standard.image, msg.client.constants.standard.invite)
			.setDescription(msg.r.finishdesc ? msg.client.ch.stp(msg.r.finishdesc, {user: msg.author}) : msg.client.ch.stp(msg.lan.description, {guild: msg.guild}))
			.setColor(msg.client.constants.standard.color)
			.setFooter(msg.lan.footer);
		msg.client.ch.send(msg.DM, {embeds: [embed]});
		msg.member.roles.add(msg.r.finishedrole).catch(() => {});
	}
};