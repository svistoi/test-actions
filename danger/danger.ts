function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run(): Promise<void> {
  const { repo, owner, pull_number } = danger.github.thisPR;

  message("Message 1");
  sleep(500);
  message("Message 2");
  sleep(500);
  message("Message 3");
  sleep(500);
  message("Message 4");
}

run();
