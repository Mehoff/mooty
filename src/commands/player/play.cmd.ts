import {
  CacheType,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import { Command } from "../../../types";
import { YTDLService } from "../../services/player.service";

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
    const query = interaction.options.getString("query");
    if (!query) return await interaction.reply("Bad query, try again");

    const result = await YTDLService.handleQuery(query);
    if (result) return await interaction.reply(result);
  },
};

export default Play;
