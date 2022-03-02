export const supportedIDs = [1, 4, 56, 97, 42161, 421611] as const;
export type NetworkID = typeof supportedIDs[number];
export const isSupportedNetworkID = (value: unknown): value is NetworkID =>
  supportedIDs.includes(value as any);

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
