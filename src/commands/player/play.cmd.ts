import {
  joinVoiceChannel,
  createAudioResource,
  CreateVoiceConnectionOptions,
  JoinVoiceChannelOptions,
  getVoiceConnection,
} from "@discordjs/voice";
import {
  CacheType,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import { Readable } from "stream";
import { Command } from "../../../types";
import { YoutubeService } from "../../services/youtube/youtube.service";
import {
  MootyAudioPlayer,
  PlayerService,
} from "../../services/player/player.service";
import { ServiceResponse } from "../../classes/service-response";
import { DEFAULT_ERROR_MESSAGE } from "../../constants";
import { Song } from "../../classes/song";

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
    // Refactor this to MootyPlayer updates;

    // Create readable stream from playload
    const { data, message, isError }: ServiceResponse<Song> =
      await YoutubeService.handleQuery(interaction);

    if (isError)
      return await interaction.reply(message ? message : DEFAULT_ERROR_MESSAGE);

    const song: Song = data!;

    // Check if connection exists
    const connection = getVoiceConnection(interaction.guildId!);

    // If connection does not exist - player is also must be undefined, create AudioPlayer and connect to voice channel
    if (!connection) {
      // Create new a new AudioPlayer
      const mooty: MootyAudioPlayer =
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
      joinVoiceChannel(connectionOptions).subscribe(mooty.player);

      mooty.addSong(song);

      // if (mooty.current !== null)
      //   interaction.reply("Something bad happened, dev is retarded");

      // const readable: Readable = await YoutubeService.getReadable(
      //   mooty.current?.url!
      // );

      // // Create audio resource from readable we got from youtube-service
      // const resource = createAudioResource(readable, {
      //   inlineVolume: true,
      // });

      // // Play the resource
      // mooty.player.play(resource);
    } else {
      // If connection does exist, try to find AudioPlayer
      const mooty: MootyAudioPlayer =
        PlayerService.createOrGetExistingPlayer(interaction);

      // Find member who used slash command
      const member = interaction.guild!.members.cache.get(
        interaction.member?.user.id!
      );

      // If failed to find or not in voice channel - throw error
      if (!member || !member.voice.channelId)
        return await interaction.reply("Member is not in a voice channel");

      mooty.addSong(song);

      // const connectionOptions: JoinVoiceChannelOptions &
      //   CreateVoiceConnectionOptions = {
      //   channelId: member?.voice.channelId!,
      //   guildId: interaction.guildId!,
      //   adapterCreator: interaction.guild?.voiceAdapterCreator!,
      // };

      // // Create audio resource from readable we got from youtube-service
      // const resource = createAudioResource(readable, {
      //   inlineVolume: true,
      // });

      // // Play the resource
      // mooty.player.play(resource);
    }

    await interaction.reply("Track is playing");
  },
};

export default Play;
