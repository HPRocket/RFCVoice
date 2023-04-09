const { authorization } = require("play-dl")

authorization()

/*const myArray = ["hi", "how", "are", "you", "?"]

const arrayProxy = new Proxy(myArray, {
    get: (target, property) => {
        console.log(`Property ${property} has been read.`)
        return target[property]
    },
    set: (target, property, value) => {
        console.log(`Property ${property} is going to be reassigned value ${value}`)
        return target[property] = value
    }
})

console.log(arrayProxy[0])

arrayProxy[3] = "I"

console.log(arrayProxy)
console.log(myArray)*/
