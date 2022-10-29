import { pedersen } from 'starknet.js';
import { randomInt } from 'math.js';
import BN from "bn.js";

const P = new BN("800000000000011000000000000000000000000000000000000000000000001", 16);

export function randomGenerator(): number {
    return randomInt(P);
}

export function randomAndHash(): [number, string] {
    const s = randomGenerator();
    return [s, pedersen(s, 0)];
}
