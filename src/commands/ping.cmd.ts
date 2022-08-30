import {
  CacheType,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import { Command } from "../../types";

const Test: Command = {
  data: new SlashCommandBuilder()
    .setName("test")
    .setDescription("Replies with Pong!")
    .addStringOption((option) =>
      option
        .setName("option")
        .setDescription("Option description")
        .setRequired(true)
        .addChoices(
          { name: "Tres", value: "Tres" },
          { name: "Uno", value: "Uno" }
        )
    ),
  execute: (interaction: ChatInputCommandInteraction<CacheType>) => {
    const val = interaction.options.getString("option");
    if (val) {
      return interaction.reply(val);
    }
  },
};

export default Test;
