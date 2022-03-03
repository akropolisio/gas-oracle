# Akropolis Gas Oracle
This service estimates `EIP-1559` gas fees and legacy gas price.
If the network supports `EIP-1559`, the estimates are based on the outputs of `web3.getFeeHistory(200, 'pending', PERCENTILES)`, otherwise, `gasPrice` percentiles are calculated using transactions from the latest 200 blocks.

For Akropolis origins, the server can be reached at https://gas-oracle.akropolis.io/.

## Supported networks
- Ethereum Mainnet 1
- Ethereum Rinkeby 4
- BSC Mainnet 56
- BSC Testnet 97
- Arbitrum One 42161
- Arbitrum Testnet 421611

## Installation
Clone this repo:

```
git clone https://github.com/akropolisio/gas-oracle.git
cd gas-oracle
```

Install dependencies:

```
npm install
```

Also make sure you have [pm2](https://pm2.keymetrics.io/) installed.

## Usage
Start:

```
npm run start
```

Start with dev mode (will automatically refresh on source updates):

```
npm run start:dev
```

These commands will start separate pm2 processes for each network.

To stop pm2 run:

```
npm run stop
``` 
Note that pm2 runs in background, so to see console logs run:
```
pm2 logs
```
For more commands see [pm2 docs](https://pm2.keymetrics.io/docs/usage/quick-start/).

## API
The data can be fetched under `/gas/[networkID]` endpoint. The response contains a json with the following structure:
```
type GasParams = Record<
  'slow' | 'standard' | 'fast',
  {
    pendingBlock: number;
    gasPrice: number;
    waitTime: number;
    percent: number;
    baseFeePerGas?: number;
    maxPriorityFeePerGas?: number;
    maxFeePerGas?: number;
  }
>;
```
- pendingBlock - pending block number at the time of the request;
- gasPrice - suggested gasPrice in gwei;
- waitTime - milliseconds to wait before tx is added in a block;
- percent - hardcoded values to calculate rewardPercentiles. Equal to `25` for slow speed, `60` for standard speed, and `90` for fast speed;
- baseFeePerGas - baseFeePerGas for the pending block in gwei, `undefined` if EIP-1559 not supported;
- maxPriorityFeePerGas - suggested maxPriorityFeePerGas in gwei, `undefined` if EIP-1559 not supported;
- maxFeePerGas - suggested maxFeePerGas in gwei, `undefined` if EIP-1559 not supported. Equals to `2 * baseFeePerGas + maxPriorityFeePerGas`.

