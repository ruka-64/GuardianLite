import assert from 'assert';
import { client } from '..';
import { config } from '../../../config';
import { EmbedBuilder, MessageFlags } from 'discord.js';
import { logger } from 'comodern';

const getChannel = () => {
  const guild = client.guilds.cache.get(config.discord.guild);
  const channel = guild?.channels.cache.get(config.discord.channel);
  assert(channel?.isTextBased());
  return channel;
};

export async function SendText(str: string, isSilent = false) {
  const channel = getChannel();
  channel.send({
    content: str,
    flags: isSilent ? MessageFlags.SuppressNotifications : undefined,
  });
}

export async function SendAlert(mcid: string, uuid?: string) {
  logger.log(`Detected: ${mcid}`);
  const channel = getChannel();
  const embed = new EmbedBuilder()
    .setTitle('侵入者を "確認しました"')
    .addFields(
      {
        name: 'MCID',
        value: mcid,
        inline: true,
      },
      {
        name: 'UUID',
        value: uuid ?? '不明',
        inline: true,
      }
    )
    .setThumbnail(uuid ? `https://api.creepernation.net/avatar/${uuid}` : null)
    .setColor('Red')
    .setFooter({
      text: 'Guardian by ruka64',
    })
    .setTimestamp();

  await channel.send({ embeds: [embed] });
}
