// @ts-ignore
import fetch from 'node-fetch';

export async function request(url: string, method = 'GET', body: unknown = null, headers = {}): Promise<unknown> {
  let requestParams = {
    method,
    headers,
  }
  if (method.toUpperCase() !== 'GET') {
    requestParams = Object.assign({}, requestParams, {body})
  }

  const response = await fetch(url, requestParams).catch((e: any) => {
    // http status not present
    // console.log(JSON.stringify(response))
    throw new Error(`${method} ${url} has failed with the following error: ${e}`)
  })

  if (!response) {
    // http status not present
    throw new Error(`No response from ${method} ${url}`)
  }

  try {
    return await response.json()
  } catch (e) {
    throw new Error(`Getting body of response from ${url} has failed with the following error: ${e}`)
  }
}