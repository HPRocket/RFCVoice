import { Snowflake } from "discord.js"

export default {

    responses: {

        "channel": {

            "disconnect": (channelId: Snowflake) => `Disconnected from <#${channelId}>.`,

        },

        "permissions": {

            "joinChannel": `Please join my voice channel to run this command!`,
            "vcRequired": `Please connect me to a voice channel to run this command!`

        },

        "queue": {

            "buttons": {

                "pageExpire": `This embed has expired! You can make a new one using ${"`"}/queue${"`"}.`,
                "pageFail": `Could not go to the requested page.`,
                "permissionsFail": `Make your own embed using ${"`"}/queue${"`"} to use this feature.`

            },

            "channel": `Channel`, // The word "channel" in the language of the file; used in the description of the embed

            "pageCount": (currentPage: number, totalPages: number) => `Page ${currentPage} of ${totalPages}.`, // Footer of the embed

            "playing": {

                "none": `${"`"}No track is currently playing.${"`"}`,
                "pause": "Pausing the queue.",
                "resume": "Resuming the queue."

            },

            "status": {
                "loop": {
                    "none": `🟦｜Not looping.`,
                    "queue": `🔁｜Looping the queue.`,
                    "track": `🔂｜Looping the current track.`,
                },
                "paused": `⏸️｜The queue is currently paused.`,
                "shuffle": `🔀｜Shuffling the queue.`
            },

            "title": `Queue`, // Title of the embed

            "track": (position: number, title: string, source: string, authors: string, current?: boolean) => `**${current ? ">>" : ""} ${position}:**    [${title}](${source})\nBy: ${"`"}${authors}${"`"}`,

        },

        "tracks": {

            "add": {
                "trackCount": (count: number) => `Queued ${count} tracks.`,
                "trackInfo": (title: string, source: string, authors: string) => `Queued [${title}](${source}) by ${"`"}${authors}${"`"}.`
            },

            "clear": "Cleared the queue.",

            "goto": {
                "fail": (trackIndex: number) => `Could not go to ${"`"}${trackIndex}${"`"}.`,
                "success": (trackIndex: number, title: string, source: string, authors: string) => `Went to ${"`"}${trackIndex}${"`"}\n[${title}](${source}) by ${"`"}${authors}${"`"}.`,
            },

            "loop": {
                "queue": {
                    "off": `Stopped looping the queue.`,
                    "on": `Now looping the queue.`,
                },
                "track": {
                    "off": `Stopped looping the current track.`,
                    "on": `Now looping the current track.`,
                }
            },

            "move": {
                "fail": (newPos: number) => `Could not move the track to ${"`"}${newPos}${"`"}.`,
                "success": (trackPos: number, newPos: number) => `Moved the track at ${"`"}${trackPos}${"`"} to ${"`"}${newPos}${"`"}.`,
            },

            "remove": {
                "fail": (trackPos: number) => `Could not find a track at ${"`"}${trackPos}${"`"}.`,
                "success": (trackPos: number, title: string, source: string, authors: string) => `Removed [${title}](${source}) by ${"`"}${authors}${"`"} from position ${"`"}${trackPos}${"`"}.`,
            },

            "seek": {
                "fail": (seconds: number) => `Could not seek the track ${"`"}${seconds}${"`"} seconds.`,
                "success": {
                    "backwards": (seconds: number) => `Went backwards ${"`"}${seconds}${"`"} seconds.`,
                    "forwards": (seconds: number) => `Went forwards ${"`"}${seconds}${"`"} seconds.`,
                },
            },

            "shuffle": {
                "off": `Stopped shuffling the queue.`,
                "on": `Now shuffling the queue.`,
            },

            "skip": (newTitle: string, newSource: string, newAuthors: string) => `Skipped [${newTitle}](${newSource}) by ${"`"}${newAuthors}${"`"}.`,

        },
        
    },

}
