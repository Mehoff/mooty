import { getVoiceConnection } from "@discordjs/voice";
import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  CacheType,
} from "discord.js";
import { EmbedGenerator } from "../../classes";
import { PlayerService } from "../../services/player/player.service";
import { Command } from "../../interfaces";

const Search: Command = {
  data: new SlashCommandBuilder()
    .setName("search")
    .setDescription("Searches for videos by query and lists results")
    .addStringOption((option) =>
      option
        .setName("query")
        .setDescription("Enter search input")
        .setRequired(true)
        .setMinLength(3)
        .setMaxLength(499)
    ),
  execute: async (interaction: ChatInputCommandInteraction<CacheType>) => {
    const member = interaction.guild!.members.cache.get(
      interaction.member?.user.id!
    );

    if (!member || !member.voice.channelId) {
      return await interaction.reply({
        embeds: [
          EmbedGenerator.buildMessageEmbed(
            "⚠️ Failed to process command",
            "Member is not in a voice channel"
          ),
        ],
      });
    }
  },
};

export default Search;
