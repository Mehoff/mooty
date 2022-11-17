import { CacheType, CommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../interfaces";

const Foo: Command = {
  data: new SlashCommandBuilder()
    .setName("foo")
    .setDescription("Replies with Foo!"),
  execute: (interaction: CommandInteraction<CacheType>) => {
    return interaction.reply("Foo");
  },
};

export default Foo;
