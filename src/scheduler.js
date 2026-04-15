/**
 * scheduler.js
 *
 * Runs a cron job that polls for new settlements and triggers a Telegram send.
 */

const cron = require('node-cron');
const config = require('../config');
const { fetchNewSettlement, markPosted } = require('./settlement');

/**
 * Start polling for settlements on the configured cron schedule.
 *
 * @param {(settlement: import('./settlement').Settlement) => Promise<void>} onNewSettlement
 *   Callback invoked when a previously-unseen settlement is detected.
 *   Typically bot.sendSettlement — injected to avoid circular imports.
 */
function startScheduler(onNewSettlement) {
  const expression = config.scheduler.cronExpression;

  if (!cron.validate(expression)) {
    throw new Error(`Invalid cron expression: "${expression}"`);
  }

  console.log(`[scheduler] Polling for settlements on schedule: ${expression}`);

  // Run once immediately at startup so we don't wait for the first tick
  runCheck(onNewSettlement);

  cron.schedule(expression, () => runCheck(onNewSettlement));
}

async function runCheck(onNewSettlement) {
  try {
    const settlement = await fetchNewSettlement();

    if (!settlement) {
      console.log('[scheduler] No new settlement found.');
      return;
    }

    console.log(`[scheduler] New settlement detected — Series #${settlement.seriesId}`);
    await onNewSettlement(settlement);
    markPosted(settlement.seriesId);
  } catch (err) {
    console.error(`[scheduler] Error during settlement check: ${err.message}`);
  }
}

module.exports = { startScheduler };
