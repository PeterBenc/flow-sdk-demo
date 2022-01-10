export type AccountInfo = {
  address: string,
  balance: number,
  code: string,
  contracts: Record<string, unknown>,
  keys: [
    {
      index: number,
      publicKey: string,
      signAlgo: number, // enum
      hashAlgo: number,
      weight: number,
      sequenceNumber: number,
      revoked: boolean
    }
  ]
}

export type NodeIdList = string[]

export type StakingInfo = [
  {
    id: number,
    nodeID: string,
    tokensCommitted: string, // FLOW
    tokensStaked: string,
    tokensUnstaking: string,
    tokensRewarded: string,
    tokensUnstaked: string,
    tokensRequestedToUnstake: string
  }
]