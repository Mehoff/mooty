import { getVoiceConnection } from "@discordjs/voice";
import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  CacheType,
} from "discord.js";
import { Command } from "../../../types";
import { PlayerService } from "../../services/player/player.service";

const Skip: Command = {
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Skips current played song"),
  execute: async (interaction: ChatInputCommandInteraction<CacheType>) => {
    const connection = getVoiceConnection(interaction.guildId!);
    if (!connection)
      return await interaction.reply("⚠️No voice connection detected");

    const mooty = PlayerService.createOrGetExistingPlayer(interaction);
    mooty.skip();

    await interaction.reply({
      ephemeral: true,
      content: "Skipped song",
    });
  },
};

export default Skip;
