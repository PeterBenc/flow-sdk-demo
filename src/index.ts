import { authz } from "./sdk/tx";
import { getAccountAddress, getAccountKeyPair, getSignFn } from "./mnemonicProvider";
import { executeScript, getAccountInfo, submitTx} from "./api/accessNode";
// @ts-ignore
import fcl from "@onflow/fcl"
// @ts-ignore
import * as t from '@onflow/types'
import { TESTNET_CONFIG } from "./constants";
import { TestCode } from "./sdk/txs/testTx";
import { SetupStakingCollectionCode } from "./sdk/txs/setupStakingCollection";
import { GetDelegatorInfoCode } from "./sdk/txs/getDelegatorInfo";
import { createAccount, getAccount } from "./api/flowport";

fcl.config(TESTNET_CONFIG)

const accountIndex = 0


async function printAddress() {
  const keyPair = await getAccountKeyPair(accountIndex)
  console.log(getAccountAddress(keyPair.pubKeyHex))
}

async function printAccountInfo() {
  const keyPair = await getAccountKeyPair(accountIndex)
  const address = getAccountAddress(keyPair.pubKeyHex)
  console.log(await getAccountInfo(address))
}

const getAuthFn = async () => {
  const keyPair = await getAccountKeyPair(accountIndex)
  const signFn = getSignFn(keyPair.privKeyHex)
  const address = getAccountAddress(keyPair.pubKeyHex)
  const {keys} = await getAccountInfo(address)
  return await authz(address, keys[accountIndex].index.toString(), signFn)
}


async function testTx() {
  submitTx(TestCode, await getAuthFn())
}

async function setupStakingCollectionTx() {
  submitTx(SetupStakingCollectionCode, await getAuthFn())
}

async function getStakingInfoTx() {
  const keyPair = await getAccountKeyPair(accountIndex)
  const address = getAccountAddress(keyPair.pubKeyHex)
  const args = [fcl.arg(address, t.Address)]
  console.log(await executeScript(GetDelegatorInfoCode, await getAuthFn(), args))
}

async function getOrCreateAccount() {
  let account = await getAccount('f2b5b79b577ed202e9d1a81a8d918107d51871778ecb7c270d3d726a517deec9b585789b563dab3bd67401c161465bf38f29cbf50acef04c40e2a6607dc267ba')
  if ('error' in account) {
    console.log(account.error)
    console.log('creating new account')
    await createAccount('f2b5b79b577ed202e9d1a81a8d918107d51871778ecb7c270d3d726a517deec9b585789b563dab3bd67401c161465bf38f29cbf50acef04c40e2a6607dc267ba')
  }
  console.log(account)
}

// printAddress()
// printAccountInfo()
// testTx()
// getStakingInfoTx()
getOrCreateAccount()