import NodeCache from 'node-cache';
import Web3 from 'web3';
import { toNumber } from 'web3-utils';

import { ETHEREUM_JSON_RPC_URLS, HISTORY_BLOCK_COUNT, PERCENTILES } from '../constants';
import { BlockRecord, NetworkID } from '../types';
import { makeWeb3 } from '../utils/makeWeb3';
import { percentiles } from '../utils/percentiles';

export class BlockHistory {
  private web3: Web3;
  private cache = new NodeCache();

  constructor(networkID: NetworkID, private size: number = HISTORY_BLOCK_COUNT) {
    const rpcURL = ETHEREUM_JSON_RPC_URLS[networkID];
    this.web3 = makeWeb3(rpcURL);

    this.cache.on('set', (key: number) => {
      this.cache.del(key - this.size);
    });
  }

  public async getRecords(blockCount: number = this.size): Promise<BlockRecord[]> {
    const pendingBlockNumber = await this.web3.eth.getBlockNumber();
    const blocks = this.getBlocksFromCache(blockCount - 1, pendingBlockNumber - 1);

    const missingBlockCount = blockCount - blocks.length;
    const newBlocks = await this.getBlocksFromWeb3(missingBlockCount, pendingBlockNumber);

    return blocks.concat(newBlocks);
  }

  private getBlocksFromCache(blockCount: number, newestBlock: number) {
    const blocks: BlockRecord[] = [];
    let oldestBlockNumber = newestBlock - blockCount + 1;

    while (oldestBlockNumber <= newestBlock) {
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

  private async getBlocksFromWeb3(blockCount: number, newestBlock: number) {
    const blockRecords = await this.getFeeHistory(blockCount, newestBlock).catch(() =>
      this.getFeeHistoryFallback(blockCount, newestBlock),
    );

    this.cache.mset(
      blockRecords.map(val => ({
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
