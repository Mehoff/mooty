import dotenv from "dotenv";
import path from "path";
import { Client, Guild, GuildMember, PartialGuildMember } from "discord.js";
import { GatewayIntentBits } from "discord-api-types/v9";
import { CommandsHandler } from "./classes";
import { getDiscordToken } from "./helpers";
dotenv.config();

const commandsPath = path.join(__dirname, "commands");

const commandsHandler = new CommandsHandler(commandsPath);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

client.once("ready", async () => {
  await commandsHandler.loadCommands();
  console.log(`Beep-bop, I am ready!`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;
  await commandsHandler.execute(interaction);
});

client.on(
  "guildMemberUpdate",
  async (
    oldMember: GuildMember | PartialGuildMember,
    newMember: GuildMember
  ) => {
    console.log(oldMember);
    console.log(newMember);
  }
);

client.login(getDiscordToken(process.env.NODE_ENV));
