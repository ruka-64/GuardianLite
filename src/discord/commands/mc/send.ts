import { SlashCommandBuilder } from 'discord.js';
import type { ChatInputCommandInteraction } from 'discord.js';
import { client } from '../../index.js';
import { bot } from '../../../bot/index.js';

export const data = new SlashCommandBuilder()
  .setName('send_chat')
  .setDescription('Just send')
  .addStringOption((opt) =>
    opt.setName('text').setDescription('Text').setRequired(true)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const str = interaction.options.getString('text');
  bot.chat(str!);
  await interaction.reply({
    content: `Successfully sent message: ${str}`,
    ephemeral: false,
    allowedMentions: { parse: [] },
  });
}
