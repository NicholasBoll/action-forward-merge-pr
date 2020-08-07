import {wait, getQueries} from '../src/queries'
import * as process from 'process'

const queries = getQueries({
  token: process.env.GITHUB_TOKEN_COM!,
  owner: 'NicholasBoll',
  repo: 'test-github-actions'
})

test('throws invalid number', async () => {
  const input = parseInt('foo', 10)
  await expect(wait(input)).rejects.toThrow('milliseconds not a number')
})

test('wait 500 ms', async () => {
  const start = new Date()
  await wait(500)
  const end = new Date()
  const delta = Math.abs(end.getTime() - start.getTime())
  expect(delta).toBeGreaterThan(450)
})

test('octokit', async () => {
  // const result = await queries.getCommitCount({
  //   base: 'support/v4',
  //   head: 'support/v3'
  // })
  // console.log(result)
})
