import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  VoiceConnectionStatus,
  CreateVoiceConnectionOptions,
  JoinVoiceChannelOptions,
  AudioPlayerStatus,
  StreamType,
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

    player.on(AudioPlayerStatus.Buffering, (err) => {
      interaction.channel?.send("Buffering");
    });

    player.on(AudioPlayerStatus.Idle, (err) => {
      interaction.channel?.send("Idle");
    });

    player.on(AudioPlayerStatus.Paused, (err) => {
      interaction.channel?.send("Paused");
    });

    player.on(AudioPlayerStatus.Playing, (oldState, newState) => {
      interaction.channel?.send("Playing");
    });

    player.on("error", (err) => {
      console.log("Player error: ");
      console.error(err);
    });

    const member = interaction.guild!.members.cache.get(
      interaction.member?.user.id!
    );

    if (!member || !member.voice.channelId)
      return await interaction.reply("Member is not in a voice channel");

    const connectionOptions: JoinVoiceChannelOptions &
      CreateVoiceConnectionOptions = {
      channelId: member?.voice.channelId!,
      guildId: interaction.guildId!,
      adapterCreator: interaction.guild?.voiceAdapterCreator!,
    };

    joinVoiceChannel(connectionOptions).subscribe(player);

    const resource = createAudioResource(readable, {
      inlineVolume: true,
    });

    player.play(resource);

    await interaction.reply("Track is playing");
  },
};

export default Play;
