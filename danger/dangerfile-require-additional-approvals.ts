import { listTeamMemberLogins, subtract, PRState, PR, ReviewDecision } from './util';

export async function verifyAtLeastOneCoreApprover(approvers: Array<string>): Promise<void> {
  const baseRef = danger.github.pr.base.ref

  if (baseRef.startsWith('release/') || baseRef.startsWith('develop')) {
    listTeamMemberLogins('accounts-core-team').then((coreApprovers) => {
      const isCoreApproved = approvers.some((approver) => coreApprovers.includes(approver));
      if (!isCoreApproved) {
        fail(
          'At least 1 @scorebet/accounts-core-team approval required, but please get reviews from feature team first.',
        );
      }
    });
  } else {
    console.log(`Not enforcing core approvers because baseRef: ${baseRef}`)
  }
}

export async function maybePruneRequestedReviewers(pr: PR): Promise<any> {
  if (pr.state === PRState.OPEN && pr.reviewDecision === ReviewDecision.APPROVED) {
    let reviewersToRemove = subtract(pr.remainingRequestedReviewers, pr.commenters);
    reviewersToRemove = subtract(reviewersToRemove, pr.approvers);

    if (reviewersToRemove.length > 0) {
      message(
        `Approval already provided, removing those who did not comment or approve: ${reviewersToRemove}`,
      );
      const { repo, owner, pull_number } = danger.github.thisPR;
      danger.github.api.pulls.removeRequestedReviewers({
        owner: owner,
        repo: repo,
        pull_number: pull_number,
        reviewers: reviewersToRemove,
      })
    }
  } else {
    console.log(`Ignoring PR for reviewer pruning, state: ${pr.state}, reviewDecision: ${pr.reviewDecision}`)
  }
}
