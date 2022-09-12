import {
  AudioPlayer,
  AudioPlayerError,
  createAudioPlayer,
  CreateAudioPlayerOptions,
  NoSubscriberBehavior,
} from "@discordjs/voice";

// deprecated?
export class Player {
  constructor() {
    const createAudioPlayerOptions: CreateAudioPlayerOptions = {
      behaviors: {
        noSubscriber: NoSubscriberBehavior.Pause,
      },
      debug: true,
    };

    this.audioPlayer = createAudioPlayer(createAudioPlayerOptions);
    this.audioPlayer.on("debug", (message: string) => {
      console.debug(message);
    });
    this.audioPlayer.on("error", (error: AudioPlayerError) => {
      console.error(error.message);
      console.info(error.stack);
    });
  }

  private audioPlayer: AudioPlayer;

  // Pass interactions in params?
  public play() {
    console.log("Play");
  }

  public stop() {
    if (this.audioPlayer) this.audioPlayer.stop();
  }
}
