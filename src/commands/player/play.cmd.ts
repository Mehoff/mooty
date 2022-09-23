import {
  joinVoiceChannel,
  createAudioResource,
  CreateVoiceConnectionOptions,
  JoinVoiceChannelOptions,
  getVoiceConnection,
} from "@discordjs/voice";
import {
  APIEmbedField,
  CacheType,
  ChatInputCommandInteraction,
  EmbedBuilder,
  RestOrArray,
  SlashCommandBuilder,
} from "discord.js";
import { Readable } from "stream";
import { Command } from "../../../types";
import { YoutubeService } from "../../services/youtube/youtube.service";
import { PlayerService } from "../../services/player/player.service";
import { ServiceResponse } from "../../classes/service-response";
import { DEFAULT_ERROR_MESSAGE } from "../../constants";
import { Song } from "../../classes/song";
import { MootyAudioPlayer } from "../../services/player/mooty-audio-player";

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
    // Find member who used slash-command
    const member = interaction.guild!.members.cache.get(
      interaction.member?.user.id!
    );

    // If failed to find or not in voice channel - throw error
    if (!member || !member.voice.channelId)
      return await interaction.reply("Member is not in a voice channel");

    // Get response from Youtube
    const { data, message, isError }: ServiceResponse<Song> =
      await YoutubeService.handleQuery(interaction);

    // If any error occured and command cannot be executed - reply with message
    if (isError)
      return await interaction.reply(message ? message : DEFAULT_ERROR_MESSAGE);

    // If no error, data is a Song info
    const song: Song = data!;

    // Check if bot connected to a voice channel
    const connection = getVoiceConnection(interaction.guildId!);

    // Create new Mooty player instance or get existing
    const mooty: MootyAudioPlayer =
      PlayerService.createOrGetExistingPlayer(interaction);

    // If connection does not exist - player is also must be undefined, create AudioPlayer and connect to voice channel
    if (!connection) {
      // Create connection options to channel
      const connectionOptions: JoinVoiceChannelOptions &
        CreateVoiceConnectionOptions = {
        channelId: member?.voice.channelId!,
        guildId: interaction.guildId!,
        adapterCreator: interaction.guild?.voiceAdapterCreator!,
      };

      // Join to voice channel and subscribe to player
      joinVoiceChannel(connectionOptions).subscribe(mooty.player);
    }

    // Add song to queue
    mooty.addSong(song);

    // Send a successful reply message
    const embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle(song.title)
      .setURL(song.url)
      .setFooter({ text: `Requested by ${interaction.member?.user.username!}` })
      .setThumbnail(song.thumbnailUrl)
      .setTimestamp(); // TODO: Add song.uploadDate

    return await interaction.reply({ embeds: [embed] });
  },
};

export default Play;
