import { Client, IntentsBitField } from 'discord.js';
import { config } from './config';

const client = new Client({
  intents: [IntentsBitField.Flags.Guilds],
});

client.on('ready', async (client) => {
  await client.application.commands.set([], config.discord.guild);
  process.exit(0);
});

client.login(config.discord.token);
