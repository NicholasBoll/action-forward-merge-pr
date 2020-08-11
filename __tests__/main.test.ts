import {wait, getRepo} from '../src/repo'
import * as process from 'process'

const repository = getRepo({
  token: process.env.GITHUB_TOKEN_COM!,
  owner: 'NicholasBoll',
  repo: 'action-forward-merge-pr'
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

// skip these side-effect tests. Manually enable to test things out.
test.skip('getCommits', async () => {
  const result = await repository.getCommits({
    base: 'support/v4',
    head: 'support/v3'
  })
  console.log(result)
})

test.skip('compareBranches', async () => {
  await repository.createMergePullRequests({
    branches: 'support/v3+main,main+prerelease/v5',
    body: ''
  })
}, 30000)

test.skip('checkIfBranchExists', async () => {
  const result = await repository.checkIfBranchExists('support/v3')
  console.log(result)
})
