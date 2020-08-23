# Buidler Contract Sizer

Output Solidity contract sizes with Buidler.

## Installation

```bash
yarn add --dev buidler-contract-sizer
```

## Usage

Load plugin in Buidler config:

```javascript
usePlugin('buidler-contract-sizer');
```

Add configuration under the `contractSizer` key:

| option | description | default |
|-|-|-|
| `alphaSort` | whether to sort results table alphabetically (default sort is by contract size) | `false`
| `runOnCompile` | whether to output contract sizes automatically after compilation | `false` |

```javascript
contractSizer: {
  alphaSort: true,
  runOnCompile: true,
}
```

Run the included Buidler task to output compiled contract sizes:

```bash
yarn run buidler size-contracts
```
