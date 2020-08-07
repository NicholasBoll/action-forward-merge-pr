import {getOctokit} from '@actions/github'
import {GitHubQuery} from './__generated__/git-hub-query'
const gql = (strings: TemplateStringsArray): string => strings.raw[0]

export async function wait(milliseconds: number): Promise<string> {
  return new Promise(resolve => {
    if (isNaN(milliseconds)) {
      throw new Error('milliseconds not a number')
    }

    setTimeout(() => resolve('done!'), milliseconds)
  })
}

export function getQueries({
  token,
  owner,
  repo
}: {
  token: string
  owner: string
  repo: string
}) {
  const octokit = getOctokit(token)

  return {
    async getCommitCount({base, head}: {base: string; head: string}) {
      return octokit.repos
        .compareCommits({
          owner,
          repo,
          base,
          head
        })
        .then(r => r.data.commits.length)
    }
  }
}

export async function getRepo({token}: {token: string}) {
  const octokit = getOctokit(token)

  // const query = gql`
  //   query GitHubQuery {
  //     repository(owner: "NicholasBoll", name: "action-forward-merge-pr") {
  //       name
  //     }
  //     viewer {
  //       login
  //       gists(first: 10) {
  //         nodes {
  //           id
  //         }
  //       }
  //     }
  //   }
  // `

  // return octokit.graphql<GitHubQuery>(query)

  return octokit.repos.compareCommits({
    owner: 'NicholasBoll',
    repo: 'test-github-actions',
    base: 'support/v4',
    head: 'support/v3'
  })
}
