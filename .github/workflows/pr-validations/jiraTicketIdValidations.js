const toJiraTicket = (board, number) => {
  const allCapsBoard = board === board.toUpperCase();
  const num = parseInt(number);

  if (!isNaN(num) && allCapsBoard) return `${board}-${num}`;
};

const toJiraTicketFromBranch = (branch) => {
  const [board, number] = branch.split('-');
  return toJiraTicket(board, number);
};

const toJiraTicketFromTitle = (title) => {
  const [ticket] = title.trim().split(']');
  const [board, number] = ticket.replace('[', '').split('-');
  return toJiraTicket(board, number);
};

const toJiraTicketFromBody = (body) => {
  const [ticket] = body.split('\n');
  const [board, number] = ticket.trim().replace('[', '').replace(']', '').split('-');
  return toJiraTicket(board, number);
};

module.exports = async ({ github, context, core }) => {
  const pr = context.payload.pull_request;
  const prInfo = await github.rest.pulls.get({
    owner: context.repo.owner,
    repo: context.repo.repo,
    pull_number: pr.number,
  });

  const jiraTicketFromBranch = toJiraTicketFromBranch(prInfo.data.head.ref);
  const jiraTicketFromTitle = toJiraTicketFromTitle(prInfo.data.title);
  const jiraTicketFromBody = toJiraTicketFromBody(prInfo.data.body);

  const jiraTicket = jiraTicketFromBranch || jiraTicketFromTitle || jiraTicketFromBody;
  if (jiraTicket) {
    if (!jiraTicketFromBranch) {
      core.error(
        `You are missing the Jira Ticket as the first thing in the branch name -> "${jiraTicket}-important-pr"`,
      );
      core.setFailed();
    }
    if (!jiraTicketFromTitle) {
      core.error(
        `You are missing the Jira Ticket as the first thing in the PR Title -> "${jiraTicket} - I did some stuff"`,
      );
      core.setFailed();
    }
    if (!jiraTicketFromBody) {
      core.error(
        `You are missing the Jira Ticket as the first thing in the PR Body -> "${jiraTicket}"`,
      );
      core.setFailed();
    }

    if (
      jiraTicketFromBranch !== jiraTicketFromTitle ||
      jiraTicketFromTitle !== jiraTicketFromBody
    ) {
      core.error(
        `The jira tickets from your branch, PR Title and/or PR Body don't match, your branch is name starts with ${jiraTicketFromBranch}, title starts with ${jiraTicketFromTitle} and your body starts with ${jiraTicketFromTitle}`,
      );
      core.setFailed();
    }
  } else {
    core.warn(`No Jira Ticket Detected, Not going to bother you`);
  }
};
