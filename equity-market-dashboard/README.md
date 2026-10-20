# EquityScope — Equity Market Dashboard

A responsive React + TypeScript + Vite equity-market dashboard using TradingView's embeddable widgets. Includes a GitHub Actions workflow for GitHub Pages deployment.

## Widgets included

- Market ticker tape
- Market overview with India, US and FX tabs
- Market quotes
- Indian and US stock heatmaps
- Advanced chart with a symbol selector
- Company financials with a symbol selector
- Company profile
- Technical analysis with a symbol selector
- Stock screener
- Economic calendar

## Run locally

Install Node.js 20 or later, then run:

```bash
npm install
npm run dev
```

Open the local URL shown by Vite.

## Deploy to GitHub Pages

1. Create a public GitHub repository named **`equityscope-dashboard`** (the repository name is used by `vite.config.ts`).
2. Upload the project files and folders to the repository root, including `.github/workflows/deploy.yml`.
3. Push the files to the `main` branch.
4. In GitHub, open **Settings → Pages** and set the build source to **GitHub Actions**.
5. Open the **Actions** tab and wait for **Deploy EquityScope to GitHub Pages** to complete.
6. Your site will be published at `https://YOUR-USERNAME.github.io/equityscope-dashboard/`.

If you choose a different repository name, update the `base` value in `vite.config.ts` to `'/YOUR-REPOSITORY-NAME/'`.

## Notes

- Widgets load from TradingView and require an internet connection.
- Coverage and delays vary by symbol, exchange and widget.
- This website displays TradingView widgets; it does **not** expose underlying widget data to your backend or ML models.
- Keep attribution visible and comply with TradingView's current widget and data-use terms.
- This is a research dashboard prototype, not a broker or investment recommendation service.
