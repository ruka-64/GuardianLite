import { createBot, type Bot } from 'mineflayer';
import { config } from '../../config';
import { logger } from 'comodern';
import { kv, wait } from '..';
import { SendAlert, SendText } from '../discord/utils/notifier';
import { loader as autoEat } from 'mineflayer-auto-eat';
import { InvCleaner, isInvFull } from './utils/inv';
import { Vec3 } from 'vec3';
import { autoFishModule } from './utils/autoFish';

export let isReady = false;
export let bot: Bot;

export const autoFisher = new autoFishModule(bot!);

export function mcbot(shouldInit: boolean = false) {
  const waitForTeleport = () => {
    return new Promise<true>((resolve) => {
      bot.on('forcedMove', () => resolve(true));
    });
  };
  //@ts-ignore
  bot = createBot({
    host: '127.0.0.1',
    port: 25569,
    auth: 'offline',
    version: '1.21.1',
    physicsEnabled: true,
  });

  logger.info(`My master is ${config.master.mcid}.`);

  bot.on('chat', (username, msg) => {
    logger.log(`<${username}> ${msg}`);
  });

  bot.once('spawn', async () => {
    bot.loadPlugin(autoEat);
    bot.autoEat.enableAuto();

    logger.log('Joined');
    await wait(500);
    bot.chat('/msg ruka64 hello');
    await bot.waitForTicks(20);
    logger.log('Moving to NeoSigen');
    bot.chat('/server NeoSigen');
    await waitForTeleport();
    logger.log('Moved to NeoSigen');
    await SendText(`Connected! (logged in as ${bot.username})`, true);
    if (shouldInit) {
      await bot.waitForChunksToLoad();
      bot.chat(`/tpa ${config.master.mcid}`);
      logger.log('awaiting your tpa request');
      await waitForTeleport();
      await bot.waitForChunksToLoad();
      bot.chat('/sethome botpos');
    } else {
      bot.chat('/home botpos');
    }
    logger.info(`${bot.username ?? 'Bot'} is ready!`);
    isReady = true;
  });

  bot.on('physicsTick', async () => {
    if (!isReady) return;
    const entity = bot.nearestEntity((e) => {
      return (
        e.type === 'player' &&
        e.position.distanceTo(bot.entity.position) < 64 &&
        e.displayName !== 'Armor Stand'
      );
    });
    //
    if (entity && entity.username) {
      if (await kv.get('rejoining')) return;
      if (config.mc.whitelist.includes(entity.username)) return;
      if (entity.username.includes('[ZNPC]')) {
        await kv.set('rejoining', true, 1000 * 30);
        logger.log('rejoining kv value:', await kv.get('rejoining'));
        await SendText('I transfered to lobby! Rejoining to NeoSigen...', true);
        await bot.waitForChunksToLoad();
        await bot.waitForTicks(10);
        bot.chat('/msg ruka64 reconnecting');
        bot.chat('/server NeoSigen');
        return;
      }
      const kvData = await kv.get(entity.username);
      if (kvData !== 0) {
        await kv.set(entity.username, 0, 1000 * 60 * 5);
        await SendAlert(entity.username, entity.uuid);
      }
    }
  });

  //TODO: Auto accepting tpa request
  bot.on('messagestr', async (msg) => {
    if (msg.includes('Unknown or incomplete command, see below for error')) {
      await SendText(
        'Failed to send command (unknown command), reconnecting',
        true
      );
      await bot.waitForChunksToLoad();
      bot.quit();
      process.exit(0);
    }
    if (msg.includes('[Spartan Notification]')) {
      if (!isReady) return;
      if (await kv.get('rejoining')) return;
      await kv.set('rejoining', true, 1000 * 30);
      logger.log('rejoining kv value:', await kv.get('rejoining'));
      await SendText('I transfered to lobby! Rejoining to NeoSigen...', true);
      await bot.waitForChunksToLoad();
      await bot.waitForTicks(10);
      bot.chat('/msg ruka64 reconnecting');
      bot.chat('/server NeoSigen');
    }
    if (msg.includes('You cannot pick up items for')) {
      if (await kv.get('rejoining')) {
        await SendText('Rejoined!', true);
        await kv.delete('rejoining');
      }
    }
    const tpa_regex = /(.+) has requested to teleport to you./;
    const tell_regex = /\[(.+) -> me\] (.+)/;
    if (msg.endsWith('has requested to teleport to you.')) {
      const match = msg.match(tpa_regex);
      if (match) {
        if (config.mc.whitelist.includes(match[1]!)) {
          logger.log(`Accepting ${match[1]}'s tpa request...`);
          bot.chat('/tpaccept');
        }
      }
    }
    if (msg.startsWith('[')) {
      const match = msg.match(tell_regex);
      if (match) {
        logger.log('Tell', msg);
        if (match[2] === 'invcleaner') {
          await InvCleaner();
          bot.chat(`/msg ${match[1]} Done.`);
          return;
        }
        if (match[2] === 'xp') {
          if (isInvFull()) {
            bot.chat(`/msg ${match[1]} My inv is full (try invcleaner)`);
            return;
          }
          await new Promise<string>((resolve) => {
            bot.chat('/b store max');
            bot.on('messagestr', (msg) => resolve(msg));
          });
          logger.log('Finding xp bottle...');
          const expId = bot.registry.itemsByName.experience_bottle!.id;
          if (bot.registry.itemsByName.experience_bottle) {
            const exp = bot.inventory.findInventoryItem(expId, null, false);
            if (exp) {
              logger.log(`Finding ${match[1]}...`);
              const player = bot.players[match[1]!];
              if (!player) {
                bot.chat(`/msg ${match[1]} I can't find you...`);
                return;
              }
              const e = {
                yaw: bot.entity.yaw,
                pitch: bot.entity.pitch,
              };
              await bot.lookAt(player.entity.position);
              await bot.waitForTicks(1);
              await bot.toss(exp.type, null, exp.count);
              bot.chat(`/msg ${match[1]} Go ahead!`);
              await bot.look(e.yaw, e.pitch);
              logger.log(`I gave xp to ${match[1]}`);
            } else {
              logger.log('Cannot find xp bottle');
              bot.chat(`/msg ${match[1]} I don't have xp bottle...`);
            }
          }
          return;
        } else await SendText(`[Tell] ${msg}`);
      }
    }
    logger.log('msg', msg);
  });

  bot._client.on('damage_event', (packet) => {
    const entity = bot.entities[packet.entityId];
    bot.emit('entityHurt', entity!, entity!);
  });

  bot.on('entityHurt', async (e) => {
    if (e) {
      // const send = SendText(`[WARNING] ${e.username ?? e.name} attacked me! trying to kill that entity...`);
      while (1) {
        if (!e) break;
        if (!e.health || e.health <= 0) break;
        bot.lookAt(e.position);
        bot.attack(e);
        await wait(1000);
      }
      // await send
    }
  });

  bot.on('forcedMove', () => {
    // logger.warn('ForcedMove detected.');
    // logger.log('Current location is: ', bot.entity.position);
  });

  bot.on('kicked', async (reason, loggedIn) => {
    if (await kv.get('reconnecting')) return;
    await kv.set('reconnecting', true);
    logger.warn(`I was kicked... reason: ${reason} (LoggedIn: ${loggedIn})`);
    await SendText(
      `I was kicked :( (reason: ${reason}) trying to reconnect...`,
      true
    );
    logger.log('Reconnecting after 10 seconds...');
    await wait(10000);
    return mcbot();
  });
  bot.on('error', (err) => {
    if (err.message === 'PartialReadError') return;
    else console.error(err);
  });
  bot.on('end', async (reason) => {
    if (await kv.get('reconnecting')) return;
    await kv.set('reconnecting', true);
    await SendText(
      `I was disconnected (reason: ${reason})! trying to reconnect...`,
      true
    );
    logger.info(`End event detected (reason: ${reason})`);
    logger.log('Reconnecting after 10 seconds...');
    await wait(10000);
    return mcbot();
  });
  bot.on('message', async (json, pos) => {
    if (!json.hasOwnProperty('translate')) return;
    if (json.translate?.startsWith('death.')) {
      if (json.toString().includes(bot.username)) {
        await SendText(
          `I was died (reason: ${
            json.translate
          }), respawning... \nDeathMessage: ${json.toString()}`
        );
        bot.chat('/home botpos');
        await waitForTeleport();
      }
    }
  });
}
