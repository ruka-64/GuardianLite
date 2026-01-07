import { bot } from '..';
import type { Bot } from 'mineflayer';
import { SendText } from '../../discord/utils/notifier';

export class autoFishModule {
  public running: boolean;
  private fishState: boolean;
  private bot: Bot;
  constructor(bot: Bot) {
    this.bot = bot;
    this.fishState = false;
    this.running = false;
  }

  private async equipRod() {
    const rod = bot.registry.itemsByName.fishing_rod;
    if (!bot.heldItem || bot.heldItem.name !== rod!.name) {
      await bot.equip(rod!.id, 'hand');
    }
  }

  async startFishing() {
    if (this.running) {
      this.stopFishing();
    }
    this.running = true;
    while (1) {
      if (!this.running) break;
      try {
        await this.equipRod();
        this.fishState = true;
        await bot.fish();
        await bot.waitForTicks(16);
        this.fishState = false;
      } catch (e: any) {
        if (e.message === 'Fishing cancelled due to calling bot.fish() again') {
          if (this.fishState) bot.activateItem();
          await SendText('Autofish called again. disabling', true);
        } else {
          await SendText(`Error detected while running autofish: ${e}`, true);
        }
        break;
      }
    }
    this.running = false;
    this.fishState = false;
  }

  stopFishing() {
    this.running = false;
    bot.activateItem();
  }
}
