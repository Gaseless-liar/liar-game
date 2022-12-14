import { pedersen } from "starknet/dist/utils/hash";

export function randomGenerator(): number {
    return Math.floor(Math.random()*Number.MAX_SAFE_INTEGER);
}

export function randomAndHash(): [number, string] {
    const s = randomGenerator();
    return [s, pedersen([s, 0])];
}

export function hash(x: number): string {
    return pedersen([x, 0]);
}

export function generateDisputeId() {
    return Math.floor(Math.random()*9999999999);
}

export function deduceCards(ownSecrets: number[], opponentSecrets: number[]) {
    let cards : any = [];
    ownSecrets.forEach((item, index, arr) => {
        cards[index] = pedersen([item, opponentSecrets[index]]);
    });
    return [cards];
}