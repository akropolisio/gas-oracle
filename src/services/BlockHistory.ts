import NodeCache from 'node-cache';
import Web3 from 'web3';
import { toNumber } from 'web3-utils';

import { HISTORY_BLOCK_COUNT, PERCENTILES } from '../constants';
import { BlockRecord } from '../types';
import { makeWeb3 } from '../utils/makeWeb3';
import { percentiles } from '../utils/percentiles';

export class BlockHistory {
  private web3: Web3;
  private cache = new NodeCache();

  constructor(rpcURL: string, private size: number = HISTORY_BLOCK_COUNT) {
    this.web3 = makeWeb3(rpcURL);

    this.cache.on('set', (key: number) => {
      this.cache.del(key - this.size);
    });
  }

  public async getRecords(blockCount: number = this.size): Promise<BlockRecord[]> {
    const pendingBlockNumber = await this.web3.eth.getBlockNumber();
    const blocks = this.getBlocksFromCache(blockCount, pendingBlockNumber);

    const missingBlockCount = blockCount - blocks.length;
    const newBlocks = await this.getBlocksFromWeb3(missingBlockCount, pendingBlockNumber);

    return blocks.concat(newBlocks);
  }

  private getBlocksFromCache(blockCount: number, pendingBlock: number) {
    const blocks: BlockRecord[] = [];
    let oldestBlockNumber = pendingBlock - blockCount + 1;

    while (oldestBlockNumber <= pendingBlock) {
      const value = this.cache.get<BlockRecord>(oldestBlockNumber);
      if (value) {
        blocks.push(value);
        oldestBlockNumber += 1;
      } else {
        break;
      }
    }
    return blocks;
  }

  private async getBlocksFromWeb3(blockCount: number, pendingBlock: number) {
    const blockRecords = await this.getFeeHistory(blockCount, pendingBlock).catch(() =>
      this.getFeeHistoryFallback(blockCount, pendingBlock),
    );

    this.cache.mset(
      blockRecords.slice(0, -1).map(val => ({
        val,
        key: val.number,
      })),
    );

    return blockRecords;
  }

  private async getFeeHistory(blockCount: number, newestBlock: number): Promise<BlockRecord[]> {
    const { reward, oldestBlock, baseFeePerGas } = await this.web3.eth.getFeeHistory(
      blockCount,
      newestBlock,
      PERCENTILES,
    );
    return reward.map((blockRewards, index) => ({
      number: toNumber(oldestBlock) + index,
      baseFeePerGas: toNumber(baseFeePerGas[index]),
      rewards: blockRewards.map(toNumber),
    }));
  }

  private async getFeeHistoryFallback(
    blockCount: number,
    newestBlock: number,
  ): Promise<BlockRecord[]> {
    const blocks = await Promise.all(
      Array.from(Array(blockCount), (_, index) =>
        this.web3.eth.getBlock(newestBlock - index, true),
      ),
    );

    return blocks.map(({ number, transactions }) => ({
      number,
      baseFeePerGas: 0,
      rewards: percentiles(
        transactions.map(tx => toNumber(tx.gasPrice)),
        PERCENTILES,
      ),
    }));
  }
}
