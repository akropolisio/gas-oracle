import { NetworkID } from './types';
import { percentileToBlocks } from './utils/percentileToBlocks';

export const ETHEREUM_JSON_RPC_URLS: Record<NetworkID, string> = {
  1: 'https://mainnet.infura.io/v3/eea14fc5eadb494abda29dfd5c89201e',
  4: 'https://rinkeby.infura.io/v3/eea14fc5eadb494abda29dfd5c89201e',
  56: 'https://bsc-dataseed.binance.org/',
  97: 'https://data-seed-prebsc-1-s1.binance.org:8545',
  42161: 'https://arb1.arbitrum.io/rpc',
  421611: 'https://rinkeby.arbitrum.io/rpc',
};

export const HISTORY_BLOCK_COUNT = 200;

export const PERCENTILES = [25, 60, 90];
export const PERCENTILES_IN_BLOCKS = PERCENTILES.map(percentileToBlocks);

export const AVERAGE_BLOCK_TIME: Record<NetworkID, number> = {
  1: 15 * 1000,
  4: 15 * 1000,
  56: 3 * 1000,
  97: 3 * 1000,
  42161: 3 * 1000,
  421611: 3 * 1000,
};

export const WHITELISTED_ORIGINS = [
  'https://www.akropolis.io',
  'https://testnet.akropolis.io',
  /^https:\/\/.+akropolisio\.vercel\.app$/,
  'http://localhost:8083',
];
