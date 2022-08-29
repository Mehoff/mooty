import { Client } from "discord.js";
import { CommandsHandler } from "./commands-handler";
import dotenv from "dotenv";
import { GatewayIntentBits } from "discord-api-types/v9";
dotenv.config();

export const commandsHandler = new CommandsHandler();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

client.once("ready", async () => {
  await commandsHandler.init();
  console.log(`Beep-bop, I am ready!`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;
  await commandsHandler.execute(interaction);
});

client.login(process.env.DISCORD_TOKEN);
