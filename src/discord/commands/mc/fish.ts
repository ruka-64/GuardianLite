import { SlashCommandBuilder } from 'discord.js';
import type { ChatInputCommandInteraction } from 'discord.js';
import { client } from '../../index.js';
import { autoFisher, bot } from '../../../bot/index.js';

export const data = new SlashCommandBuilder()
  .setName('fish')
  .setDescription('toggle autofish');

export async function execute(interaction: ChatInputCommandInteraction) {
  if (autoFisher.running) {
    autoFisher.stopFishing();
    await interaction.reply('Stopped');
  } else {
    autoFisher.startFishing();
    await interaction.reply('Started');
  }
  return;
}
