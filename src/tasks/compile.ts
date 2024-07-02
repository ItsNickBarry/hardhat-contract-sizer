import { TASK_COMPILE } from 'hardhat/builtin-tasks/task-names';
import { task } from 'hardhat/config';

task(TASK_COMPILE)
  .addFlag(
    'noSizeContracts',
    "Don't size contracts after running this task, even if runOnCompile option is enabled",
  )
  .setAction(async (args, hre, runSuper) => {
    await runSuper();

    if (
      hre.config.contractSizer.runOnCompile &&
      !args.noSizeContracts &&
      !(hre as any).__SOLIDITY_COVERAGE_RUNNING
    ) {
      // Disable compile to avoid an infinite loop
      await hre.run('size-contracts', { noCompile: true });
    }
  });
