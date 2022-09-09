import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  VoiceConnectionStatus,
  CreateVoiceConnectionOptions,
  JoinVoiceChannelOptions,
} from "@discordjs/voice";
import {
  CacheType,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import { Readable } from "stream";
import { Command } from "../../../types";
import { YoutubeService } from "../../services/player.service";

const Play: Command = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Plays the youtube video")
    .addStringOption((option) =>
      option
        .setName("query")
        .setDescription("Enter video URL or search input")
        .setRequired(true)
        .setMinLength(3)
        .setMaxLength(499)
    ),
  execute: async (interaction: ChatInputCommandInteraction<CacheType>) => {
    const query = interaction.options.getString("query");
    if (!query) return await interaction.reply("Bad query, try again");

    const readable: Readable = await YoutubeService.handleQuery(query);

    const player = createAudioPlayer();

    const connectionOptions: JoinVoiceChannelOptions &
      CreateVoiceConnectionOptions = {
      channelId: interaction.channelId,
      guildId: interaction.guildId!,
      adapterCreator: interaction.guild?.voiceAdapterCreator!,
    };

    console.log("Connection options: ", connectionOptions);

    const connection = joinVoiceChannel(connectionOptions);

    connection.on(VoiceConnectionStatus.Signalling, (oldState, newState) => {
      console.log("Signalling...");
    });

    connection.on(VoiceConnectionStatus.Ready, (oldState, newState) => {
      console.log("Ready...");
    });

    connection.on(VoiceConnectionStatus.Destroyed, (oldState, newState) => {
      console.log("Destroyed...");
    });

    connection.on(VoiceConnectionStatus.Connecting, (oldState, newState) => {
      console.log("Connectiing...");
    });

    const resource = createAudioResource(readable);
    player.play(resource);
    connection.subscribe(player);

    await interaction.reply("Track is playing");
  },
};

export default Play;
