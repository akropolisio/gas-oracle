import { AVERAGE_BLOCK_TIME, PERCENTILES, PERCENTILES_IN_BLOCKS } from '../constants';
import { GasParams, NetworkID } from '../types';
import { median } from '../utils/median';
import { BlockHistory } from './BlockHistory';

export class Oracle {
  private blockHistory: BlockHistory;
  private waitTime: number[];

  constructor(network: NetworkID) {
    this.blockHistory = new BlockHistory(network);
    this.waitTime = PERCENTILES_IN_BLOCKS.map(
      blockCount => blockCount * AVERAGE_BLOCK_TIME[network],
    );
  }

  public async getGasParams(): Promise<GasParams> {
    const blockRecords = await this.blockHistory.getRecords();

    const { baseFeePerGas: pendingBaseFeePerGas, number } = blockRecords[blockRecords.length - 1];
    const gasParams = PERCENTILES.map((percent, i) => {
      const result = {
        pendingBlock: number,
        gasPrice: median(
          blockRecords.map(block => block.baseFeePerGas + block.rewards[i]).filter(x => !!x),
        ),
        percent,
        waitTime: this.waitTime[i],
        baseFeePerGas: pendingBaseFeePerGas,
      };
      if (!pendingBaseFeePerGas) {
        return result;
      }

      const maxPriorityFeePerGas = median(
        blockRecords.map(block => block.rewards[i]).filter(x => !!x),
      );
      return {
        ...result,
        maxPriorityFeePerGas,
        maxFeePerGas: 2 * pendingBaseFeePerGas + maxPriorityFeePerGas,
      };
    });

    return {
      slow: gasParams[0],
      standard: gasParams[1],
      fast: gasParams[2],
    };
  }
}
