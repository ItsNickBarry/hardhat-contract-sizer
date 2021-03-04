const fs = require('fs');
const path = require('path');
const { extendConfig } = require('hardhat/config');
const colors = require('colors/safe');
const Table = require('cli-table3');

const {
  TASK_COMPILE,
} = require('hardhat/builtin-tasks/task-names');

extendConfig(function (config, userConfig) {
  config.contractSizer = Object.assign(
    {
      alphaSort: false,
      runOnCompile: false,
      disambiguatePaths: false,
    },
    userConfig.contractSizer
  );
});

const NAME = 'size-contracts';
const DESC = 'Output the size of compiled contracts';

const SIZE_LIMIT = 24576;

task(NAME, DESC, async function (args, hre) {
  let files = await hre.artifacts.getArtifactPaths();

  let contracts = files.map(function (file) {
    let name = file.replace(hre.config.paths.root, '');

    if (!hre.config.contractSizer.disambiguatePaths) {
      name = path.basename(name).replace('.json', '');
    }

    let { deployedBytecode } = JSON.parse(fs.readFileSync(file));

    let size = Buffer.from(
      deployedBytecode.replace(/__\$\w*\$__/g, '0'.repeat(40)).slice(2),
      'hex'
    ).length;

    return { name, size };
  });

  if (hre.config.contractSizer.alphaSort) {
    contracts.sort((a, b) => a.name.toUpperCase() > b.name.toUpperCase() ? 1 : -1);
  } else {
    contracts.sort((a, b) => a.size - b.size);
  }

  let table = new Table({
    head: [colors.bold('Contract Name'), 'Size (Kb)'],
    style: { head: [], border: [], 'padding-left': 2, 'padding-right': 2 },
    chars: {
      mid: '·',
      'top-mid': '|',
      'left-mid': ' ·',
      'mid-mid': '|',
      'right-mid': '·',
      left: ' |',
      'top-left': ' ·',
      'top-right': '·',
      'bottom-left': ' ·',
      'bottom-right': '·',
      middle: '·',
      top: '-',
      bottom: '-',
      'bottom-mid': '|',
    },
  });

  let largeContracts = 0;

  for (let contract of contracts) {
    if (!contract.size) {
      continue;
    }

    let name = contract.name;
    let size = (contract.size / 1024).toFixed(2);

    if (contract.size > SIZE_LIMIT) {
      size = colors.red.bold(size);
      largeContracts++;
    } else if (contract.size > SIZE_LIMIT * 0.9) {
      size = colors.yellow.bold(size);
    }

    table.push([
      { content: name },
      { content: size, hAlign: 'right' },
    ]);
  }

  console.log(table.toString());

  if (largeContracts) {
    console.log();
    console.log(colors.red(`Warning: ${ largeContracts } contracts exceed the size limit for mainnet deployment.`));
  }
});

task(TASK_COMPILE, async function (args, hre, runSuper) {
  await runSuper();

  if (hre.config.contractSizer.runOnCompile) {
    await hre.run(NAME);
  }
});
