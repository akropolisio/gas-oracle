import { PERCENTILES, PERCENTILES_IN_BLOCKS } from '../constants';
import { GasParams } from '../types';
import { median } from '../utils/median';
import { BlockHistory } from './BlockHistory';

export class Oracle {
  private blockHistory: BlockHistory;
  private waitTime: number[];

  constructor(rpcURL: string, averageBlockTime: number, networkID: number) {
    this.blockHistory = new BlockHistory(rpcURL, averageBlockTime, networkID);
    this.waitTime = PERCENTILES_IN_BLOCKS.map(blockCount => blockCount * averageBlockTime);
  }

  public async getGasParams(): Promise<GasParams> {
    const blockRecords = await this.blockHistory.getRecords();
    if (blockRecords.length === 0) {
      throw Error('Not enough data to calculate gas params');
    }

    const { baseFeePerGas: pendingBaseFeePerGas, number } = blockRecords[blockRecords.length - 1];
    const gasParams = PERCENTILES.map((percent, i) => {
      const result = {
        pendingBlock: number,
        percent,
        waitTime: this.waitTime[i],
      };

      if (pendingBaseFeePerGas) {
        const maxPriorityFeePerGas = Math.round(
          median(blockRecords.map(block => block.rewards[i]).filter(x => !!x)),
        );
        return {
          ...result,
          maxPriorityFeePerGas,
          baseFeePerGas: pendingBaseFeePerGas,
          gasPrice: maxPriorityFeePerGas + pendingBaseFeePerGas,
          maxFeePerGas: 2 * pendingBaseFeePerGas + maxPriorityFeePerGas,
        };
      }
      return {
        ...result,
        gasPrice: Math.round(
          median(
            blockRecords.map(block => block.baseFeePerGas + block.rewards[i]).filter(x => !!x),
          ),
        ),
      };
    });

    return {
      slow: gasParams[0],
      standard: gasParams[1],
      fast: gasParams[2],
    };
  }
}
