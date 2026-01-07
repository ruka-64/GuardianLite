import { bot } from '..';

export const isInvFull = () => {
  return bot.inventory.emptySlotCount() === 0;
};

export const InvCleaner = async () => {
  const e = bot.entity;
  await bot.look(e.yaw - 180, e.pitch);
  for (const slot of bot.inventory.slots) {
    if (!slot) continue;
    if (slot.name === 'bone') await bot.toss(slot.type, null, slot.count);
    if (slot.name === 'arrow') await bot.toss(slot.type, null, slot.count);
    if (slot.name === 'rotten_flesh')
      await bot.toss(slot.type, null, slot.count);
  }
  await bot.look(e.yaw + 180, e.pitch);
};

export const ThrowItem = async (id: string) => {
  const itemId = bot.registry.itemsByName[id]?.id;
  if (!itemId) {
    return false;
  }
  const e = bot.entity;
  await bot.look(e.yaw - 180, e.pitch);
  for (const slot of bot.inventory.slots) {
    if (!slot) continue;
    if (slot.name === id) {
      await bot.toss(slot.type, null, slot.count);
    }
  }
  await bot.look(e.yaw + 180, e.pitch);
  return true;
};
