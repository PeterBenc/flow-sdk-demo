import { authz } from "./sdk/tx";
import { getAccountAddress, getAccountKeyPair, getSignFn } from "./mnemonicProvider";
import { executeScript, getAccountInfo, submitTx} from "./api/accessNode";
// @ts-ignore
import fcl from "@onflow/fcl"
// @ts-ignore
import * as t from '@onflow/types'
import { MAINNET_CONFIG, TESTNET_CONFIG } from "./constants";
import { NodeIdList } from "./api/accessNode/types";
import { getNodeIdsCode } from "./sdk/txs/getNodeIds";
import { createAccount, getAccount } from "./api/flowport";
import { getDelegatorInfoCode } from "./sdk/txs/getDelegatorInfo";
import { setupStakingCollectionCode } from "./sdk/txs/setupStakingCollection";
import { delegateCode } from "./sdk/txs/delegate";
import { testCode } from "./sdk/txs/testTx";

fcl.config(TESTNET_CONFIG)

const accountIndex = 0


async function printAddress() {
  const keyPair = await getAccountKeyPair(accountIndex)
  console.log(await getAccountAddress(keyPair.pubKeyHex))
}

async function printAccountInfo() {
  const keyPair = await getAccountKeyPair(accountIndex)
  const address = await getAccountAddress(keyPair.pubKeyHex)
  console.log(await getAccountInfo(address))
}

const getAuthFn = async () => {
  const keyPair = await getAccountKeyPair(accountIndex)
  const signFn = getSignFn(keyPair.privKeyHex)
  const address = await getAccountAddress(keyPair.pubKeyHex)
  const {keys} = await getAccountInfo(address)
  return await authz(address, keys[accountIndex].index.toString(), signFn)
}


async function testTx() {
  submitTx(testCode, await getAuthFn())
}

async function setupStakingCollectionTx() {
  submitTx(setupStakingCollectionCode, await getAuthFn())
}

async function getStakingInfo() {
  const keyPair = await getAccountKeyPair(accountIndex)
  const address = await getAccountAddress(keyPair.pubKeyHex)
  const args = [fcl.arg(address, t.Address)]
  const stakingInfo = await executeScript(getDelegatorInfoCode, args)
  console.log(stakingInfo)
}

async function getNodeIds() {
  const nodeIdList: NodeIdList = await executeScript(getNodeIdsCode)
  console.log(nodeIdList)
}

async function delegateTx() {
  const nodeId = '0ee760c93c5a7fd934040941c0fa4c22e2982649e45e57a993bd56fbe4845ef7'
  const amount = "0.1" // Flow
  const args = [fcl.arg(nodeId, t.String), fcl.arg(amount, t.UFix64)]
  submitTx(delegateCode, await getAuthFn(), args)
}

printAddress()
// printAccountInfo()
// testTx()
// delegateTx()
setupStakingCollectionTx()
// getStakingInfo()
// getNodeIds()

