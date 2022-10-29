import { pedersen } from "starknet/dist/utils/hash";
import { randomInt } from "math/";
import BN from "bignumber.js";

const P = new BN("800000000000011000000000000000000000000000000000000000000000001", 16);

export function randomGenerator(): number {
    return randomInt(P);
}

export function randomAndHash(): [number, string] {
    const s = randomGenerator();
    return [s, pedersen([s, new BN(0)])];
}

export function hash(x: number) {
    return pedersen([x, new BN(0)]);
}