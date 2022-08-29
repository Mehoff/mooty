import {
  APIApplicationCommandOptionChoice,
  CacheType,
  CommandInteraction,
  CommandInteractionOptionResolver,
  Interaction,
  SlashCommandBuilder,
  SlashCommandStringOption,
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
  // execute: (interaction: CommandInteraction<CacheType>) => {
  //   // interaction.reply({ body: interaction.options.get("option") });
  //   const option = interaction.options.get<string>("option", true);
  //   if (option) interaction.reply({ content: option.value });
  // },
  execute: (interaction: CommandInteraction<CacheType>) => {
    const val = interaction.options;
  },
};

export default Test;
