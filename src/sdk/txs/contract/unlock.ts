export const unlockTokensCode = `
import LockedTokenV1 from 0xcc1a0d9c99750953
import FlowToken from 0x7e60df042a9c0868

transaction() {

  prepare(acct: AuthAccount) {
    let lockedVaultRef = acct.borrow<&LockedTokenV1.Vault>(from: LockedTokenV1.lockedTokenStoragePath)
        ?? panic("Could not borrow a reference to the owner's locked vault")
    
    let flowVaultRef = acct.borrow<&FlowToken.Vault>(from: /storage/flowTokenVault)
        ?? panic("Could not borrow a reference to the owner's vault")
      
    let unlockedVault <- lockedVaultRef.unlock()
    flowVaultRef.deposit(from: <- unlockedVault)
  }
}
`;
