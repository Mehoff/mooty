# Massive TODO File

Flow of player:

### Scenario 1

#### State:

- connected: false
- queue: []

/play song

- Check if possible to connect to voice channel
- Create MootyPlayer, connect to voice channel
- Create `Song` object from input
- Hand `Song` to `MootyPlayer`, it should figure out actions with it on its own
- `Mooty` has to have a _lifecycle_
- On _play_ push Song to queue, and trigger _onAddToQueue_ function which should do actions according to current player state, if current `Song` in `NULL` should move `Song` to current from `queue`.
- Call `YTService.getReadable(this.current)` and hand `Readable` to Discord's `player.play(readable)` function
- On `player.on('finish')` -> call _onPlayerFinish_ of `PlayerService` to hand over `Song` from `queue` or destoy connection and leave channel
