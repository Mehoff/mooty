import { GuildMember } from "discord.js";

export class Song {
  public title: string;
  public thumbnailUrl: string;
  public url: string;

  // Possibly undefined because possibly when we will add 'Radio' mode, there will be no 'requestedBy' member
  public requestedBy?: GuildMember | undefined;

  constructor(
    title: string,
    thumbnailUrl: string,
    url: string,
    requestedBy: GuildMember | undefined = undefined // What if song was not set by GuildMember?
  ) {
    this.url = url;
    this.thumbnailUrl = thumbnailUrl;
    this.title = title;

    if (requestedBy) this.requestedBy = requestedBy;
  }
}
