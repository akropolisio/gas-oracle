module.exports = {
  apps: [
    {
      name: 'gas-oracle_1',
      args: '--network 1 --port 8800',
      script: 'build/index.js',
    },
    {
      name: 'gas-oracle_4',
      script: 'build/index.js',
      args: '--network 4 --port 8801',
    },
    {
      name: 'gas-oracle_56',
      script: 'build/index.js',
      args: '--network 56 --port 8802',
    },
    {
      name: 'gas-oracle_97',
      script: 'build/index.js',
      args: '--network 97 --port 8803',
    },
    {
      name: 'gas-oracle_42161',
      script: 'build/index.js',
      args: '--network 42161 --port 8804',
    },
    {
      name: 'gas-oracle_421611',
      script: 'build/index.js',
      args: '--network 421611 --port 8805',
    },
  ],
};
