import { percentileToBlocks } from './utils/percentileToBlocks';

export const BLOCK_HISTORY_SIZE = 200;

export const PERCENTILES = [25, 60, 90];
export const PERCENTILES_IN_BLOCKS = PERCENTILES.map(percentileToBlocks);

export const DEFAULT_AVERAGE_BLOCK_TIME = 15000;

export const WHITELISTED_ORIGINS = [
  'https://www.akropolis.io',
  'https://testnet.akropolis.io',
  /^https:\/\/.+akropolisio\.vercel\.app$/,
  'http://localhost:8083',
];
