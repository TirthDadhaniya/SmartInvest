import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import usePageTitle from '../utils/usePageTitle';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  MdOutlineSearch,
  MdOutlineCalendarToday,
  MdOutlineTrendingUp,
  MdOutlineClose,
  MdOutlineCheckCircle,
  MdPlayArrow,
  MdPause,
  MdStop,
  MdDelete,
  MdOutlineRocketLaunch,
  MdRefresh,
  MdOutlinePayments,
  MdOutlineWarning,
} from 'react-icons/md';
import api from '../api/axios';
import { PortfolioContext } from '../context/portfolio-context';
import FundSearch from '../components/FundSearch';
import { formatINR, formatNAV, formatUnits } from '../utils/formatters';
import { calculateSIPFutureValue } from '../utils/calculations';
import { compareISODate, isValidISODate, toNumber, todayISO } from '../utils/validation';
import Toast from '../components/Toast';
import { ManageFundsSkeleton } from '../components/PageSkeletons';

const toISODateLocal = value => {
  if (!value) return '';
  const dt = new Date(value);
  const local = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000);
  return local.toISOString().split('T')[0];
};

const shiftISODateByDays = (isoDate, days) => {
  const [y, m, d] = (isoDate || '').split('-').map(Number);
  if (!y || !m || !d) return isoDate;
  const dateObj = new Date(y, m - 1, d);
  dateObj.setDate(dateObj.getDate() + days);
  return toISODateLocal(dateObj);
};

const fetchNAVOnOrBeforeDate = async (schemeCode, targetISODate, fallbackNAV) => {
  if (!schemeCode || !targetISODate) {
    return { nav: fallbackNAV || 0, exactDate: 'Current' };
  }

  const startDate = shiftISODateByDays(targetISODate, -45);
  const rangeUrl = `https://api.mfapi.in/mf/${schemeCode}?startDate=${startDate}&endDate=${targetISODate}`;

  try {
    const rangeRes = await fetch(rangeUrl);
    const rangeData = await rangeRes.json();
    if (Array.isArray(rangeData?.data) && rangeData.data.length > 0) {
      return {
        nav: parseFloat(rangeData.data[0].nav),
        exactDate: rangeData.data[0].date,
      };
    }
  } catch {
    // Fall through to full-history lookup.
  }

  try {
    const fullRes = await fetch(`https://api.mfapi.in/mf/${schemeCode}`);
    const fullData = await fullRes.json();
    if (Array.isArray(fullData?.data) && fullData.data.length > 0) {
      const [targetY, targetM, targetD] = targetISODate.split('-').map(Number);
      const targetDate = new Date(targetY, targetM - 1, targetD);

      for (let i = 0; i < fullData.data.length; i++) {
        const [d, m, y] = fullData.data[i].date.split('-').map(Number);
        const histDate = new Date(y, m - 1, d);
        if (histDate <= targetDate) {
          return {
            nav: parseFloat(fullData.data[i].nav),
            exactDate: fullData.data[i].date,
          };
        }
      }
    }
  } catch {
    // Use fallback NAV.
  }

  return { nav: fallbackNAV || 0, exactDate: 'Current' };
};

const resolveAmountAndUnits = (mode, rawInput, nav) => {
  const value = parseFloat(rawInput) || 0;
  const safeNav = Number(nav) || 0;

  if (mode === 'Units') {
    const units = value;
    const amount = units * safeNav;
    return { amount, units };
  }

  const amount = value;
  const units = safeNav > 0 ? amount / safeNav : 0;
  return { amount, units };
};

// --- Shared Modal Wrapper ---
const ModalWrapper = ({ children, onClose }) => {
  useEffect(() => {
    const handleEsc = e => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);
  return (
    <div
      className="fixed inset-0 bg-black/50 z-100 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-xl flex flex-col w-full max-w-md overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

// Toast is imported from shared component

const useFundHistory = (fund, setFund) => {
  const minDate = useMemo(() => {
    if (!fund?.history || fund.history.length === 0) {
      return '';
    }

    const oldest = fund.history[fund.history.length - 1].date;
    const [d, m, y] = oldest.split('-');
    return `${y}-${m}-${d}`;
  }, [fund?.history]);

  useEffect(() => {
    if (!fund?.scheme_code && !fund?.schemeCode) {
      return;
    }

    if (fund.history && fund.history.length > 0) {
      return;
    }

    let isMounted = true;
    const schemeCode = fund.scheme_code || fund.schemeCode;
    fetch(`https://api.mfapi.in/mf/${schemeCode}`)
      .then(r => r.json())
      .then(data => {
        if (!isMounted) return;
        if (data.data && data.data.length > 0) {
          if (setFund) {
            setFund(prev => ({ ...prev, history: data.data }));
          }
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [fund?.scheme_code, fund?.schemeCode, fund?.history, setFund]);

  return minDate;
};

// --- Sell Modal ---
const SellModal = ({ item, onClose, onSuccess }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [mode, setMode] = useState('Amount');
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [navInfo, setNavInfo] = useState({
    nav: item.currentNAV,
    exactDate: 'Current',
  });
  const [fetchingNav, setFetchingNav] = useState(true);
  const minDate = useFundHistory(item, null);

  useEffect(() => {
    let isMounted = true;

    const loadNavForDate = async () => {
      setFetchingNav(true);
      const resolved = await fetchNAVOnOrBeforeDate(item.schemeCode, date, item.currentNAV);
      if (isMounted) {
        setNavInfo(resolved);
        setFetchingNav(false);
      }
    };

    loadNavForDate();

    return () => {
      isMounted = false;
    };
  }, [item.schemeCode, item.currentNAV, date]);

  const availableUnits = item.units;
  const navValue = Number(navInfo.nav || 0);
  const totalValue = availableUnits * navValue;

  let sellAmount = 0,
    sellUnits = 0;
  if (inputValue) {
    const val = parseFloat(inputValue);
    if (!isNaN(val)) {
      if (mode === 'Amount') {
        sellAmount = val;
        sellUnits = navValue > 0 ? val / navValue : 0;
      } else {
        sellUnits = val;
        sellAmount = val * navValue;
      }
    }
  }
  if (sellUnits > availableUnits) {
    sellUnits = availableUnits;
    sellAmount = totalValue;
  }

  const handleConfirm = async () => {
    if (sellUnits <= 0) return;
    setLoading(true);
    try {
      await api.post(`/api/investments/${item._id}/sell`, {
        unitsToSell: sellUnits,
        currentNAV: navValue,
        sellDate: new Date(`${date}T12:00:00`).toISOString(),
      });
      onSuccess('Redemption completed successfully');
    } catch {
      alert('Failed to sell');
    } finally {
      setLoading(false);
    }
  };

  // Tax warning
  const estProfit = sellUnits * (navValue - item.purchaseNAV);
  const estTax = estProfit > 0 ? Math.max(0, estProfit - 100000) * 0.1 : 0;

  return (
    <ModalWrapper onClose={onClose}>
      <div className="p-6 border-b border-border flex justify-between items-center">
        <div>
          <h3 className="font-bold text-lg text-t-primary">Sell / Redeem</h3>
          <p className="text-[11px] font-bold text-t-secondary truncate w-full">
            {item.fundName || item.scheme_name}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-t-secondary hover:text-negative cursor-pointer border-none bg-transparent"
        >
          <MdOutlineClose className="text-xl" />
        </button>
      </div>
      <div className="p-6 space-y-5">
        <div className="flex gap-4">
          <div className="flex-1 bg-slate-50 border border-slate-100 rounded-lg p-3 text-center">
            <span className="text-[10px] uppercase font-bold text-t-secondary tracking-widest">
              Available Units
            </span>
            <span className="block font-black text-t-primary text-sm mt-1">
              {formatUnits(availableUnits)}
            </span>
          </div>
          <div className="flex-1 bg-slate-50 border border-slate-100 rounded-lg p-3 text-center">
            <span className="text-[10px] uppercase font-bold text-t-secondary tracking-widest">
              Max Value
            </span>
            <span className="block font-black text-primary text-sm mt-1">
              {fetchingNav ? 'Loading...' : formatINR(totalValue)}
            </span>
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-t-secondary uppercase mb-1 block">
            Sell Date
          </label>
          <input
            type="date"
            value={date}
            min={minDate}
            max={new Date().toISOString().split('T')[0]}
            onChange={e => setDate(e.target.value)}
            className="styled-date w-full bg-surface border border-border rounded-lg px-4 py-2.5 outline-none focus:border-negative focus:ring-1 focus:ring-negative transition-all"
          />
        </div>
        <div className="bg-red-50/60 border border-red-100 rounded-lg p-3 text-sm flex justify-between">
          <span className="text-red-800/80">
            NAV on {navInfo.exactDate === 'Current' ? 'selected date' : navInfo.exactDate}:
          </span>
          <span className="font-black text-red-900">
            {fetchingNav ? 'Loading...' : formatNAV(navValue)}
          </span>
        </div>
        {/* Tax Impact Warning */}
        {estProfit > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
            <p className="font-bold mb-1">⚠️ Tax Impact Before You Sell</p>
            <p>
              You will owe approximately <strong>{formatINR(estTax)}</strong> in LTCG tax on this
              redemption.
            </p>
          </div>
        )}
        <div className="flex bg-slate-100 p-1 rounded-lg">
          {['Amount', 'Units'].map(m => (
            <button
              key={m}
              className={`flex-1 py-2 text-sm font-bold rounded cursor-pointer border-none transition-all ${mode === m ? 'bg-surface text-negative shadow-sm' : 'text-t-secondary bg-transparent'}`}
              onClick={() => {
                setMode(m);
                setInputValue('');
              }}
            >
              By {m}
            </button>
          ))}
        </div>
        <div>
          <label className="text-xs font-bold text-t-secondary uppercase mb-1 block">
            Enter {mode} to Sell
          </label>
          <input
            type="number"
            min="0"
            step="any"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 outline-none focus:border-negative focus:ring-1 focus:ring-negative transition-all"
          />
        </div>
        <div className="flex justify-between items-center bg-red-50 text-sm px-4 py-3 rounded-lg border border-red-100">
          <span className="text-red-800 font-bold">Payout:</span>
          <span className="font-black text-negative text-base">{formatINR(sellAmount)}</span>
        </div>
      </div>
      <div className="p-6 border-t border-border bg-slate-50 flex justify-end gap-3">
        <button
          onClick={onClose}
          disabled={loading}
          className="px-5 py-2 text-sm font-bold text-t-secondary border-none bg-transparent cursor-pointer"
        >
          Cancel
        </button>
        <button
          disabled={sellUnits <= 0 || loading || fetchingNav}
          onClick={handleConfirm}
          className="px-5 py-2 text-sm font-bold bg-negative text-t-inverse rounded-lg hover:bg-red-600 disabled:opacity-50 border-none cursor-pointer transition-all shadow-sm"
        >
          {loading ? 'Processing...' : 'Confirm Sell'}
        </button>
      </div>
    </ModalWrapper>
  );
};

// --- Buy More Modal ---
const BuyModal = ({ item, onClose, onSuccess }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [mode, setMode] = useState('Amount');
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [navInfo, setNavInfo] = useState({
    nav: item.currentNAV,
    exactDate: 'Current',
  });
  const [fetchingNav, setFetchingNav] = useState(true);
  const minDate = useFundHistory(item, null);

  useEffect(() => {
    let isMounted = true;

    const loadNavForDate = async () => {
      setFetchingNav(true);
      const resolved = await fetchNAVOnOrBeforeDate(item.schemeCode, date, item.currentNAV);
      if (isMounted) {
        setNavInfo(resolved);
        setFetchingNav(false);
      }
    };

    loadNavForDate();

    return () => {
      isMounted = false;
    };
  }, [item.schemeCode, item.currentNAV, date]);

  const navValue = navInfo.nav;

  const { amount: calcAmount, units: calcUnits } = resolveAmountAndUnits(
    mode,
    inputValue,
    navValue
  );

  const handleConfirm = async () => {
    const { amount, units } = resolveAmountAndUnits(mode, inputValue, navValue);
    if (amount <= 0 || units <= 0) return;
    setLoading(true);
    try {
      await api.post('/api/investments', {
        scheme_code: parseInt(item.schemeCode || item.scheme_code),
        scheme_name: item.fundName || item.scheme_name,
        fund_house: item.fundHouse || item.fund_house || 'AMC',
        scheme_category: item.schemeCategory || item.scheme_category || 'Mutual Fund',
        scheme_type: 'Open Ended',
        investedAmount: amount,
        units: units,
        purchaseNAV: navValue,
        purchaseDate: new Date(`${date}T12:00:00`).toISOString(),
        type: 'lumpsum',
      });
      onSuccess('Investment added successfully!');
    } catch {
      alert('Failed to buy');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalWrapper onClose={onClose}>
      <div className="p-6 border-b border-border flex justify-between items-center">
        <div>
          <h3 className="font-bold text-lg text-t-primary">Buy More Units</h3>
          <p className="text-[11px] font-bold text-t-secondary truncate max-w-65">
            {item.fundName || item.scheme_name}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-t-secondary hover:text-t-primary cursor-pointer border-none bg-transparent"
        >
          <MdOutlineClose className="text-xl" />
        </button>
      </div>
      <div className="p-6 space-y-5">
        <div>
          <label className="text-xs font-bold text-t-secondary uppercase mb-1 block">
            Purchase Date
          </label>
          <input
            type="date"
            value={date}
            min={minDate}
            max={new Date().toISOString().split('T')[0]}
            onChange={e => setDate(e.target.value)}
            className="styled-date w-full bg-surface border border-border rounded-lg px-4 py-2.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
        </div>
        <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3 text-sm flex justify-between">
          <span className="text-blue-800/80">
            NAV on {navInfo.exactDate === 'Current' ? 'selected date' : navInfo.exactDate}:
          </span>
          <span className="font-black text-blue-900">
            {fetchingNav ? 'Loading...' : formatNAV(navValue)}
          </span>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg">
          {['Amount', 'Units'].map(m => (
            <button
              key={m}
              className={`flex-1 py-2 text-sm font-bold rounded cursor-pointer border-none transition-all ${mode === m ? 'bg-surface text-primary shadow-sm' : 'text-t-secondary bg-transparent'}`}
              onClick={() => {
                setMode(m);
                setInputValue('');
              }}
            >
              By {m}
            </button>
          ))}
        </div>
        <div>
          <label className="text-xs font-bold text-t-secondary uppercase mb-1 block">
            Enter {mode}
          </label>
          <input
            type="number"
            min="0"
            step="any"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            placeholder={`e.g. ${mode === 'Amount' ? '10000' : '50.5'}`}
          />
        </div>
        <div className="flex justify-between items-center text-sm pt-2">
          <span className="text-t-secondary">Will yield:</span>
          <span className="font-black text-primary text-base">
            {mode === 'Amount' ? formatUnits(calcUnits) : formatINR(calcAmount)}
          </span>
        </div>
      </div>
      <div className="p-6 border-t border-border bg-slate-50 flex justify-end gap-3">
        <button
          onClick={onClose}
          disabled={loading}
          className="px-5 py-2 text-sm font-bold text-t-secondary border-none bg-transparent cursor-pointer"
        >
          Cancel
        </button>
        <button
          disabled={calcAmount <= 0 || loading || fetchingNav}
          onClick={handleConfirm}
          className="px-5 py-2 text-sm font-bold bg-primary text-t-inverse rounded-lg hover:bg-primary-hover disabled:opacity-50 border-none cursor-pointer transition-all shadow-sm"
        >
          {loading ? 'Processing...' : 'Confirm Buy'}
        </button>
      </div>
    </ModalWrapper>
  );
};

// --- Delete SIP Modal ---
const DeleteSipModal = ({ onClose, onConfirm }) => {
  return (
    <ModalWrapper onClose={onClose}>
      <div className="p-6 border-b border-border flex justify-between items-center">
        <h3 className="font-bold text-lg text-t-primary">Delete SIP</h3>
        <button
          onClick={onClose}
          className="text-t-secondary hover:text-negative cursor-pointer border-none bg-transparent"
        >
          <MdOutlineClose className="text-xl" />
        </button>
      </div>
      <div className="p-6">
        <div className="flex items-center gap-4 text-amber-600 mb-4 bg-amber-50 p-4 rounded-lg border border-amber-100">
          <MdOutlineWarning className="text-3xl shrink-0" />
          <p className="text-sm font-bold">
            Are you sure you want to delete this SIP? This action cannot be undone and will stop
            future automated tracking for this fund.
          </p>
        </div>
      </div>
      <div className="p-6 border-t border-border bg-slate-50 flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-5 py-2 text-sm font-bold text-t-secondary border-none bg-transparent cursor-pointer"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-6 py-2 bg-negative text-t-inverse text-sm font-bold rounded-lg hover:bg-red-600 transition-all border-none cursor-pointer shadow-sm"
        >
          Confirm Delete
        </button>
      </div>
    </ModalWrapper>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
const ManageFunds = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { fetchPortfolio } = useContext(PortfolioContext);

  const queryParams = new URLSearchParams(location.search);
  const initialSip = queryParams.get('sip') === 'true';
  const paramSchemeCode = queryParams.get('schemeCode');

  const [activeTab, setActiveTab] = useState(initialSip ? 'SIPs' : 'Investments');
  const [holdings, setHoldings] = useState([]);
  const [sips, setSips] = useState([]);
  const [loadingTable, setLoadingTable] = useState(true);

  const [buyModalItem, setBuyModalItem] = useState(null);
  const [sellModalItem, setSellModalItem] = useState(null);
  const [deleteSipId, setDeleteSipId] = useState(null);
  const [toast, setToast] = useState('');

  // SIP Payment
  const [sipPaymentLoading, setSipPaymentLoading] = useState(null); // ID of SIP being paid

  // Add Investment form state
  const [invSelectedFund, setInvSelectedFund] = useState(null);
  const [invDate, setInvDate] = useState(new Date().toISOString().split('T')[0]);
  const [invMode, setInvMode] = useState('Amount');
  const [invInput, setInvInput] = useState('');
  const [invSubmitting, setInvSubmitting] = useState(false);
  const [invNavLoading, setInvNavLoading] = useState(false);
  const [invNavInfo, setInvNavInfo] = useState({ nav: 0, exactDate: 'Current' });
  const [invErrors, setInvErrors] = useState({});

  // Add SIP form state
  const [sipFund, setSipFund] = useState(null);
  const [sipAmount, setSipAmount] = useState(0);
  const [sipStartDate, setSipStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [sipRate, setSipRate] = useState(12);
  const [sipDuration, setSipDuration] = useState(0);
  const [sipErrors, setSipErrors] = useState({});
  const [sipSubmitting, setSipSubmitting] = useState(false);

  const invMinDate = useFundHistory(invSelectedFund, setInvSelectedFund);
  const sipMinDate = useFundHistory(sipFund, setSipFund);

  // Auto-calculate expected return rate based on 3Y historical CAGR when a fund is selected
  useEffect(() => {
    if (sipFund && sipFund.history && sipFund.history.length > 0) {
      const history = sipFund.history;
      const currentNAV = parseFloat(history[0].nav);

      const findNavDaysAgo = days => {
        const targetDateObj = new Date();
        targetDateObj.setDate(targetDateObj.getDate() - days);
        for (let i = 0; i < history.length; i++) {
          const [d, m, y] = history[i].date.split('-');
          if (new Date(`${y}-${m}-${d}`) <= targetDateObj) return parseFloat(history[i].nav);
        }
        return null;
      };

      const r3 = findNavDaysAgo(1095);
      const r1 = findNavDaysAgo(365);

      let computedRate = 12; // default
      if (r3) {
        computedRate = (Math.pow(currentNAV / r3, 1 / 3) - 1) * 100;
      } else if (r1) {
        computedRate = ((currentNAV - r1) / r1) * 100;
      }

      if (computedRate > 0 && computedRate < 100) {
        setSipRate(parseFloat(computedRate.toFixed(2)));
      }
    }
  }, [sipFund]);

  useEffect(() => {
    if (paramSchemeCode) {
      fetch(`https://api.mfapi.in/mf/${paramSchemeCode}`)
        .then(r => r.json())
        .then(detail => {
          const fundData = {
            scheme_code: paramSchemeCode,
            scheme_name: detail.meta.scheme_name,
            mutual_fund_family: detail.meta.mutual_fund_family,
            scheme_category: detail.meta.scheme_category,
            scheme_type: detail.meta.scheme_type,
            currentNAV: parseFloat(detail.data[0].nav),
            history: detail.data,
          };
          if (initialSip) setSipFund(fundData);
          else setInvSelectedFund(fundData);
        });
    }
  }, [paramSchemeCode, initialSip]);

  const loadData = useCallback(async () => {
    setLoadingTable(true);
    try {
      if (activeTab === 'Investments') {
        const res = await api.get('/api/portfolio/tax-analysis');
        const payload = res.data.success ? res.data.data : res.data;
        const source = Array.isArray(payload?.investments) ? payload.investments : [];
        const mappedHoldings = source.map(f => ({
          _id: f._id,
          schemeCode: f.scheme_code,
          fundName: f.scheme_name,
          fundHouse: f.fund_house,
          schemeCategory: f.scheme_category,
          schemeType: f.scheme_type,
          units: Number(f.units || 0),
          purchaseNAV: Number(f.purchaseNAV || 0),
          currentNAV: Number(f.currentNav ?? f.currentNAV ?? f.purchaseNAV ?? 0),
          currentValue: Number(f.currentValue || 0),
          investedAmount: Number(f.investedAmount || 0),
        }));
        setHoldings(mappedHoldings);
      } else {
        const res = await api.get('/api/sips');
        const payload = res.data.success ? res.data.data : res.data;
        setSips(payload || []);
      }
    } catch {
      /* handled silently */
    } finally {
      setLoadingTable(false);
    }
  }, [activeTab]);

  useEffect(() => {
    loadData();
  }, [activeTab, loadData]);

  const showRefreshToast = msg => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
    loadData();
    fetchPortfolio();
  };

  useEffect(() => {
    let isMounted = true;

    const loadInvestmentNavForDate = async () => {
      if (!invSelectedFund) {
        if (isMounted) {
          setInvNavInfo({ nav: 0, exactDate: 'Current' });
          setInvNavLoading(false);
        }
        return;
      }

      setInvNavLoading(true);
      const resolved = await fetchNAVOnOrBeforeDate(
        invSelectedFund.scheme_code,
        invDate,
        invSelectedFund.currentNAV
      );

      if (isMounted) {
        setInvNavInfo(resolved);
        setInvNavLoading(false);
      }
    };

    loadInvestmentNavForDate();

    return () => {
      isMounted = false;
    };
  }, [invSelectedFund, invDate]);

  const effectiveNav = invNavInfo.nav || 0;
  const effectiveDate = invNavInfo.exactDate || 'Current';

  const invPreview = useMemo(() => {
    if (!invSelectedFund || !invInput)
      return { invested: 0, units: 0, currentVal: 0, profit: 0, profitPct: 0 };

    const nav = effectiveNav;
    const { amount: amt, units } = resolveAmountAndUnits(invMode, invInput, nav);

    const currentVal = units * invSelectedFund.currentNAV;
    const profit = currentVal - amt;
    const profitPct = amt > 0 ? (profit / amt) * 100 : 0;

    return { invested: amt, units, currentVal, profit, profitPct };
  }, [invSelectedFund, invInput, invMode, effectiveNav]);

  // --- Investment Submit ---
  const handleInvSubmit = async e => {
    e.preventDefault();
    const errors = {};

    const enteredValue = toNumber(invInput);
    const currentDateISO = todayISO();

    if (!invSelectedFund) errors.fund = 'Please select a fund';
    if (!Number.isFinite(enteredValue) || enteredValue <= 0) {
      errors.input = `Please enter a valid ${invMode.toLowerCase()}`;
    }
    if (!isValidISODate(invDate)) {
      errors.date = 'Please select a valid purchase date';
    } else {
      if (invMinDate && compareISODate(invDate, invMinDate) < 0) {
        errors.date = `Purchase date cannot be before ${invMinDate}`;
      }
      if (compareISODate(invDate, currentDateISO) > 0) {
        errors.date = 'Purchase date cannot be in the future';
      }
    }

    if (Object.keys(errors).length > 0) {
      setInvErrors(errors);
      return;
    }

    setInvErrors({});
    setInvSubmitting(true);

    const exactNav = effectiveNav;
    const { amount: amt, units } = resolveAmountAndUnits(invMode, invInput, exactNav);

    if (amt <= 0 || units <= 0) {
      setInvErrors({ input: 'Calculation failed. Please check inputs.' });
      setInvSubmitting(false);
      return;
    }

    try {
      await api.post('/api/investments', {
        scheme_code: parseInt(invSelectedFund.scheme_code),
        scheme_name: invSelectedFund.scheme_name,
        fund_house: invSelectedFund.mutual_fund_family || 'AMC',
        scheme_category: invSelectedFund.scheme_category,
        scheme_type: invSelectedFund.scheme_type,
        investedAmount: amt,
        units: units,
        purchaseNAV: exactNav,
        purchaseDate: new Date(`${invDate}T12:00:00`).toISOString(),
        type: 'lumpsum',
      });
      setInvSelectedFund(null);
      setInvInput('');
      setInvErrors({});
      showRefreshToast('Investment added successfully!');
    } catch (err) {
      const apiErrors = err.response?.data?.errors;
      if (Array.isArray(apiErrors) && apiErrors.length > 0) {
        const mapped = {};
        apiErrors.forEach(issue => {
          const field = String(issue.field || '').replace('body.', '');
          if (field === 'investedAmount' || field === 'units') mapped.input = issue.message;
          else if (field === 'purchaseDate') mapped.date = issue.message;
          else mapped.form = issue.message;
        });
        setInvErrors(mapped);
      } else {
        setInvErrors({ form: err.response?.data?.message || 'Failed to add investment' });
      }
    } finally {
      setInvSubmitting(false);
    }
  };

  // --- SIP Submit ---
  const handleSipSubmit = async e => {
    e.preventDefault();
    const errors = {};

    const amount = toNumber(sipAmount);
    const rate = toNumber(sipRate);
    const duration = toNumber(sipDuration);
    const currentDateISO = todayISO();

    if (!sipFund) errors.fund = 'Please select a fund';
    if (!Number.isFinite(amount) || amount < 500) {
      errors.amount = 'Minimum SIP amount is ₹500';
    }

    if (!isValidISODate(sipStartDate)) {
      errors.date = 'Please select a valid SIP start date';
    } else {
      if (sipMinDate && compareISODate(sipStartDate, sipMinDate) < 0) {
        errors.date = `SIP date cannot be before ${sipMinDate}`;
      }
      if (compareISODate(sipStartDate, currentDateISO) > 0) {
        errors.date = 'SIP start date cannot be in the future';
      }
    }

    if (!Number.isFinite(rate) || rate < 0 || rate > 50) {
      errors.rate = 'Expected return must be between 0% and 50%';
    }

    if (
      !Number.isFinite(duration) ||
      duration < 1 ||
      duration > 40 ||
      !Number.isInteger(duration)
    ) {
      errors.duration = 'Duration must be a whole number between 1 and 40 years';
    }

    if (Object.keys(errors).length > 0) {
      setSipErrors(errors);
      return;
    }

    setSipErrors({});
    setSipSubmitting(true);
    try {
      const tzOffset = new Date().getTimezoneOffset() * 60000;
      let startD = new Date(new Date(sipStartDate).getTime() - tzOffset);

      await api.post('/api/sips', {
        scheme_code: parseInt(sipFund.scheme_code),
        scheme_name: sipFund.scheme_name,
        fund_house: sipFund.mutual_fund_family || 'AMC',
        scheme_type: 'Open Ended',
        scheme_category: sipFund.scheme_category || 'Equity',
        monthlyAmount: amount,
        startDate: startD.toISOString(),
        durationYears: duration,
        expectedReturnRate: rate,
      });
      setSipFund(null);
      showRefreshToast('SIP created successfully!');
    } catch (err) {
      const apiErrors = err.response?.data?.errors;
      if (Array.isArray(apiErrors) && apiErrors.length > 0) {
        const mapped = {};
        apiErrors.forEach(issue => {
          const field = String(issue.field || '').replace('body.', '');
          if (field === 'monthlyAmount') mapped.amount = issue.message;
          else if (field === 'startDate') mapped.date = issue.message;
          else if (field === 'expectedReturnRate') mapped.rate = issue.message;
          else if (field === 'durationYears') mapped.duration = issue.message;
          else mapped.form = issue.message;
        });
        setSipErrors(mapped);
      } else {
        setSipErrors({ form: err.response?.data?.message || 'Failed to create SIP' });
      }
    } finally {
      setSipSubmitting(false);
    }
  };

  const handleSipToggle = async (id, status) => {
    try {
      await api.put(`/api/sips/${id}/status`, { status });
      showRefreshToast(`SIP ${status}`);
    } catch {
      alert('Failed');
    }
  };

  const handlePaySip = async id => {
    setSipPaymentLoading(id);
    try {
      const res = await api.post(`/api/sips/${id}/execute`, {});
      if (res.data.success) {
        showRefreshToast('SIP instalment executed successfully!');
      }
    } catch (err) {
      const errorMsg =
        err?.response?.data?.message || 'Failed to execute SIP. Please try again.';
      setToast(errorMsg);
      setTimeout(() => setToast(''), 4000);
    } finally {
      setSipPaymentLoading(null);
    }
  };

  const handleSipDeleteRequest = id => {
    setDeleteSipId(id);
  };

  const confirmSipDelete = async () => {
    if (!deleteSipId) return;
    try {
      await api.delete(`/api/sips/${deleteSipId}`);
      setDeleteSipId(null);
      showRefreshToast('SIP deleted successfully.');
    } catch (err) {
      setToast(err.response?.data?.message || 'Failed to delete SIP.');
      setTimeout(() => setToast(''), 4000);
    }
  };

  const { invested: sipInvested, futureValue: sipFV } = calculateSIPFutureValue(
    sipAmount,
    sipDuration,
    sipRate
  );

  const newLocal =
    'block max-w-100 text-left text-sm font-bold text-primary hover:underline truncate bg-transparent border-none cursor-pointer p-0';
  usePageTitle('Manage Funds');
  return (
    <div className="flex-1 p-4 md:p-8 space-y-8 max-w-350 mx-auto w-full relative pb-20 animate-in fade-in duration-300">
      <Toast message={toast} />

      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-t-primary">
          Manage Funds
        </h1>
        <p className="text-t-secondary text-sm mt-1">
          Add investments, buy more, sell, and manage your SIPs
        </p>
      </div>

      {/* Top Tabs */}
      <div className="border-b border-border flex gap-8">
        <button
          onClick={() => {
            setActiveTab('Investments');
            navigate('/manageFunds', { replace: true });
          }}
          className={`pb-4 border-b-2 font-bold text-sm bg-transparent cursor-pointer transition-colors ${activeTab === 'Investments' ? 'border-primary text-primary' : 'border-transparent text-t-secondary hover:text-t-primary'}`}
        >
          Investments
        </button>
        <button
          onClick={() => {
            setActiveTab('SIPs');
            navigate('/manageFunds?sip=true', { replace: true });
          }}
          className={`pb-4 border-b-2 font-bold text-sm bg-transparent cursor-pointer transition-colors ${activeTab === 'SIPs' ? 'border-primary text-primary' : 'border-transparent text-t-secondary hover:text-t-primary'}`}
        >
          SIPs
        </button>
      </div>

      <div className="animate-in fade-in zoom-in-95 duration-200">
        {activeTab === 'Investments' ? (
          <div className="space-y-8">
            {/* ADD INVESTMENT FORM */}
            <section className="bg-surface rounded-xl border border-border shadow-sm p-6 grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-8">
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-t-primary">Add New Investment</h3>
                <form onSubmit={handleInvSubmit} noValidate className="space-y-6">
                  <div className="space-y-1 relative z-50">
                    <label className="text-[10px] font-black tracking-widest text-t-secondary uppercase">
                      Search Fund
                    </label>
                    <FundSearch
                      value={invSelectedFund}
                      onSelect={fund => {
                        setInvSelectedFund(fund);
                        setInvErrors(prev => ({ ...prev, fund: '' }));
                      }}
                      error={!!invErrors.fund}
                      placeholder="Ex: Parag Parikh Flexi Cap"
                    />
                    {invErrors.fund && (
                      <p className="text-[10px] text-negative font-bold mt-1">{invErrors.fund}</p>
                    )}
                    {invSelectedFund && (
                      <div className="mt-2 text-sm text-t-primary bg-indigo-50/50 border border-indigo-100 p-3 rounded-lg flex justify-between items-center shadow-sm">
                        <div>
                          <p className="font-bold truncate max-w-125">
                            {invSelectedFund.scheme_name}
                          </p>
                          <p className="text-[10px] text-t-secondary font-bold uppercase mt-0.5 tracking-wider">
                            {invSelectedFund.scheme_category}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-t-secondary font-bold uppercase tracking-wider mb-0.5">
                            {invNavLoading
                              ? 'Fetching NAV...'
                              : effectiveDate === 'Current'
                                ? 'Current NAV'
                                : `NAV as of ${effectiveDate}`}
                          </p>
                          <p className="font-black text-primary">
                            {invNavLoading ? 'Loading...' : formatNAV(effectiveNav)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 z-0 items-end">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black tracking-widest text-t-secondary uppercase">
                        Purchase Date
                      </label>
                      <input
                        type="date"
                        value={invDate}
                        onChange={e => {
                          setInvDate(e.target.value);
                          setInvErrors(prev => ({ ...prev, date: '' }));
                        }}
                        className={`styled-date w-full bg-surface border rounded-lg px-4 py-2.5 outline-none transition-all ${invErrors.date ? 'border-negative focus:border-negative focus:ring-1 focus:ring-negative' : 'border-border focus:border-primary focus:ring-1 focus:ring-primary'}`}
                      />
                      {invErrors.date && (
                        <p className="text-[10px] text-negative font-bold mt-1">{invErrors.date}</p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black tracking-widest text-t-secondary uppercase">
                        Invest By
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="any"
                          value={invInput}
                          onChange={e => {
                            setInvInput(e.target.value);
                            setInvErrors(prev => ({ ...prev, input: '' }));
                          }}
                          className={`w-full bg-surface border rounded-lg pl-4 pr-34 py-2.5 outline-none transition-all ${invErrors.input ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-border focus:border-primary focus:ring-1 focus:ring-primary'}`}
                          placeholder={`Enter ${invMode.toLowerCase()}`}
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex bg-slate-100 p-1 rounded-md">
                          {['Amount', 'Units'].map(m => (
                            <button
                              key={m}
                              type="button"
                              onClick={() => setInvMode(m)}
                              className={`px-2.5 py-1 text-[11px] font-bold rounded cursor-pointer border-none transition-all ${invMode === m ? 'bg-surface text-primary shadow-sm' : 'text-t-secondary bg-transparent'}`}
                            >
                              {m}
                            </button>
                          ))}
                        </div>
                      </div>
                      {invErrors.input && (
                        <p className="text-[10px] text-negative font-bold mt-1">
                          {invErrors.input}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={invSubmitting || invNavLoading}
                    className="w-full sm:w-auto px-8 bg-primary hover:bg-primary-hover text-t-inverse font-bold py-3 rounded-xl transition-all shadow-md active:scale-[0.98] border-none disabled:opacity-50 cursor-pointer"
                  >
                    {invSubmitting ? 'Adding...' : 'Add Investment'}
                  </button>
                  {invErrors.form && (
                    <p className="text-[11px] text-negative font-bold mt-1">{invErrors.form}</p>
                  )}
                </form>
              </div>

              {/* Purchase Summary Panel */}
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 flex flex-col justify-center relative overflow-hidden h-full z-0">
                <MdOutlineRocketLaunch className="absolute -right-6 -bottom-6 text-[120px] text-slate-200/50" />
                <div className="relative z-10 space-y-5">
                  <h4 className="text-sm font-black text-t-secondary uppercase tracking-widest border-b border-slate-200 pb-2">
                    Purchase Summary
                  </h4>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-t-secondary uppercase tracking-wider">
                      Purchase Date
                    </p>
                    <p className="text-xl font-black text-t-primary">
                      {invDate
                        ? new Date(`${invDate}T00:00:00`).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '-'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-t-secondary uppercase tracking-wider">
                      NAV Used ({effectiveDate === 'Current' ? 'Current' : effectiveDate})
                    </p>
                    <p className="text-xl font-black text-primary">
                      {invNavLoading ? 'Loading...' : formatNAV(effectiveNav)}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-slate-200 mt-2 space-y-1">
                    <p className="text-[10px] font-bold text-t-secondary uppercase tracking-wider">
                      Amount
                    </p>
                    <p className="text-3xl font-black tracking-tighter text-t-primary">
                      {formatINR(invPreview.invested)}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-slate-200 mt-2 space-y-1">
                    <p className="text-[10px] font-bold text-t-secondary uppercase tracking-wider">
                      Units
                    </p>
                    <p className="text-2xl font-black tracking-tight text-t-primary">
                      {formatUnits(invPreview.units)}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* HOLDINGS TABLE */}
            <section className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden">
              <div className="p-6 border-b border-border flex justify-between items-center">
                <h3 className="text-lg font-bold text-t-primary">Your Holdings</h3>
                <button
                  onClick={loadData}
                  className="flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-hover bg-transparent border-none cursor-pointer"
                >
                  <MdRefresh /> Refresh
                </button>
              </div>
              {loadingTable ? (
                <div className="py-12 flex justify-center">
                  <div className="animate-pulse font-bold text-primary">Loading...</div>
                </div>
              ) : holdings.length === 0 ? (
                <div className="w-full flex flex-col items-center justify-center py-16">
                  <MdOutlineRocketLaunch className="text-t-placeholder text-6xl mb-4" />
                  <p className="text-t-secondary font-bold">No investments yet. Add one above!</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-200">
                    <thead className="bg-slate-50 border-b border-border">
                      <tr>
                        <th className="px-6 py-3 text-[10px] font-black tracking-widest text-t-secondary uppercase">
                          Fund Name
                        </th>
                        <th className="px-6 py-3 text-[10px] font-black tracking-widest text-t-secondary uppercase text-right">
                          Units Held
                        </th>
                        <th className="px-6 py-3 text-[10px] font-black tracking-widest text-t-secondary uppercase text-right">
                          Avg Purchase NAV
                        </th>
                        <th className="px-6 py-3 text-[10px] font-black tracking-widest text-t-secondary uppercase text-right">
                          Current NAV
                        </th>
                        <th className="px-6 py-3 text-[10px] font-black tracking-widest text-t-secondary uppercase text-right">
                          Current Value
                        </th>
                        <th className="px-6 py-3 text-[10px] font-black tracking-widest text-t-secondary uppercase text-center">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {holdings.map((h, idx) => (
                        <tr
                          key={h._id || `${h.schemeCode}-${idx}`}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <td className="px-6 py-4 max-w-100">
                            <button
                              onClick={() => navigate(`/fund/${h.schemeCode}`)}
                              className={newLocal}
                              title={h.fundName || h.scheme_name}
                            >
                              {h.fundName || h.scheme_name}
                            </button>
                            <span className="text-[10px] text-t-secondary font-bold tracking-wider uppercase mt-0.5 inline-block px-1.5 py-0.5 bg-slate-100 rounded">
                              {h.schemeCategory || h.scheme_category}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right text-sm font-black text-t-primary">
                            {formatUnits(h.units)}
                          </td>
                          <td className="px-6 py-4 text-right text-sm font-bold text-t-secondary">
                            {formatNAV(h.purchaseNAV)}
                          </td>
                          <td className="px-6 py-4 text-right text-sm font-bold text-t-primary">
                            {formatNAV(h.currentNAV)}
                          </td>
                          <td className="px-6 py-4 text-right text-sm font-black text-primary">
                            {formatINR(h.currentValue)}
                          </td>
                          <td className="px-6 py-4 flex items-center justify-center gap-2">
                            <button
                              onClick={() => setBuyModalItem(h)}
                              className="px-4 py-1.5 text-xs font-bold text-primary border border-primary rounded-lg hover:bg-primary/5 cursor-pointer transition-colors bg-transparent"
                            >
                              Buy More
                            </button>
                            <button
                              onClick={() => setSellModalItem(h)}
                              className="px-4 py-1.5 text-xs font-bold text-negative border border-red-300 rounded-lg hover:bg-red-50 cursor-pointer transition-colors bg-transparent"
                            >
                              Sell
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        ) : (
          /* ==================== SIPs TAB ==================== */
          <div className="space-y-8">
            <section className="bg-surface rounded-xl border border-border shadow-sm p-6 grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-8">
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-t-primary">Start a New SIP</h3>
                <form onSubmit={handleSipSubmit} noValidate className="space-y-6">
                  <div className="space-y-1 relative z-50">
                    <label className="text-[10px] font-black tracking-widest text-t-secondary uppercase">
                      Search Fund
                    </label>
                    <FundSearch
                      value={sipFund}
                      onSelect={setSipFund}
                      error={!!sipErrors.fund}
                      placeholder="Ex: Quant Small Cap"
                    />
                    {sipErrors.fund && (
                      <p className="text-[10px] text-negative font-bold mt-1">{sipErrors.fund}</p>
                    )}
                    {sipFund && (
                      <div className="mt-2 text-sm text-t-primary bg-indigo-50/50 border border-indigo-100 p-3 rounded-lg flex justify-between items-center shadow-sm">
                        <div>
                          <p className="font-bold truncate max-w-125">{sipFund.scheme_name}</p>
                          <p className="text-[10px] text-t-secondary uppercase font-bold tracking-wider mt-0.5">
                            {sipFund.scheme_category}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 z-0">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black tracking-widest text-t-secondary uppercase">
                        Monthly Amount (₹)
                      </label>
                      <input
                        type="number"
                        value={sipAmount}
                        onChange={e => {
                          setSipAmount(e.target.value);
                          setSipErrors(prev => ({ ...prev, amount: '' }));
                        }}
                        className={`w-full bg-surface border rounded-lg px-4 py-2.5 outline-none transition-all ${sipErrors.amount ? 'border-negative focus:ring-negative' : 'border-border focus:border-primary focus:ring-primary focus:ring-1'}`}
                      />
                      {sipErrors.amount && (
                        <p className="text-[10px] text-negative font-bold mt-1">
                          {sipErrors.amount}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black tracking-widest text-t-secondary uppercase">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={sipStartDate}
                        onChange={e => {
                          setSipStartDate(e.target.value);
                          setSipErrors(prev => ({ ...prev, date: '' }));
                        }}
                        className={`styled-date w-full bg-surface border rounded-lg px-4 py-2.5 outline-none custom-date transition-all ${sipErrors.date ? 'border-negative focus:ring-negative' : 'border-border focus:border-primary focus:ring-primary focus:ring-1'}`}
                      />
                      {sipErrors.date && (
                        <p className="text-[10px] text-negative font-bold mt-1">{sipErrors.date}</p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 z-0">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black tracking-widest text-t-secondary uppercase">
                        Expected Return (%)
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={sipRate}
                        onChange={e => {
                          setSipRate(e.target.value);
                          setSipErrors(prev => ({ ...prev, rate: '' }));
                        }}
                        className={`w-full bg-surface border rounded-lg px-4 py-2.5 outline-none transition-all ${sipErrors.rate ? 'border-negative focus:ring-negative' : 'border-border focus:border-primary focus:ring-primary focus:ring-1'}`}
                      />
                      {sipErrors.rate && (
                        <p className="text-[10px] text-negative font-bold mt-1">{sipErrors.rate}</p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black tracking-widest text-t-secondary uppercase">
                        Duration (Years)
                      </label>
                      <input
                        type="number"
                        value={sipDuration}
                        onChange={e => {
                          setSipDuration(e.target.value);
                          setSipErrors(prev => ({ ...prev, duration: '' }));
                        }}
                        className={`w-full bg-surface border rounded-lg px-4 py-2.5 outline-none transition-all ${sipErrors.duration ? 'border-negative focus:ring-negative' : 'border-border focus:border-primary focus:ring-primary focus:ring-1'}`}
                      />
                      {sipErrors.duration && (
                        <p className="text-[10px] text-negative font-bold mt-1">
                          {sipErrors.duration}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={sipSubmitting}
                    className="w-full sm:w-auto px-8 bg-primary hover:bg-primary-hover text-t-inverse font-bold py-3 rounded-xl transition-all shadow-md active:scale-[0.98] border-none disabled:opacity-50 cursor-pointer"
                  >
                    {sipSubmitting ? 'Creating...' : 'Start SIP'}
                  </button>
                  {sipErrors.form && (
                    <p className="text-[11px] text-negative font-bold mt-1">{sipErrors.form}</p>
                  )}
                </form>
              </div>

              {/* Live Preview Panel */}
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 flex flex-col justify-center relative overflow-hidden h-full z-0">
                <MdOutlineTrendingUp className="absolute -right-6 -bottom-6 text-[120px] text-slate-200/50" />
                <div className="relative z-10 space-y-5">
                  <h4 className="text-sm font-black text-t-secondary uppercase tracking-widest border-b border-slate-200 pb-2">
                    Live Preview
                  </h4>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-t-secondary uppercase tracking-wider">
                      SIP Start Date
                    </p>
                    <p className="text-xl font-black text-t-primary">
                      {sipStartDate
                        ? new Date(`${sipStartDate}T00:00:00`).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '-'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-t-secondary uppercase tracking-wider">
                      Monthly Amount
                    </p>
                    <p className="text-xl font-black text-t-primary">{formatINR(sipAmount)}</p>
                  </div>
                  <div className="pt-3 border-t border-slate-200 mt-2 space-y-1">
                    <p className="text-[10px] font-bold text-t-secondary uppercase tracking-wider">
                      Total to be Invested
                    </p>
                    <p className="text-xl font-black text-t-primary">{formatINR(sipInvested)}</p>
                  </div>
                  <div className="pt-3 border-t border-slate-200 mt-2 space-y-1">
                    <p className="text-[10px] font-bold text-t-secondary uppercase tracking-wider">
                      Estimated Future Value
                    </p>
                    <p className="text-3xl font-black tracking-tighter text-t-primary">
                      {formatINR(sipFV)}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* SIPs Table */}
            <section className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden">
              <div className="p-6 border-b border-border">
                <h3 className="text-lg font-bold text-t-primary">Your SIPs</h3>
              </div>
              {loadingTable ? (
                <div className="py-12 flex justify-center">
                  <div className="animate-pulse font-bold text-primary">Loading...</div>
                </div>
              ) : sips.length === 0 ? (
                <div className="w-full flex flex-col items-center justify-center py-16">
                  <MdOutlineCalendarToday className="text-t-placeholder text-6xl mb-4" />
                  <p className="text-t-secondary font-bold">
                    No SIPs configured yet. Start one above!
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-200">
                    <thead className="bg-slate-50 border-b border-border">
                      <tr>
                        <th className="px-6 py-3 text-[10px] font-black tracking-widest text-t-secondary uppercase">
                          Fund Name
                        </th>
                        <th className="px-6 py-3 text-[10px] font-black tracking-widest text-t-secondary uppercase">
                          Monthly Amount
                        </th>
                        <th className="px-6 py-3 text-[10px] font-black tracking-widest text-t-secondary uppercase text-center">
                          Status
                        </th>
                        <th className="px-6 py-3 text-[10px] font-black tracking-widest text-t-secondary uppercase">
                          Next Due Date
                        </th>
                        <th className="px-6 py-3 text-[10px] font-black tracking-widest text-t-secondary uppercase text-center">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {sips.map((s, idx) => {
                        const now = new Date();
                        const nextDue = new Date(s.nextDueDate);
                        const diffDays = Math.ceil(
                          (nextDue.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
                        );
                        const canPay = s.status === 'active' && diffDays <= 15;

                        return (
                          <tr
                            key={s._id || `${s.scheme_code || s.fundName}-${idx}`}
                            className="hover:bg-slate-50 transition-colors"
                          >
                            <td className="px-6 py-4 max-w-55 overflow-hidden">
                              <button
                                onClick={() => navigate(`/fund/${s.scheme_code}`)}
                                className="block w-full max-w-full text-sm font-bold text-primary hover:underline truncate text-left bg-transparent border-none cursor-pointer p-0"
                                title={s.scheme_name || s.fundName}
                              >
                                {s.scheme_name || s.fundName}
                              </button>
                              <p className="text-[10px] text-t-secondary uppercase tracking-wider font-bold mt-0.5 overflow-hidden truncate">
                                {s.scheme_category || s.schemeCategory}
                              </p>
                            </td>
                            <td className="px-6 py-4 text-base font-black text-t-primary">
                              {formatINR(s.monthlyAmount)}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span
                                className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-black tracking-widest uppercase rounded-md border ${
                                  s.status === 'active'
                                    ? 'bg-green-50 text-green-700 border-green-200'
                                    : s.status === 'paused'
                                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                                      : 'bg-slate-100 text-slate-600 border-slate-300'
                                }`}
                              >
                                {s.status === 'active' && <MdPlayArrow className="text-sm" />}
                                {s.status === 'paused' && <MdPause className="text-sm" />}
                                {s.status === 'completed' && <MdStop className="text-sm" />}
                                {s.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm font-bold text-t-primary">
                              {new Date(s.nextDueDate).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </td>
                            <td className="px-6 py-4 flex items-center justify-center gap-2">
                              {canPay && (
                                <button
                                  onClick={() => handlePaySip(s._id)}
                                  disabled={sipPaymentLoading === s._id}
                                  className="p-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-md border-none cursor-pointer transition-colors disabled:opacity-50"
                                  title="Pay SIP"
                                >
                                  {sipPaymentLoading === s._id ? (
                                    <div className="animate-spin text-lg">⟳</div>
                                  ) : (
                                    <MdOutlinePayments className="text-lg" />
                                  )}
                                </button>
                              )}
                              {s.status === 'active' ? (
                                <button
                                  onClick={() => handleSipToggle(s._id, 'paused')}
                                  className="p-2 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-md border-none cursor-pointer transition-colors"
                                  title="Pause"
                                >
                                  <MdPause className="text-lg" />
                                </button>
                              ) : s.status === 'paused' ? (
                                <button
                                  onClick={() => handleSipToggle(s._id, 'active')}
                                  className="p-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-md border-none cursor-pointer transition-colors"
                                  title="Resume"
                                >
                                  <MdPlayArrow className="text-lg" />
                                </button>
                              ) : null}
                              <button
                                onClick={() => handleSipDeleteRequest(s._id)}
                                className="p-2 bg-red-50 text-negative hover:bg-red-100 rounded-md border-none cursor-pointer transition-colors"
                                title="Delete"
                              >
                                <MdDelete className="text-lg" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        )}
      </div>

      {buyModalItem && (
        <BuyModal
          item={buyModalItem}
          onClose={() => setBuyModalItem(null)}
          onSuccess={msg => {
            setBuyModalItem(null);
            showRefreshToast(msg);
          }}
        />
      )}
      {sellModalItem && (
        <SellModal
          item={sellModalItem}
          onClose={() => setSellModalItem(null)}
          onSuccess={msg => {
            setSellModalItem(null);
            showRefreshToast(msg);
          }}
        />
      )}
      {deleteSipId && (
        <DeleteSipModal
          onClose={() => setDeleteSipId(null)}
          onConfirm={confirmSipDelete}
        />
      )}
    </div>
  );
};

export default ManageFunds;
