import { getVoiceConnection } from "@discordjs/voice";
import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  CacheType,
} from "discord.js";
import { Command } from "../../../types";
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
        content: "No voice connection detected",
      });

    const mooty = PlayerService.createOrGetExistingPlayer(interaction);

    if (mooty.getCurrent() === undefined)
      return await interaction.reply({
        ephemeral: true,
        content: "Nothing to pause",
      });

    if (mooty.isPaused()) {
      return await interaction.reply({
        ephemeral: true,
        content: "Song is already paused",
      });
    }

    mooty.pause();
    await interaction.reply({ ephemeral: true, content: "Song is paused" });
  },
};

export default Pause;
