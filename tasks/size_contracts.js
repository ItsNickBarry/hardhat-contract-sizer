const colors = require('colors/safe');
const Table = require('cli-table3');
const { HardhatPluginError } = require('hardhat/plugins');

const SIZE_LIMIT = 24576;

task('size-contracts', 'Output the size of compiled contracts')
  .addFlag('noCompile', 'Don\'t compile before running this task')
  .setAction(sizeContracts);

async function sizeContracts(args, hre) {
  const config = hre.config.contractSizer;

  if (!args.noCompile) {
    await hre.run('compile', { noSizeContracts: true });
  }

  const contracts = [];

  for (let fullName of await hre.artifacts.getAllFullyQualifiedNames()) {
    if (config.only.length && !config.only.some(m => fullName.match(m))) continue;
    if (config.except.length && config.except.some(m => fullName.match(m))) continue;

    const { deployedBytecode } = await hre.artifacts.readArtifact(fullName);
    const size = Buffer.from(
      deployedBytecode.replace(/__\$\w*\$__/g, '0'.repeat(40)).slice(2),
      'hex'
    ).length;

    if (!config.disambiguatePaths) {
      fullName = fullName.split(':').pop();
    }

    contracts.push({ name: fullName, size });
  }

  if (config.alphaSort) {
    contracts.sort((a, b) => a.name.toUpperCase() > b.name.toUpperCase() ? 1 : -1);
  } else {
    contracts.sort((a, b) => a.size - b.size);
  }

  const table = new Table({
    head: [colors.bold('Contract Name'), 'Size (KB)'],
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

    let size = (contract.size / 1000).toFixed(3);

    if (contract.size > SIZE_LIMIT) {
      size = colors.red.bold(size);
      largeContracts++;
    } else if (contract.size > SIZE_LIMIT * 0.9) {
      size = colors.yellow.bold(size);
    }

    table.push([
      { content: contract.name },
      { content: size, hAlign: 'right' },
    ]);
  }

  console.log(table.toString());

  if (largeContracts > 0) {
    console.log();

    const message = `Warning: ${ largeContracts } contracts exceed the size limit for mainnet deployment.`;

    if (config.strict) {
      throw new HardhatPluginError(message);
    } else {
      console.log(colors.red(message));
    }
  }
}
