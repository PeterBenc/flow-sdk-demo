import { request } from "../../utils"

type FlowportAccountInfoResponse = {
  error: string
} | {
  address: string,
  publicKeys: 
    {
      publicKey: string,
      signatureAlgorithm: "ECDSA_P256" | "ECDSA_SECP256K1" | string
      hashAlgorithm: "SHA3_256" | string
    }[]
}

export const createAccount = (publicKey: string): Promise<FlowportAccountInfoResponse> => {
  return request(
    'https://hardware-wallet-api-testnet.staging.onflow.org/accounts',
    'POST',
    JSON.stringify({
      "publicKey": publicKey,
      "signatureAlgorithm": "ECDSA_P256",
      "hashAlgorithm": "SHA3_256"
    }),
    {'Content-Type': 'application/json'},
  ).catch(e => e) as Promise<FlowportAccountInfoResponse>
}

export const getAccount = (publicKey: string): Promise<FlowportAccountInfoResponse> => {
  return request(
    `https://hardware-wallet-api-testnet.staging.onflow.org/accounts?publicKey=${publicKey}`,
  ).catch(e => e) as Promise<FlowportAccountInfoResponse>
}