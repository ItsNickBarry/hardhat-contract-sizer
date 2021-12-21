import 'hardhat/types/config';

declare module 'hardhat/types/config' {
  interface HardhatUserConfig {
    contractSizer?: {
      alphaSort?: boolean,
      disambiguatePaths?: boolean,
      runOnCompile?: boolean,
      alwaysRecompile?: boolean,
      strict?: boolean,
      only?: string[],
      except?: string[],
    }
  }

  interface HardhatConfig {
    contractSizer: {
      alphaSort: boolean,
      disambiguatePaths: boolean,
      runOnCompile: boolean,
      alwaysRecompile: boolean,
      strict: boolean
      only: string[],
      except: string[],
    }
  }
}
