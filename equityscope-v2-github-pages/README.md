# EquityScope Dashboard v2

A React + TypeScript + Vite static research dashboard for Indian equities, designed for GitHub Pages.

## Features
- Screener-style company table with search, sector filter and sorting
- Company valuation and quality metrics where available
- Historical adjusted daily price chart with 1Y/3Y/5Y/10Y views
- Annual financial statement snapshot where the source provides it
- Daily GitHub Actions workflow to refresh up to 10 years of historical prices
- No browser API keys; the generated JSON is bundled as a static public data file

## Data-source notes
The pipeline uses Yahoo Finance through the unofficial `yfinance` library. This is not an official Yahoo Finance API; availability, accuracy and coverage can change. Some fundamentals may be missing. This is a personal/educational prototype. Verify source terms and redistribution permissions before public or commercial use. For production/commercial deployment, use a properly licensed market-data provider.

## Deploy to GitHub Pages
1. Upload the **contents of this project folder** to the root of your repository `equityscope-dashboard` (not the enclosing `equityscope-v2` folder).
2. Make sure `.github/workflows/deploy.yml` is included. Remove or disable the old `static.yml` workflow to avoid conflicting deployments.
3. In Settings → Pages, choose **GitHub Actions** as the source.
4. In Actions, run **Build data and deploy EquityScope**. The scheduled workflow refreshes data on weekdays.
5. Open `https://sujalgupta75.github.io/equityscope-dashboard/`.

The first build tries to fetch actual market data. If the source is unavailable, the site still builds and shows an explicitly labelled illustrative fallback dataset. Check the workflow log to verify whether the fetch succeeded.

## Run locally
```bash
npm install
npm run dev
```
To refresh the data locally:
```bash
python -m pip install yfinance pandas
python scripts/fetch_data.py
```
Then build:
```bash
npm run build
```
