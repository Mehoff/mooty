import { getVoiceConnection } from "@discordjs/voice";
import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  CacheType,
} from "discord.js";
import { Command } from "../../../types";
import { EmbedGenerator } from "../../classes";
import { PlayerService } from "../../services/player/player.service";

const Shuffle: Command = {
  data: new SlashCommandBuilder()
    .setName("shuffle")
    .setDescription("Shuffle songs in queue"),
  execute: async (interaction: ChatInputCommandInteraction<CacheType>) => {
    const connection = getVoiceConnection(interaction.guildId!);
    if (!connection)
      return await interaction.reply("⚠️No voice connection detected");

    const mooty = PlayerService.createOrGetExistingPlayer(interaction);

    mooty.shuffle();

    await interaction.reply({
      content: "*Shuffled songs*",
      embeds: [EmbedGenerator.getCurrentSongEmbed(mooty)],
    });
  },
};

export default Shuffle;
