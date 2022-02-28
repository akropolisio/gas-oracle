import BN, { isBN } from 'bn.js';

expect.addSnapshotSerializer({
  test: (value) => isBN(value),
  print: (value) => (value as BN).toString(),
});
