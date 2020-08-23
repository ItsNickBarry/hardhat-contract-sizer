const fs = require('fs');
const colors = require('colors/safe');
const Table = require('cli-table3');

const {
  TASK_COMPILE,
} = require('@nomiclabs/buidler/builtin-tasks/task-names');

const CONFIG = {
  alphaSort: false,
  runOnCompile: false,
};

const NAME = 'size-contracts';
const DESC = 'Output the size of compiled contracts';

const SIZE_LIMIT = 24576;

task(NAME, DESC, async function (args, bre) {
  let config = Object.assign({}, CONFIG, bre.config.contractSizer);

  let files = fs.readdirSync(bre.config.paths.artifacts);

  let contracts = files.map(function (file) {
    let { deployedBytecode } = JSON.parse(fs.readFileSync(`${ bre.config.paths.artifacts }/${ file }`));
    return {
      name: file.replace('.json', ''),
      size: Buffer.from(deployedBytecode.slice(2), 'hex').length,
    };
  });

  if (config.alphaSort) {
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

task(TASK_COMPILE, async function (args, bre, runSuper) {
  let config = Object.assign({}, CONFIG, bre.config.contractSizer);

  await runSuper();

  if (config.runOnCompile) {
    await bre.run(NAME);
  }
});
