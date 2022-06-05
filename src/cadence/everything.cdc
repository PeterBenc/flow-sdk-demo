/**

# The Flow Fungible Token standard

## `FungibleToken` contract interface

The interface that all fungible token contracts would have to conform to.
If a users wants to deploy a new token contract, their contract
would need to implement the FungibleToken interface.

Their contract would have to follow all the rules and naming
that the interface specifies.

## `Vault` resource

Each account that owns tokens would need to have an instance
of the Vault resource stored in their account storage.

The Vault resource has methods that the owner and other users can call.

## `Provider`, `Receiver`, and `Balance` resource interfaces

These interfaces declare pre-conditions and post-conditions that restrict
the execution of the functions in the Vault.

They are separate because it gives the user the ability to share
a reference to their Vault that only exposes the fields functions
in one or more of the interfaces.

It also gives users the ability to make custom resources that implement
these interfaces to do various things with the tokens.
For example, a faucet can be implemented by conforming
to the Provider interface.

By using resources and interfaces, users of FungibleToken contracts
can send and receive tokens peer-to-peer, without having to interact
with a central ledger smart contract. To send tokens to another user,
a user would simply withdraw the tokens from their Vault, then call
the deposit function on another user's Vault to complete the transfer.

*/

/// FungibleToken
///
/// The interface that fungible token contracts implement.
///
pub contract interface FungibleToken {

    /// The total number of tokens in existence.
    /// It is up to the implementer to ensure that the total supply
    /// stays accurate and up to date
    ///
    pub var totalSupply: UFix64

    /// TokensInitialized
    ///
    /// The event that is emitted when the contract is created
    ///
    pub event TokensInitialized(initialSupply: UFix64)

    /// TokensWithdrawn
    ///
    /// The event that is emitted when tokens are withdrawn from a Vault
    ///
    pub event TokensWithdrawn(amount: UFix64, from: Address?)

    /// TokensDeposited
    ///
    /// The event that is emitted when tokens are deposited into a Vault
    ///
    pub event TokensDeposited(amount: UFix64, to: Address?)

    /// Provider
    ///
    /// The interface that enforces the requirements for withdrawing
    /// tokens from the implementing type.
    ///
    /// It does not enforce requirements on `balance` here,
    /// because it leaves open the possibility of creating custom providers
    /// that do not necessarily need their own balance.
    ///
    pub resource interface Provider {

        /// withdraw subtracts tokens from the owner's Vault
        /// and returns a Vault with the removed tokens.
        ///
        /// The function's access level is public, but this is not a problem
        /// because only the owner storing the resource in their account
        /// can initially call this function.
        ///
        /// The owner may grant other accounts access by creating a private
        /// capability that allows specific other users to access
        /// the provider resource through a reference.
        ///
        /// The owner may also grant all accounts access by creating a public
        /// capability that allows all users to access the provider
        /// resource through a reference.
        ///
        pub fun withdraw(amount: UFix64): @Vault {
            post {
                // `result` refers to the return value
                result.balance == amount:
                    "Withdrawal amount must be the same as the balance of the withdrawn Vault"
            }
        }
    }

    /// Receiver
    ///
    /// The interface that enforces the requirements for depositing
    /// tokens into the implementing type.
    ///
    /// We do not include a condition that checks the balance because
    /// we want to give users the ability to make custom receivers that
    /// can do custom things with the tokens, like split them up and
    /// send them to different places.
    ///
    pub resource interface Receiver {

        /// deposit takes a Vault and deposits it into the implementing resource type
        ///
        pub fun deposit(from: @Vault)
    }

    /// Balance
    ///
    /// The interface that contains the `balance` field of the Vault
    /// and enforces that when new Vaults are created, the balance
    /// is initialized correctly.
    ///
    pub resource interface Balance {

        /// The total balance of a vault
        ///
        pub var balance: UFix64

        init(balance: UFix64) {
            post {
                self.balance == balance:
                    "Balance must be initialized to the initial balance"
            }
        }
    }

    /// Vault
    ///
    /// The resource that contains the functions to send and receive tokens.
    ///
    pub resource Vault: Provider, Receiver, Balance {

        // The declaration of a concrete type in a contract interface means that
        // every Fungible Token contract that implements the FungibleToken interface
        // must define a concrete `Vault` resource that conforms to the `Provider`, `Receiver`,
        // and `Balance` interfaces, and declares their required fields and functions

        /// The total balance of the vault
        ///
        pub var balance: UFix64

        // The conforming type must declare an initializer
        // that allows prioviding the initial balance of the Vault
        //
        init(balance: UFix64)

        /// withdraw subtracts `amount` from the Vault's balance
        /// and returns a new Vault with the subtracted balance
        ///
        pub fun withdraw(amount: UFix64): @Vault {
            pre {
                self.balance >= amount:
                    "Amount withdrawn must be less than or equal than the balance of the Vault"
            }
            post {
                // use the special function `before` to get the value of the `balance` field
                // at the beginning of the function execution
                //
                self.balance == before(self.balance) - amount:
                    "New Vault balance must be the difference of the previous balance and the withdrawn Vault"
            }
        }

        /// deposit takes a Vault and adds its balance to the balance of this Vault
        ///
        pub fun deposit(from: @Vault) {
            // Assert that the concrete type of the deposited vault is the same
            // as the vault that is accepting the deposit
            pre {
                from.isInstance(self.getType()): 
                    "Cannot deposit an incompatible token type"
            }
            post {
                self.balance == before(self.balance) + before(from.balance):
                    "New Vault balance must be the sum of the previous balance and the deposited Vault"
            }
        }
    }

    /// createEmptyVault allows any user to create a new Vault that has a zero balance
    ///
    pub fun createEmptyVault(): @Vault {
        post {
            result.balance == 0.0: "The newly created Vault must have zero balance"
        }
    }
}

pub contract FlowToken: FungibleToken {

    // Total supply of Flow tokens in existence
    pub var totalSupply: UFix64

    // Event that is emitted when the contract is created
    pub event TokensInitialized(initialSupply: UFix64)

    // Event that is emitted when tokens are withdrawn from a Vault
    pub event TokensWithdrawn(amount: UFix64, from: Address?)

    // Event that is emitted when tokens are deposited to a Vault
    pub event TokensDeposited(amount: UFix64, to: Address?)

    // Event that is emitted when new tokens are minted
    pub event TokensMinted(amount: UFix64)

    // Event that is emitted when tokens are destroyed
    pub event TokensBurned(amount: UFix64)

    // Event that is emitted when a new minter resource is created
    pub event MinterCreated(allowedAmount: UFix64)

    // Event that is emitted when a new burner resource is created
    pub event BurnerCreated()

    // Vault
    //
    // Each user stores an instance of only the Vault in their storage
    // The functions in the Vault and governed by the pre and post conditions
    // in FungibleToken when they are called.
    // The checks happen at runtime whenever a function is called.
    //
    // Resources can only be created in the context of the contract that they
    // are defined in, so there is no way for a malicious user to create Vaults
    // out of thin air. A special Minter resource needs to be defined to mint
    // new tokens.
    //
    pub resource Vault: FungibleToken.Provider, FungibleToken.Receiver, FungibleToken.Balance {

        // holds the balance of a users tokens
        pub var balance: UFix64

        // initialize the balance at resource creation time
        init(balance: UFix64) {
            self.balance = balance
        }

        // withdraw
        //
        // Function that takes an integer amount as an argument
        // and withdraws that amount from the Vault.
        // It creates a new temporary Vault that is used to hold
        // the money that is being transferred. It returns the newly
        // created Vault to the context that called so it can be deposited
        // elsewhere.
        //
        pub fun withdraw(amount: UFix64): @FungibleToken.Vault {
            self.balance = self.balance - amount
            emit TokensWithdrawn(amount: amount, from: self.owner?.address)
            return <-create Vault(balance: amount)
        }

        // deposit
        //
        // Function that takes a Vault object as an argument and adds
        // its balance to the balance of the owners Vault.
        // It is allowed to destroy the sent Vault because the Vault
        // was a temporary holder of the tokens. The Vault's balance has
        // been consumed and therefore can be destroyed.
        pub fun deposit(from: @FungibleToken.Vault) {
            let vault <- from as! @FlowToken.Vault
            self.balance = self.balance + vault.balance
            emit TokensDeposited(amount: vault.balance, to: self.owner?.address)
            vault.balance = 0.0
            destroy vault
        }

        destroy() {
            FlowToken.totalSupply = FlowToken.totalSupply - self.balance
        }
    }

    // createEmptyVault
    //
    // Function that creates a new Vault with a balance of zero
    // and returns it to the calling context. A user must call this function
    // and store the returned Vault in their storage in order to allow their
    // account to be able to receive deposits of this token type.
    //
    pub fun createEmptyVault(): @FungibleToken.Vault {
        return <-create Vault(balance: 0.0)
    }

    pub resource Administrator {
        // createNewMinter
        //
        // Function that creates and returns a new minter resource
        //
        pub fun createNewMinter(allowedAmount: UFix64): @Minter {
            emit MinterCreated(allowedAmount: allowedAmount)
            return <-create Minter(allowedAmount: allowedAmount)
        }

        // createNewBurner
        //
        // Function that creates and returns a new burner resource
        //
        pub fun createNewBurner(): @Burner {
            emit BurnerCreated()
            return <-create Burner()
        }
    }

    // Minter
    //
    // Resource object that token admin accounts can hold to mint new tokens.
    //
    pub resource Minter {

        // the amount of tokens that the minter is allowed to mint
        pub var allowedAmount: UFix64

        // mintTokens
        //
        // Function that mints new tokens, adds them to the total supply,
        // and returns them to the calling context.
        //
        pub fun mintTokens(amount: UFix64): @FlowToken.Vault {
            pre {
                amount > UFix64(0): "Amount minted must be greater than zero"
                amount <= self.allowedAmount: "Amount minted must be less than the allowed amount"
            }
            FlowToken.totalSupply = FlowToken.totalSupply + amount
            self.allowedAmount = self.allowedAmount - amount
            emit TokensMinted(amount: amount)
            return <-create Vault(balance: amount)
        }

        init(allowedAmount: UFix64) {
            self.allowedAmount = allowedAmount
        }
    }

    // Burner
    //
    // Resource object that token admin accounts can hold to burn tokens.
    //
    pub resource Burner {

        // burnTokens
        //
        // Function that destroys a Vault instance, effectively burning the tokens.
        //
        // Note: the burned tokens are automatically subtracted from the
        // total supply in the Vault destructor.
        //
        pub fun burnTokens(from: @FungibleToken.Vault) {
            let vault <- from as! @FlowToken.Vault
            let amount = vault.balance
            destroy vault
            emit TokensBurned(amount: amount)
        }
    }

    init(adminAccount: AuthAccount) {
        self.totalSupply = 0.0

        // Create the Vault with the total supply of tokens and save it in storage
        //
        let vault <- create Vault(balance: self.totalSupply)
        adminAccount.save(<-vault, to: /storage/flowTokenVault)

        // Create a public capability to the stored Vault that only exposes
        // the `deposit` method through the `Receiver` interface
        //
        adminAccount.link<&FlowToken.Vault{FungibleToken.Receiver}>(
            /public/flowTokenReceiver,
            target: /storage/flowTokenVault
        )

        // Create a public capability to the stored Vault that only exposes
        // the `balance` field through the `Balance` interface
        //
        adminAccount.link<&FlowToken.Vault{FungibleToken.Balance}>(
            /public/flowTokenBalance,
            target: /storage/flowTokenVault
        )

        let admin <- create Administrator()
        adminAccount.save(<-admin, to: /storage/flowTokenAdmin)

        // Emit an event that shows that the contract was initialized
        emit TokensInitialized(initialSupply: self.totalSupply)
    }
}




















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
}

// lock flow

// import LockedTokenV1 from 0x
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

// unlock flow

// import LockedTokenV1 from 0x
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

// get locked balance

// import LockedTokenV1 from 0x

pub fun main(acct: Address): UFix64 {

  let lockedVaultRef = getAccount(acct)
      .getCapability(LockedTokenV1.lockedTokensPublicPath)
      .borrow<&LockedTokenV1.Vault{LockedTokenV1.VaultPublic}>()
      ?? panic("Could not borrow a reference to the owner's locked vault")

  return lockedVaultRef.getLockedBalance()
}

