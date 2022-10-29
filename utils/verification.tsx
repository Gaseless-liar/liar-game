import { sign, verify, getKeyPairFromPublicKey, getKeyPair } from 'starknet.js';

export function verifyIntegrity(toCompare: [any, any][]): void {
    toCompare.forEach(pair => {
        if (pair[0] !== pair[1])

    });
}

export function verifySig(sig: string, pubKey, hash: string) {
    const keyPair = getKeyPairFromPublicKey(pubKey);
    if (!verify(keyPair, hash, sig)) {

    }
}

export function sign(privKey, hash: string): [any, string] {
    const keyPair = getKeyPair(privKey);
    return sign(keyPair, hash);
}


