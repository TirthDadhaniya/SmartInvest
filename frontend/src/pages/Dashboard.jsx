import React, { useState, useEffect, useContext, useRef, useMemo, useCallback } from 'react';
import usePageTitle from '../utils/usePageTitle';
import {
  MdOutlineInfo,
  MdOutlineTrendingUp,
  MdOutlineTrendingDown,
  MdOutlineCallMade,
  MdOutlineEventRepeat,
  MdOutlineWarning,
  MdOutlineRocketLaunch,
  MdOutlineShoppingCart,
  MdErrorOutline,
  MdRefresh,
  MdClose,
  MdOutlineCheckCircle,
  MdOutlineLock,
} from 'react-icons/md';
import { Link, useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import api from '../api/axios';
import { PortfolioContext } from '../context/portfolio-context';
import { formatINR } from '../utils/formatters';

// Skeleton is imported from the shared PageSkeletons component
import { DashboardSkeleton } from '../components/PageSkeletons';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [sips, setSips] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [stressData, setStressData] = useState(null);
  const [goalGaps, setGoalGaps] = useState([]);

  // SIP Adjust Modal
  const [sipModalOpen, setSipModalOpen] = useState(false);
  const [editingSip, setEditingSip] = useState(null);
  const [newAmount, setNewAmount] = useState('');
  const [sipSaving, setSipSaving] = useState(false);
  const [sipSaveError, setSipSaveError] = useState('');
  const [sipSaveSuccess, setSipSaveSuccess] = useState(false);
  const sipInputRef = useRef(null);

  // SIP Payment
  const [sipPaymentLoading, setSipPaymentLoading] = useState(false);
  const [sipPaymentMessage, setSipPaymentMessage] = useState('');

  const closeSipModal = () => {
    setSipModalOpen(false);
    setEditingSip(null);
    setSipSaveError('');
    setSipSaveSuccess(false);
  };

  const handleSipAmountSave = async () => {
    const parsed = parseFloat(newAmount);
    if (!parsed || parsed <= 0) {
      setSipSaveError('Please enter a valid amount greater than 0.');
      return;
    }
    try {
      setSipSaving(true);
      setSipSaveError('');
      await api.put(`/api/sips/${editingSip._id}`, {
        monthlyAmount: parsed,
        durationYears: editingSip.durationYears || 10,
        expectedReturnRate: editingSip.expectedReturnRate || 12,
      });
      // Refresh SIPs list
      const res = await api.get('/api/sips');
      setSips(res.data.success ? res.data.data : res.data);
      setSipSaveSuccess(true);
      setTimeout(() => closeSipModal(), 1200);
    } catch (err) {
      setSipSaveError(err?.response?.data?.message || 'Failed to update SIP. Please try again.');
    } finally {
      setSipSaving(false);
    }
  };

  const handlePaySip = async sipId => {
    setSipPaymentLoading(true);
    setSipPaymentMessage('');
    try {
      await api.post(`/api/sips/${sipId}/execute`, {});
      setSipPaymentMessage('SIP instalment executed successfully!');
      // Refresh data
      await fetchData();
      setTimeout(() => setSipPaymentMessage(''), 3000);
    } catch (err) {
      setSipPaymentMessage(
        err?.response?.data?.message || 'Failed to execute SIP. Please try again.'
      );
      setTimeout(() => setSipPaymentMessage(''), 4000);
    } finally {
      setSipPaymentLoading(false);
    }
  };

  const {
    rawData: portfolio,
    loading: portLoading,
    error: portError,
    fetchPortfolio,
  } = useContext(PortfolioContext);

  const categoryColors = useMemo(
    () => [
      'bg-indigo-500',
      'bg-emerald-500',
      'bg-amber-500',
      'bg-rose-500',
      'bg-sky-500',
      'bg-violet-500',
    ],
    []
  );

  const piePalette = useMemo(
    () => ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#0ea5e9', '#8b5cf6'],
    []
  );

  const normalizedCategoryAllocation = useMemo(() => {
    if (!portfolio) return [];

    const { categoryAllocation, investments, totalCurrentValue } = portfolio;

    // If backend provides specific category breakdown, use it, otherwise aggregate from investments
    let source = [];
    if (Array.isArray(categoryAllocation) && categoryAllocation.length > 0) {
      source = categoryAllocation.map(c => ({
        name: c.name,
        value: c.value,
        percent: c.percent,
      }));
    } else {
      // Manual aggregation as fallback
      const groups = (investments || []).reduce((acc, inv) => {
        const cat = inv.scheme_category || inv.schemeCategory || 'Other';
        acc[cat] = (acc[cat] || 0) + (inv.currentValue || 0);
        return acc;
      }, {});
      source = Object.entries(groups).map(([name, val]) => ({
        name,
        value: val,
        percent: totalCurrentValue > 0 ? (val / totalCurrentValue) * 100 : 0,
      }));
    }

    return source
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value)
      .map((item, idx) => ({
        key: `${item.name}-${idx}`,
        label: item.name,
        percent: item.percent,
        value: item.value,
        colorClass: categoryColors[idx % categoryColors.length],
        color: piePalette[idx % piePalette.length],
      }));
  }, [portfolio, categoryColors, piePalette]);

  const getGoalProgressPercent = goal => {
    const derivedProgress =
      goal.targetAmount > 0 ? ((goal.targetAmount - (goal.gap || 0)) / goal.targetAmount) * 100 : 0;
    const rawProgress =
      typeof goal.progressPercent === 'number' ? goal.progressPercent : derivedProgress;
    return Math.min(100, Math.max(0, rawProgress || 0));
  };

  const formatGoalDate = dateValue =>
    new Date(dateValue).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  const topGoalGaps = useMemo(
    () =>
      [...goalGaps]
        .sort((a, b) => getGoalProgressPercent(b) - getGoalProgressPercent(a))
        .slice(0, 2),
    [goalGaps]
  );

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await fetchPortfolio();
      const [sipsRes, transRes, stressRes, goalsRes] = await Promise.all([
        api.get('/api/sips'),
        api.get('/api/transactions'),
        api.get('/api/portfolio/stress-test').catch(() => ({ data: { data: null } })),
        api.get('/api/portfolio/goal-gaps').catch(() => ({ data: { data: [] } })),
      ]);
      setSips(
        sipsRes.data.success ? sipsRes.data.data : Array.isArray(sipsRes.data) ? sipsRes.data : []
      );
      setTransactions(
        transRes.data.success
          ? transRes.data.data
          : Array.isArray(transRes.data)
            ? transRes.data
            : []
      );
      setStressData(stressRes.data?.data || (stressRes.data?.success ? stressRes.data.data : null));

      const goalsData =
        goalsRes.data?.data ||
        (goalsRes.data?.success
          ? goalsRes.data.data
          : Array.isArray(goalsRes.data)
            ? goalsRes.data
            : []);
      const fetchedGoals = Array.isArray(goalsData) ? goalsData : [];

      setGoalGaps(
        fetchedGoals.map(g => ({
          ...g,
          gapStatus: g.gapStatus || 'on_track',
          gapMessage: g.gapMessage || `Target: ₹${g.targetAmount}`,
          extraSIPNeeded: g.extraSIPNeeded || 0,
        }))
      );
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        setError('Your session has expired. Please login again to view your dashboard.');
      } else {
        setError('Unable to connect to the server. Please check your internet connection.');
      }
    } finally {
      setLoading(false);
    }
  }, [fetchPortfolio]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  usePageTitle('Dashboard');

  const isGlobalLoading = loading || portLoading;

  if (isGlobalLoading) return <DashboardSkeleton />;

  const isAuthError =
    (error && error.includes('session')) || (portError && portError.includes('Session'));

  if (error || portError) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center animate-in fade-in zoom-in-95 duration-200">
        {isAuthError ? (
          <MdOutlineLock className="text-6xl text-amber-500 mb-4" />
        ) : (
          <MdErrorOutline className="text-6xl text-red-500 mb-4" />
        )}
        <h2 className="text-xl font-bold text-t-primary mb-2">
          {isAuthError ? 'Authentication Required' : 'Oops! Connection Interrupted'}
        </h2>
        <p className="text-t-secondary mb-6 max-w-md">{error || portError}</p>
        {isAuthError ? (
          <Link
            to="/login"
            className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-lg font-bold transition-all shadow-sm no-underline"
          >
            Go to Login
          </Link>
        ) : (
          <button
            onClick={fetchData}
            className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-lg font-bold transition-all shadow-sm border-none cursor-pointer"
          >
            <MdRefresh className="text-xl" /> Retry Connection
          </button>
        )}
      </div>
    );
  }

  if (!portfolio || !portfolio.investments || portfolio.investments.length === 0) {
    return (
      <div className="p-8 space-y-8 max-w-300 mx-auto w-full flex flex-col items-center justify-center h-full min-h-[70vh] animate-in fade-in duration-300">
        <div className="size-24 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
          <MdOutlineRocketLaunch className="text-5xl" />
        </div>
        <h2 className="text-3xl font-bold text-t-primary">Your portfolio is empty</h2>
        <p className="text-t-secondary text-center max-w-md text-lg">
          Add your first mutual fund to start tracking your wealth in real-time.
        </p>
        <Link
          to="/manageFunds"
          className="mt-6 bg-primary text-t-inverse px-8 py-4 rounded-xl font-bold hover:bg-primary-hover shadow-lg transition-all text-lg no-underline hover:scale-105 active:scale-95 inline-block"
        >
          Add Your First Fund
        </Link>
      </div>
    );
  }

  const { unrealizedProfit, realizedProfit, totalProfit, healthScore, expenseInfo } = portfolio;
  const isUnrealizedProfit = unrealizedProfit >= 0;
  const isRealizedProfit = realizedProfit >= 0;
  const isTotalProfit = totalProfit >= 0;

  const topCategory = normalizedCategoryAllocation[0] || null;
  const categoryPieData = normalizedCategoryAllocation;

  // Upcoming SIPs logic - find active SIPs with nextDueDate within 15 days
  const now = new Date();
  const upcomingSips = sips.filter(s => {
    if (s.status !== 'active') return false;
    const diffDays = Math.ceil(
      (new Date(s.nextDueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diffDays >= 0 && diffDays <= 15;
  });

  const nextSip = upcomingSips.length > 0 ? upcomingSips[0] : null;

  const openSipModal = sip => {
    setEditingSip(sip);
    setNewAmount(String(sip.monthlyAmount ?? sip.amount ?? ''));
    setSipSaveError('');
    setSipSaveSuccess(false);
    setSipModalOpen(true);
    setTimeout(() => sipInputRef.current?.focus(), 50);
  };

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-350 mx-auto w-full animate-in fade-in duration-300">
      {/* SIP Reminder Strip */}
      {nextSip && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white size-12 rounded-lg shadow-sm flex items-center justify-center text-primary">
              <MdOutlineEventRepeat className="text-xl" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">
                Next SIP Payment:{' '}
                {new Date(nextSip.nextDueDate).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
              <p className="text-xs text-slate-500">
                Scheduled for{' '}
                <span className="font-bold text-primary">
                  {upcomingSips.length} {upcomingSips.length === 1 ? 'fund' : 'funds'}
                </span>{' '}
                totaling{' '}
                <span className="font-bold text-primary">
                  {formatINR(
                    upcomingSips.reduce((sum, s) => sum + (s.monthlyAmount || s.amount || 0), 0)
                  )}
                </span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePaySip(nextSip._id)}
              disabled={sipPaymentLoading}
              className="text-xs font-bold uppercase tracking-widest bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors whitespace-nowrap border-none cursor-pointer disabled:opacity-50"
            >
              {sipPaymentLoading ? 'Processing...' : 'Pay SIP'}
            </button>
            <button
              onClick={() => openSipModal(nextSip)}
              className="text-xs font-bold uppercase tracking-widest bg-primary text-t-inverse px-4 py-2 rounded-lg hover:bg-primary-hover transition-colors whitespace-nowrap border-none cursor-pointer"
            >
              Adjust Amount
            </button>
          </div>
        </div>
      )}

      {sipPaymentMessage && (
        <div
          className={`p-3 rounded-lg text-sm font-bold animate-in fade-in duration-200 ${sipPaymentMessage.includes('successfully') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}
        >
          {sipPaymentMessage}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-8 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* <div className="bg-surface p-6 rounded-card border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
          <p className="text-t-secondary text-sm font-medium">Portfolio Value</p>
          <p className="text-2xl font-bold mt-1 text-t-primary">{formatINR(totalCurrentValue)}</p>
          <div className="mt-4 flex items-center gap-1 text-t-placeholder text-xs">
            <MdOutlineInfo className="text-[14px]" />
            <span>Current value of funds you hold</span>
          </div>
        </div> */}

          <div className="bg-surface p-6 rounded-card border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <h3 className="font-inter font-bold text-t-primary mb-3">Unrealized Profit</h3>

            <p
              className={`text-2xl font-bold mt-1 ${isUnrealizedProfit ? 'text-positive' : 'text-negative'}`}
            >
              {isUnrealizedProfit ? '+' : ''}
              {formatINR(unrealizedProfit)}
            </p>
            <div
              className={`mt-4 flex items-center gap-1 text-xs ${isUnrealizedProfit ? 'text-positive' : 'text-negative'}`}
            >
              {isUnrealizedProfit ? (
                <MdOutlineTrendingUp className="text-[14px]" />
              ) : (
                <MdOutlineTrendingDown className="text-[14px]" />
              )}
              <span>Paper profit on current holdings</span>
            </div>
          </div>

          <div className=" bg-surface p-6 rounded-card border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <h3 className="font-inter font-bold text-t-primary mb-3">Realized Profit</h3>

            <p
              className={`text-2xl font-bold mt-1 ${isRealizedProfit ? 'text-positive' : 'text-negative'}`}
            >
              {isRealizedProfit ? '+' : ''}
              {formatINR(realizedProfit)}
            </p>
            <div
              className={`mt-4 flex items-center gap-1 text-xs ${isRealizedProfit ? 'text-positive' : 'text-negative'}`}
            >
              {isRealizedProfit ? (
                <MdOutlineTrendingUp className="text-[14px]" />
              ) : (
                <MdOutlineTrendingDown className="text-[14px]" />
              )}
              <span>Profit from funds you sold</span>
            </div>
          </div>

          <div className="bg-surface p-6 rounded-card border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <h3 className="font-inter font-bold text-t-primary mb-3">Total Profit</h3>

            <p
              className={`text-2xl font-bold ${isTotalProfit ? 'text-positive' : 'text-negative'}`}
            >
              {isTotalProfit ? '+' : ''}
              {formatINR(totalProfit)}
            </p>
            <div
              className={`mt-4 flex items-center gap-1 text-xs ${isTotalProfit ? 'text-positive' : 'text-negative'}`}
            >
              {isTotalProfit ? (
                <MdOutlineTrendingUp className="text-[14px]" />
              ) : (
                <MdOutlineTrendingDown className="text-[14px]" />
              )}
              <span>Realized + Unrealized combined</span>
            </div>
          </div>
        </div>
        <div className="xl:col-span-4 grid grid-cols-1 gap-6">
          {/* <div className="bg-surface p-6 rounded-card border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
          <p className="text-t-secondary text-sm font-medium">Total Invested</p>
          <p className="text-2xl font-bold mt-1 text-t-primary">{formatINR(totalInvested)}</p>
          <div className="mt-4 flex items-center gap-1 text-t-placeholder text-xs">
            <MdOutlineInfo className="text-[14px]" />
            <span>Invested amount in current holdings</span>
          </div>
        </div> */}

          <div className="xl:col-span-4 bg-surface p-6 rounded-card border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <div className="flex justify-between items-center  gap-2 mb-4">
              <h3 className="font-inter font-bold text-t-primary">Portfolio Health</h3>
              <p className="text-2xl font-bold mt-1 text-t-primary">{healthScore}/100</p>
            </div>
            <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${healthScore > 70 ? 'bg-green-500' : healthScore > 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                style={{ width: `${healthScore}%` }}
              ></div>
            </div>
            <div className="mt-6 flex items-center gap-1 text-t-placeholder text-xs">
              <MdOutlineCallMade className="text-[14px]" />
              <span>Based on diversification, allocation and SIP consistency</span>
            </div>
          </div>
        </div>
      </div>

      {/* Asset Allocation + Goals */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 xl:col-span-8 bg-surface p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-inter font-bold text-t-primary">Asset Allocation</h3>
            <span className="text-[10px] uppercase tracking-widest text-t-secondary font-bold">
              Current Portfolio
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-8 md:gap-12">
            <div className="relative size-48 shrink-0 mx-auto md:mx-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryPieData}
                    dataKey="percent"
                    nameKey="label"
                    innerRadius={60}
                    outerRadius={88}
                    paddingAngle={2}
                    stroke="none"
                  >
                    {categoryPieData.map(item => (
                      <Cell key={item.key} fill={item.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(value, name, item) => [
                      `${Number(value).toFixed(2)}%`,
                      `${name} (${formatINR(item?.payload?.value || 0)})`,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">
                  Top Category
                </span>
                <span className="font-bold text-t-primary text-center px-3 leading-tight mt-1">
                  {topCategory ? topCategory.label : 'N/A'}
                </span>
                <span className="text-[11px] text-slate-500 font-semibold mt-1">
                  {topCategory ? `${topCategory.percent.toFixed(2)}%` : '0.00%'}
                </span>
              </div>
            </div>

            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {normalizedCategoryAllocation.map(item => (
                <div key={item.key} className="flex items-center gap-3">
                  <div className={`size-3 rounded-full ${item.colorClass}`}></div>
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-500">{item.label}</span>
                    <span className="text-sm font-bold text-t-primary">
                      {item.percent.toFixed(2)}% ({formatINR(item.value)})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Goals Card moved beside Asset Allocation */}
        <div className="col-span-12 xl:col-span-4 bg-surface p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-[11px] uppercase tracking-widest text-t-secondary font-bold m-0">
              FINANCIAL GOALS
            </p>
            {goalGaps.length > 0 && (
              <Link
                to="/profile#financial-goals-section"
                className="text-[11px] font-bold uppercase tracking-wider text-primary hover:underline no-underline"
              >
                View All
              </Link>
            )}
          </div>
          {goalGaps.length === 0 ? (
            <div className="text-center py-4 text-t-secondary text-sm flex-1 flex items-center justify-center">
              <Link
                to="/profile#financial-goals-section"
                className="text-primary font-bold hover:underline no-underline"
              >
                Set your first goal →
              </Link>
            </div>
          ) : (
            <div className="space-y-3 flex-1 flex flex-col">
              {topGoalGaps.map(goal => {
                const progress = getGoalProgressPercent(goal);
                const currentAmount =
                  goal.targetAmount > 0 ? (goal.targetAmount * progress) / 100 : 0;

                return (
                  <div
                    key={goal._id}
                    className={`p-3 rounded-lg flex flex-col justify-between border overflow-hidden ${goal.gapStatus === 'on_track' ? 'border-green-100' : 'border-red-100'}`}
                    style={{
                      background:
                        goal.gapStatus === 'on_track'
                          ? `linear-gradient(90deg, rgba(34, 197, 94, 0.20) ${progress}%, rgba(248, 250, 252, 0.96) ${progress}%)`
                          : `linear-gradient(90deg, rgba(239, 68, 68, 0.16) ${progress}%, rgba(254, 242, 242, 0.90) ${progress}%)`,
                    }}
                  >
                    <div className="flex justify-between items-start gap-3 mb-2">
                      <p className="text-[14px] font-bold text-t-primary leading-5 pr-1">
                        {goal.name}
                      </p>
                      <span
                        className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-tight whitespace-nowrap ${
                          goal.gapStatus === 'on_track'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {goal.gapStatus === 'on_track' ? 'On Track' : 'Behind Schedule'}
                      </span>
                    </div>
                    <div className="flex items-end justify-between gap-3 mb-2">
                      <div>
                        <p className="text-[12px] font-semibold text-t-primary m-0">
                          {formatINR(currentAmount)} / {formatINR(goal.targetAmount || 0)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[16px] leading-none font-black text-t-primary">
                          {progress.toFixed(0)}%
                        </p>
                      </div>
                    </div>
                    <p
                      className={`text-[11px] font-medium leading-5 ${goal.gapStatus === 'on_track' ? 'text-slate-600' : 'text-red-700'}`}
                    >
                      {goal.gapStatus === 'on_track'
                        ? `Can be completed till ${formatGoalDate(goal.targetDate)}`
                        : `Need ${formatINR(goal.extraSIPNeeded)}/month extra to close gap.`}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Stress Test + Silent Fee Cost Row */}
      <div className="grid grid-cols-12 gap-6">
        {/* STRESS TEST CARD */}
        <div className="col-span-12 lg:col-span-8 bg-surface p-6 rounded-xl border border-border shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <p className="text-[10px] uppercase tracking-widest text-t-secondary font-bold">
              PORTFOLIO STRESS TEST
            </p>
            <MdOutlineWarning className="text-amber-500 text-xl" />
          </div>
          {stressData && stressData.scenarios ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Moderate */}
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg">
                  <p className="text-[12px] font-bold text-amber-900 mb-2">
                    {(stressData.scenarios.moderate?.label || 'Moderate Correction') +
                      ` (-${Number(stressData.scenarios.moderate?.lossPct || 0).toFixed(2)}%)`}
                  </p>
                  <div className="flex items-end justify-between">
                    <div className="space-y-1">
                      <p className="text-[10px] text-amber-700 uppercase font-bold">
                        Projected Value
                      </p>
                      <p className="text-xl font-black text-amber-900">
                        {formatINR(stressData.scenarios.moderate?.portfolioValue || 0)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 line-through">
                        {formatINR(stressData.totalCurrentValue)}
                      </p>
                      <p className="text-xs font-bold text-red-500">
                        -{formatINR(stressData.scenarios.moderate?.estimatedLoss || 0)}
                      </p>
                    </div>
                  </div>
                </div>
                {/* Severe */}
                <div className="p-4 bg-orange-50 border border-orange-100 rounded-lg">
                  <p className="text-[12px] font-bold text-orange-900 mb-2">
                    {(stressData.scenarios.severe?.label || 'Severe Crash') +
                      ` (-${Number(stressData.scenarios.severe?.lossPct || 0).toFixed(2)}%)`}
                  </p>
                  <div className="flex items-end justify-between">
                    <div className="space-y-1">
                      <p className="text-[10px] text-orange-700 uppercase font-bold">
                        Projected Value
                      </p>
                      <p className="text-xl font-black text-orange-900">
                        {formatINR(stressData.scenarios.severe?.portfolioValue || 0)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 line-through">
                        {formatINR(stressData.totalCurrentValue)}
                      </p>
                      <p className="text-xs font-bold text-red-500">
                        -{formatINR(stressData.scenarios.severe?.estimatedLoss || 0)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <p className="mt-4 text-[10px] text-slate-400 italic">
                Disclaimer: These scenarios are based on historical index volatility and are not
                guaranteed projections of future returns.
              </p>
            </>
          ) : (
            <div className="text-center py-8 text-t-secondary text-sm">
              Add investments to see stress test analysis.
            </div>
          )}
        </div>

        {/* SILENT FEE COST CARD */}
        <div className="col-span-12 lg:col-span-4 bg-surface p-6 rounded-xl border border-border shadow-sm">
          <p className="text-[10px] uppercase tracking-widest text-t-secondary font-bold mb-4">
            SILENT FEE COST
          </p>
          {expenseInfo ? (
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center relative">
                  <MdOutlineTrendingDown className="text-slate-400 text-xl" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Annual Drain</p>
                  <p className="text-lg font-bold text-t-primary">
                    {formatINR(expenseInfo.annualExpenseCost)}
                  </p>
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                <p className="text-[10px] uppercase font-bold text-t-secondary mb-1">
                  10-Year Opportunity Cost
                </p>
                <p className="text-2xl font-black text-red-500">
                  {formatINR(expenseInfo.tenYearOpportunityCost)}
                </p>
                <p className="text-[10px] text-slate-400 mt-2">
                  Based on weighted average expense ratio of {expenseInfo.weightedExpenseRatio}%
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-t-secondary text-sm">
              No expense data available.
            </div>
          )}
        </div>
      </div>

      {/* Bottom Grid: Transactions */}
      <div className="grid grid-cols-12 gap-6">
        {/* RECENT TRANSACTIONS */}
        <div className="col-span-12 bg-surface rounded-xl border border-border shadow-sm overflow-hidden">
          {/* Heading and View All link */}
          <div className="p-6 border-b border-border flex justify-between items-center">
            <p className="text-[10px] uppercase tracking-widest text-t-secondary font-bold">
              RECENT TRANSACTIONS
            </p>
            <Link
              to="/transactions"
              className="text-[12px] font-bold text-primary hover:underline no-underline"
            >
              View All
            </Link>
          </div>
          {transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-t-placeholder">
              <MdOutlineShoppingCart className="text-4xl mb-2 opacity-50" />
              <span className="text-xs font-bold text-t-secondary">
                No transactions recorded yet.
              </span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-250">
                <thead className="bg-slate-50 border-b border-border">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-t-secondary uppercase">Date</th>
                    <th className="px-6 py-4 text-xs font-bold text-t-secondary uppercase">
                      Asset
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-t-secondary uppercase text-center">
                      Type
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-t-secondary uppercase text-right">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-t-secondary uppercase text-right">
                      Units / Nav
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-t-secondary uppercase text-right">
                      Profit / Loss
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {transactions.slice(0, 5).map(tx => {
                    const isSell = tx.type === 'sell';
                    const pnl = isSell ? Number(tx.profitLoss || 0) : null;
                    const isPositive = pnl >= 0;
                    const units = Number(tx.units || 0);
                    const nav = Number(tx.nav || 0);
                    const baseAmount = units * nav;
                    const pnlPct =
                      isSell && baseAmount > 0 ? ((pnl / baseAmount) * 100).toFixed(2) : 0;

                    let bgFlag = '';
                    let badgeColors = 'bg-slate-100 text-slate-800';
                    if (tx.type === 'buy') {
                      badgeColors = 'bg-green-100 text-green-800';
                      bgFlag = 'hover:bg-green-50/50';
                    }
                    if (tx.type === 'sell') {
                      badgeColors = 'bg-red-100 text-red-800';
                      bgFlag = 'hover:bg-red-50/50';
                    }
                    if (tx.type === 'sip') {
                      badgeColors = 'bg-blue-100 text-blue-800';
                      bgFlag = 'hover:bg-blue-50/50';
                    }
                    if (tx.type === 'redemption') {
                      badgeColors = 'bg-purple-100 text-purple-800';
                      bgFlag = 'hover:bg-purple-50/50';
                    }

                    return (
                      <tr
                        key={tx._id}
                        className={`transition-colors border-l-4 border-l-transparent ${bgFlag}`}
                      >
                        <td className="px-6 py-4 text-sm font-medium text-t-primary whitespace-nowrap">
                          {new Date(tx.date).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="px-6 py-4 max-w-62.5">
                          <button
                            onClick={() => navigate(`/fund/${tx.scheme_code}`)}
                            className="text-sm font-bold text-primary hover:text-primary-hover underline text-left truncate w-full tracking-tight bg-transparent border-none cursor-pointer"
                            title={tx.scheme_name}
                          >
                            {tx.scheme_name}
                          </button>
                          <p className="text-[10px] text-t-secondary mt-0.5">{tx.scheme_code}</p>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-md tracking-wider ${badgeColors}`}
                          >
                            {tx.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm font-bold text-t-primary">
                            {formatINR(tx.amount)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <p className="text-sm font-bold text-t-primary">{units.toFixed(2)}</p>
                          <p className="text-[10px] text-t-secondary">{`Rs ${nav.toFixed(4)}`}</p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {isSell ? (
                            <div
                              className={`flex flex-col items-end ${isPositive ? 'text-positive' : 'text-negative'}`}
                            >
                              <span className="text-sm font-bold">
                                {isPositive ? '+' : ''}
                                {formatINR(pnl)}
                              </span>
                              <span className="text-[10px] font-bold">
                                {isPositive ? '+' : ''}
                                {pnlPct}%
                              </span>
                            </div>
                          ) : (
                            <span className="text-t-placeholder font-bold text-sm">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      {/* SIP Adjust Amount Modal */}
      {sipModalOpen && editingSip && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={closeSipModal}
        >
          <div
            className="bg-surface rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-lg bg-indigo-50 flex items-center justify-center text-primary">
                  <MdOutlineEventRepeat className="text-lg" />
                </div>
                <div>
                  <h3 className="font-bold text-t-primary text-sm">Adjust SIP Amount</h3>
                  <p className="text-[10px] text-t-secondary truncate max-w-55">
                    {editingSip.fundName}
                  </p>
                </div>
              </div>
              <button
                onClick={closeSipModal}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-t-secondary hover:text-t-primary transition-colors border-none bg-transparent cursor-pointer"
              >
                <MdClose className="text-lg" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 space-y-4">
              {/* Current vs New */}
              <div className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3 border border-border">
                <div>
                  <p className="text-[10px] uppercase font-bold text-t-secondary tracking-widest mb-0.5">
                    Current Amount
                  </p>
                  <p className="text-lg font-black text-t-primary">
                    {formatINR(editingSip.monthlyAmount || editingSip.amount || 0)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase font-bold text-t-secondary tracking-widest mb-0.5">
                    Next Due
                  </p>
                  <p className="text-sm font-bold text-primary">
                    {new Date(editingSip.nextDueDate).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <label className="text-[10px] uppercase font-bold text-t-secondary tracking-widest block mb-2">
                  New Monthly Amount (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-t-secondary font-bold text-sm">
                    ₹
                  </span>
                  <input
                    ref={sipInputRef}
                    type="number"
                    step="any"
                    value={newAmount}
                    onChange={e => {
                      setNewAmount(e.target.value);
                      setSipSaveError('');
                    }}
                    onKeyDown={e => e.key === 'Enter' && handleSipAmountSave()}
                    placeholder="e.g. 5000"
                    className="w-full pl-8 pr-4 py-3 border border-border rounded-xl text-t-primary font-bold outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-white"
                  />
                </div>
                {sipSaveError && (
                  <p className="text-xs text-negative font-bold mt-2 flex items-center gap-1">
                    <MdOutlineWarning className="text-sm" /> {sipSaveError}
                  </p>
                )}
              </div>

              {/* Success Banner */}
              {sipSaveSuccess && (
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl">
                  <MdOutlineCheckCircle className="text-xl text-green-600 shrink-0" />
                  <p className="text-sm font-bold">SIP amount updated successfully!</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-border flex justify-end gap-3">
              <button
                onClick={closeSipModal}
                className="px-5 py-2 text-sm font-bold text-t-secondary hover:text-t-primary bg-transparent border-none cursor-pointer transition-colors"
                disabled={sipSaving}
              >
                Cancel
              </button>
              <button
                onClick={handleSipAmountSave}
                disabled={sipSaving || sipSaveSuccess}
                className="px-6 py-2 bg-primary text-t-inverse text-sm font-bold rounded-lg hover:bg-primary-hover transition-all border-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {sipSaving ? (
                  <>
                    <span className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />{' '}
                    Saving...
                  </>
                ) : sipSaveSuccess ? (
                  <>
                    <MdOutlineCheckCircle className="text-base" /> Saved!
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
