import {
  AudioPlayer,
  AudioPlayerStatus,
  createAudioPlayer,
} from "@discordjs/voice";
import { ChatInputCommandInteraction, CacheType } from "discord.js";

export class PlayerService {
  public static playersMap: Map<string, AudioPlayer> = new Map<
    string,
    AudioPlayer
  >();

  static createOrGetExistingPlayer(
    interaction: ChatInputCommandInteraction<CacheType>
  ): AudioPlayer {
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

  static createPlayer(
    interaction: ChatInputCommandInteraction<CacheType>
  ): AudioPlayer {
    const player = createAudioPlayer();

    player.on(AudioPlayerStatus.Buffering, (err) => {
      interaction.channel?.send("Buffering");
    });

    player.on(AudioPlayerStatus.Idle, (err) => {
      interaction.channel?.send("Idle");
    });

    player.on(AudioPlayerStatus.Paused, (err) => {
      interaction.channel?.send("Paused");
    });

    player.on(AudioPlayerStatus.Playing, (oldState, newState) => {
      interaction.channel?.send("Playing");
    });

    player.on("error", (err) => {
      console.log("Player error: ");
      console.error(err);
    });

    return player;
  }
}
