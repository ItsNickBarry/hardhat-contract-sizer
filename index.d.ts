import 'hardhat/types/config';

declare module 'hardhat/types/config' {
  interface HardhatUserConfig {
    contractSizer?: {
      alphaSort?: boolean,
      runOnCompile?: boolean,
      flat?: boolean,
      strict?: boolean,
      only?: string[],
      except?: string[],
    }
  }

  interface HardhatConfig {
    contractSizer: {
      alphaSort: boolean,
      runOnCompile: boolean,
      flat: boolean,
      strict: boolean
      only: string[],
      except: string[],
    }
  }
}
