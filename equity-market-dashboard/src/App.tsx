import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import {
  Activity, BarChart3, CalendarDays, ChartNoAxesCombined, ChevronRight,
  CircleHelp, Grid2X2, Menu, Search, TrendingUp, X,
} from 'lucide-react';

const INDIA_SYMBOLS = [
  { name: 'NSE:NIFTY', displayName: 'NIFTY 50' },
  { name: 'BSE:SENSEX', displayName: 'SENSEX' },
  { name: 'NSE:BANKNIFTY', displayName: 'NIFTY BANK' },
  { name: 'NSE:RELIANCE', displayName: 'Reliance Industries' },
  { name: 'NSE:TCS', displayName: 'TCS' },
  { name: 'NSE:INFY', displayName: 'Infosys' },
  { name: 'NSE:HDFCBANK', displayName: 'HDFC Bank' },
];
const SYMBOL_OPTIONS = [
  ['NSE:RELIANCE', 'Reliance Industries'], ['NSE:TCS', 'TCS'], ['NSE:INFY', 'Infosys'],
  ['NSE:HDFCBANK', 'HDFC Bank'], ['NSE:ITC', 'ITC'], ['NSE:ICICIBANK', 'ICICI Bank'],
  ['NASDAQ:AAPL', 'Apple'], ['NASDAQ:MSFT', 'Microsoft'], ['NASDAQ:NVDA', 'NVIDIA'],
] as const;

type SectionKey = 'overview' | 'charts' | 'heatmap' | 'screener' | 'fundamentals' | 'technical' | 'calendar';
const NAV: { key: SectionKey; label: string; icon: typeof Activity }[] = [
  { key: 'overview', label: 'Market overview', icon: Grid2X2 },
  { key: 'charts', label: 'Advanced chart', icon: ChartNoAxesCombined },
  { key: 'heatmap', label: 'Stock heatmap', icon: BarChart3 },
  { key: 'screener', label: 'Stock screener', icon: Search },
  { key: 'fundamentals', label: 'Fundamentals', icon: Activity },
  { key: 'technical', label: 'Technical analysis', icon: TrendingUp },
  { key: 'calendar', label: 'Economic calendar', icon: CalendarDays },
];
const PAGE_NAMES: Record<SectionKey, string> = {
  overview: 'Market overview', charts: 'Advanced chart', heatmap: 'Stock heatmap',
  screener: 'Stock screener', fundamentals: 'Fundamentals', technical: 'Technical analysis', calendar: 'Economic calendar',
};

function Panel({ title, subtitle, number, children, className = '' }: { title: string; subtitle?: string; number?: string; children: ReactNode; className?: string }) {
  return <article className={`panel ${className}`}><div className="panel-heading"><div><h3>{title}</h3>{subtitle && <p>{subtitle}</p>}</div>{number && <span className="panel-kicker">{number}</span>}</div>{children}</article>;
}
function PageHeading({ eyebrow, title, subtitle, right }: { eyebrow: string; title: string; subtitle: string; right?: ReactNode }) {
  return <div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}<span className="title-period">.</span></h1><p>{subtitle}</p></div>{right}</div>;
}
function SymbolSelect({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <div className="symbol-control"><label>{label}</label><select value={value} onChange={event => onChange(event.target.value)}>{SYMBOL_OPTIONS.map(([symbol, name]) => <option value={symbol} key={symbol}>{name}</option>)}</select></div>;
}
function Widget({ file, config, minHeight = 470 }: { file: string; config: Record<string, unknown>; minHeight?: number }) {
  const [id] = useState(() => `widget-${Math.random().toString(36).slice(2)}`);
  useEffect(() => {
    const container = document.getElementById(id);
    if (!container) return;
    container.innerHTML = '';
    const outer = document.createElement('div');
    outer.className = 'tradingview-widget-container';
    outer.style.width = '100%';
    const widget = document.createElement('div');
    widget.className = 'tradingview-widget-container__widget';
    const script = document.createElement('script');
    script.src = `https://s3.tradingview.com/external-embedding/${file}`;
    script.async = true;
    script.type = 'text/javascript';
    script.textContent = JSON.stringify(config);
    outer.append(widget, script);
    container.appendChild(outer);
    return () => { container.innerHTML = ''; };
  }, [id, file, JSON.stringify(config)]);
  return <div id={id} className="tv-widget" style={{ minHeight }} />;
}

function App() {
  const [section, setSection] = useState<SectionKey>('overview');
  const [menuOpen, setMenuOpen] = useState(false);
  const [chartSymbol, setChartSymbol] = useState('NSE:RELIANCE');
  const [fundamentalSymbol, setFundamentalSymbol] = useState('NSE:RELIANCE');
  const [technicalSymbol, setTechnicalSymbol] = useState('NSE:NIFTY');
  const today = new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(new Date());
  const goTo = (key: SectionKey) => { setSection(key); setMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const advancedChartConfig = (symbol: string) => ({
    autosize: true, symbol, interval: 'D', timezone: 'Asia/Kolkata', theme: 'dark', style: '1', locale: 'en',
    allow_symbol_change: true, calendar: false, support_host: 'https://www.tradingview.com', details: true,
    hotlist: true, withdateranges: true, hide_side_toolbar: false, studies: ['STD;SMA', 'STD;RSI'],
    show_popup_button: true, popup_width: '1000', popup_height: '650',
  });
  const technicalConfig = (symbol: string) => ({ interval: '1D', width: '100%', isTransparent: true, height: 570, symbol, showIntervalTabs: true, displayMode: 'single', locale: 'en', colorTheme: 'dark' });
  const financialsConfig = (symbol: string) => ({ symbol, colorTheme: 'dark', displayMode: 'regular', isTransparent: true, locale: 'en', width: '100%', height: 650 });

  return <div className="app-shell">
    <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
      <a className="brand" href="#overview" onClick={event => { event.preventDefault(); goTo('overview'); }}><span className="brand-mark"><TrendingUp size={24} /></span><span><strong>EquityScope</strong><small>MARKET INTELLIGENCE</small></span></a>
      <div className="nav-label">WORKSPACE</div>
      <nav className="navigation" aria-label="Main navigation">{NAV.map(item => { const Icon = item.icon; return <button key={item.key} className={`nav-item ${section === item.key ? 'active' : ''}`} onClick={() => goTo(item.key)}><Icon size={17} strokeWidth={1.8} />{item.label}</button>; })}</nav>
      <div className="sidebar-bottom"><div className="data-status"><span className="status-dot"/><div><strong>Widget data</strong><small>Provided by TradingView</small></div></div><div className="sidebar-note">Market data may be delayed. Availability depends on the symbol and exchange.</div><a className="tv-credit" href="https://www.tradingview.com/" target="_blank" rel="noreferrer">Powered by TradingView ↗</a></div>
    </aside>
    {menuOpen && <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
    <main className="main-content">
      <header className="topbar"><button className="mobile-menu" aria-label="Toggle navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={18} /> : <Menu size={18} />}</button><div className="breadcrumb"><span>Workspace</span><span className="crumb-slash">/</span><strong>{PAGE_NAMES[section]}</strong></div><div className="top-actions"><span className="market-pill"><span className="status-dot"/> Market dashboard</span><a href="https://www.tradingview.com/" target="_blank" rel="noreferrer" className="top-link">TradingView ↗</a></div></header>
      {section === 'overview' && <section className="page-section active">
        <PageHeading eyebrow="YOUR MARKET AT A GLANCE" title="Market overview" subtitle="Explore equity markets, discover movers and follow the trends that matter." right={<div className="heading-date"><span className="date-dot"/>{today}</div>} />
        <div className="ticker-widget"><Widget file="embed-widget-ticker-tape.js" minHeight={45} config={{ symbols: [{ proName: 'NSE:NIFTY', title: 'NIFTY 50' }, { proName: 'BSE:SENSEX', title: 'SENSEX' }, { proName: 'NSE:BANKNIFTY', title: 'NIFTY BANK' }, { proName: 'NASDAQ:NDX', title: 'NASDAQ 100' }, { proName: 'AMEX:SPY', title: 'S&P 500 ETF' }, { proName: 'NASDAQ:AAPL', title: 'Apple' }], showSymbolLogo: true, isTransparent: true, displayMode: 'adaptive', colorTheme: 'dark', locale: 'en' }} /></div>
        <div className="section-intro"><div><h2>Market pulse</h2><p>Quick view of major markets and tracked instruments.</p></div><span className="section-tag">LIVE WIDGETS</span></div>
        <div className="widget-grid overview-grid">
          <Panel title="Market overview" subtitle="Indices, futures, bonds and currencies" number="01"><Widget file="embed-widget-market-overview.js" minHeight={500} config={{ colorTheme: 'dark', dateRange: '12M', showChart: true, locale: 'en', width: '100%', height: 490, isTransparent: true, showSymbolLogo: true, showFloatingTooltip: false, plotLineColorGrowing: '#22c55e', plotLineColorFalling: '#ef4444', gridLineColor: 'rgba(148,163,184,0.10)', scaleFontColor: '#a9b5ca', belowLineFillColorGrowing: 'rgba(34,197,94,0.08)', belowLineFillColorFalling: 'rgba(239,68,68,0.08)', belowLineFillColorGrowingBottom: 'rgba(34,197,94,0)', belowLineFillColorFallingBottom: 'rgba(239,68,68,0)', symbolActiveColor: 'rgba(59,130,246,0.16)', tabs: [{ title: 'India', symbols: [{ s: 'NSE:NIFTY', d: 'NIFTY 50' }, { s: 'BSE:SENSEX', d: 'SENSEX' }, { s: 'NSE:BANKNIFTY', d: 'NIFTY BANK' }] }, { title: 'US', symbols: [{ s: 'NASDAQ:NDX', d: 'NASDAQ 100' }, { s: 'SP:SPX', d: 'S&P 500' }, { s: 'NASDAQ:IXIC', d: 'Nasdaq Composite' }] }, { title: 'Forex', symbols: [{ s: 'FX:EURUSD', d: 'EUR/USD' }, { s: 'FX:USDJPY', d: 'USD/JPY' }, { s: 'FX:GBPUSD', d: 'GBP/USD' }] }] }} /></Panel>
          <Panel title="Market quotes" subtitle="Selected indices and equities" number="02"><Widget file="embed-widget-market-quotes.js" minHeight={500} config={{ width: '100%', height: 490, symbolsGroups: [{ name: 'India', originalName: 'India', symbols: [{ name: 'NSE:RELIANCE', displayName: 'Reliance Industries' }, { name: 'NSE:TCS', displayName: 'TCS' }, { name: 'NSE:HDFCBANK', displayName: 'HDFC Bank' }, { name: 'NSE:INFY', displayName: 'Infosys' }, { name: 'NSE:ICICIBANK', displayName: 'ICICI Bank' }] }, { name: 'US', originalName: 'US', symbols: [{ name: 'NASDAQ:AAPL', displayName: 'Apple' }, { name: 'NASDAQ:MSFT', displayName: 'Microsoft' }, { name: 'NASDAQ:NVDA', displayName: 'NVIDIA' }] }], showSymbolLogo: true, isTransparent: true, colorTheme: 'dark', locale: 'en' }} /></Panel>
        </div>
        <div className="section-intro section-intro-spaced"><div><h2>See the whole market</h2><p>Spot sector concentration and price action at a glance.</p></div><button className="text-button" onClick={() => goTo('heatmap')}>Open heatmap <ChevronRight size={14}/></button></div>
        <div className="widget-grid two-col"><Panel title="Stock heatmap" subtitle="Explore market leaders and laggards" number="03"><Widget file="embed-widget-stock-heatmap.js" minHeight={470} config={{ exchanges: ['NSE'], dataSource: 'SENSEX', grouping: 'sector', blockSize: 'market_cap_basic', blockColor: 'change', locale: 'en', symbolUrl: '', colorTheme: 'dark', hasTopBar: true, isTransparent: true, width: '100%', height: 470 }} /></Panel><Panel title="Technical snapshot" subtitle="Technical summary for NIFTY 50" number="04"><Widget file="embed-widget-technical-analysis.js" minHeight={470} config={technicalConfig('NSE:NIFTY')} /></Panel></div>
        <div className="disclaimer"><CircleHelp size={17}/><p><strong>Data note:</strong> These widgets are provided by TradingView and may show delayed or unavailable data for some Indian symbols. This dashboard does not execute trades or provide personalized investment advice.</p></div>
      </section>}

      {section === 'charts' && <section className="page-section active"><PageHeading eyebrow="PRICE ACTION" title="Advanced chart" subtitle="Explore price history, indicators and chart patterns." right={<SymbolSelect label="SYMBOL" value={chartSymbol} onChange={setChartSymbol}/>} /><Panel title={chartSymbol} subtitle="Interactive chart powered by TradingView"><Widget file="embed-widget-advanced-chart.js" minHeight={660} config={advancedChartConfig(chartSymbol)}/></Panel><div className="section-intro section-intro-spaced"><div><h2>Company at a glance</h2><p>Summary and key statistics for the selected instrument.</p></div></div><Panel title="Symbol overview" subtitle="Price summary and performance"><Widget file="embed-widget-symbol-overview.js" minHeight={410} config={{ symbols: [[chartSymbol, `${chartSymbol}|1D`]], chartOnly: false, width: '100%', height: 390, locale: 'en', colorTheme: 'dark', autosize: true, showVolume: true, showMA: true, hideDateRanges: false, hideMarketStatus: false, hideSymbolLogo: false, scalePosition: 'right', scaleMode: 'Normal', fontFamily: 'Inter, sans-serif', fontSize: '12', noTimeScale: false, valuesTracking: '1', changeMode: 'price-and-percent', chartType: 'area', lineWidth: 2, lineType: 0, dateRanges: ['1d|1', '1m|30', '3m|60', '12m|1D', '60m|1W', 'all|1M'] }}/></Panel></section>}

      {section === 'heatmap' && <section className="page-section active"><PageHeading eyebrow="MARKET BREADTH" title="Stock heatmap" subtitle="Compare market capitalization and performance across stocks."/><Panel title="Indian equity market" subtitle="Explore market groupings and performance"><Widget file="embed-widget-stock-heatmap.js" minHeight={720} config={{ exchanges: ['NSE'], dataSource: 'SENSEX', grouping: 'sector', blockSize: 'market_cap_basic', blockColor: 'change', locale: 'en', symbolUrl: '', colorTheme: 'dark', hasTopBar: true, isTransparent: true, width: '100%', height: 700 }}/></Panel><div className="panel-gap"><Panel title="US equity market" subtitle="Large-cap US stocks"><Widget file="embed-widget-stock-heatmap.js" minHeight={620} config={{ dataSource: 'SPX500', grouping: 'sector', blockSize: 'market_cap_basic', blockColor: 'change', locale: 'en', symbolUrl: '', colorTheme: 'dark', hasTopBar: true, isTransparent: true, width: '100%', height: 600 }}/></Panel></div></section>}

      {section === 'screener' && <section className="page-section active"><PageHeading eyebrow="DISCOVER OPPORTUNITIES" title="Stock screener" subtitle="Filter and explore instruments using TradingView's built-in screener."/><Panel title="Equity screener" subtitle="Use the screener's built-in filters and sorting tools"><Widget file="embed-widget-screener.js" minHeight={740} config={{ market: 'india', showToolbar: true, defaultColumn: 'overview', defaultScreen: 'most_capitalized', isTransparent: true, locale: 'en', width: '100%', height: 720, colorTheme: 'dark' }}/></Panel><p className="helper-text">Screener availability, exchanges, and columns are determined by TradingView's widget configuration.</p></section>}

      {section === 'fundamentals' && <section className="page-section active"><PageHeading eyebrow="COMPANY RESEARCH" title="Fundamentals" subtitle="Review company profile, financial statements and valuation metrics." right={<SymbolSelect label="COMPANY" value={fundamentalSymbol} onChange={setFundamentalSymbol}/>} /><Panel title={`${fundamentalSymbol} — Financials`} subtitle="Available metrics depend on the company and data coverage"><Widget file="embed-widget-financials.js" minHeight={670} config={financialsConfig(fundamentalSymbol)}/></Panel><div className="widget-grid two-col panel-gap"><Panel title="Company profile" subtitle="Business overview and company information"><Widget file="embed-widget-symbol-profile.js" minHeight={520} config={{ width: '100%', height: 500, colorTheme: 'dark', isTransparent: true, symbol: fundamentalSymbol, locale: 'en' }}/></Panel><Panel title="Technical analysis" subtitle="Summary and key indicators"><Widget file="embed-widget-technical-analysis.js" minHeight={520} config={technicalConfig(fundamentalSymbol)}/></Panel></div></section>}

      {section === 'technical' && <section className="page-section active"><PageHeading eyebrow="INDICATORS & SIGNALS" title="Technical analysis" subtitle="Review technical summaries for selected stocks and indices." right={<SymbolSelect label="SYMBOL" value={technicalSymbol} onChange={setTechnicalSymbol}/>} /><div className="widget-grid two-col"><Panel title={technicalSymbol} subtitle="Technical summary"><Widget file="embed-widget-technical-analysis.js" minHeight={600} config={technicalConfig(technicalSymbol)}/></Panel><Panel title="Market quotes" subtitle="Compare selected companies"><Widget file="embed-widget-market-quotes.js" minHeight={600} config={{ width: '100%', height: 560, symbolsGroups: [{ name: 'India', symbols: INDIA_SYMBOLS.map(item => ({ name: item.name, displayName: item.displayName })) }], showSymbolLogo: true, isTransparent: true, colorTheme: 'dark', locale: 'en' }}/></Panel></div><div className="panel-gap"><Panel title="Advanced chart" subtitle="Chart a symbol and apply indicators in TradingView"><Widget file="embed-widget-advanced-chart.js" minHeight={650} config={advancedChartConfig(technicalSymbol)}/></Panel></div></section>}

      {section === 'calendar' && <section className="page-section active"><PageHeading eyebrow="UPCOMING CATALYSTS" title="Economic calendar" subtitle="Follow economic releases that can influence markets."/><Panel title="Economic events" subtitle="Upcoming macroeconomic releases and event details"><Widget file="embed-widget-economic-calendar.js" minHeight={740} config={{ colorTheme: 'dark', isTransparent: true, width: '100%', height: 720, locale: 'en', importanceFilter: '-1,0,1', countryFilter: 'us,eu,gb,jp,cn,in' }}/></Panel><div className="disclaimer"><CircleHelp size={17}/><p>Economic calendars may change as source providers update event schedules. Check official releases before making decisions.</p></div></section>}

      <footer className="footer"><span>© {new Date().getFullYear()} EquityScope</span><span>Market research workspace · Not investment advice</span><a href="https://www.tradingview.com/" target="_blank" rel="noreferrer">Market widgets by TradingView</a></footer>
    </main>
  </div>;
}

export default App;
