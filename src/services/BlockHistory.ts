/* eslint-disable no-await-in-loop */
/* eslint-disable no-console */
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

  // TODO: remove network
  constructor(rpcURL: string, private averageBlockTime: number, private network: number) {
    this.web3 = makeWeb3(rpcURL);

    this.connect();
  }

  public async getRecords(): Promise<BlockRecord[]> {
    const cachedBlocks = this.getBlocksFromCache();

    const pendingBlock = await this.getBlocksFromWeb3(1, 'pending');
    console.log('========== [Network %s]: Request =========', this.network);
    console.log(
      'blocks from cache: %s, pending block: %s',
      cachedBlocks.length,
      pendingBlock[0].number,
    );
    console.log('========== ======= =========');

    const allBlocks = cachedBlocks.concat(pendingBlock);

    return allBlocks;
  }

  private getBlocksFromCache() {
    const cachedBlocks = this.cache.keys().reduce((acc, key) => {
      const block = this.cache.get<BlockRecord>(key);
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
    console.log(
      '[Network %s] eth_getFeeHistory, last block: %s',
      this.network,
      blockCount,
      lastBlockNumber,
    );
    const { reward, oldestBlock, baseFeePerGas } = await this.web3.eth.getFeeHistory(
      blockCount,
      lastBlockNumber,
      PERCENTILES,
    );
    return reward
      .map((blockRewards, index) => ({
        number: toNumber(oldestBlock) + index,
        baseFeePerGas: toNumber(baseFeePerGas[index]),
        rewards: blockRewards.map(toNumber),
      }))
      .filter(value => !this.cache.has(value.number));
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
        console.log('[Network %s] eth_getBlockByNumber, last block: %s', this.network, blockNumber);

        // eslint-disable-next-line @typescript-eslint/no-loop-func
        block = await this.web3.eth.getBlock(blockNumber, true).catch(err => {
          console.warn('[Network %s] Skipping block %s: %s', this.network, blockNumber, err);
          return null;
        });

        if (block) {
          result.push({
            number: block.number,
            baseFeePerGas: 0,
            rewards: percentiles(
              block.transactions.map(tx => toNumber(tx.gasPrice)),
              PERCENTILES,
            ),
          });
        }
      }

      blockNumber = block ? block.number - 1 : await this.getPreviousBlockNumber(blockNumber);
      progress += 1;
    }

    return result.reverse();
  }

  private async getPreviousBlockNumber(blockNumber: BlockNumber): Promise<number> {
    if (blockNumber === 'pending' || blockNumber === 'latest') {
      console.log('[Network %s] eth_blockNumber', this.network);
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
      console.log(Math.max(...cacheKeys.map(Number)));
    }
  }

  private async connect() {
    const startPolling = async () => {
      const newRecords = await this.getBlocksFromWeb3(this.size, 'latest');
      console.log(
        '[Network %s]: Received: %s blocks, latest: %s',
        this.network,
        newRecords.length,
        newRecords[newRecords.length - 1]?.number,
      );
      this.cacheRecords(newRecords);
      console.log('[Network %s]: Cache size is %s', this.network, this.cache.keys().length);
      setTimeout(startPolling, this.averageBlockTime);
    };

    return startPolling();
  }
}
