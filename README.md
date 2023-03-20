# Akropolis Gas Oracle
This service estimates `EIP-1559` gas fees and legacy gas price.
If the network supports `EIP-1559`, the estimates are based on the outputs of `web3.getFeeHistory(200, 'pending', PERCENTILES)`, otherwise, `gasPrice` percentiles are calculated using transactions from the latest 200 blocks.

For Akropolis origins, the server can be reached at https://gas-oracle.akropolis.io/.

## Supported networks
- Ethereum Mainnet 1
- BSC Mainnet 56
- Arbitrum One 42161

## Installation
Clone this repo:

```
git clone git@github.com:akropolisio/gas-oracle.git
cd gas-oracle
```

Install dependencies:

```
npm install
```

Create .env with RPC urls:
```
cp .example.env .env && nano .env
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

## Adding new networks
Add RPC url to .env:
```
JSON_RPC_URL_42="https://kovan.infura.io/v3/API_KEY"
```
Provide average block time (ms) in src/rpcSettings.json (default is 15000ms):
```
{
  "averageBlockTime": {
    // ...
    "42": 4000
  }
}
```
Restart pm2 in terminal:
```
pm2 restart pm2.json --update-env
```

## API
The data can be fetched under `[networkID]` endpoint. The response contains a json with the following structure:
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
- gasPrice - suggested gasPrice in wei;
- waitTime - milliseconds to wait before tx is added in a block;
- percent - hardcoded values to calculate rewardPercentiles. Equal to `25` for slow speed, `60` for standard speed, and `90` for fast speed;
- baseFeePerGas - baseFeePerGas for the pending block in wei, `undefined` if EIP-1559 not supported;
- maxPriorityFeePerGas - suggested maxPriorityFeePerGas in wei, `undefined` if EIP-1559 not supported;
- maxFeePerGas - suggested maxFeePerGas in wei, `undefined` if EIP-1559 not supported. Equals to `2 * baseFeePerGas + maxPriorityFeePerGas`.
