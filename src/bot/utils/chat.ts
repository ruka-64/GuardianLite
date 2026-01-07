import { bot } from '..';

export const sendCommand = (cmd: string) => {
  bot.chat(cmd.startsWith('/') ? cmd : '/' + cmd);
  return new Promise<string>((_) => {
    bot.on('messagestr', (msg) => _(msg));
  });
};
