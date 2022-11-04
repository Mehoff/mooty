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
      { name: "Source link:", value: `[Link](${song.url})`, inline: true },
      {
        name: "⏭️ Next up:",
        value: `${mooty.isQueueEmpty() ? "None" : mooty.getQueueFront().title}`,
        inline: true,
      },
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
      .addFields([
        {
          name: "Source link:",
          value: `[Link](${current.url})`,
          inline: true,
        },
        {
          name: "⏭️ Next up:",
          value: `${
            mooty.isQueueEmpty() ? "None" : mooty.getQueueFront().title
          }`,
          inline: true,
        },
      ])
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
      .addFields([
        {
          name: "Source link:",
          value: `[Link](${song.url})`,
          inline: true,
        },
        {
          name: "⏭️ Next up:",
          value: `${
            mooty.isQueueEmpty() ? "None" : mooty.getQueueFront().title
          }`,
          inline: true,
        },
      ])
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
      .setTitle("Queue is finished")
      .setTimestamp();
  }
}
