import { Client, Intents } from "discord.js";
import dotenv from "dotenv";
dotenv.config();

const client = new Client({
  intents: [Intents.FLAGS.GUILDS],
});

client.once("ready", () => {
  console.log(`Beep-bop, I am ready!`);
});

client.login(process.env.DISCORD_BOT_TOKEN);
