import {
  joinVoiceChannel,
  CreateVoiceConnectionOptions,
  JoinVoiceChannelOptions,
  getVoiceConnection,
  VoiceConnectionDisconnectedState,
  VoiceConnectionStatus,
} from "@discordjs/voice";
import {
  CacheType,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import { YoutubeService } from "../../services/youtube/youtube.service";
import { PlayerService } from "../../services/player/player.service";
import { DEFAULT_ERROR_MESSAGE } from "../../constants";
import { Song, ServiceResponse, EmbedGenerator } from "../../classes";
import { MootyAudioPlayer } from "../../services/player/mooty-audio-player";
import { Command } from "../../interfaces";

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
      return await interaction.reply({
        embeds: [
          EmbedGenerator.buildMessageEmbed(
            "⚠️ Failed to process command",
            "Member is not in a voice channel"
          ),
        ],
      });

    // Get response from Youtube
    const { data, message, isError }: ServiceResponse<Song> =
      await YoutubeService.handleQuery(interaction);

    // If any error occured and command cannot be executed - reply with message
    if (isError)
      return await interaction.reply({
        embeds: [
          EmbedGenerator.buildMessageEmbed(
            "⚠️ Failed to process command",
            message ? message : DEFAULT_ERROR_MESSAGE
          ),
        ],
      });

    // If no error, data is a Song info
    const song: Song = data!;
    song.requestedBy = member;

    // Check if bot connected to a voice channel
    const connection = getVoiceConnection(interaction.guildId!);

    // Create new Mooty player instance or get existing
    const mooty: MootyAudioPlayer =
      PlayerService.createOrGetExistingPlayer(interaction);

    // If connection does not exist - player is also must be undefined, create AudioPlayer and connect to voice channel
    if (
      !connection ||
      connection.state.status === VoiceConnectionStatus.Disconnected
    ) {
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
    const embed = await mooty.addSong(song);
    return await interaction.reply({ embeds: [embed] });
  },
};

export default Play;
