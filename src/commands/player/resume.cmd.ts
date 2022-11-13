import { getVoiceConnection } from "@discordjs/voice";
import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  CacheType,
} from "discord.js";
import { EmbedGenerator } from "../../classes";
import { Command } from "../../interfaces";
import { MootyAudioPlayer } from "../../services/player/mooty-audio-player";
import { PlayerService } from "../../services/player/player.service";

const Resume: Command = {
  data: new SlashCommandBuilder()
    .setName("resume")
    .setDescription("Pauses current played song"),
  execute: async (interaction: ChatInputCommandInteraction<CacheType>) => {
    const connection = getVoiceConnection(interaction.guildId!);
    if (!connection)
      return await interaction.reply({
        ephemeral: true,
        embeds: [
          EmbedGenerator.buildMessageEmbed(
            "⚠️ Failed to process command",
            "No voice connection detected"
          ),
        ],
      });

    const mooty: MootyAudioPlayer =
      PlayerService.createOrGetExistingPlayer(interaction);

    if (mooty.current === undefined)
      return await interaction.reply({
        ephemeral: true,
        embeds: [
          EmbedGenerator.buildMessageEmbed(
            "⚠️ Failed to process command",
            "Nothing to resume"
          ),
        ],
      });

    if (!mooty.current)
      return await interaction.reply({
        ephemeral: true,
        embeds: [
          EmbedGenerator.buildMessageEmbed(
            "⚠️ Failed to process command",
            "Song is not paused"
          ),
        ],
      });

    mooty.resume();
    await interaction.reply({
      ephemeral: true,
      embeds: [EmbedGenerator.buildMessageEmbed("▶️ Song resumed")],
    });
  },
};

export default Resume;
