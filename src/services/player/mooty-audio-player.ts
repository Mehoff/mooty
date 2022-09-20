import {
  AudioPlayer,
  createAudioPlayer,
  AudioPlayerStatus,
  createAudioResource,
} from "@discordjs/voice";
import { ChatInputCommandInteraction, CacheType } from "discord.js";
import { Song } from "../../classes/song";
import { YoutubeService } from "../youtube/youtube.service";
import { Readable } from "stream";

export class MootyAudioPlayer {
  public player: AudioPlayer;
  public queue: Song[];
  public current: Song | undefined;

  constructor(interaction: ChatInputCommandInteraction<CacheType>) {
    this.player = createAudioPlayer();
    this.queue = [];
    this.current = undefined;

    this.player.on(AudioPlayerStatus.Buffering, (err) => {
      interaction.channel?.send("Buffering");
    });

    this.player.on(AudioPlayerStatus.Idle, (err) => {
      interaction.channel?.send("Idle");

      this.onSongEnd();
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

  async onAddToQueue() {
    console.log("Add to queue");
    // Remember to set current to `undefined` on queue finish
    if (!this.current) {
      if (this.queue.length > 0) {
        this.current = this.queue.pop();
        this.player.play(
          createAudioResource(
            await YoutubeService.getReadable(this.current?.url!)
          )
        );
      }
    }
  }

  async onSongEnd() {
    this.current = undefined;
    // Check if queue has any more songs
    if (this.queue.length > 0) {
      this.current = this.queue.pop();
      this.player.play(
        createAudioResource(
          await YoutubeService.getReadable(this.current?.url!)
        )
      );
    }
  }

  addSong(song: Song) {
    this.queue.push(song);
    this.onAddToQueue();
  }
}
