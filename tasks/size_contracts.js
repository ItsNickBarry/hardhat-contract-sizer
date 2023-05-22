const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const stripAnsi = require('strip-ansi');
const Table = require('cli-table3');
const { HardhatPluginError } = require('hardhat/plugins');
const {
  TASK_COMPILE,
} = require('hardhat/builtin-tasks/task-names');

task(
  'size-contracts', 'Output the size of compiled contracts'
).addFlag(
  'noCompile', 'Don\'t compile before running this task'
).setAction(async function (args, hre) {
  if (!args.noCompile) {
    await hre.run(TASK_COMPILE, { noSizeContracts: true });
  }

  const config = hre.config.contractSizer;

  // TODO: avoid hardcoding unit names
  if (!['B', 'kB', 'KiB'].includes(config.unit)) {
    throw new HardhatPluginError(`Invalid unit: ${ config.unit }`);
  }

  const SIZE_LIMIT = 24576;

  const formatSize = function (size) {
    const divisor = { 'B': 1, 'kB': 1000, 'KiB': 1024 }[config.unit];
    return (size / divisor).toFixed(3);
  };

  const outputData = [];

  const fullNames = await hre.artifacts.getAllFullyQualifiedNames();

  const outputPath = path.resolve(
    hre.config.paths.cache,
    '.hardhat_contract_sizer_output.json'
  );

  const previousSizes = {};

  if (fs.existsSync(outputPath)) {
    const previousOutput = await fs.promises.readFile(outputPath);

    JSON.parse(previousOutput).forEach(function (el) {
      previousSizes[el.fullName] = el.size;
    });
  }

  await Promise.all(fullNames.map(async function (fullName) {
    if (config.only.length && !config.only.some(m => fullName.match(m))) return;
    if (config.except.length && config.except.some(m => fullName.match(m))) return;

    const { deployedBytecode } = await hre.artifacts.readArtifact(fullName);
    const size = Buffer.from(
      deployedBytecode.replace(/__\$\w*\$__/g, '0'.repeat(40)).slice(2),
      'hex'
    ).length;

    outputData.push({
      fullName,
      displayName: config.disambiguatePaths ? fullName : fullName.split(':').pop(),
      size,
      previousSize: previousSizes[fullName] || null,
    });
  }));

  if (config.alphaSort) {
    outputData.sort((a, b) => a.displayName.toUpperCase() > b.displayName.toUpperCase() ? 1 : -1);
  } else {
    outputData.sort((a, b) => a.size - b.size);
  }

  await fs.promises.writeFile(outputPath, JSON.stringify(outputData), { flag: 'w' });

  const table = new Table({
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

  const compiler = hre.config.solidity.compilers[0];

  table.push([
    {
      content: chalk.gray(`Solc version: ${compiler.version}`),
    },
    {
      content: chalk.gray(`Optimizer enabled: ${compiler.settings.optimizer.enabled}`),
    },
    {
      content: chalk.gray(`Runs: ${compiler.settings.optimizer.runs}`),
    },
  ]);

  table.push([
    {
      content: chalk.bold('Contract Name'),
    },
    {
      content: chalk.bold(`Size (${config.unit})`),
    },
    {
      content: chalk.bold(`Change (${config.unit})`),
    },
  ]);

  let oversizedContracts = 0;

  for (let item of outputData) {
    if (!item.size) {
      continue;
    }

    let size = formatSize(item.size);

    if (item.size > SIZE_LIMIT) {
      size = chalk.red.bold(size);
      oversizedContracts++;
    } else if (item.size > SIZE_LIMIT * 0.9) {
      size = chalk.yellow.bold(size);
    }

    let diff = '';

    if (item.previousSize) {
      if (item.size < item.previousSize) {
        diff = chalk.green(`-${formatSize(item.previousSize - item.size)}`);
      } else if (item.size > item.previousSize) {
        diff = chalk.red(`+${formatSize(item.size - item.previousSize)}`);
      } else {
        diff = chalk.yellow(formatSize(0));
      }
    }

    table.push([
      { content: item.displayName },
      { content: size, hAlign: 'right' },
      { content: diff, hAlign: 'right' },
    ]);
  }

  console.log(table.toString());
  if (config.outputFile)
    fs.writeFileSync(config.outputFile, `${stripAnsi(table.toString())}\n`);

  if (oversizedContracts > 0) {
    console.log();

    const message = `Warning: ${oversizedContracts} contracts exceed the size limit for mainnet deployment (${formatSize(SIZE_LIMIT)} ${config.unit}).`;

    if (config.strict) {
      throw new HardhatPluginError(message);
    } else {
      console.log(chalk.red(message));
    }
  }
});
