import { pedersen } from 'starknet.js'
import { randomInt } from 'math.js'
import BN from "bn.js"

const P = new BN("800000000000011000000000000000000000000000000000000000000000001", 16)

function randomGenerator() {
    return randomInt(P);
}

function randomAndHash() {
    const s = randomGenerator();
    return [s, pedersen(s, 0)];
}
