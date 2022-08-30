import dotenv from "dotenv";
import path from "path";
import { Client } from "discord.js";
import { GatewayIntentBits } from "discord-api-types/v9";
import { CommandsHandler } from "../commands-handler";
dotenv.config();

const commandsDeploer = new CommandsHandler(path.join(__dirname, "commands"));

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

client.once("ready", async () => {
  await commandsDeploer.init();
  console.log(`Beep-bop, I am ready!`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;
  await commandsDeploer.execute(interaction);
});

client.login(process.env.DISCORD_TOKEN);
