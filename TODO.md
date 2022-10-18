# Massive TODO File (also a diary-like document)

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

## Interaction responses 01/10/22

### User stories

- When user adds new song to queue, we should build embeded-message with indication of it.
- When current song ends, and there is new starting - send a embeded-message that indicates this
- When current song ends, must send embeded-message which indicates this

### TODO

- Create embed-messages service class, which will handle creation of emebeds based on MootyPlayer context and request
- On `skip` if `queue.length` is 0 - disconnect from channel, send specified message, destroy player.
- Add small avatar on embed message

## /current

- Shows current song that is being played

## Disconnect on queue end

- Disconnect when there is no song to be played for this channel
- Ensure all settings are set to defaults (in case we will try to play next song after disconnect)
- Fix "The application did not respond" response on `/skip` on last song
- Fix double 'Queue is finished' message
