import { useEffect, useMemo, useState } from "react";
import { Search, TrendingUp, BarChart3, Activity, ShieldCheck, RefreshCw, ArrowUpRight, ArrowDownRight, Database, SlidersHorizontal, Menu, X, ChevronDown, CircleHelp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, BarChart, Bar } from "recharts";

type Stock = {
  symbol: string; name: string; sector: string; price: number; changePct: number;
  marketCapCr: number; pe: number | null; pb: number | null; roe: number | null;
  roce: number | null; debtEquity: number | null; revenueGrowth: number | null;
  profitGrowth: number | null; dividendYield: number | null; history?: { date: string; close: number; volume: number }[];
  annual?: { year: string; revenue: number; netIncome: number; eps: number }[];
};
type Dataset = { generatedAt?: string; source?: string; disclaimer?: string; stocks: Stock[]; indices?: {name:string;symbol:string;value:number;changePct:number}[] };

const demo: Dataset = {
  generatedAt: "Illustrative fallback dataset",
  source: "Local fallback data — not live market data",
  disclaimer: "Fallback figures are illustrative only. Connect the scheduled data workflow to populate actual Yahoo Finance data.",
  indices: [
    {name:"NIFTY 50",symbol:"^NSEI",value:25250.35,changePct:0.42},
    {name:"SENSEX",symbol:"^BSESN",value:82610.45,changePct:0.31},
    {name:"NIFTY BANK",symbol:"^NSEBANK",value:56240.8,changePct:-0.18},
    {name:"INDIA VIX",symbol:"^INDIAVIX",value:14.25,changePct:-2.7}
  ],
  stocks: [
    {symbol:"RELIANCE.NS",name:"Reliance Industries",sector:"Energy & Retail",price:1452.3,changePct:0.84,marketCapCr:1960000,pe:24.8,pb:2.1,roe:9.2,roce:10.8,debtEquity:0.42,revenueGrowth:7.6,profitGrowth:3.2,dividendYield:0.39},
    {symbol:"TCS.NS",name:"Tata Consultancy Services",sector:"Information Technology",price:3240.1,changePct:-0.42,marketCapCr:1175000,pe:25.2,pb:12.1,roe:51.5,roce:64.2,debtEquity:0.08,revenueGrowth:6.4,profitGrowth:5.9,dividendYield:1.65},
    {symbol:"HDFCBANK.NS",name:"HDFC Bank",sector:"Banking",price:982.4,changePct:0.67,marketCapCr:750000,pe:18.3,pb:2.4,roe:14.1,roce:null,debtEquity:null,revenueGrowth:9.8,profitGrowth:8.1,dividendYield:1.25},
    {symbol:"ICICIBANK.NS",name:"ICICI Bank",sector:"Banking",price:1290.5,changePct:1.12,marketCapCr:910000,pe:19.6,pb:3.2,roe:17.2,roce:null,debtEquity:null,revenueGrowth:14.2,profitGrowth:12.5,dividendYield:0.78},
    {symbol:"INFY.NS",name:"Infosys",sector:"Information Technology",price:1510.7,changePct:-0.25,marketCapCr:625000,pe:22.1,pb:7.8,roe:31.6,roce:39.4,debtEquity:0.06,revenueGrowth:4.7,profitGrowth:7.3,dividendYield:2.65},
    {symbol:"ITC.NS",name:"ITC",sector:"Consumer Staples",price:402.15,changePct:0.21,marketCapCr:505000,pe:25.4,pb:7.0,roe:27.4,roce:35.6,debtEquity:0.01,revenueGrowth:7.1,profitGrowth:3.8,dividendYield:2.95},
    {symbol:"LT.NS",name:"Larsen & Toubro",sector:"Industrials",price:3585.6,changePct:1.35,marketCapCr:495000,pe:34.2,pb:5.1,roe:15.4,roce:17.8,debtEquity:0.72,revenueGrowth:18.2,profitGrowth:14.8,dividendYield:0.81},
    {symbol:"BHARTIARTL.NS",name:"Bharti Airtel",sector:"Telecom",price:1920.2,changePct:0.55,marketCapCr:1140000,pe:38.1,pb:9.8,roe:20.5,roce:14.2,debtEquity:1.75,revenueGrowth:16.3,profitGrowth:24.1,dividendYield:0.52},
    {symbol:"SUNPHARMA.NS",name:"Sun Pharmaceutical",sector:"Healthcare",price:1720.4,changePct:0.18,marketCapCr:413000,pe:35.1,pb:5.3,roe:15.9,roce:18.6,debtEquity:0.04,revenueGrowth:10.6,profitGrowth:15.4,dividendYield:0.76},
    {symbol:"TATAMOTORS.NS",name:"Tata Motors",sector:"Automotive",price:680.2,changePct:-1.15,marketCapCr:250000,pe:8.7,pb:1.8,roe:24.8,roce:17.1,debtEquity:1.12,revenueGrowth:5.4,profitGrowth:-9.2,dividendYield:0.88},
    {symbol:"HINDUNILVR.NS",name:"Hindustan Unilever",sector:"Consumer Staples",price:2465.3,changePct:-0.32,marketCapCr:578000,pe:49.1,pb:11.4,roe:20.7,roce:27.1,debtEquity:0.06,revenueGrowth:3.2,profitGrowth:4.1,dividendYield:1.58},
    {symbol:"WIPRO.NS",name:"Wipro",sector:"Information Technology",price:276.4,changePct:-0.86,marketCapCr:289000,pe:21.2,pb:3.1,roe:15.2,roce:18.9,debtEquity:0.19,revenueGrowth:1.8,profitGrowth:-2.4,dividendYield:0.22}
  ]
};

const fmt = (n:number | null | undefined, digits=1) => n == null || !Number.isFinite(n) ? "—" : n.toLocaleString("en-IN",{maximumFractionDigits:digits,minimumFractionDigits:digits});
const money = (n:number | null | undefined) => n == null ? "—" : "₹"+n.toLocaleString("en-IN",{maximumFractionDigits:2});
const pct = (n:number | null | undefined) => n == null ? "—" : `${n>0?"+":""}${fmt(n,2)}%`;

export default function App() {
  const [dataset,setDataset] = useState<Dataset>(demo);
  const [dataMode,setDataMode] = useState<"loading"|"live"|"fallback">("loading");
  const [query,setQuery] = useState("");
  const [sector,setSector] = useState("All sectors");
  const [sort,setSort] = useState("marketCapCr");
  const [minROE,setMinROE] = useState(false);
  const [activeTab,setActiveTab] = useState("Overview");
  const [selected,setSelected] = useState("RELIANCE.NS");
  const [period,setPeriod] = useState("5Y");
  const [mobileNav,setMobileNav] = useState(false);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/market.json`, {cache:"no-store"})
      .then(r => { if(!r.ok) throw new Error("No generated data"); return r.json(); })
      .then((d:Dataset) => { if(d.stocks?.length) { setDataset(d); setDataMode("live"); } else throw new Error("Empty dataset"); })
      .catch(() => { setDataset(demo); setDataMode("fallback"); });
  }, []);

  const sectors = useMemo(() => ["All sectors",...Array.from(new Set(dataset.stocks.map(s=>s.sector))).sort()],[dataset]);
  const stocks = useMemo(() => dataset.stocks.filter(s =>
    (s.name.toLowerCase().includes(query.toLowerCase()) || s.symbol.toLowerCase().includes(query.toLowerCase())) &&
    (sector==="All sectors" || s.sector===sector) &&
    (!minROE || (s.roe != null && s.roe>=15))
  ).sort((a,b)=>Number((b as any)[sort] ?? -Infinity)-Number((a as any)[sort] ?? -Infinity)),[dataset,query,sector,sort,minROE]);
  const stock = dataset.stocks.find(s=>s.symbol===selected) ?? stocks[0] ?? dataset.stocks[0];
  const history = stock?.history ?? [];
  const filteredHistory = history.length ? history.filter((_,i)=> {
    const days = period==="1Y"?365:period==="3Y"?365*3:period==="5Y"?365*5:365*10;
    return new Date(history[history.length-1].date).getTime()-new Date(history[i].date).getTime()<=days*86400000;
  }) : [];
  const chartData = filteredHistory.length ? filteredHistory : Array.from({length:60},(_,i)=>({date:`${2019+Math.floor(i/12)}-${String(i%12+1).padStart(2,"0")}`,close:(stock?.price ?? 100)*(0.64+i*0.006+Math.sin(i/4)*0.045),volume:0}));
  const nav = ["Overview","Stock Screener","Company Financials","Historical Data","Methodology"];

  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav?"open":""}`}>
      <div className="brand"><div className="brand-mark"><TrendingUp size={21}/></div><div><strong>EquityScope</strong><small>INDIA EQUITY RESEARCH</small></div><button className="mobile-close" onClick={()=>setMobileNav(false)}><X/></button></div>
      <div className="market-label">WORKSPACE</div>
      <nav>{nav.map((item,i)=><button key={item} className={`nav-item ${activeTab===item?"active":""}`} onClick={()=>{setActiveTab(item);setMobileNav(false)}}>{[<Activity size={17}/>,<SlidersHorizontal size={17}/>,<BarChart3 size={17}/>,<Database size={17}/>,<CircleHelp size={17}/>][i]}<span>{item}</span>{i===1&&<span className="nav-pill">{dataset.stocks.length}</span>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="data-status"><span className={`status-dot ${dataMode==="live"?"good":dataMode==="loading"?"loading":""}`}/><div><b>{dataMode==="live"?"Dataset loaded":dataMode==="loading"?"Loading dataset":"Fallback mode"}</b><small>{dataMode==="live"?"Generated market snapshot":dataMode==="loading"?"Checking local data file":"Historical data workflow not connected"}</small></div></div><div className="side-note">Research tools, not investment advice.</div></div>
    </aside>
    <main className="main">
      <header className="topbar"><button className="menu-button" onClick={()=>setMobileNav(true)}><Menu/></button><div className="crumb">Workspace <span>/</span> <b>{activeTab}</b></div><div className="top-actions"><span className="market-clock"><i/> NSE DATA PIPELINE</span><button className="icon-button" title="Refresh data" onClick={()=>location.reload()}><RefreshCw size={16}/></button><div className="avatar">ES</div></div></header>
      <div className="content">
        <section className="page-heading"><div><div className="eyebrow">INDIA · EQUITIES · FUNDAMENTALS</div><h1>{activeTab==="Overview"?"Market intelligence, in one view":activeTab}</h1><p>Explore Indian listed companies with historical prices, valuation and business-quality metrics.</p></div><div className="updated"><span className="live-dot"/><span>{dataMode==="live"?"DATASET READY":dataMode==="loading"?"LOADING DATA":"DEMO SNAPSHOT"}</span><small>{dataset.generatedAt ?? "Waiting for data"}</small></div></section>

        {activeTab==="Overview" && <>
          <section className="index-grid">{(dataset.indices ?? demo.indices).map((idx)=><div className="index-card" key={idx.symbol}><div className="index-title">{idx.name}<span className="index-symbol">{idx.symbol}</span></div><div className="index-value">{fmt(idx.value,2)}</div><div className={`index-change ${idx.changePct>=0?"positive":"negative"}`}>{idx.changePct>=0?<ArrowUpRight size={15}/>:<ArrowDownRight size={15}/>} {pct(idx.changePct)} <span>session</span></div><div className="mini-bars">{Array.from({length:24},(_,i)=><i key={i} style={{height:`${10+((i*17+(idx.symbol.length*13))%29)}px`}}/>)}</div></div>)}</section>
          <div className="section-title-row"><div><h2>Equity watchlist</h2><p>Selected large-cap Indian companies</p></div><button className="text-button" onClick={()=>setActiveTab("Stock Screener")}>Open screener <ArrowUpRight size={15}/></button></div>
          <section className="watch-grid">{dataset.stocks.slice(0,4).map(s=><button className="watch-card" key={s.symbol} onClick={()=>{setSelected(s.symbol);setActiveTab("Historical Data")}}><div className="watch-top"><span className="ticker-icon">{s.name.split(" ").map(x=>x[0]).join("").slice(0,2)}</span><span className="watch-symbol">{s.symbol.replace(".NS","")}</span><span className={`watch-change ${s.changePct>=0?"positive":"negative"}`}>{pct(s.changePct)}</span></div><b>{s.name}</b><div className="watch-bottom"><strong>{money(s.price)}</strong><span>{s.sector}</span></div></button>)}</section>
          <div className="section-title-row"><div><h2>Fundamental snapshot</h2><p>Compare valuation, profitability and growth</p></div><span className="muted-badge"><Database size={13}/> {dataset.stocks.length} companies</span></div>
          <ScreenerTable stocks={stocks.slice(0,8)} onSelect={(s)=>{setSelected(s.symbol);setActiveTab("Company Financials")}} />
        </>}

        {activeTab==="Stock Screener" && <>
          <section className="filter-panel"><div className="searchbox"><Search size={17}/><input placeholder="Search company or symbol..." value={query} onChange={e=>setQuery(e.target.value)}/></div><select value={sector} onChange={e=>setSector(e.target.value)}>{sectors.map(s=><option key={s}>{s}</option>)}</select><select value={sort} onChange={e=>setSort(e.target.value)}><option value="marketCapCr">Sort: Market cap</option><option value="pe">Sort: P/E ratio</option><option value="roe">Sort: ROE</option><option value="revenueGrowth">Sort: Revenue growth</option><option value="profitGrowth">Sort: Profit growth</option></select><label className="check-filter"><input type="checkbox" checked={minROE} onChange={e=>setMinROE(e.target.checked)}/> ROE ≥ 15%</label></section>
          <div className="table-meta"><span>{stocks.length} companies match filters</span><span>Values in ₹ crore unless noted</span></div><ScreenerTable stocks={stocks} onSelect={(s)=>{setSelected(s.symbol);setActiveTab("Company Financials")}}/>
        </>}

        {activeTab==="Company Financials" && <section className="company-layout">
          <div className="company-picker"><label>Choose company</label><select value={stock?.symbol ?? ""} onChange={e=>setSelected(e.target.value)}>{dataset.stocks.map(s=><option key={s.symbol} value={s.symbol}>{s.name}</option>)}</select></div>
          <div className="company-hero"><div><div className="eyebrow">{stock?.symbol} · {stock?.sector}</div><h2>{stock?.name}</h2><div className="company-price">{money(stock?.price)} <span className={stock?.changePct>=0?"positive":"negative"}>{pct(stock?.changePct)}</span></div></div><div className="hero-mark">{stock?.name.split(" ").map(x=>x[0]).join("").slice(0,3)}</div></div>
          <div className="metric-grid">{[["Market cap",stock?`₹${fmt(stock.marketCapCr/100,0)} lakh Cr`:"—"],["P/E",fmt(stock?.pe)],["P/B",fmt(stock?.pb)],["ROE",stock?.roe==null?"—":`${fmt(stock.roe)}%`],["ROCE",stock?.roce==null?"—":`${fmt(stock.roce)}%`],["Debt / equity",fmt(stock?.debtEquity,2)],["Revenue growth",pct(stock?.revenueGrowth)],["Profit growth",pct(stock?.profitGrowth)]].map(([k,v])=><div className="metric-card" key={k}><span>{k}</span><strong>{v}</strong></div>)}</div>
          <div className="section-title-row"><div><h2>Annual financials</h2><p>Revenue and net income, where available</p></div><span className="muted-badge">Annual</span></div>
          {stock?.annual?.length ? <div className="chart-card"><ResponsiveContainer width="100%" height={260}><BarChart data={stock.annual}><CartesianGrid strokeDasharray="3 3" stroke="#263346"/><XAxis dataKey="year" stroke="#8392a8"/><YAxis stroke="#8392a8"/><Tooltip contentStyle={{background:"#101a2b",border:"1px solid #263346",borderRadius:10}}/><Bar dataKey="revenue" fill="#6d8cff" radius={[4,4,0,0]}/><Bar dataKey="netIncome" fill="#35c99a" radius={[4,4,0,0]}/></BarChart></ResponsiveContainer><div className="chart-legend"><span><i className="blue-dot"/> Revenue (₹ crore)</span><span><i className="green-dot"/> Net income (₹ crore)</span></div></div> : <div className="empty-state"><Database/><b>Annual financial data not available in this snapshot</b><p>The scheduled data workflow attempts to fetch annual income-statement fields. Coverage varies by company and source.</p></div>}
        </section>}

        {activeTab==="Historical Data" && <section className="chart-card historical-card">
          <div className="chart-heading"><div><div className="eyebrow">PRICE HISTORY</div><h2>{stock?.name ?? "Select a company"}</h2><p>{stock?.symbol} · Adjusted close where provided</p></div><div className="periods">{["1Y","3Y","5Y","10Y"].map(p=><button className={period===p?"selected":""} key={p} onClick={()=>setPeriod(p)}>{p}</button>)}</div></div>
          <div className="historical-price">{money(stock?.price)} <span className={stock?.changePct>=0?"positive":"negative"}>{pct(stock?.changePct)}</span></div>
          <div className="history-chart"><ResponsiveContainer width="100%" height={330}><AreaChart data={chartData}><defs><linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6688ff" stopOpacity={0.32}/><stop offset="100%" stopColor="#6688ff" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#263346"/><XAxis dataKey="date" stroke="#8392a8" minTickGap={45}/><YAxis stroke="#8392a8" domain={["auto","auto"]}/><Tooltip contentStyle={{background:"#101a2b",border:"1px solid #263346",borderRadius:10}}/><Area type="monotone" dataKey="close" stroke="#7d97ff" strokeWidth={2} fill="url(#priceFill)" dot={false}/></AreaChart></ResponsiveContainer></div>
          <div className="history-note"><ShieldCheck size={16}/>{history.length?`Loaded ${history.length.toLocaleString("en-IN")} historical observations from generated dataset.`:"Illustrative chart until the scheduled data workflow completes. Do not use this fallback chart for investment decisions."}</div>
          <div className="section-title-row"><div><h2>Historical observations</h2><p>Most recent daily records</p></div></div>
          {history.length ? <div className="table-wrap"><table><thead><tr><th>Date</th><th>Close (₹)</th><th>Volume</th></tr></thead><tbody>{[...filteredHistory].reverse().slice(0,20).map(row=><tr key={row.date}><td>{row.date}</td><td>{money(row.close)}</td><td>{row.volume.toLocaleString("en-IN")}</td></tr>)}</tbody></table></div>:<div className="empty-state"><Activity/><b>No actual historical series loaded yet</b><p>Once GitHub Actions fetches the dataset, historical price series will be available here.</p></div>}
        </section>}

        {activeTab==="Methodology" && <section className="methodology"><div className="method-card"><Database/><h2>Data provenance</h2><p>{dataset.source ?? "Source is reported in generated data."}</p><p>{dataset.disclaimer ?? "Check source metadata for the last successful update."}</p><p>Historical prices are downloaded by a scheduled GitHub Actions job and published as static JSON alongside the website. This avoids exposing API credentials in the browser.</p></div><div className="method-card"><ShieldCheck/><h2>How to interpret metrics</h2><ul><li><b>P/E:</b> price divided by earnings per share.</li><li><b>P/B:</b> market price relative to book value per share.</li><li><b>ROE:</b> net income relative to shareholders' equity.</li><li><b>ROCE:</b> operating profit relative to capital employed.</li><li><b>Debt/equity:</b> a leverage measure; banks need different interpretation.</li></ul></div><div className="method-card warning"><CircleHelp/><h2>Important limitations</h2><p>Yahoo Finance is an unofficial source for this pipeline and can change or restrict access. Its fields may be missing or stale. This project is for educational research, not financial advice, and is not an exchange-authorized real-time feed.</p><p>Do not redistribute data commercially unless your source's licence permits it.</p></div></section>}
        <footer><span>EquityScope <b>·</b> Research workspace</span><span>Data status: {dataMode==="live"?"Generated dataset loaded":dataMode==="loading"?"Loading":"Fallback demo"} <b>·</b> Not investment advice</span></footer>
      </div>
    </main>
  </div>;
}

function ScreenerTable({stocks,onSelect}:{stocks:Stock[];onSelect:(s:Stock)=>void}) {
  return <div className="table-wrap"><table><thead><tr><th>Company</th><th>Sector</th><th className="right">Price</th><th className="right">Mkt cap (₹ Cr)</th><th className="right">P/E</th><th className="right">P/B</th><th className="right">ROE</th><th className="right">ROCE</th><th className="right">Rev. growth</th><th className="right">Profit growth</th></tr></thead><tbody>{stocks.map(s=><tr key={s.symbol} onClick={()=>onSelect(s)} className="click-row"><td><div className="company-cell"><span className="ticker-icon small">{s.name.split(" ").map(x=>x[0]).join("").slice(0,2)}</span><span><b>{s.name}</b><small>{s.symbol}</small></span></div></td><td><span className="sector-chip">{s.sector}</span></td><td className="right">{money(s.price)}</td><td className="right">{fmt(s.marketCapCr,0)}</td><td className="right">{fmt(s.pe)}</td><td className="right">{fmt(s.pb)}</td><td className="right">{s.roe==null?"—":`${fmt(s.roe)}%`}</td><td className="right">{s.roce==null?"—":`${fmt(s.roce)}%`}</td><td className={`right ${(s.revenueGrowth??0)>=0?"positive":"negative"}`}>{pct(s.revenueGrowth)}</td><td className={`right ${(s.profitGrowth??0)>=0?"positive":"negative"}`}>{pct(s.profitGrowth)}</td></tr>)}</tbody></table>{!stocks.length&&<div className="empty-state">No companies match the current filters.</div>}</div>;
}