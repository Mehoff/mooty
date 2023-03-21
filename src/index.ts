import dotenv from "dotenv";
import path from "path";
import {
  Client,
  Guild,
  GuildMember,
  PartialGuildMember,
  VoiceState,
} from "discord.js";
import { GatewayIntentBits } from "discord-api-types/v9";
import { CommandsHandler } from "./classes";
import { getDiscordToken } from "./helpers";
import { PlayerService } from "./services/player/player.service";
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

client.on("voiceStateUpdate", (oldState: VoiceState, newState: VoiceState) => {
  if (newState.channel) {
    console.log(
      `${newState.member?.user.tag} connected to ${newState.channel.name}. Size - [${newState.channel.members.size}]`
    );
  } else if (oldState.channel) {
    console.log(
      `${oldState.member?.user.tag} disconnected from ${oldState.channel.name}. Size - [${oldState.channel.members.size}]`
    );

    const clientId =
      process.env.NODE_ENV === "development"
        ? process.env.DISCORD_DEV_CLIENT_ID
        : process.env.DISCORD_PROD_CLIENT_ID;

    const isBotLeft = oldState.channel.members.get(clientId!);

    if (oldState.channel.members.size === 1 && isBotLeft) {
      // TODO:

      // Set current player state on pause, if it exists.
      // Resume on someone connecting

      setTimeout(async () => {
        // TODO:

        // Instead of just disonnecting, find Mooty instance, and delete player properly?
        // Also, can add a auto-pause if no one in channel, and resume if some-one is reconnecting

        // Check if someone is some one connected between start of setTimeout and function execution
        // If so - do not disconnect

        const mooty = PlayerService.getExistingPlayer(isBotLeft.guild.id);

        if (!mooty) await isBotLeft.voice.disconnect();
        else await mooty.destroy();
      }, 5000);
    }
  }
});

client.login(getDiscordToken(process.env.NODE_ENV));
