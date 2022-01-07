export type Account = {
    type: "ACCOUNT"
    address: string
    scopes: string[]
    keyId?: number
    label?: string
    balance?: string
  }