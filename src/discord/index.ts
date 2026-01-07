import { logger } from 'comodern';
import {
  ActivityType,
  Client,
  Collection,
  CommandInteraction,
  IntentsBitField,
  type ApplicationCommandDataResolvable,
} from 'discord.js';
import { config } from '../../config';
import './types/Client.d.ts';
import { join } from 'path';
import { readdirSync } from 'fs';

export const client = new Client({
  intents: [IntentsBitField.Flags.Guilds],
});

const commands: ApplicationCommandDataResolvable[] = [];

client.commands = new Collection<
  string,
  (interaction: CommandInteraction) => Promise<void>
>();

const c_dirPath = join(import.meta.dirname, 'commands');
const c_subPath = readdirSync(c_dirPath);

for (const dir of c_subPath) {
  const dirPath = join(c_dirPath, dir);
  const files = readdirSync(dirPath).filter((file) => file.endsWith('.ts'));
  for (const file of files) {
    const filePath = join(dirPath, file);
    (async () => {
      const command = await import(filePath);
      if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
        client.commands.set(command.data.name, command.execute);
        logger.log(`[Loader] Loaded ${dir}/${command.data.name}`);
      } else {
        logger.error(
          `[Loader] The command at ${filePath} is missing a required "data" or "execute" property.`
        );
      }
    })();
  }
}

client.on('ready', async (client) => {
  await client.application.commands.set(commands, config.discord.guild);
  logger.log(`${client.user.displayName} is ready.`);
  client.user.setPresence({
    activities: [
      {
        name: 'NewShirakaba',
        type: ActivityType.Competing,
      },
    ],
  });
});

client.on('interactionCreate', async (interaction) => {
  if (interaction.isButton()) {
    //ボタン処理
    return;
  }

  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);
  if (!command) {
    logger.error(
      `[interaction] No command matching ${interaction.commandName} was found.`
    );
    return;
  }
  try {
    await command(interaction);
  } catch (e) {
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: '処理中にエラーが発生しました: ' + e,
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: '処理中にエラーが発生しました: ' + e,
        ephemeral: true,
      });
    }
  }
});

client.login(config.discord.token);

process.on('uncaughtException', (e) => logger.error(e));
