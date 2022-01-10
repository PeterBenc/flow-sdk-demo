// @ts-ignore
import fcl from "@onflow/fcl"
import { AccountInfo } from "./types";

export const getAccountInfo = async (address: string): Promise<AccountInfo> => {
  const { account: user } = await fcl.send([fcl.getAccount(address)]);
  // console.log(user)
  return user as AccountInfo
}

export const submitTx = async (tx: string, authFn: any, args: any[] = []) => {
  const txHash = await fcl.send([
    fcl.transaction`${tx}`,
    fcl.args(args),
    fcl.proposer(authFn),
    fcl.payer(authFn),
    fcl.authorizations([ authFn ]),
    fcl.limit(5000),
  ])
  // console.log({ txHash });

  const {events} = await fcl.tx(txHash).onceExecuted();
  console.log(events)
}

export const executeScript = async (script: string, args: any[] = []) => {
  const res = await fcl.send([
    fcl.script`${script}`,
    fcl.args(args),
  ])
  return fcl.decode(res)
}
  