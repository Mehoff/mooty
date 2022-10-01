import { ChatInputCommandInteraction, CacheType } from "discord.js";
import { MootyAudioPlayer } from "./mooty-audio-player";

export class PlayerService {
  public static playersMap: Map<string, MootyAudioPlayer> = new Map<
    string,
    MootyAudioPlayer
  >();

  static createOrGetExistingPlayer(
    interaction: ChatInputCommandInteraction<CacheType>
  ): MootyAudioPlayer {
    if (!interaction.guildId)
      throw new Error("Interaction does not have guild data");

    const exists = this.playersMap.get(interaction.guildId);
    if (!exists) {
      const newPlayer = this.createPlayer(interaction);
      this.playersMap.set(interaction.guildId, newPlayer);

      return newPlayer;
    }
    return exists;
  }

  static createPlayer = (interaction: ChatInputCommandInteraction<CacheType>) =>
    new MootyAudioPlayer(interaction);
}
