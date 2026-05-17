import React, { useState, useEffect, useMemo } from 'react';
import usePageTitle from '../utils/usePageTitle';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MdOutlineTrendingUp, MdOutlineArrowBack, MdOutlineInfo } from 'react-icons/md';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import api from '../api/axios';
import { formatINR } from '../utils/formatters';

// Returns historical NAV on or before the requested offset from today.
const findNavDaysAgo = (history, days) => {
  const targetDateObj = new Date();
  targetDateObj.setDate(targetDateObj.getDate() - days);

  for (let i = 0; i < history.length; i++) {
    const [d, m, y] = history[i].date.split('-');
    if (new Date(`${y}-${m}-${d}`) <= targetDateObj) {
      return parseFloat(history[i].nav);
    }
  }

  return null;
};

const calculateCagr = (current, past, years) =>
  ((Math.pow(current / past, 1 / years) - 1) * 100).toFixed(2);

const calculateComparison = ({ calcAmount, calcDuration, calcRate }) => {
  const r = calcRate / 100;
  const i = r / 12;
  const n = Math.max(1, calcDuration * 12);
  const totalInvested = calcAmount * n;

  // SIP FV
  let sipFV = 0;
  if (i === 0) {
    sipFV = totalInvested;
  } else {
    sipFV = calcAmount * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
  }

  // Lumpsum FV (of the same total invested amount)
  const lumpsumFV = totalInvested * Math.pow(1 + r, calcDuration);

  return {
    totalInvested,
    sip: {
      futureValue: sipFV || 0,
      wealthGained: Math.max(0, sipFV - totalInvested),
    },
    lumpsum: {
      futureValue: lumpsumFV || 0,
      wealthGained: Math.max(0, lumpsumFV - totalInvested),
    },
    difference: Math.max(0, lumpsumFV - sipFV),
  };
};

const Fund = () => {
  const { schemeCode } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mfData, setMfData] = useState(null);
  const [userInvestment, setUserInvestment] = useState(null);
  const [returns, setReturns] = useState({ '1Y': 'N/A', '3Y': 'N/A', '5Y': 'N/A' });
  const [timeframe, setTimeframe] = useState('1Y');
  const timeframes = ['1M', '6M', '1Y', '3Y', 'All'];

  // Calculator state
  const [calcAmount, setCalcAmount] = useState(5000);
  const [calcDuration, setCalcDuration] = useState(5);
  const [calcRate, setCalcRate] = useState(12);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [mfRes, portRes] = await Promise.all([
          fetch(`https://api.mfapi.in/mf/${schemeCode}`).then(r => r.json()),
          api
            .get('/api/portfolio/tax-analysis')
            .catch(() => ({ data: { data: { investments: [] } } })),
        ]);

        if (!mfRes.data || mfRes.data.length === 0) throw new Error('Mutual Fund data not found');
        setMfData(mfRes);

        const investments = portRes.data?.data?.investments || [];
        const matched = investments.find(inv => inv.scheme_code.toString() === schemeCode);
        if (matched) setUserInvestment(matched);

        // Calculate Returns
        const history = mfRes.data;
        const currentNAV = parseFloat(history[0].nav);
        const r1 = findNavDaysAgo(history, 365);
        const r3 = findNavDaysAgo(history, 1095);
        const r5 = findNavDaysAgo(history, 1825);

        const r1Pct = r1 ? (((currentNAV - r1) / r1) * 100).toFixed(2) : null;
        const r3Pct = r3 ? calculateCagr(currentNAV, r3, 3) : null;
        const r5Pct = r5 ? calculateCagr(currentNAV, r5, 5) : null;

        setReturns({
          '1Y': r1Pct ? r1Pct + '%' : 'N/A',
          '3Y': r3Pct ? r3Pct + '%' : 'N/A',
          '5Y': r5Pct ? r5Pct + '%' : 'N/A',
        });

        // Dynamic Calculator Rate
        let autoRate = 12;
        if (r3Pct) autoRate = parseFloat(r3Pct);
        else if (r1Pct) autoRate = parseFloat(r1Pct);

        if (autoRate > 0 && autoRate < 100) {
          setCalcRate(parseFloat(autoRate.toFixed(2)));
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch fund details.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [schemeCode]);

  const comparisonData = useMemo(
    () =>
      calculateComparison({
        calcAmount,
        calcDuration,
        calcRate,
      }),
    [calcAmount, calcDuration, calcRate]
  );

  const { totalInvested, sip, lumpsum, difference } = comparisonData;

  const history = useMemo(() => mfData?.data || [], [mfData]);
  const meta = useMemo(() => mfData?.meta || {}, [mfData]);
  const currentNAV = history[0] ? parseFloat(history[0].nav) : 0;
  const latestDate = history[0]?.date || '';

  usePageTitle(meta?.scheme_name || 'Fund');

  const chartData = useMemo(() => {
    if (!history.length) return [];

    let slicedData = [];

    if (timeframe === '1M') slicedData = history.slice(0, 30);
    else if (timeframe === '6M') slicedData = history.slice(0, 180);
    else if (timeframe === '1Y') slicedData = history.slice(0, 365);
    else if (timeframe === '3Y') slicedData = history.slice(0, 1095);
    else slicedData = history;

    return slicedData.map(item => ({ date: item.date, nav: parseFloat(item.nav) })).reverse();
  }, [history, timeframe]);

  if (loading)
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-t-secondary font-bold animate-pulse text-lg">
          Loading fund details...
        </div>
      </div>
    );
  if (error || !mfData)
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h2 className="text-xl font-bold text-red-500 mb-2">Error</h2>
        <p className="text-t-secondary">{error || 'Fund not found'}</p>
        <Link to="/investments" className="mt-4 text-primary font-bold hover:underline">
          Return to Investments
        </Link>
      </div>
    );

  const cat = (meta.scheme_category || '').toLowerCase();
  let riskLabel = 'Moderate';
  if (cat.includes('small cap') || cat.includes('mid cap') || cat.includes('sector'))
    riskLabel = 'High';
  else if (cat.includes('debt') || cat.includes('liquid')) riskLabel = 'Low';
  const userReturnPercent = Number(
    userInvestment?.returnPercent ?? userInvestment?.plPercentage ?? 0
  );
  const userProfitLoss = Number(userInvestment?.profitLoss ?? 0);

  return (
    <div className="p-4 md:p-8 max-w-360 mx-auto w-full grid grid-cols-12 gap-8 pb-20 animate-in fade-in duration-300">
      {/* Left Column */}
      <div className="col-span-12 lg:col-span-8 space-y-6 min-w-0">
        <button
          onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/investments'))}
          className="inline-flex items-center gap-2 text-t-secondary hover:text-primary transition-colors font-bold text-sm no-underline border-none bg-transparent cursor-pointer"
        >
          <MdOutlineArrowBack /> Back
        </button>

        {/* Fund Header */}
        <section className="bg-surface rounded-xl p-6 border border-border shadow-sm">
          <h1 className="text-2xl font-black tracking-tight text-t-primary mb-1 leading-tight">
            {meta.scheme_name}
          </h1>
          <p className="text-t-secondary font-bold text-sm tracking-wide">
            {meta.mutual_fund_family}
          </p>
          <div className="flex gap-2 mt-3">
            <span className="px-3 py-1 bg-slate-100 text-t-secondary rounded text-[10px] font-bold uppercase tracking-wider border border-slate-200">
              {meta.scheme_category}
            </span>
            <span className="px-3 py-1 bg-slate-100 text-t-secondary rounded text-[10px] font-bold uppercase tracking-wider border border-slate-200">
              {meta.scheme_type}
            </span>
          </div>

          {/* Key Metrics Bar */}
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-4 pt-6 mt-6 border-t border-border">
            <div className="flex flex-col">
              <span className="text-[10px] text-t-secondary font-bold uppercase mb-1">
                Current NAV
              </span>
              <span className="text-lg font-bold text-t-primary">₹{currentNAV.toFixed(4)}</span>
              <span className="text-[9px] text-t-secondary">{latestDate}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-t-secondary font-bold uppercase mb-1">
                1Y Return
              </span>
              <span
                className={`text-base font-bold ${returns['1Y'].includes('-') ? 'text-negative' : 'text-positive'}`}
              >
                {returns['1Y']}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-t-secondary font-bold uppercase mb-1">
                3Y Return
              </span>
              <span
                className={`text-base font-bold ${returns['3Y'].includes('-') ? 'text-negative' : 'text-positive'}`}
              >
                {returns['3Y']}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-t-secondary font-bold uppercase mb-1">
                5Y Return
              </span>
              <span
                className={`text-base font-bold ${returns['5Y'].includes('-') ? 'text-negative' : 'text-positive'}`}
              >
                {returns['5Y']}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-t-secondary font-bold uppercase mb-1">Risk</span>
              <span
                className={`text-sm font-bold uppercase ${riskLabel === 'High' ? 'text-red-600' : riskLabel === 'Moderate' ? 'text-amber-600' : 'text-green-600'}`}
              >
                {riskLabel}
              </span>
            </div>
          </div>

          {/* User Position */}
          {userInvestment && (
            <div className="mt-6 pt-6 border-t border-slate-100 bg-slate-50/50 rounded-lg p-5 border">
              <span className="text-xs font-bold text-primary uppercase tracking-widest mb-3 block">
                Your Position
              </span>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-[10px] font-bold text-t-secondary uppercase mb-1">Invested</p>
                  <p className="text-sm font-bold text-t-primary">
                    {formatINR(userInvestment.investedAmount)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-t-secondary uppercase mb-1">
                    Current Value
                  </p>
                  <p className="text-sm font-bold text-t-primary">
                    {formatINR(userInvestment.currentValue)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-t-secondary uppercase mb-1">Returns</p>
                  <p
                    className={`text-sm font-bold ${userReturnPercent >= 0 ? 'text-positive' : 'text-negative'}`}
                  >
                    {userReturnPercent >= 0 ? '+' : ''}
                    {userReturnPercent.toFixed(2)}%
                    <span className="text-t-secondary font-medium text-[10px] ml-1">
                      ({formatINR(Math.abs(userProfitLoss))})
                    </span>
                  </p>
                </div>
                {userInvestment.afterTaxProfit !== undefined && (
                  <div>
                    <p className="text-[10px] font-bold text-t-secondary uppercase mb-1">
                      After Tax Est.
                    </p>
                    <p
                      className={`text-sm font-bold ${userInvestment.afterTaxProfit >= 0 ? 'text-positive' : 'text-negative'}`}
                    >
                      {formatINR(userInvestment.afterTaxProfit)}
                      {userInvestment.taxType && (
                        <span className="text-[8px] block opacity-60 uppercase">
                          ({userInvestment.taxType.replace('_', ' ')})
                        </span>
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* NAV Chart */}
        <section className="bg-surface rounded-xl p-6 border border-border shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-t-primary text-lg">NAV Performance</h3>
            <div className="flex bg-slate-100 p-1 rounded-lg">
              {timeframes.map(tf => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1 text-xs font-bold rounded-md border-none cursor-pointer transition-colors ${timeframe === tf ? 'bg-surface text-primary shadow-sm' : 'text-t-secondary bg-transparent hover:text-t-primary'}`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorNav" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  dy={10}
                  minTickGap={50}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  domain={['dataMin - 5', 'dataMax + 5']}
                />
                <RechartsTooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="nav"
                  stroke="#4f46e5"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorNav)"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Fund Details Section */}
        <section className="bg-surface rounded-xl p-6 border border-border shadow-sm">
          <h3 className="text-lg font-bold text-t-primary mb-6">Fund Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6">
            <div>
              <p className="text-[10px] font-bold uppercase text-t-secondary mb-1">
                Fund House / AMC
              </p>
              <p className="text-sm font-bold text-t-primary">{meta.fund_house}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-t-secondary mb-1">
                Scheme Category
              </p>
              <p className="text-sm font-bold text-t-primary">{meta.scheme_category}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-t-secondary mb-1">Scheme Type</p>
              <p className="text-sm font-bold text-t-primary">{meta.scheme_type}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-t-secondary mb-1">Launch Date</p>
              <p className="text-sm font-bold text-t-primary">
                {history[history.length - 1]?.date || 'N/A'}
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Right Column */}
      <aside className="col-span-12 lg:col-span-4 space-y-6">
        {/* Savings Calculator */}
        <div className="bg-surface rounded-xl border border-border shadow-md overflow-hidden">
          <div className="p-6 border-b border-border">
            <h3 className="text-lg font-bold text-t-primary mb-1 flex items-center justify-between">
              Growth Calculator <MdOutlineTrendingUp className="text-primary text-xl" />
            </h3>
            <p className="text-[10px] text-t-secondary font-bold uppercase tracking-wider mb-6">
              Compare Monthly SIP vs. Upfront Lumpsum
            </p>

            <div className="space-y-5">
              {[
                {
                  label: 'Monthly SIP Amount',
                  value: calcAmount,
                  setter: setCalcAmount,
                  min: 500,
                  max: 100000,
                  step: 500,
                },
                {
                  label: 'Duration (Years)',
                  value: calcDuration,
                  setter: setCalcDuration,
                  min: 1,
                  max: 30,
                  step: 1,
                },
                {
                  label: 'Expected Return (%)',
                  value: calcRate,
                  setter: setCalcRate,
                  min: 1,
                  max: 30,
                  step: 0.5,
                },
              ].map((s, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-t-secondary uppercase tracking-wider">
                      {s.label}
                    </label>
                    <span className="text-sm font-bold text-primary">
                      {s.label.includes('%')
                        ? s.value + '%'
                        : s.label.includes('Amount')
                          ? formatINR(s.value)
                          : s.value + ' Years'}
                    </span>
                  </div>
                  <input
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                    type="range"
                    min={s.min}
                    max={s.max}
                    step={s.step}
                    value={s.value}
                    onChange={e => s.setter(Number(e.target.value))}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Comparison Results */}
          <div className="p-6 bg-slate-50 space-y-4">
            <div className="bg-white border border-border rounded-xl p-4 shadow-sm text-center">
              <p className="text-[10px] font-black text-t-secondary uppercase tracking-widest mb-1">
                Total Investment
              </p>
              <p className="text-2xl font-black text-t-primary">{formatINR(totalInvested)}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-xl">
                <p className="text-[9px] font-black text-indigo-700 uppercase tracking-widest mb-1">
                  SIP Growth
                </p>
                <p className="text-sm font-black text-indigo-900">{formatINR(sip.futureValue)}</p>
                <p className="text-[8px] font-bold text-indigo-600 mt-1">
                  Wealth: +{formatINR(sip.wealthGained)}
                </p>
              </div>
              <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-xl relative group">
                <p className="text-[9px] font-black text-emerald-700 uppercase tracking-widest mb-1">
                  Lumpsum Growth
                </p>
                <p className="text-sm font-black text-emerald-900">
                  {formatINR(lumpsum.futureValue)}
                </p>
                <p className="text-[8px] font-bold text-emerald-600 mt-1">
                  Wealth: +{formatINR(lumpsum.wealthGained)}
                </p>
                <div className="absolute top-2 right-2 group-hover:block hidden">
                  <MdOutlineInfo className="text-emerald-400 text-xs cursor-help" />
                  <div className="absolute bottom-full right-0 mb-2 w-40 bg-slate-800 text-white text-[8px] p-2 rounded shadow-xl z-10 leading-tight font-medium">
                    Shows growth if all {formatINR(totalInvested)} was invested today instead of
                    monthly.
                  </div>
                </div>
              </div>
            </div>

            {difference > 0 && (
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-100 flex items-start gap-2">
                <MdOutlineInfo className="text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-amber-800 leading-relaxed">
                  <strong>Opportunity Cost:</strong> You gain{' '}
                  <span className="font-black underline">{formatINR(difference)}</span> more by
                  investing upfront as a Lumpsum compared to a monthly SIP.
                </p>
              </div>
            )}
          </div>

          <div className="p-6 pt-0 bg-slate-50 space-y-3 flex gap-3 flex-col sm:flex-row xl:flex-col">
            <button
              onClick={() => navigate(`/manageFunds?schemeCode=${schemeCode}&sip=true`)}
              className="flex-1 w-full text-center bg-primary hover:bg-primary-hover text-t-inverse py-3 rounded-lg font-bold text-sm transition-all border-none cursor-pointer"
            >
              Start SIP
            </button>
            <button
              onClick={() => navigate(`/manageFunds?schemeCode=${schemeCode}`)}
              className="flex-1 w-full text-center bg-surface hover:bg-slate-100 text-primary border border-primary py-3 rounded-lg font-bold text-sm transition-all cursor-pointer"
            >
              Buy Lumpsum
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default Fund;
