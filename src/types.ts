export type NetworkID = number;

export type GasParams = Record<
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

export type BlockRecord = {
  number: number;
  baseFeePerGas: number;
  rewards: number[];
};

export type BlockNumber = number | 'latest' | 'pending';
