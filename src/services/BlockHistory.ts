/* eslint-disable no-await-in-loop */
import NodeCache from 'node-cache';
import Web3 from 'web3';
import { toNumber } from 'web3-utils';

import { BLOCK_HISTORY_SIZE, PERCENTILES } from '../constants';
import { BlockRecord, BlockNumber } from '../types';
import { makeWeb3 } from '../utils/makeWeb3';
import { percentiles } from '../utils/percentiles';

export class BlockHistory {
  private web3: Web3;
  private cache = new NodeCache();
  private size: number = BLOCK_HISTORY_SIZE;

  constructor(rpcURL: string, private averageBlockTime: number, private networkID: number) {
    this.web3 = makeWeb3(rpcURL);

    this.connect();
  }

  public async getRecords(): Promise<BlockRecord[]> {
    const cachedBlocks = this.getBlocksFromCache();
    const pendingBlock = await this.getBlocksFromWeb3(1, 'pending');
    const allBlocks = cachedBlocks.concat(pendingBlock);

    if (cachedBlocks.length < this.size / 2) {
      console.warn(
        '[%s] Gas price might be inaccurate. Expected %s cached records, but got %s',
        this.networkID,
        this.size,
        cachedBlocks.length,
      );
    }

    return allBlocks;
  }

  private getBlocksFromCache() {
    const cachedBlocks = this.cache.keys().reduce((acc, key) => {
      const block: BlockRecord | undefined = this.cache.get<BlockRecord>(key);
      return block ? acc.concat(block) : acc;
    }, [] as BlockRecord[]);

    return cachedBlocks;
  }

  private async getBlocksFromWeb3(blockCount: number, lastBlockNumber: BlockNumber) {
    const blockRecords = await this.getFeeHistory(blockCount, lastBlockNumber).catch(() =>
      this.getFeeHistoryFallback(blockCount, lastBlockNumber),
    );

    return blockRecords;
  }

  private async getFeeHistory(
    blockCount: number,
    lastBlockNumber: BlockNumber,
  ): Promise<BlockRecord[]> {
    const feeHistory = await this.web3.eth.getFeeHistory(blockCount, lastBlockNumber, PERCENTILES);
    const { oldestBlock, baseFeePerGas } = feeHistory;

    const reward = feeHistory.reward.filter(blockRewards => blockRewards.some(x => !!toNumber(x)));
    if (reward.length === 0) {
      throw Error(
        `[${this.networkID}] getFeeHistory() is not fully supported in ${lastBlockNumber}`,
      );
    }

    const result: BlockRecord[] = reward
      .map((blockRewards, index) => ({
        number: toNumber(oldestBlock) + index,
        baseFeePerGas: toNumber(baseFeePerGas[index]),
        rewards: blockRewards.map(toNumber),
      }))
      .filter(value => !this.cache.has(value.number));

    return result;
  }

  private async getFeeHistoryFallback(
    blockCount: number,
    lastBlockNumber: BlockNumber,
  ): Promise<BlockRecord[]> {
    const result: BlockRecord[] = [];
    let progress = 0;
    let blockNumber = lastBlockNumber;

    while (progress < blockCount) {
      let block;
      if (!this.cache.has(blockNumber)) {
        // eslint-disable-next-line @typescript-eslint/no-loop-func
        block = await this.web3.eth.getBlock(blockNumber, true).catch(err => {
          console.warn('[%s] Skipping block %s: %s', this.networkID, blockNumber, err);
          return null;
        });
      }

      if (block) {
        result.push({
          number: block.number,
          baseFeePerGas: 0,
          rewards: percentiles(
            block.transactions.map(tx => toNumber(tx.gasPrice)).filter(gasPrice => !!gasPrice),
            PERCENTILES,
          ),
        });
        blockNumber = block.number - 1;
      } else {
        blockNumber = await this.getPreviousBlockNumber(blockNumber);
      }

      progress += 1;
    }

    return result.reverse();
  }

  private async getPreviousBlockNumber(blockNumber: BlockNumber): Promise<number> {
    if (blockNumber === 'pending' || blockNumber === 'latest') {
      const pending = await this.web3.eth.getBlockNumber();
      return blockNumber === 'pending' ? pending - 1 : pending - 2;
    }
    return blockNumber - 1;
  }

  private cacheRecords(blockRecords: BlockRecord[]) {
    const successfullyCached = this.cache.mset(
      blockRecords.map(val => ({
        val,
        key: val.number,
      })),
    );
    if (successfullyCached) {
      const cacheKeys = this.cache.keys();
      const latestBlock = Math.max(...cacheKeys.map(Number));
      this.cache.del(cacheKeys.filter(key => Number(key) <= latestBlock - this.size));
    }
  }

  private async connect() {
    const startPolling = async () => {
      try {
        const newRecords = await this.getBlocksFromWeb3(this.size, 'latest');
        this.cacheRecords(newRecords);
      } catch (error) {
        console.warn('[%s] Restarting polling... %s', this.networkID, error);
      } finally {
        setTimeout(startPolling, this.averageBlockTime);
      }
    };

    return startPolling();
  }
}
