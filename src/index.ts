import { CacheType, Client, Intents, Interaction } from "discord.js";
import { CommandsHandler } from "./commands-handler";
import dotenv from "dotenv";
dotenv.config();

export const commandsHandler = new CommandsHandler();

const client = new Client({
  intents: [Intents.FLAGS.GUILDS],
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
