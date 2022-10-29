import { BigNumberish } from 'starknet/dist/utils/number';
import { KeyPair, Signature } from 'starknet/types';
import { sign, verify, getKeyPairFromPublicKey, getKeyPair } from 'starknet/utils/ellipticCurve'

export function verifyIntegrity(toCompare: [any, any][]): boolean {
    toCompare.forEach(pair => {
        if (pair[0] !== pair[1])
            return false;
    });
    return true;
}

export function verifySig(sig: Signature, pubKey: BigNumberish, hash: string): boolean {
    const keyPair = getKeyPairFromPublicKey(pubKey);
    if (!verify(keyPair, hash, sig)) {
        false
    }
    return true;
}

export function signH(keyPair: KeyPair, hash: string): Signature {
    return sign(keyPair, hash.slice(2));
}


