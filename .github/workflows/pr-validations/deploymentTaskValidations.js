module.exports = async ({ github, context, core }) => {
  const LABEL = 'Deployment Task';
  const MIGRATION_PATHS = [
    new RegExp('^lib/identity/repo/data_migrations/.*.ex'),
    new RegExp('^priv/repo/seeds/.*.exs'),
    new RegExp('^priv/repo/seeds/.*.ex'),
    new RegExp('^priv/repo/seeds/.*.csv'),
  ];
  const BASE_PARAMS = { owner: context.repo.owner, repo: context.repo.repo };

  const findMigrationFile = (files) => {
    return files.find(
      (file) =>
        ['modified', 'added'].includes(file.status) &&
        MIGRATION_PATHS.some((regex) => regex.test(file.filename)),
    );
  };
  const findMigrationFileForPr = async (pr) => {
    const iterator = github.paginate.iterator(github.rest.pulls.listFiles, {
      ...BASE_PARAMS,
      pull_number: pr.number,
    });
    for await (const { data: files } of iterator) {
      const migrationFile = findMigrationFile(files);
      if (migrationFile) return migrationFile;
    }
  };

  const hasDeploymentTaskInBody = (body) => body.match(/^[#]+?\s+?deployment task[s]*?\s*?$/gi) || body.match(/^deployment task[s]*?\S+?---\S+?/gim)

  const pr = context.payload.pull_request;

  const prInfo = await github.rest.pulls.get({
    owner: context.repo.owner,
    repo: context.repo.repo,
    pull_number: pr.number,
  });

  console.log(`Checking PR:${pr.number}`);
  const migrationFile = await findMigrationFileForPr(pr);
  if (migrationFile) {
    console.log(
      `Applying ${LABEL} label to PR:${pr.number} because of file ${migrationFile.filename}`,
    );
    await github.rest.issues.addLabels({
      ...BASE_PARAMS,
      issue_number: pr.number,
      labels: [LABEL],
    });

    console.log(prInfo.data)
    console.log(prInfo.data.body)
    console.log(prInfo.data.body.match(/^[#]+?\s+?deployment task[s]*?\s*?$/gi))
    console.log(prInfo.data.body.match(/^deployment task[s]*?\S+?---\S+?/gim))
    if (!hasDeploymentTaskInBody(prInfo.data.body)) {
      core.error(
        'You are missing the Deployment Task, add a deployment task block declaration to your PR Body, like the example below:\r\n' +
          'Deployment Task\r\n' +
          '---\r\n' +
          '```elixir\r\n' +
          'Identity.DataMigrations.MigrateOldDataToNewPattern.perform()\r\n' +
          '```\r\n\r\n',
      );
      core.setFailed();
    }
  } else if (pr.labels.some(({ name }) => name === LABEL)) {
    console.log(`Removing ${LABEL} label from PR:${pr.number}`);
    await github.rest.issues.removeLabel({ ...BASE_PARAMS, issue_number: pr.number, name: LABEL });
  }
};
