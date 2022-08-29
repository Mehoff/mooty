import { CacheType, CommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../../types";

const Ping: Command = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong!"),
  execute: (interaction: CommandInteraction<CacheType>) => {
    return interaction.reply("Pong");
  },
};

export default Ping;
