import '@nomiclabs/buidler/types';

declare module '@nomiclabs/buidler/types' {
  interface BuidlerConfig {
    contractSizer?: {
       alphasort?: boolean;
       runOnCompile?: boolean;
    };
  }
}
