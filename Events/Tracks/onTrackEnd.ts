import { AudioPlayerStatus, getVoiceConnection } from "@discordjs/voice";
import Queue from "../../Classes/Music/Queue/Queue";
import TrackEntry from "../../Classes/Music/Track";

export default async function onTrackEnd(Queue: Queue) { // FEATURE: "Now Playing" Notifications sent on track change.

    let idleTimer: NodeJS.Timeout
    Queue.player.on(AudioPlayerStatus.Idle, async () => {

        // Try to advance the queue resource
        const currentTrackIndex = Queue.findTrackIndex(Queue.currentTrack!)
        let advance


        if (Queue.settings.shuffle) { // Shuffle mode is on

            Queue.currentTrack.shufflePlayed = true // Set the recently played track to already played.

            let notShuffledTracks: TrackEntry[] = []
            for (const track of Queue.guildQueue) {

                if (track.shufflePlayed) continue;
                notShuffledTracks.push(track)

            }



            if (notShuffledTracks.length == 0) {

                // Shuffle Queue Finished; Restart
                for (const track of Queue.guildQueue) {
                    track.shufflePlayed = false
                }

                notShuffledTracks = Queue.guildQueue // Allow all tracks to be in the random pool

            }

            const randomTrack = notShuffledTracks[Math.floor(Math.random() * (notShuffledTracks.length - 0) + 0)]
            const randomTrackIndex = Queue.findTrackIndex(randomTrack)
            advance = await Queue.goto(randomTrackIndex)

        } else { // Shuffle mode is not on

            advance = await Queue.goto(currentTrackIndex! + 1)

        }


        if (!advance) {

            // Unable? Create Idle Timer
            idleTimer = setTimeout(() => {

                const connection = getVoiceConnection(Queue.guildId)
                if (connection) {
                    connection.destroy();
                }

            }, Number(process.env.TIMEOUT_MS))
            
        } else {
            
            return true;
        
        }
    })

    Queue.player.on(AudioPlayerStatus.Playing, async () => {
        clearTimeout(idleTimer) // Destroy Idle Timer
    })

}
