import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MdOutlineSearch,
  MdOutlineFilterList,
  MdOutlineDownload,
  MdOutlineChevronLeft,
  MdOutlineChevronRight,
  MdOutlineSync,
  MdOutlineAssignment,
} from 'react-icons/md';
import api from '../api/axios';
import { TransactionsSkeleton } from '../components/PageSkeletons';
import { compareISODate, isValidISODate, todayISO } from '../utils/validation';

const Transactions = () => {
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterError, setFilterError] = useState('');

  const [sortBy, setSortBy] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 20;

  const fetchTransactions = useCallback(async () => {
    if (dateFrom && dateTo && compareISODate(dateFrom, dateTo) > 0) {
      setFilterError('From date cannot be after To date');
      setTransactions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterType) params.append('type', filterType);
      if (dateFrom) params.append('from', new Date(`${dateFrom}T00:00:00`).toISOString());
      if (dateTo) params.append('to', new Date(`${dateTo}T23:59:59`).toISOString());

      const res = await api.get(`/api/transactions?${params.toString()}`);
      const payload = res.data.success ? res.data.data : res.data;
      setTransactions(Array.isArray(payload) ? payload : []);
    } catch (err) {
      console.error(err);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo, filterType]);

  useEffect(() => {
    if (!dateFrom && !dateTo) {
      setFilterError('');
      return;
    }

    if (dateFrom && !isValidISODate(dateFrom)) {
      setFilterError('Please select a valid From date');
      return;
    }

    if (dateTo && !isValidISODate(dateTo)) {
      setFilterError('Please select a valid To date');
      return;
    }

    if (dateFrom && compareISODate(dateFrom, todayISO()) > 0) {
      setFilterError('From date cannot be in the future');
      return;
    }

    if (dateTo && compareISODate(dateTo, todayISO()) > 0) {
      setFilterError('To date cannot be in the future');
      return;
    }

    if (dateFrom && dateTo && compareISODate(dateFrom, dateTo) > 0) {
      setFilterError('From date cannot be after To date');
      return;
    }

    setFilterError('');
  }, [dateFrom, dateTo]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, dateFrom, dateTo, filterType, sortBy, sortDirection]);

  const clearFilters = () => {
    setSearchTerm('');
    setDateFrom('');
    setDateTo('');
    setFilterType('');
    setSortBy('date');
    setSortDirection('desc');
  };

  const isFiltersActive = Boolean(searchTerm || dateFrom || dateTo || filterType);

  const formatCur = val =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(val || 0));

  const formatDate = dateStr => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const searchedData = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return [...transactions];

    return transactions.filter(tx => {
      const schemeName = String(tx.scheme_name || '').toLowerCase();
      const schemeCode = String(tx.scheme_code || '').toLowerCase();
      const type = String(tx.type || '').toLowerCase();
      const amount = String(Number(tx.amount || 0));
      return (
        schemeName.includes(q) || schemeCode.includes(q) || type.includes(q) || amount.includes(q)
      );
    });
  }, [transactions, searchTerm]);

  const sortedData = useMemo(() => {
    const list = [...searchedData];
    list.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'date') {
        cmp = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortBy === 'amount') {
        cmp = Number(a.amount || 0) - Number(b.amount || 0);
      } else if (sortBy === 'fund') {
        cmp = String(a.scheme_name || '').localeCompare(String(b.scheme_name || ''));
      } else if (sortBy === 'type') {
        cmp = String(a.type || '').localeCompare(String(b.type || ''));
      }
      return sortDirection === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [searchedData, sortBy, sortDirection]);

  const totalPages = Math.ceil(sortedData.length / rowsPerPage) || 1;
  const currentView = sortedData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handleExportCSV = () => {
    if (sortedData.length === 0) return;

    const headers = [
      'Date',
      'Fund Name',
      'Scheme Code',
      'Type',
      'Amount (INR)',
      'Units',
      'NAV (INR)',
      'Profit/Loss (INR)',
      'Return (%)',
    ];

    const rows = sortedData.map(tx => {
      const d = formatDate(tx.date);
      const units = Number(tx.units || 0);
      const nav = Number(tx.nav || 0);
      const amount = Number(tx.amount || 0);
      const profitLoss = Number(tx.profitLoss || 0);
      const baseAmount = units * nav;
      const profit = tx.type === 'sell' ? profitLoss.toFixed(2) : '-';
      const pct =
        tx.type === 'sell' && baseAmount > 0
          ? `${((profitLoss / baseAmount) * 100).toFixed(2)}%`
          : '-';

      return [
        d,
        `"${String(tx.scheme_name || '').replace(/"/g, '""')}"`,
        tx.scheme_code,
        String(tx.type || '').toUpperCase(),
        amount.toFixed(2),
        units.toFixed(4),
        nav.toFixed(4),
        profit,
        pct,
      ].join(',');
    });

    const csvContent = `data:text/csv;charset=utf-8,${[headers.join(','), ...rows].join('\n')}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `smartinvest-transactions-${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Show full-page skeleton on initial load, then inline spinner for filter changes
  const isInitialLoad = loading && transactions.length === 0;

  if (isInitialLoad) return <TransactionsSkeleton />;

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-6 max-w-350 mx-auto w-full pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-t-primary mb-2">
            Transaction History
          </h1>
          <p className="text-t-secondary font-medium">
            Review and export all recorded portfolio movements.
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          disabled={transactions.length === 0}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed border-none cursor-pointer"
        >
          <MdOutlineDownload className="text-lg" />
          Export to CSV
        </button>
      </div>

      <div className="bg-surface border border-border rounded-xl p-4 shadow-sm flex flex-wrap gap-3 items-center">
        <div className="relative min-w-65 flex-1">
          <MdOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-t-placeholder" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by fund name, scheme code, type, amount..."
            className="w-full bg-surface border border-border rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-2 text-t-secondary border-r border-border pr-3">
          <MdOutlineFilterList className="text-xl" />
          <span className="text-xs font-bold tracking-wide uppercase">Filters</span>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2 border-l border-border pl-3">
          <input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            className="styled-date bg-surface border border-border text-sm text-t-primary rounded-lg px-3 py-2 outline-none focus:border-primary cursor-pointer w-35"
          />
          <span className="text-t-placeholder text-xs font-bold uppercase">-</span>
          <input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            className="styled-date bg-surface border border-border text-sm text-t-primary rounded-lg px-3 py-2 outline-none focus:border-primary cursor-pointer w-35"
          />
        </div>
        {filterError && <p className="text-[10px] text-negative font-bold">{filterError}</p>}

        {/* Type Filter */}
        <div className="flex items-center gap-2 border-l border-border pl-3">
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="styled-select bg-surface border border-border text-sm text-t-primary font-medium rounded-lg px-3 py-2 outline-none focus:border-primary cursor-pointer min-w-30"
          >
            <option value="">All Types</option>
            <option value="buy">Buy</option>
            <option value="sell">Sell</option>
            <option value="sip">SIP</option>
            <option value="redemption">Redemption</option>
          </select>
        </div>

        {/* Sorting */}
        <div className="flex items-center gap-2 border-l border-border pl-3">
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="styled-select bg-surface border border-border text-sm text-t-primary font-medium rounded-lg px-3 py-2 outline-none focus:border-primary cursor-pointer min-w-35"
          >
            <option value="date">Sort: Date</option>
            <option value="amount">Sort: Amount</option>
            <option value="fund">Sort: Fund Name</option>
            <option value="type">Sort: Type</option>
          </select>

          <select
            value={sortDirection}
            onChange={e => setSortDirection(e.target.value)}
            className="styled-select bg-surface border border-border text-sm text-t-primary font-medium rounded-lg px-3 py-2 outline-none focus:border-primary cursor-pointer min-w-35"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>

        {isFiltersActive && (
          <button
            onClick={clearFilters}
            className="text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg transition-colors border-none cursor-pointer ml-auto"
          >
            Reset
          </button>
        )}
      </div>

      <p className="text-xs font-bold uppercase tracking-widest text-t-secondary">
        Showing {sortedData.length} records {isFiltersActive ? '(Filtered)' : ''}
      </p>

      <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden flex flex-col min-h-125">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 animate-pulse text-t-secondary">
            <MdOutlineSync className="text-4xl mb-4 animate-spin text-primary" />
            <p className="text-sm font-bold">Fetching secure transaction records...</p>
          </div>
        ) : (
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left min-w-250">
              <thead className="bg-slate-50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-t-secondary uppercase">Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-t-secondary uppercase">Asset</th>
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
                {currentView.map(tx => {
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
                        {formatDate(tx.date)}
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
                          {formatCur(tx.amount)}
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
                              {formatCur(pnl)}
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

            {currentView.length === 0 && (
              <div className="w-full h-full flex flex-col justify-center items-center py-20 text-t-placeholder">
                <MdOutlineAssignment className="text-5xl mb-4" />
                <p className="text-t-secondary font-medium text-sm">
                  No transactions found matching your criteria.
                </p>
                {isFiltersActive && (
                  <button
                    onClick={clearFilters}
                    className="mt-4 px-4 py-2 border border-border rounded-lg text-sm font-bold hover:bg-slate-50 cursor-pointer bg-transparent"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {sortedData.length > 0 && (
          <div className="px-6 py-4 border-t border-border bg-slate-50 flex items-center justify-between text-sm">
            <p className="text-t-secondary font-medium">
              Showing{' '}
              <span className="text-t-primary font-bold">
                {(currentPage - 1) * rowsPerPage + 1}
              </span>{' '}
              to{' '}
              <span className="text-t-primary font-bold">
                {Math.min(currentPage * rowsPerPage, sortedData.length)}
              </span>{' '}
              of <span className="text-t-primary font-bold">{sortedData.length}</span> entries
            </p>
            <div className="flex items-center gap-1 bg-surface border border-border rounded-lg p-1.5 shadow-sm">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1 rounded text-t-secondary hover:bg-slate-100 disabled:opacity-30 border-none bg-transparent cursor-pointer"
              >
                <MdOutlineChevronLeft className="text-xl" />
              </button>
              <div className="px-3 text-sm font-bold text-primary select-none">
                {currentPage} <span className="text-t-placeholder font-normal">/ {totalPages}</span>
              </div>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1 rounded text-t-secondary hover:bg-slate-100 disabled:opacity-30 border-none bg-transparent cursor-pointer"
              >
                <MdOutlineChevronRight className="text-xl" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;
