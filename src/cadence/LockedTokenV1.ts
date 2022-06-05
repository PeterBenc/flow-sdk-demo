export const lockedTokenV1Code = `
import FlowToken from 0x7e60df042a9c0868
pub contract LockedTokenV1 {

  pub event TokensLocked(amount: UFix64)
  pub event TokensUnlocked(amount: UFix64)

  access(self) let vault: @FlowToken.Vault

  pub let lockedTokenStoragePath: StoragePath
  pub let lockedTokensPublicPath: PublicPath

  pub resource TokenLock {
      access(contract) var tokenBalance: UFix64
      // TODO: access(contract) var id: Int

      init (amount: UFix64) {
         self.tokenBalance = amount
      }

      pub fun add(amount: UFix64) { // TODO: remove 
          self.tokenBalance = self.tokenBalance + amount
      }

      pub fun remove(amount: UFix64) { // TODO: remove 
          self.tokenBalance = self.tokenBalance - amount
      }

      destroy() {
          self.tokenBalance = 0.0 // TODO: destroy should probably do something more
      }
  }

  pub resource interface VaultPublic {
      pub fun lock(tokensToLock: @FlowToken.Vault)
      pub fun unlock(): @FlowToken.Vault
      pub fun getLockedBalance(): UFix64
  }

  pub resource Vault: VaultPublic {

      access(contract) let tokenLock: @TokenLock // this should be list of ftoken locks
      
      init () {
          self.tokenLock <- create TokenLock(amount: UFix64(0.0))
      }

      pub fun lock(tokensToLock: @FlowToken.Vault) {
          // TODO: this fn should create new lock and add it to the list

          let tokenAmount = tokensToLock.balance
          self.tokenLock.add(amount: tokenAmount)

          LockedTokenV1.vault.deposit(from: <- tokensToLock)

          emit TokensLocked(amount: tokenAmount)

          // TODO: post-condition
      }

      pub fun unlock(): @FlowToken.Vault {

          let tokenAmount = self.tokenLock.tokenBalance
          let withdrawnTokens <- LockedTokenV1.vault.withdraw(amount: tokenAmount) as! @FlowToken.Vault

          self.tokenLock.remove(amount: tokenAmount)

          emit TokensUnlocked(amount: tokenAmount)
          return <-withdrawnTokens
      }

      pub fun getLockedBalance(): UFix64 {
          return self.tokenLock.tokenBalance
      }

      destroy () {
          destroy self.tokenLock
      }
  }

  pub fun createEmptyVault(): @Vault {
      return <-create Vault()
  }

  init() {
      self.lockedTokenStoragePath = /storage/lockedTokenV1
      self.lockedTokensPublicPath = /public/lockedTokenV1
      self.vault <-FlowToken.createEmptyVault() as! @FlowToken.Vault
  }
}`;
