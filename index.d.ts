import 'hardhat/types/config';

declare module 'hardhat/types/config' {
  interface HardhatUserConfig {
    contractSizer?: {
      alphaSort?: boolean,
      disambiguatePaths?: boolean,
      runOnCompile?: boolean,
      strict?: boolean,
    }
  }

  interface HardhatConfig {
    contractSizer: {
      alphaSort: boolean,
      disambiguatePaths: boolean,
      runOnCompile: boolean,
      strict: boolean
    }
  }
}
