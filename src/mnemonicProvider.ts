import { ec as EC } from "elliptic";
import { SHA3 } from "sha3";
import { getAccountInfo } from "./api/accessNode";
import { createAccount, getAccount } from "./api/flowport";
import { LOL_MNEMONIC } from "./constants";
import { mnemonicToSeed } from "./mnemonic";
const ec = new EC("p256");

const hashMsgHex = (msgHex: string) => {
  const sha = new SHA3(256);
  sha.update(Buffer.from(msgHex, "hex"));
  return sha.digest();
};

// https://github.dev/MaxStalker/flow-multipart-sign-process/tree/main/frontend/src
export const getSignFn = (
  privKey: string
): ((signable: string) => Promise<string>) => {
  return (signable: string) => {
    const key = ec.keyFromPrivate(Buffer.from(privKey, "hex"));
    const sig = key.sign(hashMsgHex(signable));
    const n = 32; // half of signature length?
    const r = sig.r.toArrayLike(Buffer, "be", n);
    const s = sig.s.toArrayLike(Buffer, "be", n);
    return Promise.resolve(Buffer.concat([r, s]).toString("hex"));
  };
};

// TODO: this is just temporary impl
const seedToRootKeyPair = (seed: string) => {
  const privHex = hashMsgHex(seed).toString("hex"); // just to cut it to 64 bytes
  const privKey = ec.keyFromPrivate(Buffer.from(privHex, "hex"));
  const pubKey = privKey.getPublic();
  return {
    privKeyHex: privHex,
    pubKeyHex: pubKey.encode("hex", false).slice(2),
  };
};

export const getAccountKeyPair = async (accountIndex: number) => {
  const seed = await mnemonicToSeed(LOL_MNEMONIC);
  // since we dont know how the implement the derivation, we use just this for all accounts
  return seedToRootKeyPair(seed);
};

export const getAccountAddress = async (publicKey: string) => {
  let account = await getAccount(publicKey);
  if ("error" in account) {
    console.log(account.error);
    console.log("creating new account");
    account = await createAccount(publicKey);
    console.log("created");
  }

  if ("address" in account) {
    return `0x${account.address}`;
  }
  throw Error("Fail");
};
