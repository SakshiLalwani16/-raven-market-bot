/**
 * bot.js
 *
 * Initialises the Telegram bot and exposes a sendSettlement() helper.
 * Entry point: starts the scheduler when run directly.
 */

const TelegramBot = require('node-telegram-bot-api');
const config = require('../config');
const { formatSettlementMessage } = require('./formatter');
const { startScheduler } = require('./scheduler');

const bot = new TelegramBot(config.telegram.botToken);

/**
 * Send a formatted settlement message to the configured channel.
 * Retries once on failure before giving up and logging the error.
 *
 * @param {import('./settlement').Settlement} settlement
 * @returns {Promise<void>}
 */
async function sendSettlement(settlement) {
  const text = formatSettlementMessage(settlement);

  const sendOptions = {
    parse_mode: 'MarkdownV2',
    // Disable link previews for cleaner appearance
    disable_web_page_preview: true,
  };

  try {
    await bot.sendMessage(config.telegram.channelId, text, sendOptions);
    console.log(`[bot] Posted settlement for Series #${settlement.seriesId}`);
  } catch (err) {
    console.error(`[bot] First attempt failed: ${err.message}. Retrying in 5 s…`);

    await new Promise(resolve => setTimeout(resolve, 5000));

    try {
      await bot.sendMessage(config.telegram.channelId, text, sendOptions);
      console.log(`[bot] Retry succeeded for Series #${settlement.seriesId}`);
    } catch (retryErr) {
      console.error(`[bot] Retry also failed for Series #${settlement.seriesId}: ${retryErr.message}`);
    }
  }
}

// Start the scheduler when this file is the entry point
if (require.main === module) {
  console.log('[bot] Raven Market settlement bot starting…');
  startScheduler(sendSettlement);
}

module.exports = { bot, sendSettlement };
