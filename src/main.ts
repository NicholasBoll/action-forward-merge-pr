import * as core from '@actions/core'
import * as github from '@actions/github'
import {getRepo} from './repo'

async function run(): Promise<void> {
  try {
    const token = core.getInput('token')
    const branches = core.getInput('branches', {required: true})
    const body = core.getInput('body') || ''

    const {owner, repo} = github.context.repo
    core.debug(JSON.stringify(github.context))
    // github.context.

    const repository = getRepo({
      token,
      owner,
      repo,
      debug: core.debug
      // currentBranch
    })

    repository.createMergePullRequests({branches, body})
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
