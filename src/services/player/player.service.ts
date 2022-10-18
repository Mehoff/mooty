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

  static deletePlayer(mooty: MootyAudioPlayer) {
    const exists = this.playersMap.get(mooty.guild.id);

    if (!exists) {
      console.error(
        `Failed to delete player: Player with specified guild id (${mooty.guild.id}) does not exist on playerMap`
      );
      return;
    }

    PlayerService.playersMap.delete(mooty.guild.id);
  }
}
