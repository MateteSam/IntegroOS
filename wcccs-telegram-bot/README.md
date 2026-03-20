# WCCCS Command Center Bot

## The AI CEO for World Class Content Creation Solutions

This Telegram bot is the central nervous system for the WCCCS team. It connects Dr. Charles, Samuel, Palesa, Mamphosi, PK, and Tlali to the AI agent operating system.

### Commands
| Command | Function |
|---|---|
| `/start` | Welcome screen + quick menu |
| `/briefing` | Morning intelligence report |
| `/post [topic]` | Draft 3 social media posts |
| `/article [title]` | Write a full magazine article |
| `/letter [company]` | Write sponsorship/advertising letter |
| `/rates` | Advertising rate cards |
| `/status` | All 14 platform health check |
| `/revenue` | Revenue pipeline to R1M |
| `/calendar` | 7-day content calendar |
| `/leads` | Today's 10 target companies |
| `/help` | All commands |
| _(any text)_ | Natural language AI CEO |

### Setup (5 minutes)

1. **Get Telegram bot token**: Message `@BotFather` → `/newbot` → Save token

2. **Copy env file**:
   ```
   cp .env.example .env
   ```
   Edit `.env` and add your `TELEGRAM_BOT_TOKEN`

3. **Install dependencies**:
   ```
   pip install -r requirements.txt
   ```

4. **Run locally**:
   ```
   python bot.py
   ```

5. **Deploy to Railway (FREE)**:
   - Push this folder to a private GitHub repo
   - Go to [railway.app](https://railway.app) → New Project → GitHub
   - Add all `.env` variables in Railway settings
   - Done — running 24/7 for free

### Get Team Member Telegram IDs
Have each person message `@userinfobot` on Telegram. Add their IDs (comma-separated) to `AUTHORIZED_USERS` in `.env`.

### Support
Contact: Samuel (CTO) — the technical admin for this system.
