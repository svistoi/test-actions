import { getCreatedFiles, getModifiedFiles, hasLabelIgnoreCase } from './util';

export function assertStructureSqlUpToDate(): void {
  const addedMigrationFiles =
    getCreatedFiles().some(
      (fileName: string) => fileName.includes('/repo/migrations') && fileName.endsWith('.exs'),
    )

  const modifiedStructureSql =
    getModifiedFiles().some((fileName) => fileName.endsWith('structure.sql'))

  if (addedMigrationFiles && !modifiedStructureSql) {
    fail(
      'You added a migration and forgot to update structure.sql.  Update by running `mix ecto.dump`',
    );
  }
}

export function assertDeploymentDependencyDocumented(): void {
  const markedNoDeploymentDependency = new RegExp(
    '.*\\[x\\] this change does not add a deployment dependency.*',
    'i',
  ).test(danger.github.pr.body);

  const hasDeploymentDependencyLabel = hasLabelIgnoreCase('deployment dependency');

  const hasDeploymentDependencyDescription = new RegExp(
    '[#]*deployment dependen(cy|cies)',
    'i',
  ).test(danger.github.pr.body);

  const isBot = danger.github.pr.user.type === 'Bot';

  if (!isBot && !markedNoDeploymentDependency && !hasDeploymentDependencyLabel) {
    fail(
      "Please explicitly check off '[ ] This change does not add a deployment dependency' \
  or add 'Deployment Dependency' label and description",
    );
  }

  if (!isBot && hasDeploymentDependencyLabel && !hasDeploymentDependencyDescription) {
    fail(
      "Please add 'Deployment Dependency' heading to PR description with description of services involved",
    );
  }
}
