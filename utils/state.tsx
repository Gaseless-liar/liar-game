import { KeyPair, number, Signature } from 'starknet';
import { computeHashOnElements, pedersen } from 'starknet/utils/hash';
import { BigNumberish } from 'starknet/utils/number';
import { randomGenerator, hash, randomAndHash, generateDisputeId } from './utils';
import { signH, verifyIntegrity, verifySig } from './verification';

export function makeState1(gameId: number, keyPairA: KeyPair, stateTable:any[]): [any, Signature, number] {
    const [s1, h1] = randomAndHash();
    const state1 = {
        'gameId' : gameId,
        'h1' : h1,
        'type' : 1,
    };
    const stateHash = computeHashOnElements([state1.gameId, state1.h1, state1.type]);
    const sig = signH(keyPairA, stateHash);
    stateTable.push(state1);
    return [state1, sig, s1];
}

export function makeState2(
        state1: any, sigState1: Signature, gameId: number, pubKeyA: BigNumberish, keyPairB: KeyPair, stateTable:any[]
    ) {
    const state1Hashed = computeHashOnElements([state1.gameId, state1.h1, state1.type]);
    if (!(verifyIntegrity([[state1.gameId, gameId], [state1.type, 1]]) || verifySig(sigState1, pubKeyA, state1Hashed))) {
        return [generateDisputeId(), gameId, state1.h1, sigState1];
    }
    const s2 = randomGenerator();
    const state2 = {
       'gameId' : gameId,
       'prevStateHash' : state1Hashed,
       's2' : s2,
       'h1' : state1.h1,
       'type' : 2
    };
    const stateHash = computeHashOnElements([state2.gameId, state2.prevStateHash, state2.h1, state2.type]);
    const sig = signH(keyPairB, stateHash);
    stateTable.push(state2);
    return [state2, sig];
}

export function makeState3(
        state2: any, sigState2: Signature, gameId: number, s1: any, oldH1: string, pubKeyB: BigNumberish, keyPairA: KeyPair, stateTable:any[]
    ) {
    const state2Hashed = computeHashOnElements([state2.gameId, state2.prevStateHash, state2.s2, state2.h1, state2.type]);
    if (!(verifyIntegrity([[state2.gameId, gameId], [state2.type, 2], [oldH1, state2.h1], [hash(s1), state2.h1]]) || verifySig(sigState2, pubKeyB, state2Hashed))) {
        return [generateDisputeId(), gameId, state2Hashed, state2.s2, oldH1, sigState2]; // attention prev Sig a rajouter !
    }
    const startingCard = pedersen([s1, state2.s2]);
    const state3 = {
        'gameId': gameId,
        'prevStateHash': state2Hashed,
        's1': s1,
        'startingCard': startingCard,
        'type': 3
    };
    const stateHash = computeHashOnElements([state3.gameId, state3.prevStateHash, state3.s1, state3.startingCard, state3.type]);
    const sig = signH(keyPairA, stateHash);
    stateTable.push(state3);
    return [state3, sig];
}

export function makeState4(state3: any, sigState3: Signature, gameId: number, keyPairB: KeyPair, pubKeyA: BigNumberish, stateTable: any[]) {
    const state3Hashed = computeHashOnElements([gameId, state3.prevStateHash, state3.s1, state3.startingCard, state3.type]);
    if (!(verifyIntegrity([[state3.gameId, gameId], [state3.type, 3]]) || verifySig(sigState3, pubKeyA, state3Hashed))) {
        return [generateDisputeId(), ];
    }
    const [as0, ah0] = randomAndHash();
    const [as1, ah1] = randomAndHash();
    const [as2, ah2] = randomAndHash();
    const [as3, ah3] = randomAndHash();
    const state4 = {
        'gameId': gameId,
        'prevStateHash': state3Hashed,
        'ah0': ah0,
        'ah1': ah1,
        'ah2': ah2,
        'ah3': ah3
    };
    const stateHash = computeHashOnElements([state4.gameId, state4.prevStateHash, state4.ah0, state4.ah1, state4.ah2, state4.ah3]);
    const sig = signH(keyPairB, stateHash);
    stateTable.push(state4);
    return [state4, sig, as0, as1, as2, as3];
}

/*
export function makeStateTurn(
    state3: any, sigState3: Signature, gameId: number, placedACardsFgp: string[], placedBCardsFgp: string[], pubKeyA: Signature
    ) {
    const state3Hashed = computeHashOnElements([state3.gameId, state3.prevStateHash, state3.s1, state3.startingCard, state3.type]);
    if (!(verifyIntegrity() || verifySig(sigState3, pubKeyA, state3Hashed))) {
        return [generateDisputeId(), ];
    }
    const state4 = {
        'gameId': gameId,
        'prevStateHash': state3Hashed,
        'startingCard': state3.startingCard,
        'placedACardsFgp': placedACardsFgp,
        'placedBCardsFgp': placedBCardsFgp,
        'type': ,
        '': ,
        '': ,
        '': ,
        '': ,
        'action':
    };
    return [state4, sig];
}
*/