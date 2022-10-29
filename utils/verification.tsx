import { BigNumberish } from 'starknet/dist/utils/number';
import { Signature } from 'starknet/types';
import { sign, verify, getKeyPairFromPublicKey, getKeyPair } from 'starknet/utils/ellipticCurve'

export function verifyIntegrity(toCompare: [any, any][]): void {
    toCompare.forEach(pair => {
        if (pair[0] !== pair[1])
            //renvoie message au front
            //+ info  + disputeID
    });
}

export function verifySig(sig: Signature, pubKey: BigNumberish, hash: string) {
    const keyPair = getKeyPairFromPublicKey(pubKey);
    if (!verify(keyPair, hash, sig)) {

    }
}

export function signH(privKey: BigNumberish, hash: string): Signature {
    const keyPair = getKeyPair(privKey);
    return sign(keyPair, hash);
}


