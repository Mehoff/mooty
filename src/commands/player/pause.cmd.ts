import { getVoiceConnection } from "@discordjs/voice";
import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  CacheType,
} from "discord.js";
import { EmbedGenerator } from "../../classes";
import { Command } from "../../interfaces";
import { PlayerService } from "../../services/player/player.service";

const Pause: Command = {
  data: new SlashCommandBuilder()
    .setName("pause")
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

    const mooty = PlayerService.createOrGetExistingPlayer(interaction);

    if (mooty.current === undefined)
      return await interaction.reply({
        ephemeral: true,
        embeds: [
          EmbedGenerator.buildMessageEmbed(
            "⚠️ Failed to process command",
            "No song is being played right now"
          ),
        ],
      });

    if (mooty.paused) {
      return await interaction.reply({
        ephemeral: true,
        embeds: [
          EmbedGenerator.buildMessageEmbed(
            "⚠️ Failed to process command",
            "Player is already paused"
          ),
        ],
      });
    }

    mooty.pause();
    await interaction.reply({
      ephemeral: true,
      embeds: [EmbedGenerator.buildMessageEmbed("⏸️ Player is paused")],
    });
  },
};

export default Pause;
