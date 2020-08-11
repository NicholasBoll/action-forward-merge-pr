import * as core from '@actions/core'
import * as github from '@actions/github'
import {getRepo} from './repo'

async function run(): Promise<void> {
  try {
    const token = core.getInput('token')
    const branches = core.getInput('branches', {required: true})
    const body = core.getInput('body') || ''

    const {owner, repo} = github.context.repo

    const repository = getRepo({
      token,
      owner,
      repo,
      info: core.info,
      currentBranch: github.context.ref.replace('refs/heads/', '')
    })

    repository.createMergePullRequests({branches, body})
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
