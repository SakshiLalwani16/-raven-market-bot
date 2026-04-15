/**
 * settlement.js
 *
 * Responsible for fetching the latest settlement data.
 *
 * HOW TO PLUG IN REAL DATA
 * ─────────────────────────
 * Option A — REST API:
 *   Replace the mock below with:
 *     const { data } = await axios.get(config.api.settlementApiUrl);
 *     return data; // must match the shape returned by the mock
 *
 * Option B — On-chain via ethers.js (Canton Chain / EVM):
 *   1. npm install ethers
 *   2. Import { ethers } from 'ethers' and define a minimal ABI, e.g.:
 *        const ABI = [
 *          "function latestSettlement() view returns (uint256 price, uint256 seriesId, ...)"
 *        ];
 *   3. const provider = new ethers.JsonRpcProvider(config.chain.rpcUrl);
 *      const contract = new ethers.Contract(config.chain.contractAddress, ABI, provider);
 *      const raw = await contract.latestSettlement();
 *      return mapRawToSettlement(raw);
 */

const axios = require('axios');
const config = require('../config');

// Tracks the last series ID we already posted so we don't double-post.
let lastPostedSeriesId = null;

/**
 * Returns a mock settlement object.
 * Shape must be preserved when connecting a real data source.
 *
 * @returns {Promise<Settlement>}
 *
 * @typedef {Object} Strike
 * @property {string} strike  - Human-readable price, e.g. "$0.1423"
 * @property {boolean} callWon
 * @property {boolean} putWon
 *
 * @typedef {Object} Settlement
 * @property {number}  seriesId
 * @property {string}  asset          - e.g. "CC"
 * @property {string}  seriesType     - e.g. "DAILY"
 * @property {string}  settlementPrice
 * @property {Strike[]} strikes
 * @property {string}  settledAt      - ISO-8601 date string
 * @property {string}  totalVolume    - All-time volume string
 * @property {string}  todayBuyins    - Today's buy-in volume string
 * @property {number}  tradeCount     - Number of trades today
 */
async function getLatestSettlement() {
  // ── MOCK DATA ─────────────────────────────────────────────────────────────
  // Replace this block with a real API call or contract read (see above).
  return {
    seriesId: 128,
    asset: 'CC',
    seriesType: 'DAILY',
    settlementPrice: '$0.1577',
    strikes: [
      { strike: '$0.1423', callWon: true,  putWon: false },
      { strike: '$0.1491', callWon: true,  putWon: false },
      { strike: '$0.1559', callWon: true,  putWon: false },
      { strike: '$0.1627', callWon: false, putWon: true  },
      { strike: '$0.1695', callWon: false, putWon: true  },
    ],
    settledAt: new Date('2026-04-14T12:00:00Z').toISOString(),
    totalVolume: '40,287.00 CC',
    todayBuyins: '1,824.63 CC',
    tradeCount: 7,
  };
  // ── END MOCK ──────────────────────────────────────────────────────────────
}

/**
 * Fetches the latest settlement and returns it only when it is new
 * (i.e. a series we haven't posted yet). Returns null if nothing new.
 *
 * @returns {Promise<Settlement|null>}
 */
async function fetchNewSettlement() {
  const settlement = await getLatestSettlement();

  if (settlement.seriesId === lastPostedSeriesId) {
    return null; // already posted this series
  }

  return settlement;
}

/**
 * Mark a series as posted so fetchNewSettlement won't return it again.
 * Call this only after the Telegram message has been sent successfully.
 *
 * @param {number} seriesId
 */
function markPosted(seriesId) {
  lastPostedSeriesId = seriesId;
}

module.exports = { fetchNewSettlement, markPosted };
