import disconnect from './disconnect'
import play from './play'
import remove from './remove'
import move from './move'
import skip from './skip'
import goto from './goto'
import clear from './clear'

export default [

    // { name: "connect", class: connect, autoJoin: false /* If another channel is specified, we don't auto-join. */, sameChannel: false },
    { name: "play", class: play, autoJoin: true, sameChannel: true },
    { name: "disconnect", class: disconnect, autoJoin: false, sameChannel: false },
    { name: "remove", class: remove, autoJoin: false, sameChannel: true },
    { name: "move", class: move, autoJoin: false, sameChannel: true },
    { name: "skip", class: skip, autoJoin: false, sameChannel: true },
    { name: "goto", class: goto, autoJoin: false, sameChannel: true },
    { name: "clear", class: clear, autoJoin: false, sameChannel: true },

]
