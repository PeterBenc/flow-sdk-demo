export const lockTokensCode = `
import LockedTokenV1 from 0xcc1a0d9c99750953
import FlowToken from 0x7e60df042a9c0868

transaction(amount: UFix64) {

  prepare(acct: AuthAccount) {
    
    if acct.borrow<&LockedTokenV1.Vault>(from: LockedTokenV1.lockedTokenStoragePath) == nil {
        acct.save(<-LockedTokenV1.createEmptyVault(), to: LockedTokenV1.lockedTokenStoragePath)

        acct.link<&LockedTokenV1.Vault{LockedTokenV1.VaultPublic}>(
            LockedTokenV1.lockedTokensPublicPath,
            target: LockedTokenV1.lockedTokenStoragePath
        )
    }
    let flowVaultRef = acct.borrow<&FlowToken.Vault>(from: /storage/flowTokenVault)
        ?? panic("Could not borrow a reference to the owner's vault")
      
    let temporaryVault <- flowVaultRef.withdraw(amount: amount) as! @FlowToken.Vault

    let lockedVaultRef = acct.borrow<&LockedTokenV1.Vault>(from: LockedTokenV1.lockedTokenStoragePath)
        ?? panic("Could not borrow a reference to the owner's locked vault")

    lockedVaultRef.lock(tokensToLock: <-temporaryVault)
  }
}
`;
