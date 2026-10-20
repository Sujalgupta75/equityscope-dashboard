"""
Build a static JSON snapshot from Yahoo Finance via yfinance.
Yahoo Finance is unofficial and availability/coverage can change. Use only under applicable terms.
This pipeline fetches up to 10 years of daily history and available annual financial statement rows.
"""
import json
import math
import os
from datetime import datetime, timezone
from pathlib import Path

import yfinance as yf

OUT = Path("public/data/market.json")
SYMBOLS = [
    ("RELIANCE.NS", "Reliance Industries", "Energy & Retail"),
    ("TCS.NS", "Tata Consultancy Services", "Information Technology"),
    ("HDFCBANK.NS", "HDFC Bank", "Banking"),
    ("ICICIBANK.NS", "ICICI Bank", "Banking"),
    ("INFY.NS", "Infosys", "Information Technology"),
    ("ITC.NS", "ITC", "Consumer Staples"),
    ("LT.NS", "Larsen & Toubro", "Industrials"),
    ("BHARTIARTL.NS", "Bharti Airtel", "Telecom"),
    ("SUNPHARMA.NS", "Sun Pharmaceutical", "Healthcare"),
    ("TATAMOTORS.NS", "Tata Motors", "Automotive"),
    ("HINDUNILVR.NS", "Hindustan Unilever", "Consumer Staples"),
    ("WIPRO.NS", "Wipro", "Information Technology"),
    ("SBIN.NS", "State Bank of India", "Banking"),
    ("AXISBANK.NS", "Axis Bank", "Banking"),
    ("KOTAKBANK.NS", "Kotak Mahindra Bank", "Banking"),
    ("MARUTI.NS", "Maruti Suzuki India", "Automotive"),
    ("BAJFINANCE.NS", "Bajaj Finance", "Financial Services"),
    ("ASIANPAINT.NS", "Asian Paints", "Consumer"),
    ("TITAN.NS", "Titan Company", "Consumer"),
    ("NTPC.NS", "NTPC", "Utilities"),
    ("POWERGRID.NS", "Power Grid Corporation", "Utilities"),
    ("ONGC.NS", "ONGC", "Energy"),
    ("ADANIPORTS.NS", "Adani Ports", "Infrastructure"),
    ("COALINDIA.NS", "Coal India", "Energy"),
    ("ULTRACEMCO.NS", "UltraTech Cement", "Materials"),
    ("NESTLEIND.NS", "Nestle India", "Consumer Staples"),
    ("TECHM.NS", "Tech Mahindra", "Information Technology"),
    ("HCLTECH.NS", "HCL Technologies", "Information Technology"),
    ("BAJAJFINSV.NS", "Bajaj Finserv", "Financial Services"),
    ("INDUSINDBK.NS", "IndusInd Bank", "Banking"),
]

def num(value):
    try:
        f = float(value)
        return round(f, 4) if math.isfinite(f) else None
    except (TypeError, ValueError):
        return None

def pick(mapping, *keys):
    for key in keys:
        if key in mapping and mapping[key] is not None:
            return num(mapping[key])
    return None

def main():
    stocks = []
    indices = []
    for symbol, fallback_name, sector in SYMBOLS:
        print(f"Fetching {symbol}", flush=True)
        try:
            ticker = yf.Ticker(symbol)
            hist = ticker.history(period="10y", interval="1d", auto_adjust=True)
            info = ticker.get_info()
            if hist is None or hist.empty:
                print(f"No history for {symbol}; skipping", flush=True)
                continue
            hist = hist.dropna(subset=["Close"])
            history = [
                {"date": idx.strftime("%Y-%m-%d"), "close": round(float(row["Close"]), 4),
                 "volume": int(row["Volume"]) if not math.isnan(float(row["Volume"])) else 0}
                for idx, row in hist.iterrows()
            ]
            price = num(hist["Close"].iloc[-1])
            prev = num(hist["Close"].iloc[-2]) if len(hist) > 1 else price
            change = ((price / prev) - 1) * 100 if price and prev else None

            annual = []
            try:
                fin = ticker.income_stmt
                if fin is not None and not fin.empty:
                    for col in list(fin.columns)[:10][::-1]:
                        rev = pick(fin[col].to_dict(), "Total Revenue", "Operating Revenue")
                        income = pick(fin[col].to_dict(), "Net Income", "Net Income Common Stockholders")
                        eps = pick(fin[col].to_dict(), "Basic EPS", "Diluted EPS")
                        if rev is not None or income is not None:
                            annual.append({"year": str(col.year), "revenue": rev, "netIncome": income, "eps": eps})
            except Exception as exc:
                print(f"Annual statement unavailable for {symbol}: {exc}", flush=True)

            stocks.append({
                "symbol": symbol, "name": info.get("longName") or info.get("shortName") or fallback_name,
                "sector": sector, "price": price, "changePct": num(change) or 0,
                "marketCapCr": num((info.get("marketCap") or 0) / 1e7) or 0,
                "pe": num(info.get("trailingPE") or info.get("forwardPE")),
                "pb": num(info.get("priceToBook")),
                "roe": num((info.get("returnOnEquity") or 0) * 100) if info.get("returnOnEquity") is not None else None,
                "roce": None,
                "debtEquity": num(info.get("debtToEquity") / 100) if info.get("debtToEquity") is not None else None,
                "revenueGrowth": num((info.get("revenueGrowth") or 0) * 100) if info.get("revenueGrowth") is not None else None,
                "profitGrowth": num((info.get("earningsGrowth") or 0) * 100) if info.get("earningsGrowth") is not None else None,
                "dividendYield": num((info.get("dividendYield") or 0) * 100) if info.get("dividendYield") is not None else None,
                "history": history, "annual": annual
            })
        except Exception as exc:
            print(f"Failed {symbol}: {exc}", flush=True)

    for symbol, name in [("^NSEI", "NIFTY 50"), ("^BSESN", "SENSEX"), ("^NSEBANK", "NIFTY BANK"), ("^INDIAVIX", "INDIA VIX")]:
        try:
            h = yf.Ticker(symbol).history(period="5d", interval="1d")
            if h is not None and len(h):
                value = num(h["Close"].iloc[-1])
                prev = num(h["Close"].iloc[-2]) if len(h)>1 else value
                indices.append({"name": name, "symbol": symbol, "value": value, "changePct": num(((value/prev)-1)*100) if value and prev else 0})
        except Exception as exc:
            print(f"Index unavailable {symbol}: {exc}", flush=True)

    if not stocks:
        raise RuntimeError("No stock data was fetched; refusing to overwrite dataset with empty data.")
    OUT.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "generatedAt": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC"),
        "source": "Yahoo Finance via yfinance (unofficial source)",
        "disclaimer": "Historical adjusted daily prices and available company fields were fetched automatically. Yahoo Finance does not provide an official public API; fields may be missing or delayed. For personal/educational use; verify licensing before redistribution or commercial use.",
        "stocks": stocks,
        "indices": indices
    }
    OUT.write_text(json.dumps(payload, separators=(",", ":")), encoding="utf-8")
    print(f"Wrote {len(stocks)} stocks to {OUT}; {sum(len(s['history']) for s in stocks)} price observations.")

if __name__ == "__main__":
    main()
