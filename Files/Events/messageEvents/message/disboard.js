module.exports = {
	async execute(msg) {
		if (msg.author.id !== '302050872383242240') return;
		if (!msg.embeds[0]) return;
		if (!msg.embeds[0].color) return;
		if (msg.embeds[0].color == '2406327' && msg.embeds[0].description?.includes('Bump done :thumbsup:')) {
			const res = await msg.client.ch.query(`SELECT * FROM disboard WHERE guildid = '${msg.guild.id}';`);
			if (res && res.rowCount > 0) {
				if (res.rows[0].enabled) {
					msg.react(msg.client.constants.emotes.tickID).catch(() => {});
				}
				msg.client.ch.query(`
                    UPDATE disboard SET lastbump = '${Date.now() + msg.client.ch.ms('120m')}' WHERE guildid = '${msg.guild.id}';
                    UPDATE disboard SET channelid = '${msg.channel.id}' WHERE guildid = '${msg.guild.id}';
                `);
			}
		}
	} 
};