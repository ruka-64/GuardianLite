# How to setup viaproxy

## Requirements

- Desktop (I recommended to use Linux. Windows sucks)
- Server (to run ViaProxy and Guardian)
- Minecraft Account
- OpenJRE 25 (Desktop & Server)
- Working brain

I tested on:

- Arch linux (Desktop)
- Debian 13 (Server)
- OpenJRE 25.0.1

## Prepare

Before setup, you need to generate account data called `saves.json`.

1. Download latest viaproxy from [here](https://github.com/ViaVersion/ViaProxy/releases/latest) and run with `java -jar ViaProxy-x.x.x.jar`

> 💡 You can use tab completion :D

2. Open Account tab and Add Microsoft Account.

3. Close ViaProxy GUI.

4. Check files:

```bash
~$ ls
ViaLoader  ViaProxy-3.4.6.jar  jars  logs  plugins  saves.json  viaproxy.yml
```

🥳 Yay! You got `saves.json`!

## Setup

1. Download latest viaproxy from [here](https://github.com/ViaVersion/ViaProxy/releases/latest).

2. Download [this config](https://gist.github.com/ruka-64/ae3f9908684b9996ff9105fb224c62c6) and save to same directory.

3. Copy & Paste your `saves.json`

4. Run with `java -jar ViaProxy-x.x.x.jar config viaproxy.yml`

5. Enjoy!
