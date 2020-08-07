import * as core from '@actions/core'
import * as github from '@actions/github'
import {getQueries} from './queries'

// const queries = getQueries({
//   token: process.env.GITHUB_TOKEN_COM!,
//   owner: 'NicholasBoll',
//   repo: 'test-github-actions'
// })

async function run(): Promise<void> {
  try {
    const token: string = core.getInput('token')
    const {owner, repo} = github.context.repo

    core.debug(new Date().toTimeString())

    core.setOutput('time', new Date().toTimeString())
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
