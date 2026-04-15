# Raven Market Settlement Bot

A Node.js Telegram bot that posts CC (Canton Chain) options settlement notifications to a Telegram channel automatically.

---

## Quick Start

### 1. Clone and install

```bash
git clone <your-repo-url>
cd raven-market-bot
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in the values:

| Variable | Required | Description |
|---|---|---|
| `TELEGRAM_BOT_TOKEN` | Yes | Bot token from [@BotFather](https://t.me/BotFather) |
| `CHANNEL_ID` | Yes | Channel username (`@channel`) or numeric ID (`-100xxxxxxxxxx`) |
| `RPC_URL` | No* | Canton Chain JSON-RPC endpoint |
| `CONTRACT_ADDRESS` | No* | Deployed settlement contract address |
| `SETTLEMENT_API_URL` | No* | REST endpoint returning settlement JSON |
| `CRON_EXPRESSION` | No | Polling schedule (default: `*/5 * * * *`) |

\* At least one data source must be configured once you swap out the mock in `src/settlement.js`.

### 3. Add the bot to your channel

1. Open your Telegram channel settings → **Administrators**.
2. Add your bot as an admin with **Post Messages** permission.

### 4. Run

```bash
# Production
npm start

# Development (auto-restarts on file change)
npm run dev
```

---

## Project Structure

```
raven-market-bot/
├── config.js          — Env var loader (throws on missing required vars)
├── src/
│   ├── bot.js         — Telegram bot init, sendSettlement(), entry point
│   ├── settlement.js  — Fetch latest settlement (mock + real hookup instructions)
│   ├── formatter.js   — Formats settlement data into MarkdownV2 message
│   └── scheduler.js   — Cron job; polls and triggers sends
├── .env.example       — Template for required env vars
├── .gitignore
└── package.json
```

---

## Connecting Real Settlement Data

Open `src/settlement.js`. The `getLatestSettlement()` function contains a mock and two commented-out approaches:

**Option A — REST API**
```js
const { data } = await axios.get(config.api.settlementApiUrl);
return data;
```

**Option B — On-chain via ethers.js**
```js
const { ethers } = require('ethers');
const provider = new ethers.JsonRpcProvider(config.chain.rpcUrl);
const contract = new ethers.Contract(config.chain.contractAddress, ABI, provider);
const raw = await contract.latestSettlement();
return mapRawToSettlement(raw);
```

The returned object must match the `Settlement` typedef documented in `settlement.js`.

---

## Example Output

```
🦅 Raven Market — Settlement

Settlement Price: $0.1577 (Strike: $0.1423 · Winner: CALL)

Strike    CALL       PUT
────────────────────────
$0.1423   CALL ✅   PUT ❌
$0.1491   CALL ✅   PUT ❌
$0.1559   CALL ✅   PUT ❌
$0.1627   CALL ❌   PUT ✅
$0.1695   CALL ❌   PUT ✅

📅 Series #128 · CC · DAILY
🕛 Settled 14 Apr 2026, 12:00 PM GMT
📦 Total Volume (All-Time): 40,287.00 CC
📊 Today's Buy-ins: 1,824.63 CC (7 trades)

Settlement via Chainlink Oracle
```

---

## License

MIT
