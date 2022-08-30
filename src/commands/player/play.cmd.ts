import {
  CacheType,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import { Command } from "../../../types";

const Play: Command = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Plays the youtube video")
    .addStringOption((option) =>
      option
        .setName("query")
        .setDescription("Enter video URL or search input")
        .setRequired(true)
    ),
  execute: async (interaction: ChatInputCommandInteraction<CacheType>) => {
    const query = interaction.options.getString("query");
    return await interaction.reply(query ? query : "Null query");
  },
};

export default Play;
