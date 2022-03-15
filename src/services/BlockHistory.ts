import NodeCache from 'node-cache';
import Web3 from 'web3';
import { toNumber } from 'web3-utils';

import { BLOCK_HISTORY_SIZE, PERCENTILES } from '../constants';
import { BlockRecord } from '../types';
import { makeWeb3 } from '../utils/makeWeb3';
import { percentiles } from '../utils/percentiles';

export class BlockHistory {
  private web3: Web3;
  private cache = new NodeCache();

  constructor(rpcURL: string, private size: number = BLOCK_HISTORY_SIZE) {
    this.web3 = makeWeb3(rpcURL);

    this.cache.on('set', (key: number) => {
      this.cache.del(key - this.size);
    });
  }

  public async getRecords(blockCount: number = this.size): Promise<BlockRecord[]> {
    const pendingBlockNumber = await this.web3.eth.getBlockNumber();
    const latestBlockNumber = pendingBlockNumber - 1;
    const minedBlockCount = blockCount - 1;

    const { cachedBlocks, missingBlocks } = this.getBlocksFromCache(
      minedBlockCount,
      latestBlockNumber,
    );

    const newBlocks = await this.getBlocksFromWeb3(missingBlocks);
    this.cacheRecords(newBlocks);

    const [pendingBlock] = await this.getBlocksFromWeb3([pendingBlockNumber]);
    const allBlocks = cachedBlocks.concat(newBlocks).concat(pendingBlock || []);

    return allBlocks;
  }

  private getBlocksFromCache(blockCount: number, newestBlockNumber: number) {
    const cachedBlocks: BlockRecord[] = [];
    const missingBlocks: number[] = [];
    let oldestBlockNumber = newestBlockNumber - blockCount + 1;

    while (oldestBlockNumber <= newestBlockNumber) {
      const value = this.cache.get<BlockRecord>(oldestBlockNumber);
      if (value) {
        cachedBlocks.push(value);
      } else {
        missingBlocks.push(oldestBlockNumber);
      }
      oldestBlockNumber += 1;
    }
    return { cachedBlocks, missingBlocks };
  }

  private async getBlocksFromWeb3(blockNumbers: number[]) {
    const blockRecords = await this.getFeeHistory(blockNumbers).catch(() =>
      this.getFeeHistoryFallback(blockNumbers),
    );

    return blockRecords;
  }

  private async getFeeHistory(blockNumbers: number[]): Promise<BlockRecord[]> {
    const newestBlockNumber = blockNumbers[blockNumbers.length - 1];
    const oldestBlockNumber = blockNumbers[0];
    const blockCount = newestBlockNumber - oldestBlockNumber + 1;

    const { reward, oldestBlock, baseFeePerGas } = await this.web3.eth.getFeeHistory(
      blockCount,
      newestBlockNumber,
      PERCENTILES,
    );
    return reward
      .map((blockRewards, index) => ({
        number: toNumber(oldestBlock) + index,
        baseFeePerGas: toNumber(baseFeePerGas[index]),
        rewards: blockRewards.map(toNumber),
      }))
      .filter(value => blockNumbers.includes(value.number));
  }

  private async getFeeHistoryFallback(blockNumbers: number[]): Promise<BlockRecord[]> {
    const blocks = await Promise.allSettled(
      blockNumbers.map(blockNumber => this.web3.eth.getBlock(blockNumber, true)),
    );

    return blocks.reduce((acc, block, index) => {
      if (block.status === 'rejected' || !block.value) {
        console.warn(
          `Skipping block ${blockNumbers[index]}: ${
            block.status === 'rejected' ? block.reason : 'value is empty'
          }`,
        );
        return acc;
      }
      return acc.concat({
        number: block.value.number,
        baseFeePerGas: 0,
        rewards: percentiles(
          block.value.transactions.map(tx => toNumber(tx.gasPrice)),
          PERCENTILES,
        ),
      });
    }, [] as BlockRecord[]);
  }

  private cacheRecords(blockRecords: BlockRecord[]) {
    return this.cache.mset(
      blockRecords.map(val => ({
        val,
        key: val.number,
      })),
    );
  }
}
