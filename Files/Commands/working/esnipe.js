const Discord = require('discord.js');
const { pool } = require('../files/Database.js');
module.exports = {
	name: 'esnipe',
	Category: 'Fun',
	description: 'Snipe the last edited message of a channel',
	usage: 'h!esnipe',
	/* eslint-disable */
	async execute(msg, args, client, prefix, command, logchannelid, permLevel, errorchannelID ) {
		/* eslint-enable */
		if (msg.guild.id == '108176345204264960') return;
		if (msg.channel.id == '741756746636198090') return;
		const res = await pool.query(`SELECT * FROM esnipe WHERE channelid = '${msg.channel.id}'`);
		if (res !== undefined) {
			if (res.rowCount !== 0) {
				if (res.rows[0].before && res.rows[0].after) {
					const user = client.users.cache.get(res.rows[0].userid);
					const embed = new Discord.MessageEmbed()
						.addField('Before:', `${res.rows[0].before}`)
						.addField('After:', `${res.rows[0].after}`)
						.setColor('b0ff00');
					if (user && user.id) {
						embed.setAuthor(user.username, user.displayAvatarURL(), 'https://discord.com/api/oauth2/authorize?client_id=650691698409734151&permissions=1576396919&scope=bot');
					}
					pool.query(`
                    UPDATE esnipe SET before = null WHERE channelid = '${msg.channel.id}';
                    UPDATE esnipe SET after = null WHERE channelid = '${msg.channel.id}'
                    `);
					const m = await msg.channel.send(embed);
					m.react('834326440761229363').catch(() => {});
					m.awaitReactions((reaction, ruser) => reaction.emoji.id === '834326440761229363' && ruser.id === user.id && ruser.id !== client.user.id,
						{max: 1, time: 60000}).then(rawcollected => {
						console.log(rawcollected.first());
						if (!rawcollected.first()) return;
						m.react('762473213526933514').catch(() => {});
						setTimeout(() => {
							m.delete().catch(() => {});
						}, 3000);
					}).catch(() => {});
				} else {
					msg.reply('There is nothing to esnipe');
				}
			} else {
				msg.reply('There is nothing to esnipe');
			}
		} else {
			msg.reply('There is nothing to esnipe');
		}
	}
};