import React, { useState, useEffect, useRef } from 'react';
import { MdOutlineSearch } from 'react-icons/md';

const FundSearch = ({ value, onSelect, error, placeholder = 'Search for a mutual fund...' }) => {
  const [query, setQuery] = useState(value?.scheme_name || '');
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (value) {
      setQuery(value.scheme_name);
    } else {
      setQuery('');
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = event => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = e => {
    const val = e.target.value;
    setQuery(val);
    if (!val) {
      setResults([]);
      setShowResults(false);
      onSelect(null);
      return;
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`https://api.mfapi.in/mf/search?q=${val}`);
        const data = await res.json();
        setResults(data || []);
        setShowResults(true);
      } catch {
        // Error handled silently
      } finally {
        setLoading(false);
      }
    }, 400); // 400ms debounce
  };

  const handleSelect = async fund => {
    setQuery(fund.schemeName);
    setShowResults(false);

    try {
      const res = await fetch(`https://api.mfapi.in/mf/${fund.schemeCode}`);
      const detail = await res.json();

      let first_nav_date = null;
      if (detail.data && detail.data.length > 0) {
        // Oldest data is at the end of the array
        const lastEntry = detail.data[detail.data.length - 1];
        const [d, m, y] = lastEntry.date.split('-');
        first_nav_date = `${y}-${m}-${d}`;
      }

      onSelect({
        scheme_code: fund.schemeCode,
        scheme_name: detail.meta.scheme_name,
        mutual_fund_family: detail.meta.mutual_fund_family,
        scheme_category: detail.meta.scheme_category,
        scheme_type: detail.meta.scheme_type,
        currentNAV: parseFloat(detail.data[0].nav),
        history: detail.data,
        first_nav_date,
      });
    } catch {
      alert('Failed to fetch fund details securely.');
    }
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <MdOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-t-placeholder text-lg" />
      <input
        type="text"
        value={query}
        onChange={handleSearch}
        onFocus={() => {
          if (results.length > 0) setShowResults(true);
        }}
        className={`w-full bg-surface border rounded-lg pl-10 pr-4 py-2.5 outline-none transition-all shadow-inner ${error ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-border focus:ring-1 focus:ring-primary focus:border-primary'}`}
        placeholder={placeholder}
      />
      {showResults && (
        <div className="absolute top-full mt-2 w-full bg-surface border border-border rounded-xl shadow-2xl max-h-60 overflow-y-auto z-50 animate-in fade-in zoom-in-95 duration-100">
          {loading ? (
            <div className="p-4 text-center text-t-secondary text-sm font-bold animate-pulse">
              Searching MFAPI Registry...
            </div>
          ) : results.length > 0 ? (
            results.map(f => (
              <div
                key={f.schemeCode}
                onClick={() => handleSelect(f)}
                className="px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-border last:border-b-0 transition-colors"
              >
                <p className="text-sm font-bold text-t-primary leading-tight">{f.schemeName}</p>
                <p className="text-[10px] text-t-secondary mt-1 font-mono tracking-wider">
                  {f.schemeCode}
                </p>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-t-secondary text-sm font-bold">
              No funds found corresponding to criteria.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FundSearch;
