import { getVoiceConnection } from "@discordjs/voice";
import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  CacheType,
} from "discord.js";
import { Command } from "../../../types";
import { EmbedGenerator } from "../../classes";
import { PlayerService } from "../../services/player/player.service";

const Current: Command = {
  data: new SlashCommandBuilder()
    .setName("current")
    .setDescription("Shows info about currently playing song"),
  execute: async (interaction: ChatInputCommandInteraction<CacheType>) => {
    const connection = getVoiceConnection(interaction.guildId!);
    if (!connection)
      return await interaction.reply("No voice connection detected");

    const mooty = PlayerService.createOrGetExistingPlayer(interaction);

    await interaction.reply({
      embeds: [EmbedGenerator.getCurrentSongEmbed(mooty)],
    });
  },
};

export default Current;
