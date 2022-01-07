import {
  mnemonicToSeed as _mnemonicToSeed,
  validateMnemonic,
} from 'bip39'


export const mnemonicToSeed = async (mnemonic: string): Promise<string> => {
  if (!validateMnemonic(mnemonic)) {
    throw new Error('Invalid mnemonic words')
  }
  const seed = await _mnemonicToSeed(mnemonic)
  return Buffer.from(seed).toString('hex')
}