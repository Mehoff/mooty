import { APIEmbedField, EmbedBuilder } from "discord.js";
import { MootyAudioPlayer } from "../services/player/mooty-audio-player";

const EMBED_COLOR = 0x0099ff;

export class EmbedGenerator {
  public static getSongAddedToQueueEmbed(
    mooty: MootyAudioPlayer
  ): EmbedBuilder {
    const song = mooty.isQueueEmpty()
      ? mooty.getCurrent()
      : mooty.getQueueLast();

    if (!song)
      return new EmbedBuilder()
        .setColor(EMBED_COLOR)
        .setTitle(`Added song to the queue`)
        .setTimestamp();

    const fields: APIEmbedField[] = [
      this._getInQueueField(mooty),
      this._getNextUpField(mooty),
    ];

    if (mooty.isPaused())
      fields.push({
        name: "Player is paused!😒",
        value: "Use **/resume** to un-pause player 🎶",
        inline: false,
      });

    return new EmbedBuilder()
      .setColor(EMBED_COLOR)
      .setTitle(`Added __**${song.title}**__ to the queue`)
      .addFields(fields)
      .setFooter({
        text: `Requested by ${song.requestedBy?.user.username}`,
        iconURL: song.requestedBy?.user.avatarURL({ size: 64 })!,
      })
      .setThumbnail(song.thumbnailUrl)
      .setTimestamp();
  }

  public static getNextSongPlayingEmbed(mooty: MootyAudioPlayer): EmbedBuilder {
    const current = mooty.getCurrent();

    if (!current)
      return new EmbedBuilder()
        .setColor(EMBED_COLOR)
        .setTitle(`Next song is playing`)
        .setTimestamp();

    return new EmbedBuilder()
      .setColor(EMBED_COLOR)
      .setTitle(`Next playing __**${current.title}**__`)
      .addFields([this._getInQueueField(mooty), this._getNextUpField(mooty)])
      .setFooter({
        text: `Requested by ${current.requestedBy?.user.username!}`,
        iconURL: current.requestedBy?.user.avatarURL({ size: 64 })!,
      })
      .setThumbnail(current.thumbnailUrl!) // TODO: Make set thumbnail optional with if-check
      .setTimestamp();
  }

  public static getCurrentSongEmbed(mooty: MootyAudioPlayer): EmbedBuilder {
    const song = mooty.getCurrent();

    if (!song)
      return new EmbedBuilder()
        .setColor(EMBED_COLOR)
        .setTitle("There is total silence, no song is being played")
        .setTimestamp();

    return new EmbedBuilder()
      .setTitle(`Currently playing __**${song.title}**__`)
      .addFields([this._getInQueueField(mooty), this._getNextUpField(mooty)])
      .setFooter({
        text: `Requested by ${song.requestedBy?.user.username!}`,
        iconURL: song.requestedBy?.user.avatarURL({ size: 64 })!,
      })
      .setThumbnail(song.thumbnailUrl!)
      .setTimestamp();
  }

  public static buildMessageEmbed(title: string, description: string = "") {
    const embed = new EmbedBuilder().setColor(EMBED_COLOR).setTitle(title);

    if (description) embed.setDescription(description);
    return embed;
  }

  public static getQueueFinishedEmbed(): EmbedBuilder {
    return new EmbedBuilder()
      .setColor(EMBED_COLOR)
      .setTitle("Queue has finished 👌")
      .setTimestamp();
  }

  private static _getNextUpString = (mooty: MootyAudioPlayer): string => {
    const next = mooty.getQueueFront();
    if (!next) return "😶 None";

    return `[${next.title}](${next.url})`;
  };

  private static _getInQueueField = (
    mooty: MootyAudioPlayer
  ): APIEmbedField => {
    let value = "";
    const length: number = mooty.getQueueLength();
    if (length === 0) value = "No songs";
    else value = length > 1 ? `${length} songs` : `${length} song`;

    return {
      name: "🎶 In queue",
      value,
      inline: true,
    };
  };

  private static _getNextUpField = (mooty: MootyAudioPlayer): APIEmbedField => {
    return {
      name: "⏭️ Next up",
      value: this._getNextUpString(mooty),
      inline: true,
    };
  };
}
