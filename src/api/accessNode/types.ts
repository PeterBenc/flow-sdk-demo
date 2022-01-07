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