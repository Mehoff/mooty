import {
  AudioPlayer,
  createAudioPlayer,
  AudioPlayerStatus,
  createAudioResource,
  getVoiceConnection,
  AudioPlayerError,
  AudioPlayerState,
} from "@discordjs/voice";
import {
  ChatInputCommandInteraction,
  CacheType,
  EmbedBuilder,
  TextBasedChannel,
  Guild,
  Message,
} from "discord.js";
import { EmbedGenerator, Song } from "../../classes";
import { shuffle } from "../../helpers";
import { YoutubeService } from "../youtube/youtube.service";
import { PlayerService } from "./player.service";

export class MootyAudioPlayer {
  private _current: Song | undefined;
  private _queue: Song[];
  private _player: AudioPlayer;
  private _channel: TextBasedChannel;
  private _guild: Guild;
  private _paused: boolean;
  private _pausedMessage: Message<true> | Message<false> | null;

  constructor(interaction: ChatInputCommandInteraction<CacheType>) {
    this._player = this._createAudioPlayer();
    this._queue = [];
    this._current = undefined;
    this._paused = true;

    this._pausedMessage = null;

    // Is this ok to ignore "Possibly undefined" warning here?
    this._channel = interaction.channel!;
    this._guild = interaction.guild!;
  }

  private _createAudioPlayer(): AudioPlayer {
    const player = createAudioPlayer();

    player.on("stateChange", this.handlePlayerStateChange);
    player.on("error", (err: AudioPlayerError) => {
      // TODO: Handle 410 Error here;
      console.error(err);
    });

    return player;
  }

  // Kind of refactored, but I think there is still a cleaner solution to this case
  private async handlePlayerStateChange(
    oldState: AudioPlayerState,
    newState: AudioPlayerState
  ) {
    const status = { oldStatus: oldState.status, newStatus: newState.status };

    switch (status) {
      case {
        oldStatus: AudioPlayerStatus.Paused,
        newStatus: AudioPlayerStatus.Playing,
      }:
        this._pausedMessage = await this._channel.send({
          embeds: [EmbedGenerator.buildMessageEmbed("⏸️ Player is paused")],
        });
        break;
      case {
        oldStatus: AudioPlayerStatus.Playing,
        newStatus: AudioPlayerStatus.Paused,
      }:
        if (this._pausedMessage && this._pausedMessage.deletable) {
          await this._pausedMessage.delete();
          this._pausedMessage = null;
        }
        break;
      case {
        oldStatus: AudioPlayerStatus.Playing,
        newStatus: AudioPlayerStatus.Idle,
      }:
        this._onSongEnd();
        break;
    }
  }

  public get paused() {
    return this._paused;
  }

  private set paused(value: boolean) {
    this._paused = value;
  }

  public get current(): Song | undefined {
    return this._current;
  }

  private set current(value: Song | undefined) {
    this.paused = !value;
    this._current = value;
  }

  public get player(): AudioPlayer {
    return this._player;
  }

  private async _play(url: string) {
    this._player.play(
      createAudioResource(await YoutubeService.getReadable(url))
    );
  }

  private async _addToQueue(song: Song) {
    this._queue.push(song);
    await this._onAddToQueue();
  }

  private async _disconnect() {
    const connection = getVoiceConnection(this._guild.id);
    await connection?.disconnect();
  }

  private async _onAddToQueue() {
    if (!this.current) {
      if (this._queue.length > 0) {
        this.current = this._queue.shift();
        this._play(this.current?.url!);
      }
    }
  }

  private async _onSongEnd() {
    // While we are skipping the song, lets ensure that we are not playing anything
    this.current = undefined;

    // Check if queue has any more songs
    if (this._queue.length > 0) {
      this.current = this._queue.shift();
      this._play(this.current?.url!);

      await this._channel.send({
        embeds: [EmbedGenerator.getNextSongPlayingEmbed(this)],
      });
    } else {
      await this._onQueueFinish();
    }
  }

  private async _onQueueFinish() {
    await this._channel.send({
      embeds: [EmbedGenerator.getQueueFinishedEmbed()],
    });

    this._player.stop();

    await this._disconnect();
    PlayerService.deletePlayer(this._guild);
  }

  /**
   *
   *
   * @param song Song to add
   * @returns Embeded discord message
   */
  public async addSong(song: Song): Promise<EmbedBuilder> {
    this._addToQueue(song);
    return EmbedGenerator.getSongAddedToQueueEmbed(this);
  }

  public async skip() {
    await this._onSongEnd();
  }

  public pause() {
    this.paused = true;
    this._player.pause();
  }

  public resume() {
    this.paused = false;
    this._player.unpause();
  }

  public shuffle() {
    // TODO: Send error or smth
    if (this._queue.length < 2) return;

    this._queue = shuffle(this._queue);
  }

  public isQueueEmpty = () => !(this._queue.length > 0);

  public getQueueLength = () => this._queue.length;

  public getFromQueueByIndex(index: number): Song {
    if (index > this._queue.length - 1 || index < 0)
      throw new RangeError("Queue index is out of range");

    return this._queue[index];
  }

  public getQueueLast(): Song {
    return this._queue[this._queue.length - 1];
  }

  public getQueueFront(): Song {
    return this._queue[0];
  }
}
