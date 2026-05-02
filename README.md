# Zeinharde's AFK Client

Zeinharde's AFK Client is a small Node.js script built with Mineflayer that connects to a Minecraft server and performs periodic micro-actions (jump + a tiny forward/back movement) to reduce the chance of being kicked for being AFK.

## What This Project Does

- Connects a bot account to a Minecraft server using the settings in `config.json`
- Prints in-game chat to your terminal
- Lets you type commands/messages in the terminal and forwards them to in-game chat
- Runs an Anti-AFK routine every `afk_interval` milliseconds

## Requirements

- Node.js installed (LTS recommended)
- Internet access to the server
- A Minecraft server you are allowed to connect to

## Installation

Open a terminal in this folder (the same folder that contains `package.json`) and run:

```bash
npm install
```

## Configuration (`config.json`)

All runtime settings are in `config.json` in the project root.

### Fields (what to write and where)

- `client_name` (string)
  - Used only for display/logging in the terminal.
  - Example: `"Zeinharde's AFK Client"`
- `host` (string)
  - The server IP/domain.
  - Example: `"play.example.com"` or `"127.0.0.1"`
- `port` (number)
  - The server port.
  - Example: `25565`
- `username` (string)
  - The in-game name the bot will use.
  - Example: `"ExampleUsername"`
- `version` (string)
  - Minecraft protocol version the bot should use.
  - Must match the server version you are connecting to.
  - Example: `"1.21.1"` (example only)
- `auth` (string)
  - Passed directly to Mineflayer as the `auth` option.
  - This project is configured for offline-mode/cracked servers by default:
    - `"offline"`
  - If you change this value, ensure your environment and dependencies support it.
- `afk_interval` (number)
  - Anti-AFK action interval in milliseconds.
  - Example: `30000` means every 30 seconds.
- `_notes` (array of strings)
  - Optional. Human-readable notes.
  - JSON does not support comments, so this is a safe place to keep reminders.

### Example `config.json`

```json
{
  "client_name": "Zeinharde's AFK Client",
  "host": "127.0.0.1",
  "port": 25565,
  "username": "MyBotName",
  "version": "1.21.1",
  "auth": "offline",
  "afk_interval": 30000
}
```

## Running

Start the client:

```bash
npm start
```

Alternative:

```bash
node index.js
```

## Using the Terminal (Important)

While the bot is running, anything you type into the terminal will be sent as in-game chat.

Common uses:

- Login plugins:
  - `/login yourPassword`
  - `/register yourPassword yourPassword`
- Server commands (if the account has permission)
- Normal messages to chat

## How Anti-AFK Works

Every `afk_interval` milliseconds, the script:

1. Presses jump for ~500ms
2. Presses forward briefly, then back briefly

This produces small movement/activity packets so many servers consider the player “active”.

## Troubleshooting

- Bot connects but instantly disconnects:
  - Check `host`, `port`, and `version` in `config.json`.
  - Some servers block bots or require additional steps (captcha/login plugins).
- You see kick reasons:
  - The client logs kick messages under `[WARNING] Kicked from server: ...`.
- The bot does not move:
  - Anti-AFK only runs after the `spawn` event (after the bot joins the world).
  - Ensure `afk_interval` is not extremely large.

## Safety / Rules

- Only use this on servers where you have permission to automate/AFK.
- The movement is intentionally tiny, but the bot can still be harmed by the environment (mobs, fall damage, lava, etc.).
