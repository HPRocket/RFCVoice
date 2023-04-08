import disconnect from './disconnect'
import play from './play'
import remove from './remove'

export default [

    // { name: "connect", class: connect, autoJoin: false /* If another channel is specified, we don't auto-join. */, sameChannel: false },
    { name: "play", class: play, autoJoin: true, sameChannel: true },
    { name: "disconnect", class: disconnect, autoJoin: false, sameChannel: false },
    { name: "remove", class: remove, autoJoin: false, sameChannel: true }

]