import disconnect from './disconnect'
import play from './play'
import pause from './pause'
import resume from './resume'
import remove from './remove'
import move from './move'
import skip from './skip'
import goto from './goto'
import clear from './clear'
import queue from './queue'
import loop from './loop'
import shuffle from './shuffle'
import seek from './seek'

export default [

    { name: "play", class: play, autoJoin: true, sameChannel: true },
    { name: "pause", class: pause, autoJoin: false, sameChannel: true },
    { name: "resume", class: resume, autoJoin: false, sameChannel: true },
    { name: "disconnect", class: disconnect, autoJoin: false, sameChannel: false },
    { name: "remove", class: remove, autoJoin: false, sameChannel: true },
    { name: "move", class: move, autoJoin: false, sameChannel: true },
    { name: "skip", class: skip, autoJoin: false, sameChannel: true },
    { name: "goto", class: goto, autoJoin: false, sameChannel: true },
    { name: "clear", class: clear, autoJoin: false, sameChannel: true },
    { name: "queue", class: queue, autoJoin: false, sameChannel: false },
    { name: "loop", class: loop, autoJoin: false, sameChannel: true },
    { name: "shuffle", class: shuffle, autoJoin: false, sameChannel: true },
    { name: "seek", class: seek, autoJoin: false, sameChannel: true },

]
