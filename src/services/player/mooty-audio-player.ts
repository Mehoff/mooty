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
  Events,
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

    player.on(
      "stateChange",
      (oldState: AudioPlayerState, newState: AudioPlayerState) => {
        this._handlePlayerStateChange(oldState, newState);
      }
    );

    player.on("error", async (err: AudioPlayerError) => {
      if (err.message.includes("410")) {
        if (this._channel) {
          this._channel.send({
            embeds: [
              EmbedGenerator.buildMessageEmbed(
                "⚠️ Failed to play video",
                "Probably video you are trying to play is age-restricted! To play age-restricted videos - fill `YOUTUBE_3PSID` and `YOUTUBE_3PAPISID` environment variables. [More info on this topic](https://github.com/Walkyst/lavaplayer-fork/issues/18). If video is not age-restricted - contact bot owner"
              ),
            ],
          });
        }
        await this._onSongEnd();
      }

      console.log(err);
    });

    return player;
  }

  private async _handlePlayerStateChange(
    oldState: AudioPlayerState,
    newState: AudioPlayerState
  ) {
    const status = { oldStatus: oldState.status, newStatus: newState.status };

    switch (status.oldStatus) {
      case AudioPlayerStatus.Playing:
        {
          switch (status.newStatus) {
            case AudioPlayerStatus.Paused:
              await this._pausePlayer();
              break;
            case AudioPlayerStatus.Idle:
              this._onSongEnd();
              break;
          }
        }
        break;
      case AudioPlayerStatus.Paused:
        {
          switch (status.newStatus) {
            case AudioPlayerStatus.Playing:
              await this._resumePlayer();
              break;
            case AudioPlayerStatus.Idle:
              this._onSongEnd();
              break;
          }
        }
        break;
    }
  }

  private async _resumePlayer() {
    if (this._pausedMessage && this._pausedMessage.deletable) {
      await this._pausedMessage.delete();
      this._pausedMessage = null;
    }
  }

  private async _pausePlayer() {
    this._pausedMessage = await this._channel.send({
      embeds: [EmbedGenerator.buildMessageEmbed("⏸️ Player is paused")],
    });
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
