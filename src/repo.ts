import {getOctokit} from '@actions/github'
import {BranchQuery} from './__generated__/branch-query'
const gql = (strings: TemplateStringsArray): string => strings.raw[0]

export async function wait(milliseconds: number): Promise<string> {
  return new Promise(resolve => {
    if (isNaN(milliseconds)) {
      throw new Error('milliseconds not a number')
    }

    setTimeout(() => resolve('done!'), milliseconds)
  })
}

export function getRepo({
  token,
  owner,
  repo,
  currentBranch,
  // eslint-disable-next-line no-console
  debug = console.debug
}: {
  token: string
  owner: string
  repo: string
  currentBranch?: string
  debug?: Function
}) {
  const octokit = getOctokit(token)

  const repository = {
    getMergeBranchName({to, from}: {to: string; from: string}) {
      return `merge/${from}-into-${to}`
    },

    async getCommits({base, head}: {base: string; head: string}) {
      return octokit.repos
        .compareCommits({
          owner,
          repo,
          base,
          head
        })
        .then(r => r.data.commits)
    },

    async checkIfBranchExists(name: string) {
      const query = gql`
        query BranchQuery($name: String!, $owner: String!, $repo: String!) {
          repository(owner: $owner, name: $repo) {
            ref(qualifiedName: $name) {
              name
            }
          }
        }
      `

      return octokit
        .graphql<BranchQuery>(query, {name, owner, repo})
        .then(result => result.repository?.ref?.name || null)
    },

    async createPullRequest({
      from,
      name,
      to,
      body
    }: {
      from: string
      name: string
      to: string
      body: string
    }) {
      const sha = (
        await octokit.git.getRef({repo, owner, ref: `heads/${from}`})
      ).data.object.sha
      debug(`Sha for ${from}: ${sha}`)

      debug(`Creating branch '${name}'`)
      await octokit.git.createRef({
        repo,
        owner,
        ref: `refs/heads/${name}`,
        sha
      })

      debug(`Branch '${name}' created`)

      debug(`Creating pull request`)
      const result = await octokit.pulls.create({
        repo,
        owner,
        title: `Merge ${from} into ${to}`,
        head: name,
        base: to,
        body
      })

      return result.data.number
    },

    async addReviewers(number: number, logins: string[]) {
      const login = (await octokit.users.getAuthenticated()).data.login

      debug(
        `Requesting reviews from: ${logins.join(', ')}. Self login: ${login}`
      )
      const reviewers = logins.filter(l => l !== login)
      if (reviewers.length) {
        return await octokit.pulls.requestReviewers({
          repo,
          owner,
          pull_number: number,
          reviewers
        })
      } else {
        debug(`No one to request a review from. Skipping.`)
      }
      return
    },

    async createMergePullRequests({
      branches,
      body
    }: {
      branches: string
      body: string
    }) {
      const match = /([^+,]+\+[^,]+)(,([^+,]+\+[^,]+))*/
      if (!match.test(branches)) {
        throw Error(
          'Branches must match the pattern "branch1+branch2" or "branch1+branch2,branch2+branch3'
        )
      }

      const branchesToProcess = branches
        .split(',')
        .map(b => b.split('+'))
        .filter(b => (currentBranch ? currentBranch === b[0] : true))

      const branchesToCreate = await Promise.all(
        branchesToProcess.map(async ([from, to]) => {
          debug(`Processing branches from: ${from}, to: ${to}`)
          const commits = await repository.getCommits({head: from, base: to})
          return {
            from,
            to,
            mergeName: repository.getMergeBranchName({
              to,
              from
            }),
            commits
          }
        })
      )
        .then(async comparisons => {
          return Promise.all(
            comparisons
              .filter(c => c.commits.length > 0)
              .map(async comparison => {
                const branchExists = !!(await repository.checkIfBranchExists(
                  comparison.mergeName
                ))
                debug(
                  `Comparing ${comparison.from}...${
                    comparison.to
                  }. Commit count: ${
                    comparison.commits.length
                  }. Branch exists: ${branchExists}.${
                    branchExists ? ' Skipping' : ''
                  }`
                )
                return {
                  branchExists,
                  ...comparison
                }
              })
          )
        })
        .then(comparisons => {
          return comparisons.filter(c => !c.branchExists)
        })

      if (branchesToCreate.length) {
        debug(
          `branchesToCreate: ${branchesToCreate
            .map(c => c.mergeName)
            .join(', ')}`
        )

        await Promise.all(
          branchesToCreate.map(c => {
            return repository.createPullRequest({
              from: c.from,
              name: c.mergeName,
              to: c.to,
              body
            })
          })
        )
      }
    }
  }

  return repository
}
