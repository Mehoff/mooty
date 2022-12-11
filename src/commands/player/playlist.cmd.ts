import { getVoiceConnection } from "@discordjs/voice";
import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  CacheType,
} from "discord.js";
import { EmbedGenerator, ServiceResponse, Song } from "../../classes";
import { Command } from "../../interfaces";
import { MootyAudioPlayer } from "../../services/player/mooty-audio-player";
import { PlayerService } from "../../services/player/player.service";
import { YoutubeService } from "../../services/youtube/youtube.service";

const Playlist: Command = {
  data: new SlashCommandBuilder()
    .setName("playlist")
    .setDescription("Passes youtube playlist to bot queue")
    .addStringOption((option) =>
      option
        .setName("url")
        .setDescription("Enter video URL or search input")
        .setRequired(true)
        .setMinLength(11)
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

    const { data, message, isError }: ServiceResponse<Song[]> =
      await YoutubeService.playlist(interaction);

    if (!data && isError) {
      return await interaction.reply({
        embeds: [
          EmbedGenerator.buildMessageEmbed(
            "⚠️ Failed to process command",
            message ? message : "Failed to add songs from playlist to queue"
          ),
        ],
      });
    }
    // const connection = getVoiceConnection(interaction.guildId!);
    // if (!connection)
    //   return await interaction.reply({
    //     ephemeral: true,
    //     embeds: [
    //       EmbedGenerator.buildMessageEmbed(
    //         "⚠️ Failed to process command",
    //         "No voice connection detected"
    //       ),
    //     ],
    //   });

    const mooty: MootyAudioPlayer =
      PlayerService.createOrGetExistingPlayer(interaction);

    if (data !== undefined) {
      const embed = await mooty.add(...data);

      return await interaction.reply({
        ephemeral: true,
        embeds: [embed],
      });
    }

    await interaction.reply({
      ephemeral: true,
      embeds: [
        EmbedGenerator.buildMessageEmbed("▶️ Added songs from playlist"),
      ],
    });
  },
};

export default Playlist;
