// @ts-ignore
import fcl from "@onflow/fcl"
import { Account } from "./types";

export const authz = async (
  address: string,
  keyId: string,
  signFn: (tx: string) => Promise<string>
) => {
  // authorization function need to return an account
  return (account: Account) => {
    return {
      ...account, // bunch of defaults in here, we want to overload some of them though
      tempId: `${address}-${keyId}`, // tempIds are more of an advanced topic, for 99% of the times where you know the address and keyId you will want it to be a unique string per that address and keyId
      addr: fcl.sansPrefix(address), // the address of the signatory, currently it needs to be without a prefix right now
      keyId: Number(keyId), // this is the keyId for the accounts registered key that will be used to sign, make extra sure this is a number and not a string
      signingFunction: async (signable: {message: string}) => {
        // Singing functions are passed a signable and need to return a composite signature
        // signable.message is a hex string of what needs to be signed.
        return {
          addr: fcl.withPrefix(address), // needs to be the same as the account.addr but this time with a prefix, eventually they will both be with a prefix
          keyId: Number(keyId), // needs to be the same as account.keyId, once again make sure its a number and not a string
          signature: await signFn(signable.message), // this needs to be a hex string of the signature, where signable.message is the hex value that needs to be signed
        }
      }
    }
  }
}