import { SlashCommandBuilder } from 'discord.js';
import type { ChatInputCommandInteraction } from 'discord.js';
import { client } from '../../index.js';

export const data = new SlashCommandBuilder()
  .setName('ping')
  .setDescription('ping pong ping pong');

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.reply({
    content: `Pong! (${client.ws.ping}ms)`,
    ephemeral: false,
    allowedMentions: { parse: [] },
  });
}
