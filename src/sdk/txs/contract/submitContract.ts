export const deployContractCode = `
transaction(name: String, code: String ) {
  prepare(signer: AuthAccount) {
    signer.contracts.add(name: name, code: code.decodeHex() )
  }
}`;

export const removeContractCode = `
transaction(name: String ) {
  prepare(signer: AuthAccount) {
    signer.contracts.remove(name: name)
  }
}`;
