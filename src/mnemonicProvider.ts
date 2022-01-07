import { ec as EC} from "elliptic"
import {SHA3} from "sha3"
import { MNEMONIC } from "./constants";
import { mnemonicToSeed } from "./mnemonic";
const ec = new EC("p256")

const hashMsgHex = (msgHex: string) => {
  const sha = new SHA3(256);
  sha.update(Buffer.from(msgHex, "hex"));
  return sha.digest();
};
  
// https://github.dev/MaxStalker/flow-multipart-sign-process/tree/main/frontend/src
export const getSignFn = (privKey: string): (signable: string) => Promise<string> => {
  return (signable: string) => {
    // console.log({ privKey, signable });
    const key = ec.keyFromPrivate(Buffer.from(privKey, "hex"))
    const sig = key.sign(hashMsgHex(signable))
    const n = 32; // half of signature length?
    const r = sig.r.toArrayLike(Buffer, "be", n)
    const s = sig.s.toArrayLike(Buffer, "be", n)
    return Promise.resolve(Buffer.concat([r, s]).toString("hex"))
  }
}

export const getAccountKeyPair = async (accountIndex: number) => {
  const seed = await mnemonicToSeed(MNEMONIC)
  // const rootKeyPair = ec.genKeyPair({entropy: seed})
  // const {privateKey, publicKey, chainCode, network} =  root.derivePath("m/44'/539'/0'")
  // TODO: derive the public key from seed
  return {
    privKeyHex: 'bfba4182bbfa8fcbbe5a65d01061f0792a3d36de6db2f307396e9f7c07e4845c',
    pubKeyHex: 'ae59227297f225a03730e10c53d88212523006f14963dd01ab401b1f7c4a571d7fbcb45bb5d69723beba0451ae5f625321da49dc4d4b088b35d65da3200aa2ea',
  }
}

export const getAccountAddress = (publicKey: string) => {
  return '0xfabf8975b228146d' // TODO: get from flowport api
}