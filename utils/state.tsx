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
    if (!(verifyIntegrity([[state1.gameId, gameId], [state1.type, 1]]) && verifySig(sigState1, pubKeyA, state1Hashed))) {
        return [generateDisputeId(), sigState1];
    }
    return [0, 0]
}

export function makeState2(
        state1: any, gameId: number, keyPairB: KeyPair, stateTable:any[]
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
    state2: any, sigState2: Signature, gameId: number, s1: number, oldH1: string, pubKeyB: BigNumberish
) {
    const state2Hashed = computeHashOnElements([state2.gameId, state2.prevStateHash, state2.s2, state2.h1, state2.type]);
    if (!(verifyIntegrity([[state2.gameId, gameId], [state2.type, 2], [oldH1, state2.h1], [hash(s1), state2.h1]]) && verifySig(sigState2, pubKeyB, state2Hashed))) {
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
    if (!(verifyIntegrity([[state3.gameId, gameId], [state3.type, 3]]) && verifySig(sigState3, pubKeyA, state3Hashed))) {
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
    if (!(verifyIntegrity([[state4.gameId, gameId], [state4.type, 4]]) && verifySig(sigState4, pubKeyB, state4Hashed))) {
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
    if (!(verifyIntegrity([[state5.gameId, gameId], [state5.type, 5], [ah0, state5.ah0], [ah1, state5.ah1], [ah2, state5.ah2], [ah3, state5.ah3]]) && verifySig(sigState5, publicKeyA, state5Hashed))) {
        return [generateDisputeId(), gameId, state5Hashed, sigState5];
    }
    return [0, 0];
}

export function makeState6(state5: any, gameId: number, keyPairB: KeyPair, as0: number, as1: number, as2: number, as3: number, stateTable: any[]) {
    const state5Hashed = computeHashOnElements([
        state5.gameId, state5.prevStateHash, state5.ah0, state5.ah1, state5.ah2, state5.ah3,
        state5.bh0, state5.bh1, state5.bh2, state5.bh3, state5.sA, state5.type
    ]);

    const card0 = pedersen([as0, state5.sA]);
    const card1 = pedersen([as1, state5.sA]);
    const card2 = pedersen([as2, state5.sA]);
    const card3 = pedersen([as3, state5.sA]);
    const sB = randomGenerator();
    const ADrawedCards = [[state5.sA, state5.ah0], [state5.sA, state5.ah0], [state5.sA, state5.ah0], [state5.sA, state5.ah0]];
    const BDrawedCards = [[sB, state5.bh0], [sB, state5.bh1], [sB, state5.bh2], [sB, state5.bh3]];
    const state6 = {
        'gameId': gameId,
        'prevStateHash': state5Hashed,
        'ADrawedCards': ADrawedCards,
        'BDrawedCards': BDrawedCards,
        'sB': sB,
        'type': 6,
        'txId': 0
    };
    const stateHash = computeHashOnElements(Object.values(state6));
    const sig = signH(keyPairB, stateHash);
    stateTable.push(state6);
    return [state6, sig, card0, card1, card2, card3];
}

export function makeState7(
        prevState: any, gameId: number, action: number, keyPairA: KeyPair, stateTable: any[],
        stackFgp: string[], depositCard: number, announcedCard: number, cardLeft: number
    ) {
    const prevStateHashed = computeHashOnElements(Object.values(prevState));
    let stateHash;
    let state7;
    let h1;
    let s1;
    if (action == 1) {
        // la seule chose qui change c'est la stack qui recoit une h1 tel que c = hash(s1, s2) avec hash(s1) = h1
        stackFgp.push(hash(depositCard)); 
        state7 = {
            'gameId': gameId,
            'prevStateHash': prevStateHashed,
            'anouncedCard': announcedCard,
            'cardLeft': cardLeft-1,
            'stackFgp': stackFgp,
            'type': 7,
            'txId': prevState.txId+1,
        };
        stateHash = computeHashOnElements(Object.values(state7));
    } else {
        // on veut piocher une carte, on genere alors s1 et h1
        [s1, h1] = randomAndHash();
        state7 = {
            'gameId': gameId,
            'prevStateHash': prevStateHashed,
            'h1': h1,
            'type': 7,
            'txId': prevState.txId+1
        };
        stateHash = computeHashOnElements(Object.values(state7));
    }

    const sig = signH(keyPairA, stateHash);
    stateTable.push(state7);
    return [state7, sig, s1]; // verifier alors l'action pour savoir comment reagir
}

export function makeState8(state7: any, gameId: number, keyPairB: KeyPair, stateTable: any[]) {
    const prevStateHash = computeHashOnElements(Object.values(state7));
    const s2 = randomGenerator();
    const state8 = {
        'gameId': gameId,
        'prevStateHash': prevStateHash,
        's2': s2,
        'h1': state7.h1,
        'type': 8,
        'txId': state7.txId+1
    };
    const stateHash = computeHashOnElements(Object.values(state8));
    const sig = signH(keyPairB, stateHash);
    stateTable.push(state8);
    return [state8, sig];
}

export function makeState9(state8: any, gameId: number, s1: number, ADrawedCards: [number, string][], keyPairA: KeyPair, stateTable: any[]) {
    const prevStateHash = computeHashOnElements(Object.values(state8));
    const card = pedersen([s1, state8.s2]);
    ADrawedCards.push([state8.s2, state8.h1]);
    const state9 = {
        'gameId': gameId,
        'prevStateHash': prevStateHash,
        'ADrawedCards': ADrawedCards,
        'type': 9,
        'txId': state8.txId+1
    };
    const stateHash = computeHashOnElements(Object.values(state9));
    const sig = signH(keyPairA, stateHash);
    stateTable.push(state9);
    return [state9, sig, card];
}

// il revele la derniere carte
export function makeState10(prevState: any, gameId: number, s1: number, keyPairA: KeyPair, stateTable: any[]) {
    const prevStateHash = computeHashOnElements(Object.values(prevState));

    const state10 = {
        'gameId': gameId,
        'prevStateHash': prevStateHash,
        's1': s1,
        'type': 10,
        'txId': prevState.txId+1
    };
    const stateHash = computeHashOnElements(Object.values(state10));
    const sig = signH(keyPairA, stateHash);
    stateTable.push(state10);
    return [state10, sig];
}

/*
// B recupere les cartes
// les cartes de A de la stack sont devenues public
// les 
export function makeState11(state10: any, gameId: number, stackFgp: string[], keyPairA: KeyPair, stateTable: any[],
        ADrawedCards: [number, string][], BDrawedCards: [number, string][], APublicCards: number[]
    ) {
    const prevStateHash = computeHashOnElements(Object.values(state10));
    
    const state11 = {
        'gameId': gameId,
        'prevStateHash': prevStateHash,
        'ADrawedCards':
        'BDrawedCards':
        'APublicCards':
        'stackFgp': 
        'type': 11,
        'txId': state10.txId+1
    };
    const stateHash = computeHashOnElements(Object.values(state11));
    const sig = signH(keyPairA, stateHash);
    stateTable.push(state11);
    return [state11, sig];
}
*/
