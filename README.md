# XLClick Tips API

A free, static REST API serving **34 Excel productivity tips** from [XLClick.com](https://xlclick.com) — hosted on GitHub Pages, updated automatically via GitHub Actions.

No API key required. No rate limits. No server to maintain.

---

## Endpoints

Base URL: `https://YOUR_USERNAME.github.io/xlclick-tips-api`

| Endpoint | Description | Updated |
|----------|-------------|---------|
| `GET /tips.json` | All 34 tips | On new tip added |
| `GET /tip/today.json` | Tip of the day | Daily at 09:00 UTC |
| `GET /tip/random.json` | A random tip | Every hour |
| `GET /tip/{id}.json` | Tip by ID (0–33) | On new tip added |

### Response format

```json
{
  "id": 13,
  "functionality": "Split to Rows",
  "title": "Split Cell Contents into Multiple Rows in Excel",
  "description": "Our most loved feature: converts a single cell with multiple values into separate rows...",
  "url": "https://xlclick.com/tutorials/split-cells-rows-excel/"
}
```

---

## Setup

### 1. Fork this repository

Click **Fork** at the top-right of this page.

### 2. Enable GitHub Pages

Go to **Settings → Pages** in your forked repo and set:
- **Source**: `Deploy from a branch`
- **Branch**: `main`
- **Folder**: `/docs`

Click **Save**. Your API will be live at `https://YOUR_USERNAME.github.io/xlclick-tips-api/`.

### 3. Generate the initial JSON files

Go to the **Actions** tab → **Generate API Files** → **Run workflow**.

This creates all files under `docs/` and commits them automatically. After that, daily and hourly updates run on their own.

---

## How it works

```
data/tips.csv  →  scripts/generate.js  →  docs/**/*.json  →  GitHub Pages
                         ↑
               GitHub Actions (cron)
               - every day  09:00 UTC → today.json
               - every hour           → random.json
               - workflow_dispatch    → everything
```

- **No server**: all responses are plain `.json` files served as static content
- **No dependencies**: `scripts/generate.js` uses only Node.js built-ins
- **Auto-updates**: GitHub Actions regenerates `today.json` daily and `random.json` hourly, then commits and pushes automatically

---

## Adding or editing tips

Edit [`data/tips.csv`](data/tips.csv) (semicolon-separated), then run the **Generate API Files** workflow manually (`workflow_dispatch`) to rebuild all JSON files.

CSV field order: `id;title;descr;post-slug;functionality;description`

---

## Using on RapidAPI

To list this API on [RapidAPI](https://rapidapi.com) as a provider:

1. Go to [rapidapi.com/provider](https://rapidapi.com/provider) and create an account
2. Add a new API → choose **Existing API**
3. Set the Base URL to `https://YOUR_USERNAME.github.io/xlclick-tips-api`
4. Add endpoints matching the table above
5. Configure a free plan and publish

---

## Local usage

```bash
# Generate all JSON files locally
node scripts/generate.js

# Regenerate only today's tip
node scripts/generate.js --today

# Regenerate only the random tip
node scripts/generate.js --random
```

---

## License

MIT
