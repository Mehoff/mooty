import { EmbedBuilder } from "discord.js";
import { MootyAudioPlayer } from "../services/player/mooty-audio-player";

// TODO: Add next-up inline message later on

export class EmbedGenerator {
  public getSongAddedToQueueEmbed(mooty: MootyAudioPlayer): EmbedBuilder {
    const song = mooty.queue.length
      ? mooty.queue[mooty.queue.length - 1]
      : mooty.current;

    if (!song)
      return new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle(`Added song to the queue`)
        .setTimestamp();

    return new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle(`Added __**${song.title}**__ to the queue`)
      .addFields([
        { name: "Source link:", value: `[Link](${song.url})` },
        {
          name: "Songs in queue",
          value: `${mooty.queue.length ? mooty.queue.length : "None"}`,
          inline: true,
        },
      ])
      .setFooter({ text: `Requested by ${song.requestedBy}` })
      .setThumbnail(song.thumbnailUrl)
      .setTimestamp();
  }

  public getNextSongPlayingEmbed(mooty: MootyAudioPlayer): EmbedBuilder {
    if (!mooty.current)
      return new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle(`Next song is playing`)
        .setTimestamp();

    return new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle(`Next playing __**${mooty.current.title}**__`)
      .addFields([
        { name: "Source link:", value: `[Link](${mooty.current.url})` },
        {
          name: "Songs in queue: (/queue to list)",
          value: `${mooty.queue.length ? mooty.queue.length : "None"}`,
          inline: true,
        },
      ])
      .setURL(mooty.current.url)
      .setFooter({ text: `Requested by ${mooty.current.requestedBy}` })
      .setThumbnail(mooty.current.thumbnailUrl)
      .setTimestamp();
  }

  public getQueueFinishedEmbed(mooty: MootyAudioPlayer): EmbedBuilder {
    return new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle("Queue is finished")
      .setTimestamp();
  }
}
