module.exports = {
	async execute(member, user) {
		const res = await user.client.ch.query('SELECT pendingrole FROM verification WHERE guildid = $1 AND active = $2;', [member.guild.id, true]);
		if (res && res.rowCount > 0) {
			member.roles.add(res.rows[0].pendingrole).catch(() => {});
			const msg = new Object; msg.r = res.rows[0], msg.lan = msg.language.verification;
			const DM = await user.createDM().catch(() => {});
			if (DM && DM.id) {
				msg.DM = DM, msg.r = res.rows[0];
				this.startProcess(msg);
			} else return msg.client.ch.reply(msg, msg.lan.openDMs);
			if (res.rows[0].selfstart) user.client.commands.get('verify').startProcess(msg);
		}
	}
};