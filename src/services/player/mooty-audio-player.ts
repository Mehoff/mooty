import {
  AudioPlayer,
  createAudioPlayer,
  AudioPlayerStatus,
  createAudioResource,
  getVoiceConnection,
  AudioPlayerError,
} from "@discordjs/voice";
import {
  ChatInputCommandInteraction,
  CacheType,
  EmbedBuilder,
  TextBasedChannel,
  Guild,
} from "discord.js";
import { EmbedGenerator } from "../../classes/embed-generator";
import { Song } from "../../classes/song";
import { YoutubeService } from "../youtube/youtube.service";
import { PlayerService } from "./player.service";

export class MootyAudioPlayer {
  private _current: Song | undefined;
  private _queue: Song[];
  private _player: AudioPlayer;
  private _channel: TextBasedChannel;
  private _guild: Guild;
  private _isPaused: boolean;

  constructor(interaction: ChatInputCommandInteraction<CacheType>) {
    this._player = createAudioPlayer();
    this._queue = [];
    this._current = undefined;
    this._isPaused = true;

    // Is this ok to ignore "Possibly undefined" warning here?
    this._channel = interaction.channel!;
    this._guild = interaction.guild!;

    this._player.on("stateChange", async (oldState, newState) => {
      if (
        oldState.status === AudioPlayerStatus.Playing &&
        newState.status === AudioPlayerStatus.Paused
      ) {
        this._channel
          .send({
            embeds: [EmbedGenerator.buildMessageEmbed("Song is paused")],
          })
          .then((msg) => setTimeout(() => msg.delete(), 3500));
      }

      if (
        oldState.status === AudioPlayerStatus.Paused &&
        newState.status === AudioPlayerStatus.Playing
      ) {
        this._channel
          .send({
            embeds: [EmbedGenerator.buildMessageEmbed("Song is resumed")],
          })
          .then((msg) => setTimeout(() => msg.delete(), 3500));
      }
    });
    this._player.on(AudioPlayerStatus.Idle, (err) => this._onSongEnd());
    this._player.on("error", (err: AudioPlayerError) => {
      // TODO: Handle 410 Error here;
      console.error(err);
    });
  }

  // get-set:

  private _setPaused = (value: boolean) => (this._isPaused = value);
  public isPaused = () => this._isPaused;

  private _setCurrent = (value: Song | undefined) => {
    this._setPaused(value ? false : true); // Probably not good
    this._current = value;
  };

  /**
   *
   * @returns Currently played song
   */
  public getCurrent = (): Song | undefined => this._current;

  /**
   *
   * @returns Discord audio player
   */
  public getPlayer = (): AudioPlayer => this._player;

  // private:

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

  /**
   * Triggers after new song was added to the queue
   */
  private async _onAddToQueue() {
    if (!this.getCurrent()) {
      if (this._queue.length > 0) {
        this._setCurrent(this._queue.pop());
        this._play(this.getCurrent()?.url!);
      }
    }
  }

  private async _onSongEnd() {
    // While we are skipping the song, lets ensure that we are not playing anything
    this._setCurrent(undefined);

    // Check if queue has any more songs
    if (this._queue.length > 0) {
      this._setCurrent(this._queue.pop());
      this._play(this.getCurrent()?.url!);

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

  // public:

  /**
   *
   * @param song Song to add
   * @returns Embeded discord message
   */
  public async addSong(song: Song): Promise<EmbedBuilder> {
    this._addToQueue(song);
    return EmbedGenerator.getSongAddedToQueueEmbed(this);
  }

  /**
   * Skips currently played song
   */
  public skip() {
    this._setCurrent(undefined);
    this._player.stop();
  }

  public pause() {
    this._setPaused(true);
    this._player.pause();
  }

  public resume() {
    this._setPaused(false);
    this._player.unpause();
  }

  public isQueueEmpty = () => !(this._queue.length > 0);

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
