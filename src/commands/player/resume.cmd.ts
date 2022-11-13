import { getVoiceConnection } from "@discordjs/voice";
import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  CacheType,
} from "discord.js";
import { Command } from "../../../types";
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
        content: "⚠️No voice connection detected",
      });

    const mooty: MootyAudioPlayer =
      PlayerService.createOrGetExistingPlayer(interaction);

    if (mooty.current === undefined)
      return await interaction.reply({
        ephemeral: true,
        content: "⚠️Nothing to resume",
      });

    if (!mooty.current)
      return await interaction.reply({
        ephemeral: true,
        content: "⚠️Song is not paused",
      });

    mooty.resume();
    await interaction.reply({ ephemeral: true, content: "Song resumed" });
  },
};

export default Resume;
