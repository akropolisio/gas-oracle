import cors from 'cors';
import express from 'express';

import { DEFAULT_AVERAGE_BLOCK_TIME, WHITELISTED_ORIGINS } from './constants';
import * as rpcSettings from './rpcSettings.json';
import { Oracle } from './services/Oracle';
import { NetworkID } from './types';

const app = express();
app.use(
  cors({
    origin: WHITELISTED_ORIGINS,
  }),
);

const HOSTNAME = 'localhost';
const PORT = 8080;

const oracles = Object.keys(process.env).reduce((acc, key) => {
  const [, network] = key.match(/JSON_RPC_URL_(\d+)/) || [];
  const networkID = Number.parseInt(network, 10);

  if (!networkID) {
    return acc;
  }
  const averageBlockTime = (rpcSettings.averageBlockTime as any)[networkID];
  const oracle = new Oracle(
    process.env[key] as any,
    averageBlockTime || DEFAULT_AVERAGE_BLOCK_TIME,
    networkID,
  );

  return { ...acc, [networkID]: oracle };
}, {} as Record<NetworkID, Oracle>);

app.get(`/:network`, async (req, res) => {
  try {
    const networkID = Number.parseInt(req.params.network, 10);
    const oracle = oracles[networkID];
    if (oracle) {
      const value = await oracle.getGasParams();
      res.set('Cache-Control', 'public, max-age=15').send(value);
    } else {
      res.status(404).send(`Network ${req.params.network} not supported`);
    }
  } catch (error) {
    console.warn(`NetworkID ${req.params.network}:`, error);

    res.status(500).send(String(error));
  }
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running at http://${HOSTNAME}:${PORT}`);
});
