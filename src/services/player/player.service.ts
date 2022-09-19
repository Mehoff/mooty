import {
  AudioPlayer,
  AudioPlayerStatus,
  createAudioPlayer,
} from "@discordjs/voice";
import { ChatInputCommandInteraction, CacheType } from "discord.js";
import { Song } from "../../classes/song";

export class MootyAudioPlayer {
  public player: AudioPlayer;
  public queue: Song[];
  public current: Song | null;

  constructor(interaction: ChatInputCommandInteraction<CacheType>) {
    this.player = createAudioPlayer();
    this.queue = [];
    this.current = null;

    this.player.on(AudioPlayerStatus.Buffering, (err) => {
      interaction.channel?.send("Buffering");
    });

    this.player.on(AudioPlayerStatus.Idle, (err) => {
      interaction.channel?.send("Idle");
    });

    this.player.on(AudioPlayerStatus.Paused, (err) => {
      interaction.channel?.send("Paused");
    });

    this.player.on(AudioPlayerStatus.Playing, (oldState, newState) => {
      interaction.channel?.send("Playing");
    });

    this.player.on("error", (err) => {
      console.log("Player error: ");
      console.error(err);
    });
  }

  onAddToQueue() {
    console.log("Add to queue");
  }

  onSongEnd() {
    // Check if queue has any more songs
    console.log("Song end...");
  }

  addSong(song: Song) {
    this.queue.push(song);
  }
}

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

  static createPlayer(
    interaction: ChatInputCommandInteraction<CacheType>
  ): MootyAudioPlayer {
    const player = new MootyAudioPlayer(interaction);
    return player;
  }

  static addSong(interaction: ChatInputCommandInteraction<CacheType>) {}
}
