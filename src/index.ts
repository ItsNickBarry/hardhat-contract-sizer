import './tasks/compile';
import './tasks/size_contracts';
import { extendConfig } from 'hardhat/config';
import 'hardhat/types/config';

declare module 'hardhat/types/config' {
  interface HardhatUserConfig {
    contractSizer?: {
      alphaSort?: boolean;
      disambiguatePaths?: boolean;
      runOnCompile?: boolean;
      strict?: boolean;
      only?: string[];
      except?: string[];
      outputFile?: string;
      unit?: 'B' | 'kB' | 'KiB';
    };
  }

  interface HardhatConfig {
    contractSizer: {
      alphaSort: boolean;
      disambiguatePaths: boolean;
      runOnCompile: boolean;
      strict: boolean;
      only: string[];
      except: string[];
      outputFile: string;
      unit: 'B' | 'kB' | 'KiB';
    };
  }
}

extendConfig((config, userConfig) => {
  config.contractSizer = Object.assign(
    {
      alphaSort: false,
      disambiguatePaths: false,
      runOnCompile: false,
      strict: false,
      only: [],
      except: [],
      outputFile: null,
      unit: 'KiB',
    },
    userConfig.contractSizer,
  );
});
