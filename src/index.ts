import Keyv from 'keyv';
import { config } from '../config';
import { JSONFilePreset } from 'lowdb/node';

export const kv = new Keyv();
export const wait = (ms: number) => new Promise((_) => setTimeout(_, ms));

export type StateData = {
  autoFightState: boolean;
};

const defaultState: StateData = { autoFightState: false };
export const stateDB = await JSONFilePreset('state.json', defaultState);

async function main() {
  import('./discord/index');
  (await import('./bot/index')).mcbot(config.mc.shouldInit);
}

main();
