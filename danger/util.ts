export enum ReviewDecision {
  APPROVED = 'APPROVED',
  CHANGES_REQUESTED = 'CHANGES_REQUESTED',
  REVIEW_REQUIRED = 'REVIEW_REQUIRED',
}

export enum PRState {
  CLOSED = 'CLOSED',
  MERGED = 'MERGED',
  OPEN = 'OPEN',
}

export class PR {
  reviewDecision: ReviewDecision;
  state: PRState;
  approvers: string[];
  commenters: string[];
  // github graphql returns those who have not approved not the entire list assigned
  remainingRequestedReviewers: string[];
}

function filterDangerDirectoryFiles(file: string): boolean {
  return !file.includes('danger/');
}

export function hasLabelIgnoreCase(label: string): boolean {
  const labelLowered = label.toLowerCase();

  const matches = danger.github.issue.labels
    .map(({ name }) => name.toLowerCase())
    .filter((name: string) => name.includes(labelLowered));

  return matches.length > 0;
}

export function getModifiedFiles(
  includeDangerDirectory = false,
  excludedFiles: string[] = [],
): string[] {
  const files: string[] = danger.git.modified_files;
  let modifiedFiles = includeDangerDirectory ? files : files.filter(filterDangerDirectoryFiles);

  if (excludedFiles.length > 0) {
    modifiedFiles = modifiedFiles.filter((file) => {
      for (const pattern of excludedFiles) {
        if (file.includes(pattern)) {
          return false;
        }
      }
      return true;
    });
  }

  return modifiedFiles;
}

export function getCreatedFiles(includeDangerDirectory = false): string[] {
  const files: string[] = danger.git.created_files;
  if (!includeDangerDirectory) {
    return files.filter(filterDangerDirectoryFiles);
  }

  return files;
}

export function getAllCreatedAndModifiedFiles(includeDangerDirectory = false): string[] {
  return [...getCreatedFiles(includeDangerDirectory), ...getModifiedFiles(includeDangerDirectory)];
}

export function getPrApprovedLogins(): Array<string> {
  const reviewers: string[] = danger.github.reviews
    .filter(({ state }) => state === 'APPROVED')
    .map(({ user }) => user.login);

  return reviewers;
}

export async function listTeamMemberLogins(team_slug: string): Promise<Array<string>> {
  const options = { org: 'scorebet', team_slug };
  const { data } = await danger.github.api.teams.listMembersInOrg(options);
  return data.map(({ login }) => login);
}

export function subtract<T>(a: Array<T>, b: Array<T>): Array<T> {
  return a.filter((val) => !b.includes(val));
}

export function unique<T>(input: Array<T>): Array<T> {
  return Array.from(new Set(input));
}

export async function getPrReviewDecisionAndReviewers(
  repo: string,
  owner: string,
  pull_number: number,
): Promise<PR> {
  const query = `
    query ($repo: String!, $owner: String!, $pull_number: Int!) {
      repository(name: $repo, owner: $owner) {
        pullRequest(number: $pull_number) {
          reviewDecision
          state
          reviews(first: 100) { nodes { state author { login } } }
          reviewRequests(first: 100) { nodes { requestedReviewer {... on User { login } } } }
        }
      }
    }`;
  const variables = {
    repo: repo,
    owner: owner,
    pull_number: pull_number,
  };

  const queryResult = await danger.github.api.request('POST /graphql', {
    headers: { authorization: `token ${process.env.DANGER_GITHUB_API_TOKEN}` },
    query: query,
    variables: variables,
  });

  const pullRequest = queryResult.data.data.repository.pullRequest;
  const reviews = pullRequest.reviews.nodes;
  const result = new PR();
  result.reviewDecision = pullRequest.reviewDecision;
  result.state = pullRequest.state;
  result.approvers = unique(
    reviews.filter(({ state }) => state === 'APPROVED').map(({ author: { login } }) => login),
  );

  result.commenters = unique(
    reviews.filter(({ state }) => state === 'COMMENTED').map(({ author: { login } }) => login),
  );

  result.remainingRequestedReviewers = pullRequest.reviewRequests.nodes.map(
    ({ requestedReviewer: { login } }) => login,
  );

  return result;
}
