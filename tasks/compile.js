const {
  TASK_COMPILE,
} = require('hardhat/builtin-tasks/task-names');

task(TASK_COMPILE, async function (args, hre, runSuper) {
  await runSuper();

  if (hre.config.contractSizer.runOnCompile) {
    await hre.run('size-contracts');
  }
});
