export default function randomNumber(min: number, max: number) {

    // Inclusive Min, Inclusive Max
    return Math.floor(Math.random() * (max - min + 1) + min);

}
