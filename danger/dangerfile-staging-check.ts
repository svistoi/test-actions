import { hasLabelIgnoreCase } from './util';

export async function assertMergedToStaging(): Promise<void> {
  const labeledOnStaging = hasLabelIgnoreCase('on: staging');

  const options = {
    owner: danger.github.thisPR.owner,
    repo: danger.github.thisPR.repo,
    base: 'staging',
    head: danger.github.pr.head.ref,
  };
  const comparison = await danger.github.api.repos.compareCommits(options);
  const latestMergedToStaging = comparison.data.total_commits === 0;

  if (labeledOnStaging && !latestMergedToStaging) {
    fail(
      'The latest commits from the PR branch are not merged into the staging branch. To fix locally: `git checkout staging; get merge <your branch>; git push`',
    );
  }

  if (!labeledOnStaging) {
    message(
      "You have not deployed to staging.  We strongly recommend getting approvals \
and testing on staging first and marking this PR with 'On: Staging' label in case we have to reset staging to develop",
    );
  }
}
