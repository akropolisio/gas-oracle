import { NetworkID } from './types';
import { percentileToBlocks } from './utils/percentileToBlocks';

export const ETHEREUM_JSON_RPC_URLS: Record<NetworkID, string> = {
  1: 'https://eth-mainnet.alchemyapi.io/v2/Rz8ueSTVkKGmbcp8JX-Aj8Tx3mTYZSwI',
  4: 'https://eth-rinkeby.alchemyapi.io/v2/GxeYT3C6LuVsPiTlNj21p6QuJOp3W1A5',
  56: 'https://bsc.getblock.io/mainnet/?api_key=a6b9f45b-2135-47a6-85ab-7926c15329f4',
  97: 'https://bsc.getblock.io/testnet/?api_key=a6b9f45b-2135-47a6-85ab-7926c15329f4',
  42161: 'https://arb-mainnet.g.alchemy.com/v2/Q3oYBFgtujCfn8XH80oYAsIk6JvVOg24',
  421611: 'https://arb-rinkeby.g.alchemy.com/v2/WAq8j4jLlQFNSfZf43ZVj7OtYcqgkK59',
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
