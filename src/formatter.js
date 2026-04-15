/**
 * formatter.js
 *
 * Turns a Settlement object into a MarkdownV2-formatted Telegram message.
 *
 * MarkdownV2 requires escaping these chars outside code/pre spans:
 *   _ * [ ] ( ) ~ ` > # + - = | { } . !
 */

/**
 * Escape a plain string for MarkdownV2.
 * @param {string} text
 * @returns {string}
 */
function esc(text) {
  return String(text).replace(/([_*[\]()~`>#+\-=|{}.!\\])/g, '\\$1');
}

/**
 * Format a row in the strikes table.
 * Telegram MarkdownV2 doesn't render HTML tables, so we use a monospace block.
 *
 * @param {{ strike: string, callWon: boolean, putWon: boolean }} strike
 * @returns {string}
 */
function strikeRow(strike) {
  const call = strike.callWon ? '✅' : '❌';
  const put  = strike.putWon  ? '✅' : '❌';
  // Pad strike to 8 chars for alignment inside the code block
  const padded = strike.strike.padEnd(8);
  return `${padded}  CALL ${call}   PUT ${put}`;
}

/**
 * Format a Settlement object into a MarkdownV2 Telegram message string.
 *
 * @param {import('./settlement').Settlement} s
 * @returns {string}
 */
function formatSettlementMessage(s) {
  const settledDate = new Date(s.settledAt);
  const dateStr = settledDate.toLocaleString('en-GB', {
    day:    '2-digit',
    month:  'short',
    year:   'numeric',
    hour:   '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
    hour12: true,
  }).replace(',', '') + ' GMT';

  // Determine the dominant outcome label for the header line
  const callWins = s.strikes.filter(s => s.callWon).length;
  const putWins  = s.strikes.filter(s => s.putWon).length;
  const winnerLabel = callWins >= putWins ? 'CALL' : 'PUT';

  // First winning strike for the compact header
  const winningStrike = s.strikes.find(s => (winnerLabel === 'CALL' ? s.callWon : s.putWon));
  const winningStrikeStr = winningStrike ? winningStrike.strike : '—';

  const strikeTable = s.strikes.map(strikeRow).join('\n');

  // Build the message — backtick spans and ``` blocks are NOT escaped inside them.
  const message = [
    `🦅 *${esc('Raven Market')} — Settlement*`,
    '',
    `Settlement Price: \`${s.settlementPrice}\` \\(Strike: ${esc(winningStrikeStr)} · Winner: *${esc(winnerLabel)}*\\)`,
    '',
    '```',
    'Strike    CALL       PUT',
    '────────────────────────',
    strikeTable,
    '```',
    '',
    `📅 Series \\#${esc(String(s.seriesId))} · ${esc(s.asset)} · ${esc(s.seriesType)}`,
    `🕛 Settled ${esc(dateStr)}`,
    `📦 Total Volume \\(All\\-Time\\): \`${s.totalVolume}\``,
    `📊 Today's Buy\\-ins: \`${s.todayBuyins}\` \\(${esc(String(s.tradeCount))} trades\\)`,
    '',
    '_Settlement via Chainlink Oracle_',
  ].join('\n');

  return message;
}

module.exports = { formatSettlementMessage };
