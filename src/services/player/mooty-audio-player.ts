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
  private current: Song | undefined;
  private queue: Song[];
  private player: AudioPlayer;
  private channel: TextBasedChannel;
  private guild: Guild;

  public embedGenerator: EmbedGenerator;

  constructor(interaction: ChatInputCommandInteraction<CacheType>) {
    this.player = createAudioPlayer();
    this.queue = [];
    this.current = undefined;

    // Is this ok to ignore "Possibly undefined" warning here?
    this.channel = interaction.channel!;
    this.guild = interaction.guild!;

    this.player.on(AudioPlayerStatus.Idle, (err) => this._onSongEnd());
    this.player.on("error", (err: AudioPlayerError) => {
      // TODO: Handle 410 Error here;
      console.error(err);
    });

    this.embedGenerator = new EmbedGenerator();
  }

  // get-set:

  private _setCurrent = (value: Song | undefined) => (this.current = value);

  /**
   *
   * @returns Currently played song
   */
  public getCurrent = (): Song | undefined => this.current;

  /**
   *
   * @returns Discord audio player
   */
  public getPlayer = (): AudioPlayer => this.player;

  // private:

  private async _play(url: string) {
    this.player.play(
      createAudioResource(await YoutubeService.getReadable(url))
    );
  }

  private async _addToQueue(song: Song) {
    this.queue.push(song);
    await this._onAddToQueue();
  }

  private async _disconnect() {
    const connection = getVoiceConnection(this.guild.id);
    await connection?.disconnect();
  }

  /**
   * Triggers after new song was added to the queue
   */
  private async _onAddToQueue() {
    if (!this.getCurrent()) {
      if (this.queue.length > 0) {
        this._setCurrent(this.queue.pop());
        this._play(this.getCurrent()?.url!);
      }
    }
  }

  private async _onSongEnd() {
    // While we are skipping the song, lets ensure that we are not playing anything
    this._setCurrent(undefined);

    // Check if queue has any more songs
    if (this.queue.length > 0) {
      this._setCurrent(this.queue.pop());
      this._play(this.getCurrent()?.url!);

      await this.channel.send({
        embeds: [this.embedGenerator.getNextSongPlayingEmbed(this)],
      });
    } else {
      await this._onQueueFinish();
    }
  }

  private async _onQueueFinish() {
    await this.channel.send({
      embeds: [this.embedGenerator.getQueueFinishedEmbed()],
    });

    this.player.stop();

    await this._disconnect();
    PlayerService.deletePlayer(this.guild);
  }

  // public:

  /**
   *
   * @param song Song to add
   * @returns Embeded discord message
   */
  public async addSong(song: Song): Promise<EmbedBuilder> {
    this._addToQueue(song);
    return this.embedGenerator.getSongAddedToQueueEmbed(this);
  }

  /**
   * Skips currently played song
   */
  public skip() {
    this._setCurrent(undefined);
    this.player.stop();
  }

  public isQueueEmpty = () => !(this.queue.length > 0);

  public getFromQueueByIndex(index: number): Song {
    if (index > this.queue.length - 1 || index < 0)
      throw new RangeError("Queue index is out of range");

    return this.queue[index];
  }

  public getQueueLast(): Song {
    return this.queue[this.queue.length - 1];
  }

  public getQueueFront(): Song {
    return this.queue[0];
  }
}
