import React, { useState, useEffect, useContext, useCallback } from 'react';
import usePageTitle from '../utils/usePageTitle';
import Toast from '../components/Toast';
import { AuthContext } from '../context/auth-context';
import { compareISODate, isBlank, isValidISODate, toNumber, todayISO } from '../utils/validation';
import {
  MdOutlineFlag,
  MdOutlineAdd,
  MdOutlineDelete,
  MdOutlineEdit,
  MdOutlineSave,
  MdOutlineClose,
  MdOutlineCheckCircle,
  MdOutlineWarning,
  MdOutlineSchool,
  MdOutlineSecurity,
  MdRefresh,
} from 'react-icons/md';
import api from '../api/axios';
import { ProfileSkeleton } from '../components/PageSkeletons';

const gradeColors = {
  'A+': 'bg-green-500',
  A: 'bg-green-500',
  'A-': 'bg-green-500',
  'B+': 'bg-green-400',
  B: 'bg-yellow-500',
  'B-': 'bg-yellow-500',
  'C+': 'bg-amber-500',
  C: 'bg-amber-500',
  'C-': 'bg-amber-500',
  D: 'bg-orange-500',
  F: 'bg-red-500',
};

const Profile = () => {
  const { user } = useContext(AuthContext);

  const [toast, setToast] = useState('');
  const [goals, setGoals] = useState([]);
  const [portfolio, setPortfolio] = useState({
    totalCurrentValue: 0,
    totalProfitLoss: 0,
    totalInvested: 0,
  });
  const [reportCard, setReportCard] = useState(null);
  const [taxData, setTaxData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [goalModal, setGoalModal] = useState({ isOpen: false, mode: 'Add', data: null });
  const [goalFormData, setGoalFormData] = useState({
    name: '',
    targetAmount: '',
    targetDate: '',
  });
  const [goalErrors, setGoalErrors] = useState({});
  const [goalSaving, setGoalSaving] = useState(false);

  const showToast = msg => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  const formatCur = val =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(Number(val || 0));

  const formatMth = dateStr =>
    new Date(dateStr).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });

  const formatGoalDate = dateStr =>
    new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  const getGoalFundedAmount = goal =>
    Math.min(
      goal.targetAmount || 0,
      (goal.targetAmount || 0) * ((goal.progressPercent || 0) / 100)
    );

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [goalsRes, portRes, rcRes, taxRes] = await Promise.all([
        api.get('/api/portfolio/goal-gaps').catch(() => ({ data: { data: [] } })),
        api.get('/api/portfolio/summary'),
        api.get('/api/portfolio/report-card').catch(() => ({ data: { data: null } })),
        api.get('/api/portfolio/tax-analysis').catch(() => ({ data: { data: null } })),
      ]);

      const goalsPayload = goalsRes.data?.success ? goalsRes.data.data : goalsRes.data;
      const portPayload = portRes.data?.data?.financials || portRes.data?.data || portRes.data;

      setGoals(Array.isArray(goalsPayload) ? goalsPayload : []);
      setPortfolio({
        totalCurrentValue: portPayload.netWorth || portPayload.totalCurrentValue || 0,
        totalProfitLoss: portPayload.totalProfitLoss || 0,
        totalInvested: portPayload.totalInvested || 0,
      });

      const rcPayload = rcRes.data?.data || (rcRes.data?.success ? rcRes.data.data : null);
      setReportCard(rcPayload);

      const tPayload = taxRes.data?.data || (taxRes.data?.success ? taxRes.data.data : null);
      setTaxData(tPayload?.taxInfo || null);
    } catch (error) {
      console.error(error);
      showToast('Unable to load profile data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  usePageTitle('Profile');

  const openGoalModal = (mode, data = null) => {
    setGoalModal({ isOpen: true, mode, data });
    setGoalErrors({});
    if (data) {
      setGoalFormData({
        name: data.name || '',
        targetAmount: String(data.targetAmount || ''),
        targetDate: data.targetDate ? new Date(data.targetDate).toISOString().split('T')[0] : '',
      });
    } else {
      setGoalFormData({ name: '', targetAmount: '', targetDate: '' });
    }
  };

  const handleGoalSubmit = async e => {
    e.preventDefault();

    const nextErrors = {};
    if (isBlank(goalFormData.name)) {
      nextErrors.name = 'Goal name is required';
    }

    const amount = toNumber(goalFormData.targetAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      nextErrors.targetAmount = 'Target amount must be greater than 0';
    }

    if (!isValidISODate(goalFormData.targetDate)) {
      nextErrors.targetDate = 'Please select a valid target date';
    } else if (compareISODate(goalFormData.targetDate, todayISO()) < 0) {
      nextErrors.targetDate = 'Target date cannot be in the past';
    }

    if (Object.keys(nextErrors).length > 0) {
      setGoalErrors(nextErrors);
      return;
    }

    setGoalErrors({});
    setGoalSaving(true);
    try {
      const payload = {
        name: goalFormData.name.trim(),
        targetAmount: amount,
        targetDate: new Date(goalFormData.targetDate).toISOString(),
      };

      if (goalModal.mode === 'Add') {
        await api.post('/api/goals', payload);
        showToast('Goal created!');
      } else {
        await api.put(`/api/goals/${goalModal.data._id}`, payload);
        showToast('Goal updated!');
      }

      setGoalModal({ isOpen: false, mode: 'Add', data: null });
      fetchDashboardData();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to save goal.');
    } finally {
      setGoalSaving(false);
    }
  };

  const handleGoalDelete = async id => {
    if (!window.confirm('Delete this goal permanently?')) return;
    try {
      await api.delete(`/api/goals/${id}`);
      showToast('Goal deleted.');
      fetchDashboardData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete goal.');
    }
  };

  if (loading) return <ProfileSkeleton />;

  const taxLimit = 100000;
  const taxableProfit = Math.max(0, portfolio.totalProfitLoss - taxLimit);
  const estimatedTax = taxableProfit * 0.1;
  const noTax = portfolio.totalProfitLoss <= 0;
  const underLimit = portfolio.totalProfitLoss > 0 && portfolio.totalProfitLoss <= taxLimit;

  const goalList =
    goals.length === 0 ? (
      <div className="border border-dashed border-border rounded-xl p-12 flex flex-col items-center justify-center text-t-placeholder bg-slate-50/50">
        <MdOutlineFlag className="text-5xl mb-3 opacity-50" />
        <p className="text-t-secondary font-medium text-sm">
          No active goals. Add one to track progress!
        </p>
      </div>
    ) : (
      goals.map(goal => {
        const fundedAmount = getGoalFundedAmount(goal);
        const isOnTrack = goal.gapStatus === 'on_track';

        return (
          <div
            key={goal._id}
            className="border border-border rounded-xl overflow-hidden hover:border-slate-300 transition-colors bg-white shadow-sm relative"
          >
            <div className="w-full h-1 bg-slate-100">
              <div
                className="h-full bg-primary transition-all duration-1000"
                style={{ width: `${Math.min(100, goal.progressPercent || 0)}%` }}
              />
            </div>

            {goal.gapStatus && (
              <div
                className={`px-4 py-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-wider ${
                  isOnTrack
                    ? 'bg-green-50 border-b border-green-100 text-green-800'
                    : 'bg-red-50 border-b border-red-100 text-red-800'
                }`}
              >
                {isOnTrack ? (
                  <>
                    <MdOutlineCheckCircle className="text-green-600" /> Can be completed till{' '}
                    {formatGoalDate(goal.targetDate)}
                  </>
                ) : (
                  <>
                    <MdOutlineWarning className="text-red-600" /> Behind Schedule - Need{' '}
                    {formatCur(goal.extraSIPNeeded)}/month more
                  </>
                )}
              </div>
            )}

            <div className="p-5 flex flex-col md:flex-row gap-6">
              <div className="flex-1 space-y-4 pt-1">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h4 className="text-lg font-black text-t-primary">{goal.name}</h4>
                    <p className="text-xs font-bold uppercase tracking-wider text-t-secondary mt-1">
                      {isOnTrack
                        ? `Target: ${formatGoalDate(goal.targetDate)}`
                        : `Target: ${formatMth(goal.targetDate)}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <h4 className="text-lg font-black text-primary">
                      {formatCur(goal.targetAmount)}
                    </h4>
                    <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold uppercase rounded-md">
                      {(goal.progressPercent || 0).toFixed(1)}% Funded
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-50 flex flex-wrap gap-4 text-xs font-medium text-t-secondary">
                  <p>
                    Allocated:{' '}
                    <span className="font-bold text-t-primary">{formatCur(fundedAmount)}</span>
                  </p>
                  <p className="hidden md:block text-slate-200">|</p>
                  <p>
                    Timeline:{' '}
                    <span className="font-bold text-t-primary">
                      {goal.monthsRemaining || '-'} months
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex md:flex-col gap-2 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 justify-center">
                <button
                  onClick={() => openGoalModal('Edit', goal)}
                  className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-primary hover:text-white text-t-primary rounded border border-slate-200 hover:border-primary transition-colors text-xs font-bold cursor-pointer"
                >
                  <MdOutlineEdit /> Edit
                </button>
                <button
                  onClick={() => handleGoalDelete(goal._id)}
                  className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-red-50 hover:text-red-600 text-t-primary rounded border border-slate-200 transition-colors text-xs font-bold cursor-pointer"
                >
                  <MdOutlineDelete /> Delete
                </button>
              </div>
            </div>
          </div>
        );
      })
    );

  return (
    <div className="flex-1 p-4 md:p-8 space-y-8 max-w-350 mx-auto w-full pb-24">
      <Toast message={toast} />

      <div className="flex justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-t-primary">
            My Profile
          </h1>
          <p className="text-t-secondary text-sm mt-1">
            Manage profile, track goals, and view tax and portfolio health
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-hover bg-transparent border-none cursor-pointer"
        >
          <MdRefresh /> Refresh Data
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1 space-y-8">
          <section className="bg-surface rounded-xl shadow-sm border border-border p-6 relative overflow-hidden">
            <div className="flex items-center gap-4 mb-6 border-b border-border pb-6">
              <div className="w-14 h-14 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xl font-black">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-t-primary tracking-tight">
                  {user?.name}
                </h3>
                <p className="text-sm text-t-secondary">{user?.email}</p>
                <p className="text-[10px] uppercase tracking-widest text-t-placeholder mt-1 font-black">
                  {user?.riskPreference || 'Moderate'} Investor
                </p>
              </div>
            </div>
          </section>

          <section className="bg-surface rounded-xl shadow-sm border border-border p-6">
            <h3 className="text-base font-bold text-t-primary mb-1 flex items-center gap-2">
              <MdOutlineSecurity className="text-indigo-600" /> Tax Estimator
            </h3>
            <p className="text-[10px] text-t-secondary mb-5 font-bold uppercase tracking-wider">
              Budget 2024 Standards
            </p>

            {taxData ? (
              <div className="space-y-4">
                <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-xl text-center">
                  <p className="text-[10px] font-black text-indigo-700 uppercase tracking-widest mb-1">
                    Total Estimated Tax
                  </p>
                  <p className="text-2xl font-black text-indigo-900">
                    {formatCur(taxData.totalTax)}
                  </p>
                </div>

                <div className="space-y-2.5 px-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-t-secondary">Equity LTCG (12.5%)</span>
                    <span className="font-black text-t-primary">
                      {formatCur(taxData.estimatedLTCGTax)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-t-secondary">Equity STCG (20%)</span>
                    <span className="font-black text-t-primary">
                      {formatCur(taxData.estimatedSTCGTax)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-t-secondary">Debt / Slab Rate</span>
                    <span className="font-black text-t-primary">
                      {formatCur(taxData.estimatedDebtTax)}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-border mt-2">
                  <div className="flex items-center gap-2 mb-1.5">
                    <MdOutlineCheckCircle className="text-green-500 text-sm" />
                    <span className="text-[10px] font-black text-green-700 uppercase tracking-wider">
                      Exemption Applied
                    </span>
                  </div>
                  <p className="text-xs text-t-secondary leading-relaxed">
                    First <strong>{formatCur(taxData.ltcgExemption)}</strong> of annual Equity LTCG
                    is tax-free.
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-xs text-t-placeholder font-bold italic">No tax data available</p>
              </div>
            )}
          </section>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div
            id="financial-goals-section"
            className="bg-surface rounded-xl shadow-sm border border-border p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-t-primary flex items-center gap-2">
                <MdOutlineFlag className="text-primary" /> Financial Goals
              </h3>
              <button
                onClick={() => openGoalModal('Add')}
                className="flex items-center gap-1.5 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-black transition-colors border-none cursor-pointer"
              >
                <MdOutlineAdd /> Add Goal
              </button>
            </div>

            <div className="space-y-4">{goalList}</div>
          </div>

          {/* {reportCard && (
            <div className="bg-surface rounded-xl shadow-sm border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-t-primary flex items-center gap-2">
                  <MdOutlineSchool className="text-primary" /> Portfolio Report Card
                </h3>
                <div
                  className={`px-4 py-2 rounded-lg text-white font-black text-xl ${gradeColors[reportCard.overallGrade] || 'bg-slate-500'}`}
                >
                  {reportCard.overallGrade}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {reportCard.categories?.map((cat, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-50 rounded-xl border border-slate-100 p-4 text-center hover:shadow-sm transition-shadow"
                  >
                    <div
                      className={`w-10 h-10 mx-auto rounded-full ${gradeColors[cat.grade] || 'bg-slate-400'} text-white flex items-center justify-center font-black text-sm mb-3`}
                    >
                      {cat.grade}
                    </div>
                    <p className="text-xs font-bold text-t-primary mb-1 capitalize">{cat.name}</p>
                    <p className="text-[10px] text-t-secondary leading-relaxed">
                      {cat.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )} */}
        </div>
      </div>

      {goalModal.isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-110 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setGoalModal({ ...goalModal, isOpen: false })}
        >
          <div
            className="bg-surface rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <form onSubmit={handleGoalSubmit} noValidate>
              <div className="p-6 border-b border-border flex justify-between items-center">
                <h3 className="text-lg font-bold text-t-primary">
                  {goalModal.mode} Financial Goal
                </h3>
                <button
                  type="button"
                  onClick={() => setGoalModal({ ...goalModal, isOpen: false })}
                  className="text-t-secondary hover:text-t-primary border-none bg-transparent cursor-pointer"
                >
                  <MdOutlineClose size={24} />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-t-secondary uppercase tracking-widest">
                    Goal Name
                  </label>
                  <input
                    type="text"
                    value={goalFormData.name}
                    onChange={e => {
                      setGoalFormData({ ...goalFormData, name: e.target.value });
                      setGoalErrors(prev => ({ ...prev, name: '' }));
                    }}
                    placeholder="e.g. Dream House, Retirement"
                    className={`w-full bg-slate-50 border rounded-lg px-4 py-2.5 outline-none focus:ring-1 ${goalErrors.name ? 'border-negative focus:border-negative focus:ring-negative' : 'border-border focus:border-primary focus:ring-primary'}`}
                  />
                  {goalErrors.name && (
                    <p className="text-[10px] text-negative font-bold mt-1">{goalErrors.name}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-t-secondary uppercase tracking-widest">
                    Target Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={goalFormData.targetAmount}
                    onChange={e => {
                      setGoalFormData({ ...goalFormData, targetAmount: e.target.value });
                      setGoalErrors(prev => ({ ...prev, targetAmount: '' }));
                    }}
                    className={`w-full bg-slate-50 border rounded-lg px-4 py-2.5 outline-none ${goalErrors.targetAmount ? 'border-negative focus:border-negative focus:ring-1 focus:ring-negative' : 'border-border focus:border-primary focus:ring-1 focus:ring-primary'}`}
                  />
                  {goalErrors.targetAmount && (
                    <p className="text-[10px] text-negative font-bold mt-1">
                      {goalErrors.targetAmount}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-t-secondary uppercase tracking-widest">
                    Target Date
                  </label>
                  <input
                    type="date"
                    value={goalFormData.targetDate}
                    onChange={e => {
                      setGoalFormData({ ...goalFormData, targetDate: e.target.value });
                      setGoalErrors(prev => ({ ...prev, targetDate: '' }));
                    }}
                    className={`w-full bg-slate-50 border rounded-lg px-4 py-2.5 outline-none custom-date ${goalErrors.targetDate ? 'border-negative focus:border-negative focus:ring-1 focus:ring-negative' : 'border-border focus:border-primary focus:ring-1 focus:ring-primary'}`}
                  />
                  {goalErrors.targetDate && (
                    <p className="text-[10px] text-negative font-bold mt-1">
                      {goalErrors.targetDate}
                    </p>
                  )}
                </div>
              </div>

              <div className="p-6 border-t border-border bg-slate-50 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setGoalModal({ ...goalModal, isOpen: false })}
                  className="px-5 py-2 text-sm font-bold text-t-secondary bg-transparent border-none cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  disabled={goalSaving}
                  className="bg-primary text-t-inverse px-6 py-2 rounded-lg text-sm font-bold hover:bg-primary-hover disabled:opacity-50 border-none cursor-pointer shadow-sm transition-all"
                >
                  {goalSaving ? 'Saving...' : `${goalModal.mode} Goal`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
