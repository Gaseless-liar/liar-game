import { computeHashOnElement, sign } from 'starknet.js';
import { random }

export function makeState1(gameId: number, priv_key_A: string): void {
    const 
    const state1 = {
        gameId : gameId,
        h1 : ,
        type = 1
    }
    const stateHash = computeHashOnElement([state1.gameId, state1.h1, state1.type]);
    const sig = sign()
    return [state1, sig];
}
