import { computeHashOnElement, pedersen } from 'starknet.js';
import { randomGenerator, hash, randomAndHash } from './utils.tsx';
import { sign, verifyIntegrity, verifySig } from './verification.tsx';

const stateTable:object[];

export function makeState1(gameId: number, privKeyA: string): [object, string] {
    const [s1, h1] = randomAndHash();
    const state1 = {
        'gameId' : gameId,
        'h1' : h1,
        'type' = 1,
    };
    const stateHash = computeHashOnElement([state1.gameId, state1.h1, state1.type]);
    const sig = sign(privKeyA, stateHash);
    stateTable.push(state1);
    return [state1, sig];
}

export function makeState2(state1, sigState1, gameId, oldH1, pubKeyA, privKeyB): [object, string]  {
    verifyIntegrity([[state1.gameId, gameId], [state.type, 1], [oldH1, state1.h1]]);
    const state1Hashed = computeHashOnElement([state1.gameId, state1.h1, state1.type]);
    verifySig(sigState1, pubKeyA, state1Hashed);
    const s2 = randomGenerator();
    const state2 = {
       'gameId' : gameId,
       'prevStateHash' : state1Hashed,
       's2' : s2,
       'h1' : state1.h1,
       'type' : 2
    };
    const stateHash = computeHashOnElement([state2.gameId, state2.prevStateHash, state2.h1, state2.type]);
    const sig = sign(privKeyB, stateHash);
    stateTable.push(state2);
    return [state2, sig];
}

export function makeState3(state2, sigState2, gameId, s1, oldS2, pubKeyB, privKeyA): [object, string] {
    verifyIntegrity([[state2.gameId, gameId], [state2.type, 2], [hash(s1), h1]]);
    const state2Hashed = computeHashOnElement([state2.gameId, state2.prevStateHash, state2.s2, state2.h1, state2.type]);
    verifySig(sigState2, pubKeyB, state2Hashed);
    const startingCard = pedersen(s1, oldS2);
    const state3 = {
        'gameId': gameId,
        'prevStateHash': state2Hashed,
        's1': s1,
        'startingCard': startingCard,
        'type': 3
    };
    const stateHash = computeHashOnElement([]);
    const sig = sign(privKeyA, stateHash);
    stateTable.push(state3);
    return [state3, sig];
}
