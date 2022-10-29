import { GamesOutlined } from '@mui/icons-material';
import { syncBuiltinESMExports } from 'module';
import { KeyPair, Signature } from 'starknet';
import { computeHashOnElements, pedersen } from 'starknet/utils/hash';
import { BigNumberish } from 'starknet/utils/number';
import { randomGenerator, hash, randomAndHash, generateDisputeId } from './utils';
import { signH, verifyIntegrity, verifySig } from './verification';

export function makeState1(gameId: number, keyPairA: KeyPair, stateTable:any[]): [any, Signature, number, any] {
    const [s1, h1] = randomAndHash();
    const state1 = {
        'gameId' : gameId,
        'h1' : h1,
        'type' : 1,
    };
    const stateHash = computeHashOnElements([state1.gameId, state1.h1, state1.type]);
    const sig = signH(keyPairA, stateHash);
    stateTable.push(state1);
    return [state1, sig, s1, h1];
}

export function checkIntegrity1 (
    state1: any, sigState1: Signature, gameId: number, pubKeyA: BigNumberish
) {
    const state1Hashed = computeHashOnElements([state1.gameId, state1.h1, state1.type]);
    if (!(verifyIntegrity([[state1.gameId, gameId], [state1.type, 1]]) || verifySig(sigState1, pubKeyA, state1Hashed))) {
        return [generateDisputeId(), sigState1];
    }
    return [0, 0]
}

export function makeState2(
        state1: any, sigState1: Signature, gameId: number, keyPairB: KeyPair, stateTable:any[]
    ) {
    const state1Hashed = computeHashOnElements([state1.gameId, state1.h1, state1.type]);
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

export function checkIntegrity2 (
    state2: any, sigState2: Signature, gameId: number, s1: any, oldH1: string, pubKeyB: BigNumberish
) {
    const state2Hashed = computeHashOnElements([state2.gameId, state2.prevStateHash, state2.s2, state2.h1, state2.type]);
    if (!(verifyIntegrity([[state2.gameId, gameId], [state2.type, 2], [oldH1, state2.h1], [hash(s1), state2.h1]]) || verifySig(sigState2, pubKeyB, state2Hashed))) {
        return [generateDisputeId(), gameId, state2Hashed, state2.s2, oldH1, sigState2]; // attention prev Sig a rajouter !
    }
    return [0, 0]
}

export function makeState3(
        state2: any, sigState2: Signature, gameId: number, s1: any, keyPairA: KeyPair, stateTable:any[]
    ) {
    const state2Hashed = computeHashOnElements([state2.gameId, state2.prevStateHash, state2.s2, state2.h1, state2.type]);
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

export function checkIntegrity3 (
    state3: any, sigState3: Signature, gameId: number, pubKeyA: BigNumberish
) {
    const state3Hashed = computeHashOnElements([gameId, state3.prevStateHash, state3.s1, state3.startingCard, state3.type]);
    if (!(verifyIntegrity([[state3.gameId, gameId], [state3.type, 3]]) || verifySig(sigState3, pubKeyA, state3Hashed))) {
        return [generateDisputeId(), gameId, state3Hashed, sigState3]; // attention prevSig, s2, s1, h1, startingCard, a rajouter !
    }
    return [0, 0]
}

export function makeState4(state3: any, gameId: number, keyPairB: KeyPair, stateTable: any[]) {
    const state3Hashed = computeHashOnElements([gameId, state3.prevStateHash, state3.s1, state3.startingCard, state3.type]);
    
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
        'ah3': ah3,
        'type': 4
    };
    const stateHash = computeHashOnElements([state4.gameId, state4.prevStateHash, state4.ah0, state4.ah1, state4.ah2, state4.ah3]);
    const sig = signH(keyPairB, stateHash);
    stateTable.push(state4);
    return [state4, sig, as0, as1, as2, as3];
}

export function checkIntegrity4 (
        state4: any, sigState4: Signature, gameId: number, pubKeyB: BigNumberish
    ) {
    const state4Hashed = computeHashOnElements([state4.gameId, state4.prevStateHash, state4.ah0, state4.ah1, state4.ah2, state4.ah3, state4.type]);
    if (!(verifyIntegrity([[state4.gameId, gameId], [state4.type, 4]]) || verifySig(sigState4, pubKeyB, state4Hashed))) {
        return [generateDisputeId(), gameId, state4Hashed, sigState4];
    }
    return [0, 0]
}

export function makeState5(
        state4: any, gameId: number, keyPairA: KeyPair, stateTable: any[]
    ) {
    const state4Hashed = computeHashOnElements([state4.gameId, state4.prevStateHash, state4.ah0, state4.ah1, state4.ah2, state4.ah3, state4.type]);
    const [bs0, bh0] = randomAndHash();
    const [bs1, bh1] = randomAndHash();
    const [bs2, bh2] = randomAndHash();
    const [bs3, bh3] = randomAndHash();
    const sA = randomGenerator();
    const state5 = {
        'gameId': gameId,
        'prevStateHash': state4Hashed,
        'ah0': state4.ah0,
        'ah1': state4.ah1,
        'ah2': state4.ah2,
        'ah3': state4.ah3,
        'bh0': bh0,
        'bh1': bh1,
        'bh2': bh2,
        'bh3': bh3,
        'sA': sA,
        'type': 5
    };
    const stateHash = computeHashOnElements([
        state5.gameId, state5.prevStateHash,
        state5.ah0, state5.ah1, state5.ah2, state5.ah3,
        state5.bh0, state5.bh1, state5.bh2, state5.bh3,
        state5.sA, state5.type
    ]);
    const sig = signH(keyPairA, stateHash);
    stateTable.push(state5);
    return [state5, sig, bs0, bs1, bs2, bs3];
}

export function checkIntegrity5(state5: any, sigState5: Signature, gameId: number, publicKeyA: Signature, ah0: string, ah1: string, ah2: string, ah3: string) {
    const state5Hashed = computeHashOnElements([
        state5.gameId, state5.prevStateHash, state5.ah0, state5.ah1, state5.ah2, state5.ah3,
        state5.bh0, state5.bh1, state5.bh2, state5.bh3, state5.sA, state5.type
    ]);
    if (!(verifyIntegrity([[state5.gameId, gameId], [state5.type, 5], [ah0, state5.ah0], [ah1, state5.ah1], [ah2, state5.ah2], [ah3, state5.ah3]]) || verifySig(sigState5, publicKeyA, state5Hashed))) {
        return [generateDisputeId(), gameId, state5Hashed, sigState5];
    }
    return [0, 0];
}

export function makeState6(state5: any, gameId: number, keyPairB: KeyPair, stateTable: any[]) {
    const state5Hashed = computeHashOnElements([
        state5.gameId, state5.prevStateHash, state5.ah0, state5.ah1, state5.ah2, state5.ah3,
        state5.bh0, state5.bh1, state5.bh2, state5.bh3, state5.sA, state5.type
    ]);

    const card0 = pedersen([state5.ah0, state5.sA]);
    const card1 = pedersen([state5.ah0, state5.sA]);
    const card2 = pedersen([state5.ah0, state5.sA]);
    const card3 = pedersen([state5.ah0, state5.sA]);
    const sB = randomGenerator();
    const ADrawedCards = [[state5.sA, state5.ah0], [state5.sA, state5.ah0], [state5.sA, state5.ah0], [state5.sA, state5.ah0]];
    const BDrawedCards = [[sB, state5.bh0], [sB, state5.bh1], [sB, state5.bh2], [sB, state5.bh3]];
    const state6 = {
        'gameId': gameId,
        'prevStateHash': state5Hashed,
        'ADrawedCards': ADrawedCards,
        'BDrawedCards': BDrawedCards,
        'sB': sB,
        'type': 6
    };
    const stateHash = computeHashOnElements([state6.gameId, state6.prevStateHash, state6.ADrawedCards, state6.BDrawedCards, state6.sB, state6.type]);
    const sig = signH(keyPairB, stateHash);
    stateTable.push(state6);
    return [state6, sig, card0, card1, card2, card3];
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