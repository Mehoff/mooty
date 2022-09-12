import { AudioPlayer } from "@discordjs/voice";
import { Readable } from "stream";
import { CacheType, ChatInputCommandInteraction } from "discord.js";

class Song {
  public title: string;
  public thumbnailUri?: string;
  public readable?: Readable;

  constructor(title: string, thumbnailUrl?: string) {
    this.title = title;
    this.thumbnailUri = thumbnailUrl;
  }
  static createSong(): Song {
    return new Song();
  }
}

export class Mooty {
  private _player: AudioPlayer;
  private _queue: Song[];

  constructor(player: AudioPlayer) {
    this._player = player;
    this._queue = [];
  }

  public addSongToQueue(song: Song) {
    this._queue.push(song);
  }

  public onSongFinish() {
    if (this._queue.length) {
      // Grab next
    }
  }
}
