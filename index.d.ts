import 'hardhat/types/config';

declare module 'hardhat/types/config' {
  interface HardhatUserConfig {
    contractSizer?: {
      alphaSort?: boolean,
      runOnCompile?: boolean,
      disambiguatePaths: boolean,
    }
  }

  interface HardhatConfig {
    contractSizer: {
      alphaSort: boolean,
      runOnCompile: boolean,
      disambiguatePaths: boolean,
    }
  }
}
