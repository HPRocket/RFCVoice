import connect from './connect'
import play from './play'

export default [

    // { name: "connect", class: connect, autoJoin: false /* If another channel is specified, we don't auto-join. */, sameChannel: false },
    { name: "play", class: play, autoJoin: true, sameChannel: true },

]