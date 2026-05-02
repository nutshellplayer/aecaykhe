// Zeinharde's AFK Client
// This script connects a Mineflayer bot to a Minecraft server and runs small periodic actions
// (jump + tiny forward/back) to reduce the chance of being kicked for inactivity.
//
// Notes:
// - This is a client-side automation script. It does not modify the server.
// - Credentials/auth are set to "offline" to support cracked/offline-mode servers.
// - Configuration is read from ./config.json so you can change host/port/username without editing code.
const mineflayer = require('mineflayer');
const readline = require('readline');
const config = require('./config.json');

// Centralized app name so all logs show the same client branding.
const APP_NAME = config.client_name || "Zeinharde's AFK Client";

// Readline interface to accept console input while the bot is running.
// Anything you type into the terminal will be sent as an in-game chat message (e.g., /login password).
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function createBot() {
    // Display connection target so it's obvious which server/port we're attempting to join.
    console.log(`[${APP_NAME}][SYSTEM] Connecting to server: ${config.host}:${config.port}`);

    // Create the Mineflayer bot instance using values from config.json:
    // - host/port: server address
    // - username: the in-game name the bot will use
    // - version: Minecraft protocol version (must match the server)
    // - auth: "offline" for offline-mode/cracked servers
    const bot = mineflayer.createBot({
        host: config.host,
        port: config.port,
        username: config.username,
        version: config.version,
        auth: config.auth || 'offline'
    });

    // Anti-AFK routine:
    // Repeats every config.afk_interval milliseconds and performs harmless micro-actions.
    //
    // Why this exists:
    // Many servers kick players who have not sent movement/action packets for a while.
    // Jumping and briefly moving forward/back causes the client to send activity packets.
    function startAntiAFK() {
        setInterval(() => {
            // bot.entity exists after the bot has spawned into the world.
            // This check prevents attempting movement before the bot is fully in-game.
            if (bot.entity) {
                // 1) Jump briefly (press jump for ~500ms).
                // setControlState simulates holding down a key, so we toggle it on then off.
                bot.setControlState('jump', true);
                setTimeout(() => bot.setControlState('jump', false), 500);

                // 2) Small forward/back movement (press forward, then back).
                // This is intentionally short to reduce the chance of walking into danger.
                bot.setControlState('forward', true);
                setTimeout(() => {
                    bot.setControlState('forward', false);
                    bot.setControlState('back', true);
                    setTimeout(() => bot.setControlState('back', false), 200);
                }, 200);
                
                // Log each anti-AFK cycle so you can confirm the automation is running.
                console.log(`[${APP_NAME}][AUTOMATION] Performed anti-AFK actions (jump + small movement).`);
            }
        }, config.afk_interval);
    }

    // "spawn" fires when the bot has successfully joined the world and is ready.
    bot.on('spawn', () => {
        console.log(`[${APP_NAME}][SUCCESS] Logged in as ${bot.username}.`);
        console.log(
            `[${APP_NAME}][INFO] Anti-AFK enabled: actions run every ${config.afk_interval / 1000} seconds.`
        );
        startAntiAFK();
    });

    // Print incoming chat messages to the console.
    // Mineflayer provides JSON chat components; toAnsi() renders them with terminal colors.
    bot.on('message', (jsonMsg) => {
        console.log(jsonMsg.toAnsi());
    });

    // Forward terminal input to in-game chat.
    // Example use cases: /login <password>, /register <password> <password>, or normal messages.
    rl.on('line', (line) => {
        const input = line.trim();
        if (input.length > 0) {
            bot.chat(input);
        }
    });

    // Error handling: logs unexpected errors coming from the bot or network layer.
    bot.on('error', (err) => console.log(`[${APP_NAME}][ERROR] ${err.message}`));

    // If the server kicks the bot, Mineflayer provides the kick reason (often JSON).
    // Exiting the process keeps behavior simple: you can restart with `npm start`.
    bot.on('kicked', (reason) => {
        console.log(`[${APP_NAME}][WARNING] Kicked from server: ${reason}`);
        process.exit();
    });

    // "end" fires when the connection is closed for any reason (kick, timeout, server restart, etc.).
    bot.on('end', () => {
        console.log(`[${APP_NAME}][INFO] Connection ended.`);
        process.exit();
    });
}

// Start the client.
createBot();
