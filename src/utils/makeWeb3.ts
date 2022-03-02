/* eslint-disable no-param-reassign */
/*
 * HotFix for Web3.js Error: Number can only safely store up to 53 bits
 * See: https://github.com/ChainSafe/web3.js/issues/3936#issuecomment-797342613
 */
import Web3 from 'web3';
import { formatters } from 'web3-core-helpers';
import utils from 'web3-utils';

export function makeWeb3(httpRPCUrl: string): Web3 {
  return new Web3(new Web3.providers.HttpProvider(httpRPCUrl)).extend({
    property: 'eth',
    methods: [
      {
        name: 'getBlock',
        call: 'eth_getBlockByNumber',
        params: 2,
        inputFormatter: [formatters.inputBlockNumberFormatter, (val: any) => !!val] as any,
        outputFormatter: outputBlockFormatter as any,
      },
    ],
  });
}

function outputBlockFormatter(block: any) {
  // transform to number
  block.gasLimit = formatters.outputBigNumberFormatter(block.gasLimit);
  block.gasUsed = formatters.outputBigNumberFormatter(block.gasUsed);
  block.size = utils.hexToNumber(block.size);
  block.timestamp = utils.hexToNumber(block.timestamp);
  if (block.number !== null) block.number = utils.hexToNumber(block.number);

  if (block.difficulty) block.difficulty = formatters.outputBigNumberFormatter(block.difficulty);
  if (block.totalDifficulty)
    block.totalDifficulty = formatters.outputBigNumberFormatter(block.totalDifficulty);

  if (Array.isArray(block.transactions)) {
    block.transactions.forEach((item: any) => {
      if (!(typeof item === 'string')) return outputTransactionFormatter(item);
    });
  }

  if (block.miner) block.miner = utils.toChecksumAddress(block.miner);

  if (block.baseFeePerGas) block.baseFeePerGas = utils.hexToNumber(block.baseFeePerGas);

  return block;
}

function outputTransactionFormatter(tx: any) {
  if (tx.blockNumber !== null) tx.blockNumber = utils.hexToNumber(tx.blockNumber);
  if (tx.transactionIndex !== null) tx.transactionIndex = utils.hexToNumber(tx.transactionIndex);
  tx.nonce = utils.hexToNumber(tx.nonce);
  tx.gas = formatters.outputBigNumberFormatter(tx.gas);
  if (tx.gasPrice) tx.gasPrice = formatters.outputBigNumberFormatter(tx.gasPrice);
  if (tx.maxFeePerGas) tx.maxFeePerGas = formatters.outputBigNumberFormatter(tx.maxFeePerGas);
  if (tx.maxPriorityFeePerGas)
    tx.maxPriorityFeePerGas = formatters.outputBigNumberFormatter(tx.maxPriorityFeePerGas);
  if (tx.type) tx.type = utils.hexToNumber(tx.type);
  tx.value = formatters.outputBigNumberFormatter(tx.value);

  if (tx.to && utils.isAddress(tx.to)) {
    // tx.to could be `0x0` or `null` while contract creation
    tx.to = utils.toChecksumAddress(tx.to);
  } else {
    tx.to = null; // set to `null` if invalid address
  }

  if (tx.from) {
    tx.from = utils.toChecksumAddress(tx.from);
  }

  return tx;
}
