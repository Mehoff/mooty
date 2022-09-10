import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  VoiceConnectionStatus,
  CreateVoiceConnectionOptions,
  JoinVoiceChannelOptions,
  AudioPlayerStatus,
  StreamType,
  getVoiceConnection,
  AudioPlayer,
} from "@discordjs/voice";
import {
  CacheType,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import { Readable } from "stream";
import { Command } from "../../../types";
import { YoutubeService } from "../../services/youtube/youtube.service";
import { PlayerService } from "../../services/players/player.service";

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

    // Create readable stream from playload
    // TODO: Create handleQueryResult object, and if error - reply with interaction message
    const readable: Readable = await YoutubeService.handleQuery(query);

    // Check if connection exists
    const connection = getVoiceConnection(interaction.guildId!);

    // If connection does not exist - player is also must be undefined, create AudioPlayer and connect to voice channel
    if (!connection) {
      // Create new a new AudioPlayer
      const player: AudioPlayer =
        PlayerService.createOrGetExistingPlayer(interaction);

      // Find member who used slash command
      const member = interaction.guild!.members.cache.get(
        interaction.member?.user.id!
      );

      // If failed to find or not in voice channel - throw error
      if (!member || !member.voice.channelId)
        return await interaction.reply("Member is not in a voice channel");

      // Create connection options to channel
      const connectionOptions: JoinVoiceChannelOptions &
        CreateVoiceConnectionOptions = {
        channelId: member?.voice.channelId!,
        guildId: interaction.guildId!,
        adapterCreator: interaction.guild?.voiceAdapterCreator!,
      };

      // Join to voice channel and sub to player
      joinVoiceChannel(connectionOptions).subscribe(player);

      // Create audio resource from readable we got from youtube-service
      const resource = createAudioResource(readable, {
        inlineVolume: true,
      });

      // Play the resource
      player.play(resource);
    } else {
      // If connection does exist, try to find AudioPlayer
      const player = PlayerService.createOrGetExistingPlayer(interaction);

      // Find member who used slash command
      const member = interaction.guild!.members.cache.get(
        interaction.member?.user.id!
      );

      // If failed to find or not in voice channel - throw error
      if (!member || !member.voice.channelId)
        return await interaction.reply("Member is not in a voice channel");

      const connectionOptions: JoinVoiceChannelOptions &
        CreateVoiceConnectionOptions = {
        channelId: member?.voice.channelId!,
        guildId: interaction.guildId!,
        adapterCreator: interaction.guild?.voiceAdapterCreator!,
      };

      // Create audio resource from readable we got from youtube-service
      const resource = createAudioResource(readable, {
        inlineVolume: true,
      });

      // Play the resource
      player.play(resource);
    }

    await interaction.reply("Track is playing");
  },
};

export default Play;
