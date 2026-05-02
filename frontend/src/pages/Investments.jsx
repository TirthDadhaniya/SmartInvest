import React, { useState, useEffect, useContext, useMemo } from 'react';
import usePageTitle from '../utils/usePageTitle';
import { useNavigate } from 'react-router-dom';
import {
  MdOutlineSearch,
  MdOutlineFilterList,
  MdOutlineSort,
  MdOutlineMoreVert,
  MdOutlineTrendingUp,
  MdOutlineTrendingDown,
  MdOutlineRocketLaunch,
  MdClose,
  MdOutlineCheckCircle,
  MdOutlineWarning,
  MdOutlinePieChart,
  MdOutlineInfo,
  MdOutlineDownload,
  MdOutlinePayments,
} from 'react-icons/md';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
} from 'recharts';
import api from '../api/axios';
import { formatINR, formatPercent, formatNAV } from '../utils/formatters';
import { PortfolioContext } from '../context/portfolio-context';
import Toast from '../components/Toast';
import FundSearch from '../components/FundSearch';
import { compareISODate, isValidISODate, toNumber, todayISO } from '../utils/validation';
const formatDate = dateStr => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const MyInvestments = () => {
  const navigate = useNavigate();
  const { fetchPortfolio } = useContext(PortfolioContext);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const [investments, setInvestments] = useState([]);
  const [historyCache, setHistoryCache] = useState({});

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('Name (A-Z)');

  const [openMenuId, setOpenMenuId] = useState(null);
  const [deleteModalItem, setDeleteModalItem] = useState(null);
  const [selectedWhatIfFund, setSelectedWhatIfFund] = useState(null);
  const [whatIfAmount, setWhatIfAmount] = useState('');
  const [whatIfDate, setWhatIfDate] = useState('');
  const [whatIfErrors, setWhatIfErrors] = useState({});
  const [whatIfResult, setWhatIfResult] = useState(null);
  const [whatIfLoading, setWhatIfLoading] = useState(false);

  const showToast = msg => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  usePageTitle('Investments');

  const loadData = async () => {
    try {
      setLoading(true);
      const [taxRes, beRes] = await Promise.all([
        api.get('/api/portfolio/tax-analysis'),
        api.get('/api/portfolio/break-even'),
      ]);

      const taxData = taxRes.data.success ? taxRes.data.data.investments : [];
      const beData = beRes.data.success ? beRes.data.data : [];

      const mergedInvs = taxData.map(t => {
        const be = beData.find(b => b._id === t._id) || {};
        const currentNAV = t.currentNav ?? t.currentNAV ?? be.currentNAV ?? t.purchaseNAV ?? 0;
        const returnPercent = t.plPercentage ?? t.returnPercent ?? 0;
        return {
          _id: t._id,
          schemeCode: t.scheme_code,
          fundName: t.scheme_name,
          schemeCategory: t.scheme_category,
          category: t.category || t.scheme_category,
          investedAmount: t.investedAmount,
          currentValue: t.currentValue,
          returnPercent,
          profitLoss: t.profitLoss,
          currentNAV,
          purchaseNAV: t.purchaseNAV,
          units: t.units,
          afterTaxProfit: t.afterTaxProfit,
          estimatedTax: t.estimatedTax,
          breakEvenNAV: be.breakEvenNAV,
          isAboveBreakEven: be.isAboveBreakEven,
          exitLoadPct: be.exitLoadPct,
        };
      });

      setInvestments(mergedInvs);

      const uniqueSchemes = [...new Set(mergedInvs.map(i => i.schemeCode))];
      const newHistoryCache = {};

      // Optimized fetch: Get the last 30 days for sparklines to ensure we have at least 7 points
      const today = new Date();
      const endDate = today.toISOString().split('T')[0];
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);
      const startDate = thirtyDaysAgo.toISOString().split('T')[0];

      await Promise.all(
        uniqueSchemes.map(async code => {
          try {
            const hRes = await fetch(
              `https://api.mfapi.in/mf/${code}?startDate=${startDate}&endDate=${endDate}`
            );
            const hData = await hRes.json();
            newHistoryCache[code] = hData.data || [];
          } catch {
            newHistoryCache[code] = [];
          }
        })
      );
      setHistoryCache(newHistoryCache);

      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const triggerDataRefresh = () => {
    loadData();
    fetchPortfolio();
  };

  const processedItems = useMemo(() => {
    const filtered = [...investments]
      .filter(item => {
        if (!search.trim()) return true;
        return item.fundName.toLowerCase().includes(search.toLowerCase());
      })
      .filter(item => {
        if (categoryFilter === 'All') return true;
        const category = (item.category || '').toLowerCase();
        return category === categoryFilter.toLowerCase();
      });

    filtered.sort((a, b) => {
      switch (sortOrder) {
        case 'Name (A-Z)':
          return a.fundName.localeCompare(b.fundName);
        case 'Returns % (High to Low)':
          return b.returnPercent - a.returnPercent;
        case 'Invested Amount (High to Low)':
          return b.investedAmount - a.investedAmount;
        case 'Current Value (High to Low)':
          return b.currentValue - a.currentValue;
        default:
          return 0;
      }
    });

    return filtered;
  }, [investments, search, categoryFilter, sortOrder]);

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [search, categoryFilter, sortOrder]);

  const totalPages = Math.ceil(processedItems.length / rowsPerPage);
  const currentView = processedItems.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleDelete = async () => {
    try {
      await api.delete(`/api/investments/${deleteModalItem._id}`);
      setDeleteModalItem(null);
      showToast('Investment removed successfully!');
      triggerDataRefresh();
    } catch {
      alert('Delete failed');
    }
  };

  const handleExportCSV = () => {
    if (!processedItems.length) return;

    const headers = [
      'Fund Name',
      'Scheme Code',
      'Category',
      'Invested Amount',
      'Current Value',
      'Return Percent',
      'Profit/Loss',
      'Current NAV',
      'Purchase NAV',
    ];

    const rows = processedItems.map(item => {
      const safeName = (item.fundName || '').replace(/"/g, '""');
      return [
        `"${safeName}"`,
        item.schemeCode,
        `"${(item.schemeCategory || '').replace(/"/g, '""')}"`,
        Number(item.investedAmount || 0).toFixed(2),
        Number(item.currentValue || 0).toFixed(2),
        Number(item.returnPercent || 0).toFixed(2),
        Number(item.profitLoss || 0).toFixed(2),
        Number(item.currentNAV || 0).toFixed(4),
        Number(item.purchaseNAV || 0).toFixed(4),
      ].join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `smartinvest-investments-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const whatIfHistory = useMemo(
    () =>
      selectedWhatIfFund?.history?.length > 100
        ? selectedWhatIfFund.history
        : historyCache[selectedWhatIfFund?.scheme_code] || [],
    [historyCache, selectedWhatIfFund]
  );

  const whatIfChartData = useMemo(() => {
    // Priority 1: Backend provided simulation chart data (most accurate)
    if (whatIfResult && whatIfResult.chartData) {
      return whatIfResult.chartData;
    }

    if (!selectedWhatIfFund) return [];

    const targetDate = new Date(whatIfDate);

    // Filter and map existing history
    const filtered = whatIfHistory
      .filter(item => {
        const [d, m, y] = item.date.split('-');
        return new Date(`${y}-${m}-${d}`) >= targetDate;
      })
      .map(item => ({ date: item.date, nav: parseFloat(item.nav) }))
      .reverse();

    // Ensure the chart starts from whatIfDate even if it was a holiday
    if (filtered.length > 0) {
      const [fd, fm, fy] = filtered[0].date.split('-');
      const firstDate = new Date(`${fy}-${fm}-${fd}`);
      if (firstDate > targetDate) {
        // Find purchase NAV (first available on or before targetDate)
        let purchaseNAV = filtered[0].nav;
        for (let i = 0; i < whatIfHistory.length; i++) {
          const [d, m, y] = whatIfHistory[i].date.split('-');
          if (new Date(`${y}-${m}-${d}`) <= targetDate) {
            purchaseNAV = parseFloat(whatIfHistory[i].nav);
            break;
          }
        }

        const dTarget = new Date(whatIfDate);
        const formattedTarget = dTarget.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
        filtered.unshift({ date: formattedTarget, nav: purchaseNAV });
      }
    }

    return filtered;
  }, [whatIfDate, whatIfHistory, selectedWhatIfFund, whatIfResult]);

  // Effect to ensure What-If fund always has full history
  useEffect(() => {
    if (
      selectedWhatIfFund?.scheme_code &&
      (!selectedWhatIfFund.history || selectedWhatIfFund.history.length < 100)
    ) {
      const fetchFullHistory = async () => {
        try {
          const res = await fetch(`https://api.mfapi.in/mf/${selectedWhatIfFund.scheme_code}`);
          const data = await res.json();
          if (data.data) {
            setSelectedWhatIfFund(prev => ({
              ...prev,
              history: data.data,
            }));
          }
        } catch (err) {
          console.error('Failed to fetch full history for What-If simulator', err);
        }
      };
      fetchFullHistory();
    }
  }, [selectedWhatIfFund?.scheme_code, selectedWhatIfFund?.history]);

  const whatIfMinDate = useMemo(() => {
    if (!selectedWhatIfFund?.history?.length) return '';
    const history = selectedWhatIfFund.history;
    const oldest = history[history.length - 1].date;
    const [d, m, y] = oldest.split('-');
    return `${y}-${m}-${d}`;
  }, [selectedWhatIfFund]);

  const renderSparkline = schemeCode => {
    const history = historyCache[schemeCode];
    if (!history || history.length < 7)
      return <div className="text-[10px] text-t-placeholder h-10 flex items-center">No data</div>;

    const sevenDays = history
      .slice(0, 7)
      .reverse()
      .map(d => ({ value: parseFloat(d.nav) }));

    const values = sevenDays.map(d => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;
    const padding = range * 0.2 || 0.1;

    const firstVal = values[0];
    const lastVal = values[values.length - 1];
    const trendColor = lastVal >= firstVal ? '#10b981' : '#ef4444';

    return (
      <div className="h-8 w-20">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sevenDays} margin={{ top: 2, right: 1, left: 1, bottom: 0 }}>
            <YAxis domain={[min - padding, max + padding]} hide />
            <Bar dataKey="value" fill={trendColor} isAnimationActive={false} minPointSize={4} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const runWhatIf = async () => {
    const errors = {};
    if (!selectedWhatIfFund?.scheme_code) {
      errors.fund = 'Please select a fund';
    }

    const amount = toNumber(whatIfAmount);
    if (!Number.isFinite(amount) || amount < 1000) {
      errors.amount = 'Amount must be at least ₹1000';
    }

    if (!isValidISODate(whatIfDate)) {
      errors.date = 'Please select a valid date';
    } else {
      if (whatIfMinDate && compareISODate(whatIfDate, whatIfMinDate) < 0) {
        errors.date = `Date cannot be before ${whatIfMinDate}`;
      }
      if (compareISODate(whatIfDate, todayISO()) > 0) {
        errors.date = 'Date cannot be in the future';
      }
    }

    if (Object.keys(errors).length > 0) {
      setWhatIfErrors(errors);
      return;
    }

    setWhatIfErrors({});

    try {
      setWhatIfLoading(true);
      const res = await api.post('/api/portfolio/what-if', {
        scheme_code: Number(selectedWhatIfFund.scheme_code),
        amount,
        date: new Date(whatIfDate).toISOString(),
      });
      setWhatIfResult(res.data?.data || null);
    } catch {
      setWhatIfResult(null);
      showToast('Could not calculate historical result for the selected inputs.');
    } finally {
      setWhatIfLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 max-w-350 mx-auto w-full relative animate-in fade-in duration-300">
      <Toast message={toastMsg} />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        {/* Page heading */}
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-t-primary">
            My Portfolio
          </h1>
          <p className="text-t-secondary text-sm mt-1">
            Track performance and analyze your holdings
          </p>
        </div>
        {/* Invest and Export buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/manageFunds')}
            className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-all border-none cursor-pointer"
          >
            <MdOutlinePayments className="text-lg" />
            Invest
          </button>
          <button
            onClick={handleExportCSV}
            disabled={processedItems.length === 0}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed border-none cursor-pointer"
          >
            <MdOutlineDownload className="text-lg" />
            Export to CSV
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-surface p-4 rounded-xl border border-border shadow-sm">
        <div className="relative w-full md:w-80">
          <MdOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-t-placeholder text-xl" />
          <input
            type="text"
            placeholder="Search funds..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white border border-border rounded-lg pl-10 pr-4 py-2 text-sm outline-none focus:ring-1 focus:border-primary focus:ring-primary transition-all"
          />
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <MdOutlineFilterList className="text-t-secondary hidden sm:block" />
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="styled-select bg-white border border-border rounded-lg px-3 py-2 text-sm font-bold text-t-primary outline-none focus:border-primary transition-colors cursor-pointer"
            >
              <option>All</option>
              <option>Equity</option>
              <option>Debt</option>
              <option>Hybrid</option>
            </select>
          </div>
          {/* Sorting Filter */}
          <div className="flex items-center gap-2">
            <MdOutlineSort className="text-t-secondary hidden sm:block" />
            <select
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value)}
              className="styled-select bg-white border border-border rounded-lg px-3 py-2 text-sm font-bold text-t-primary outline-none focus:border-primary transition-colors cursor-pointer"
            >
              <option>Name (A-Z)</option>
              <option>Returns % (High to Low)</option>
              <option>Invested Amount (High to Low)</option>
              <option>Current Value (High to Low)</option>
            </select>
          </div>
          {/* Reset Filters */}
          {(search || categoryFilter !== 'All' || sortOrder !== 'Name (A-Z)') && (
            <button
              onClick={() => {
                setSearch('');
                setCategoryFilter('All');
                setSortOrder('Name (A-Z)');
              }}
              className="text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg transition-colors border-none cursor-pointer ml-auto"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      <div className="w-full border border-border rounded-2xl overflow-hidden bg-surface">
        <div className="overflow-x-auto">
          <div className="min-w-275">
            {/* HEADER ROW - always visible */}
            <div className="flex items-center bg-primary text-white text-[12px] uppercase tracking-widest font-bold">
              <div className="min-w-45 pl-6 pr-4 py-4 w-[42%] text-left ">
                Fund Name &amp; Category
              </div>
              <div className="py-4 px-4 w-[12%] text-right ">Current Value</div>
              <div className="py-4 px-4 w-[10%] text-right ">Returns </div>
              <div className="py-4 px-4 w-[10%] text-right ">Units &amp; NAV</div>
              <div className="py-4 pr-4 w-[10%] text-right ">Break-Even</div>
              <div className="py-4  w-[12%] text-center ">7-Day Trend</div>
              <div className="py-4 pr-4 w-[4%] text-right"></div>
            </div>

            {loading ? (
              <div className="py-10 text-center text-t-secondary text-sm">Loading holdings...</div>
            ) : error ? (
              <div className="py-10 text-center space-y-3">
                <p className="text-red-500 font-bold text-lg">Connection Error</p>
                <button
                  onClick={loadData}
                  className="px-5 py-2 bg-primary text-white rounded-lg font-bold border-none cursor-pointer hover:bg-primary-hover transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : investments.length === 0 ? (
              <div className="py-10 text-center space-y-3">
                <MdOutlineRocketLaunch className="text-5xl text-primary/30 mx-auto" />
                <h2 className="text-xl font-bold text-t-primary">No active holdings</h2>
                <button
                  onClick={() => navigate('/manageFunds')}
                  className="mt-1 bg-primary text-white px-5 py-2.5 rounded-lg font-bold hover:bg-primary-hover transition-all border-none cursor-pointer"
                >
                  Add Investments
                </button>
              </div>
            ) : processedItems.length === 0 ? (
              <div className="py-10 text-center">
                <MdOutlineInfo className="text-4xl text-t-placeholder mb-2 mx-auto" />
                <h3 className="text-lg font-bold text-t-secondary">No matching funds found</h3>
                <p className="text-sm text-t-placeholder">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {currentView.map(item => {
                  const isPositive = item.returnPercent >= 0;
                  return (
                    <div
                      key={item._id}
                      onClick={() => navigate(`/fund/${item.schemeCode}`)}
                      className="group flex bg-surface hover:bg-slate-50 transition-all cursor-pointer relative"
                    >
                      {/* <div
                        className={`absolute left-0 top-0 bottom-0 w-1 transition-colors duration-300 ${isPositive ? 'group-hover:bg-green-500' : 'group-hover:bg-red-500'}`}
                      /> */}

                      {/* Fund Name + Category */}
                      <div className="min-w-45 pl-6 pr-4 py-4 w-[42%] text-left">
                        <h3
                          className="font-extrabold text-t-primary text-md truncate tracking-tight"
                          title={item.fundName}
                        >
                          {item.fundName}
                        </h3>
                        <div className="mt-1.5 inline-flex items-center px-2 py-0.5 rounded-sm bg-slate-100/80 text-[10px] uppercase font-bold tracking-wider text-t-secondary border border-border">
                          {item.schemeCategory || 'Fund Category'}
                        </div>
                      </div>

                      {/* Invested vs Current Value */}
                      <div className="flex flex-col py-4 px-4 w-[12%] text-right ">
                        <span className="text-lg font-black text-t-primary">
                          {formatINR(item.currentValue)}
                        </span>
                        <span className="text-[12px] text-t-secondary mt-0.5">
                          {`${isPositive ? 'Profit:' : 'Loss:'}`}{' '}
                          <span
                            className={`font-bold ${isPositive ? 'text-positive' : 'text-negative'}`}
                          >
                            {formatINR(Math.abs(item.profitLoss))}
                          </span>
                        </span>
                      </div>

                      {/* Return % and Profit/Loss */}
                      <div className="flex flex-col py-4 px-4 w-[10%] text-right ">
                        <div
                          className={`text-lg font-black ${isPositive ? 'text-positive' : 'text-negative'}`}
                        >
                          {isPositive ? '+' : ''}
                          {formatPercent(item.returnPercent)}
                        </div>
                        {item.afterTaxProfit !== undefined && (
                          <div className="text-[10px] mt-0.5 text-right">
                            {item.estimatedTax > 0 ? (
                              <span className="text-slate-400">
                                After tax:{' '}
                                <span className="font-bold">{formatINR(item.afterTaxProfit)}</span>
                              </span>
                            ) : (
                              <span className="text-green-500 font-bold">No tax liability</span>
                            )}
                          </div>
                        )}
                      </div>

                      {/*Units & NAV */}
                      <div className="flex flex-col py-4 pr-4 w-[10%] text-right ">
                        <span className="text-base font-bold text-t-primary">
                          {item.units ? item.units.toFixed(2) : 'Units'}{' '}
                        </span>

                        <span className="text-[12px] text-t-secondary mt-0.5">
                          {`NAV: `}{' '}
                          <span className="font-bold ">
                            {item.purchaseNAV ? formatNAV(item.purchaseNAV) : 'NAV'}
                          </span>
                        </span>
                      </div>

                      {/* Break-Even */}
                      <div className="flex flex-col py-4 pr-4 w-[10%] text-right ">
                        <span
                          className={`text-base font-bold ${item.isAboveBreakEven ? `text-green-600` : `text-amber-600`}`}
                        >
                          {formatNAV(item.breakEvenNAV)}
                        </span>
                        <span className="text-[12px] text-t-secondary mt-0.5">
                          Curr: <span className="font-bold ">{formatNAV(item.currentNAV)}</span>
                        </span>
                      </div>

                      {/* 7Day Trend */}
                      <div className="py-4 w-[12%] flex flex-col items-center  ">
                        {(() => {
                          const history = historyCache[item.schemeCode] || [];
                          const isTrendUp =
                            history.length >= 2 &&
                            parseFloat(history[0]?.nav) >=
                              parseFloat(history[Math.min(6, history.length - 1)]?.nav);
                          return (
                            <span
                              className={`w-22 h-8 rounded overflow-hidden relative border flex items-center justify-center ${
                                isTrendUp
                                  ? 'bg-emerald-50 border-emerald-100'
                                  : 'bg-rose-50 border-rose-100'
                              }`}
                            >
                              {renderSparkline(item.schemeCode)}
                            </span>
                          );
                        })()}
                      </div>

                      {/* Action Menu */}
                      <div className="py-4 pr-4 w-[4%] flex justify-end ">
                        <div className="relative">
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              setOpenMenuId(openMenuId === item._id ? null : item._id);
                            }}
                            className="p-2 text-t-placeholder hover:text-t-primary hover:bg-slate-200 rounded-full transition-colors border-none bg-transparent cursor-pointer"
                          >
                            <MdOutlineMoreVert className="text-xl" />
                          </button>
                          {openMenuId === item._id && (
                            <div
                              className="absolute right-0 top-10 w-44 bg-white rounded-xl shadow-2xl border border-slate-100 py-2 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100"
                              onClick={e => e.stopPropagation()}
                            >
                              <button
                                className="w-full text-left px-5 py-2.5 text-sm font-bold text-t-primary hover:bg-slate-50 border-none bg-transparent cursor-pointer flex items-center justify-between"
                                onClick={() => navigate(`/fund/${item.schemeCode}`)}
                              >
                                View Details <span>→</span>
                              </button>
                              <div className="h-px bg-slate-100 my-1 mx-2"></div>
                              <button
                                className="w-full text-left px-5 py-2.5 text-xs uppercase tracking-wide font-black text-negative hover:bg-red-500 hover:text-white border-none bg-transparent cursor-pointer transition-colors"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  setDeleteModalItem(item);
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        {processedItems.length > 0 && (
          <div className="px-6 py-4 border-t border-border bg-slate-50 flex items-center justify-between text-sm">
            <p className="text-t-secondary font-medium">
              Showing{' '}
              <span className="text-t-primary font-bold">
                {(currentPage - 1) * rowsPerPage + 1}
              </span>{' '}
              to{' '}
              <span className="text-t-primary font-bold">
                {Math.min(currentPage * rowsPerPage, processedItems.length)}
              </span>{' '}
              of <span className="text-t-primary font-bold">{processedItems.length}</span>
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border border-border rounded text-t-primary font-medium disabled:opacity-50 hover:bg-surface transition-colors cursor-pointer bg-white"
              >
                Prev
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 border border-border rounded text-t-primary font-medium disabled:opacity-50 hover:bg-surface transition-colors cursor-pointer bg-white"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Section: What-If Simulator */}
      {investments.length > 0 && (
        <div className="mt-6">
          <div
            id="what-if-simulator"
            className="bg-white border border-border rounded-2xl p-6 md:p-8 shadow-sm relative overflow-hidden"
          >
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full -ml-32 -mb-32 blur-3xl" />

            <div className="relative">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                  <h3 className="text-xl font-extrabold text-t-primary flex items-center gap-2">
                    <MdOutlineRocketLaunch className="text-primary" />
                    Historical What-If Simulator
                  </h3>
                  <p className="text-sm text-t-secondary mt-1 max-w-2xl">
                    Ever wondered what would have happened if you invested earlier? Select any
                    mutual fund, amount, and date to simulate historical performance.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setWhatIfResult(null);
                    setWhatIfAmount('');
                    setSelectedWhatIfFund(null);
                    setWhatIfDate('');
                  }}
                  className="self-start md:self-center px-4 py-2 text-sm font-bold text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-all border-none cursor-pointer"
                >
                  Reset Simulator
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end bg-slate-50/50 p-6 rounded-2xl border border-border/50">
                <div className="lg:col-span-5">
                  <label className="text-[11px] font-black text-t-secondary uppercase tracking-widest mb-2 block">
                    Mutual Fund Scheme
                  </label>
                  <FundSearch
                    className="z-10"
                    value={selectedWhatIfFund}
                    onSelect={fund => {
                      setSelectedWhatIfFund(fund);
                      setWhatIfErrors(prev => ({ ...prev, fund: '' }));
                      setWhatIfResult(null);
                    }}
                    placeholder="Search any fund (e.g. Axis Bluechip Fund)"
                  />
                  {whatIfErrors.fund && (
                    <p className="text-[10px] text-negative font-bold mt-1">{whatIfErrors.fund}</p>
                  )}
                </div>

                <div className="lg:col-span-2">
                  <label className="text-[11px] font-black text-t-secondary uppercase tracking-widest mb-2 block">
                    Amount (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-t-placeholder">
                      ₹
                    </span>
                    <input
                      type="number"
                      value={whatIfAmount}
                      onChange={e => {
                        setWhatIfAmount(e.target.value);
                        setWhatIfErrors(prev => ({ ...prev, amount: '' }));
                      }}
                      className={`w-full bg-white border rounded-xl pl-8 pr-4 py-2.5 text-sm font-bold outline-none transition-all ${whatIfErrors.amount ? 'border-negative focus:ring-2 focus:ring-red-200 focus:border-negative' : 'border-border focus:ring-2 focus:ring-primary/20 focus:border-primary'}`}
                    />
                  </div>
                  {whatIfErrors.amount && (
                    <p className="text-[10px] text-negative font-bold mt-1">
                      {whatIfErrors.amount}
                    </p>
                  )}
                </div>

                <div className="lg:col-span-3">
                  <label className="text-[11px] font-black text-t-secondary uppercase tracking-widest mb-2 block">
                    From Date
                  </label>
                  <input
                    type="date"
                    value={whatIfDate}
                    onChange={e => {
                      setWhatIfDate(e.target.value);
                      setWhatIfErrors(prev => ({ ...prev, date: '' }));
                    }}
                    className={`styled-date styled-date-input w-full bg-white border rounded-xl px-4 py-2 text-sm font-bold outline-none transition-all cursor-pointer ${whatIfErrors.date ? 'border-negative focus:ring-2 focus:ring-red-200 focus:border-negative' : 'border-border focus:ring-2 focus:ring-primary/20 focus:border-primary'}`}
                  />
                  {whatIfErrors.date && (
                    <p className="text-[10px] text-negative font-bold mt-1">{whatIfErrors.date}</p>
                  )}
                </div>

                <div className="lg:col-span-2">
                  <button
                    onClick={runWhatIf}
                    disabled={whatIfLoading || !selectedWhatIfFund || !whatIfAmount || !whatIfDate}
                    className="w-full h-10 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-black transition-all border-none cursor-pointer disabled:opacity-50 shadow-lg shadow-primary/20 active:scale-95"
                  >
                    {whatIfLoading ? 'Analyzing...' : 'Simulate'}
                  </button>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-1 xl:grid-cols-12 gap-8">
                <div className="xl:col-span-5 space-y-6">
                  <div className="bg-primary text-white p-6 rounded-2xl shadow-xl shadow-primary/20">
                    <p className="text-primary-foreground/80 text-xs font-bold uppercase tracking-widest mb-2">
                      Projected Value Today
                    </p>
                    <h4 className="text-4xl font-black mb-4">
                      {whatIfResult ? formatINR(whatIfResult.currentValue) : '₹ ---'}
                    </h4>
                    <p className="text-sm leading-relaxed font-medium opacity-90">
                      {whatIfResult ? (
                        <>
                          An investment of{' '}
                          <span className="font-black underline">{formatINR(whatIfAmount)}</span> in{' '}
                          <span className="font-black italic">
                            {selectedWhatIfFund?.scheme_name}
                          </span>{' '}
                          on <span className="font-black">{formatDate(whatIfDate)}</span> would have
                          grown significantly.
                        </>
                      ) : (
                        'Select a fund and parameters above to see how your wealth could have grown. We use real historical NAV data for the most accurate simulation.'
                      )}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white border border-border p-4 rounded-xl">
                      <p className="text-[10px] text-t-secondary font-black uppercase tracking-wider mb-1">
                        Absolute Profit
                      </p>
                      <p
                        className={`text-lg font-black ${whatIfResult?.profit >= 0 ? 'text-positive' : 'text-negative'}`}
                      >
                        {whatIfResult ? (whatIfResult.profit >= 0 ? '+' : '') : ''}
                        {whatIfResult ? formatINR(whatIfResult.profit) : '---'}
                      </p>
                    </div>
                    <div className="bg-white border border-border p-4 rounded-xl">
                      <p className="text-[10px] text-t-secondary font-black uppercase tracking-wider mb-1">
                        CAGR (%)
                      </p>
                      <p
                        className={`text-lg font-black ${whatIfResult?.annualizedReturn >= 0 ? 'text-positive' : 'text-negative'}`}
                      >
                        {whatIfResult ? whatIfResult.annualizedReturn?.toFixed(2) + '%' : '---'}
                      </p>
                    </div>
                    <div className="bg-white border border-border p-4 rounded-xl">
                      <p className="text-[10px] text-t-secondary font-black uppercase tracking-wider mb-1">
                        Units Held
                      </p>
                      <p className="text-lg font-black text-t-primary">
                        {whatIfResult ? whatIfResult.units?.toFixed(3) : '---'}
                      </p>
                    </div>
                    <div className="bg-white border border-border p-4 rounded-xl">
                      <p className="text-[10px] text-t-secondary font-black uppercase tracking-wider mb-1">
                        Purchase NAV
                      </p>
                      <p className="text-lg font-black text-t-primary">
                        {whatIfResult ? '₹' + whatIfResult.purchaseNAV?.toFixed(2) : '---'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="xl:col-span-7 bg-white border border-border rounded-2xl p-6 relative min-h-80">
                  <div className="flex items-center justify-between mb-6">
                    <h5 className="text-xs font-black text-t-secondary uppercase tracking-widest">
                      Growth Trajectory
                    </h5>
                    {whatIfResult && (
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-full bg-primary" />
                          <span className="text-[10px] font-bold text-t-secondary">NAV Value</span>
                        </div>
                      </div>
                    )}
                  </div>
                  {whatIfChartData.length > 0 ? (
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={whatIfChartData}>
                          <defs>
                            <linearGradient id="invWhatIfArea" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#1152d4" stopOpacity={0.2} />
                              <stop offset="95%" stopColor="#1152d4" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="date" hide axisLine={false} tickLine={false} />
                          <YAxis domain={['dataMin', 'dataMax']} hide />
                          <RechartsTooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="bg-white border border-border p-3 rounded-lg shadow-xl">
                                    <p className="text-[10px] font-black text-t-secondary mb-1">
                                      {payload[0].payload.date}
                                    </p>
                                    <p className="text-sm font-black text-primary">
                                      ₹{parseFloat(payload[0].value).toFixed(4)}
                                    </p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="nav"
                            stroke="#1152d4"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#invWhatIfArea)"
                            isAnimationActive={true}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-64 flex flex-col items-center justify-center text-center p-8 bg-slate-50 rounded-xl border border-dashed border-border group">
                      <div className="size-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <MdOutlineTrendingUp className="text-2xl text-primary/40" />
                      </div>
                      <p className="text-sm font-bold text-t-secondary">Chart Trajectory</p>
                      <p className="text-[10px] text-t-placeholder mt-1">
                        Select fund and date to see performance graph
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModalItem && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setDeleteModalItem(null)}
        >
          <div
            className="bg-surface rounded-xl flex flex-col w-full max-w-md overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="size-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
                <MdOutlineTrendingDown className="text-2xl" />
              </div>
              <h3 className="font-black text-xl text-t-primary mb-2 tracking-tight">
                Delete Investment?
              </h3>
              <p className="text-sm text-t-secondary leading-relaxed font-medium">
                Are you sure you want to delete{' '}
                <strong className="text-negative">{deleteModalItem.fundName}</strong>? All related
                transactions will also be removed.
              </p>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-border flex justify-end gap-3">
              <button
                className="px-5 py-2 bg-transparent border-none text-sm font-bold text-t-secondary hover:text-t-primary cursor-pointer transition-colors"
                onClick={() => setDeleteModalItem(null)}
              >
                Cancel
              </button>
              <button
                className="px-5 py-2 bg-negative text-t-inverse border-none rounded-lg text-sm font-bold hover:bg-red-600 cursor-pointer shadow-sm transition-all"
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyInvestments;
