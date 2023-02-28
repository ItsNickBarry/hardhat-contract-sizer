import "hardhat/types/config";

type CaseInsensitive<T extends string> = string extends T
  ? string
  : T extends `${infer F1}${infer F2}${infer R}`
  ? `${Uppercase<F1> | Lowercase<F1>}${
      | Uppercase<F2>
      | Lowercase<F2>}${CaseInsensitive<R>}`
  : T extends `${infer F}${infer R}`
  ? `${Uppercase<F> | Lowercase<F>}${CaseInsensitive<R>}`
  : "";

declare module "hardhat/types/config" {
  type Unit = "B" | "kB" | "KiB";
  type UnitCaseInsensitive = CaseInsensitive<Unit>;

  interface HardhatUserConfig {
    contractSizer?: {
      alphaSort?: boolean;
      disambiguatePaths?: boolean;
      runOnCompile?: boolean;
      strict?: boolean;
      only?: string[];
      except?: string[];
      outputFile?: string;
      unit?: UnitCaseInsensitive;
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
      unit: UnitCaseInsensitive;
    };
  }
}
