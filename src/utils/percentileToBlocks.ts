export function percentileToBlocks(percentile: number): number {
  const expectedProbability = 0.999;
  let currentProbability = percentile / 100;
  let blocksCount = 1;

  while (currentProbability < expectedProbability) {
    blocksCount += 1;
    currentProbability += ((1 - currentProbability) * percentile) / 100;
  }

  return blocksCount;
}
