export const getLockedTokensScript = `
import LockedTokenV1 from 0xcc1a0d9c99750953
pub fun main(acct: Address): UFix64 {

  let lockedVaultRef = getAccount(acct)
      .getCapability(LockedTokenV1.lockedTokensPublicPath)
      .borrow<&LockedTokenV1.Vault{LockedTokenV1.VaultPublic}>()
      ?? panic("Could not borrow a reference to the owner's locked vault")

  return lockedVaultRef.getLockedBalance()
}`;
