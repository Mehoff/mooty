import { GuildMember } from "discord.js";

export class Song {
  public title: string;
  public thumbnailUrl: string;
  public url: string;
  public requestedBy?: GuildMember;

  constructor(
    title: string,
    thumbnailUrl: string,
    url: string,
    requestedBy: GuildMember // What if song was not set by GuildMember?
  ) {
    this.url = url;
    this.thumbnailUrl = thumbnailUrl;
    this.title = title;
    this.requestedBy = requestedBy;
  }
}
