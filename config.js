require('dotenv').config();

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

module.exports = {
  telegram: {
    botToken: required('TELEGRAM_BOT_TOKEN'),
    channelId: required('CHANNEL_ID'),
  },
  chain: {
    rpcUrl: process.env.RPC_URL || '',
    contractAddress: process.env.CONTRACT_ADDRESS || '',
  },
  api: {
    settlementApiUrl: process.env.SETTLEMENT_API_URL || '',
  },
  scheduler: {
    // How often to poll for a new settlement (cron expression)
    // Default: every 5 minutes
    cronExpression: process.env.CRON_EXPRESSION || '*/5 * * * *',
  },
};
