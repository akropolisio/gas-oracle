import assert from 'assert';
import express from 'express';

import { Oracle } from './services/Oracle';
import { isSupportedNetworkID, NetworkID } from './types';

const app = express();

const HOSTNAME = 'localhost';
const args: { network: NetworkID; port: number } = {
  network: 1,
  port: 8080,
};
// eslint-disable-next-line no-console
process.argv.forEach((val, i, array) => {
  if (val === '--network' && array[i + 1]) {
    const networkID = Number.parseInt(array[i + 1], 10);
    assert(isSupportedNetworkID(networkID), 'Network is not supported');
    args.network = networkID;
  } else if (val === '--port' && array[i + 1]) {
    args.port = Number.parseInt(array[i + 1], 10);
  }
});

const oracle = new Oracle(args.network);

app.get(`/gas/${args.network}`, async (_req, res) => {
  try {
    const value = await oracle.getGasParams();
    res.send(value);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.debug(error);

    res.status(404).send({
      error: 'Not found',
      message: 'The network you requested is not available.',
      serverMessage: error,
    });
  }
});

app.listen(args.port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running at http://${HOSTNAME}:${args.port}`);
});
