import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  MdOutlineDashboard,
  MdDashboard,
  MdOutlinePieChart,
  MdPieChart,
  MdOutlinePayments,
  MdPayments,
  MdOutlineHistory,
  MdHistory,
  MdPerson,
  MdOutlineAccountBalanceWallet,
  MdOutlineSettings,
  MdClose,
  MdMenu,
  MdOutlinePerson,
  MdOutlineLogout,
} from 'react-icons/md';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/auth-context';
import { PortfolioContext } from '../context/portfolio-context';
import { formatINR } from '../utils/formatters';
import FundSearch from './FundSearch';

const AppShell = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const {
    totalCurrentValue,
    totalReturnPercent,
    loading: portLoading,
  } = useContext(PortfolioContext);

  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isProfileOpen, setProfileOpen] = useState(false);

  const profileRef = useRef(null);
  const mainScrollRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = event => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    const timer = setTimeout(() => setSidebarOpen(false), 0);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Keep navigation UX predictable: reset to top on page switch,
  // and if a target id is provided (hash/state), scroll it into view with offset.
  useEffect(() => {
    const container = mainScrollRef.current;
    if (!container) return;

    const scrollTopNow = () => {
      container.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    };

    const stateTargetId = location.state?.scrollToId;
    const hashTargetId = location.hash ? decodeURIComponent(location.hash.slice(1)) : '';
    const targetId = stateTargetId || hashTargetId;

    if (!targetId) {
      scrollTopNow();
      return;
    }

    const topOffset =
      typeof location.state?.scrollOffset === 'number'
        ? Math.max(0, location.state.scrollOffset)
        : 20;
    const maxAttempts = 60;
    let attempts = 0;
    let timerId;

    const scrollToTarget = () => {
      const element = document.getElementById(targetId);

      if (element) {
        const containerRect = container.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        const targetTop = container.scrollTop + (elementRect.top - containerRect.top) - topOffset;

        container.scrollTo({ top: Math.max(0, targetTop), left: 0, behavior: 'smooth' });
        return;
      }

      attempts += 1;
      if (attempts <= maxAttempts) {
        timerId = setTimeout(scrollToTarget, 100);
      } else {
        scrollTopNow();
      }
    };

    scrollTopNow();
    timerId = setTimeout(scrollToTarget, 0);

    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [location.hash, location.key, location.pathname, location.search, location.state]);

  // Sidebar path and icons
  const navItems = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: MdOutlineDashboard,
      activeIcon: MdDashboard,
    },
    {
      path: '/investments',
      label: 'My Investments',
      icon: MdOutlinePieChart,
      activeIcon: MdPieChart,
    },
    {
      path: '/manageFunds',
      label: 'Manage Funds',
      icon: MdOutlinePayments,
      activeIcon: MdPayments,
    },
    {
      path: '/transactions',
      label: 'Transactions',
      icon: MdOutlineHistory,
      activeIcon: MdHistory,
    },
    { path: '/profile', label: 'Profile', icon: MdOutlinePerson, activeIcon: MdPerson },
  ];

  // Logout function
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-behind font-inter overflow-hidden">
      <aside className="hidden lg:flex flex-col w-64 bg-surface border-r border-border shrink-0">
        {/* Logo & Branding */}
        <Link to="/dashboard" className="p-6 flex items-center gap-3 text-primary no-underline">
          <div className="size-9 flex items-center justify-center bg-primary/10 rounded-lg">
            <MdOutlineAccountBalanceWallet size={26} />
          </div>
          <h1 className="text-t-primary text-2xl font-bold tracking-tight">SmartInvest</h1>
        </Link>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              title={item.label}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm group ${
                  isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-t-secondary hover:bg-slate-100 hover:text-t-primary'
                }`
              }
            >
              {({ isActive }) => {
                const IconComponent = isActive ? item.activeIcon : item.icon;
                return (
                  <>
                    <IconComponent className="text-xl shrink-0 group-hover:scale-110 transition-transform" />
                    <span className="block md:hidden lg:block whitespace-nowrap">{item.label}</span>
                  </>
                );
              }}
            </NavLink>
          ))}
        </nav>

        {/* Logout button at the bottom of sidebar */}
        <div className="p-4 border-t border-border">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-negative hover:bg-red-50 transition-all border-none bg-transparent cursor-pointer"
          >
            <MdOutlineLogout className="text-xl" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-72 bg-surface z-50 lg:hidden transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Logo and Close Button */}
        <div className="p-6 flex items-center justify-between">
          {/* Logo and Brand name */}
          <Link to="/dashboard" className="flex items-center gap-3 text-primary no-underline">
            <MdOutlineAccountBalanceWallet size={28} />
            <span className="text-t-primary text-xl font-bold">SmartInvest</span>
          </Link>
          {/* Close button */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 text-t-secondary border-none bg-transparent"
          >
            <MdClose size={24} />
          </button>
        </div>
        {/* Navigation Links */}
        <nav className="px-4 space-y-2 mt-4">
          {navItems.map(item => {
            const IconComponent = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-4 rounded-xl text-base font-bold no-underline ${
                  location.pathname === item.path
                    ? 'bg-primary/10 text-primary'
                    : 'text-t-secondary'
                }`}
              >
                <IconComponent className="text-2xl" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        {/* Mobile Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-4 rounded-xl text-base font-bold text-negative border-none bg-transparent cursor-pointer"
          >
            <MdOutlineLogout size={24} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 lg:h-20 bg-surface border-b border-border flex items-center justify-between px-4 md:px-8 shrink-0 gap-4">
          <div className="flex items-center gap-4 flex-1 z-50">
            {/* Mobile Hamburger Menu */}
            <button
              className="lg:hidden p-2 text-t-secondary hover:bg-slate-50 rounded-lg border-none bg-transparent"
              onClick={() => setSidebarOpen(true)}
            >
              <MdMenu size={24} />
            </button>
            <div className="hidden sm:block flex-1 max-w-lg">
               <FundSearch 
                  key={location.pathname}
                  placeholder="Search any mutual fund to view details..."
                  onSelect={(fund) => {
                     if (fund && fund.scheme_code) {
                         navigate(`/fund/${fund.scheme_code}`);
                     }
                  }}
               />
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            {/* Real-time Portfolio Quick Stats */}
            <div className="hidden sm:flex items-center gap-6 px-6 py-2 bg-slate-50 rounded-2xl border border-border">
              <div>
                <p className="text-[9px] font-black text-t-placeholder uppercase tracking-tighter">
                  Net Worth
                </p>
                <p
                  className={`text-sm font-black text-t-primary ${portLoading ? 'animate-pulse opacity-50' : ''}`}
                >
                  {formatINR(totalCurrentValue)}
                </p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div>
                <p className="text-[9px] font-black text-t-placeholder uppercase tracking-tighter">
                  Total Returns
                </p>
                <p
                  className={`text-sm font-black ${totalReturnPercent >= 0 ? 'text-positive' : 'text-negative'} ${portLoading ? 'animate-pulse opacity-50' : ''}`}
                >
                  {totalReturnPercent >= 0 ? '+' : ''}
                  {parseFloat(totalReturnPercent).toFixed(2)}%
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Profile Dropdown */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 p-1 pr-3 hover:bg-slate-50 rounded-full transition-all border-none bg-transparent cursor-pointer"
                >
                  <div className="size-9 bg-primary text-t-inverse rounded-full flex items-center justify-center font-black text-sm">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-xs font-bold text-t-primary leading-none">
                      {user?.name?.split(' ')[0]}
                    </p>
                    <p className="text-[9px] text-t-placeholder font-medium mt-1 uppercase tracking-widest">
                      Investor
                    </p>
                  </div>
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-surface rounded-2xl shadow-2xl border border-border z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                    <div className="p-4 border-b border-border bg-slate-50/50">
                      <p className="text-sm font-bold text-t-primary">{user?.name}</p>
                      <p className="text-xs text-t-secondary truncate">{user?.email}</p>
                    </div>
                    <div className="p-2">
                      <Link
                        to="/profile"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold text-t-secondary hover:bg-slate-50 hover:text-t-primary no-underline"
                      >
                        <MdOutlineSettings size={18} /> Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold text-negative hover:bg-red-50 transition-all border-none bg-transparent cursor-pointer"
                      >
                        <MdOutlineLogout size={18} /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main ref={mainScrollRef} className="flex-1 overflow-y-auto w-full custom-scrollbar">
          <div className="max-w-350 mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppShell;
