import { Signature } from 'starknet';
import { computeHashOnElements, pedersen } from 'starknet/utils/hash';
import { BigNumberish } from 'starknet/utils/number';
import { randomGenerator, hash, randomAndHash } from './utils';
import { signH, verifyIntegrity, verifySig } from './verification';

const stateTable:any[] = [];

//renvoie message au front
//+ info  + disputeID

export function makeState1(gameId: number, privKeyA: string): [any, Signature] {
    const [s1, h1] = randomAndHash();
    const state1 = {
        'gameId' : gameId,
        'h1' : h1,
        'type' : 1,
    };
    const stateHash = computeHashOnElements([state1.gameId, state1.h1, state1.type]);
    const sig = signH(privKeyA, stateHash);
    stateTable.push(state1);
    return [state1, sig];
}

export function makeState2(state1: any, sigState1: Signature, gameId: number, oldH1: string, pubKeyA: BigNumberish, privKeyB: BigNumberish): [any, Signature]  {
    if (!verifyIntegrity([[state1.gameId, gameId], [state1.type, 1], [oldH1, state1.h1]])) {

    }
    const state1Hashed = computeHashOnElements([state1.gameId, state1.h1, state1.type]);
    verifySig(sigState1, pubKeyA, state1Hashed);
    const s2 = randomGenerator();
    const state2:any = {
       'gameId' : gameId,
       'prevStateHash' : state1Hashed,
       's2' : s2,
       'h1' : state1.h1,
       'type' : 2
    };
    const stateHash = computeHashOnElements([state2.gameId, state2.prevStateHash, state2.h1, state2.type]);
    const sig = signH(privKeyB, stateHash);
    stateTable.push(state2);
    return [state2, sig];
}

export function makeState3(state2: any, sigState2: Signature, gameId: number, s1: any, oldS2: any, pubKeyB: BigNumberish, privKeyA: BigNumberish): [any, Signature] {
    verifyIntegrity([[state2.gameId, gameId], [state2.type, 2], [hash(s1), state2.h1]]);
    const state2Hashed = computeHashOnElements([state2.gameId, state2.prevStateHash, state2.s2, state2.h1, state2.type]);
    verifySig(sigState2, pubKeyB, state2Hashed);
    const startingCard = pedersen([s1, oldS2]);
    const state3 = {
        'gameId': gameId,
        'prevStateHash': state2Hashed,
        's1': s1,
        'startingCard': startingCard,
        'type': 3
    };
    const stateHash = computeHashOnElements([]);
    const sig = signH(privKeyA, stateHash);
    stateTable.push(state3);
    return [state3, sig];
}
