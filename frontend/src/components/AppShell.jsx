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
  MdOutlineNotifications,
  MdOutlinePerson,
  MdOutlineLogout,
  MdDone,
} from 'react-icons/md';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { PortfolioContext } from '../context/PortfolioContext';
import { formatINR } from '../utils/formatters';

const AppShell = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const {
    totalCurrentValue,
    totalReturnPercent,
    loading: portLoading,
    rawData,
    notifications: portNotifications,
  } = useContext(PortfolioContext);

  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isNotifOpen, setNotifOpen] = useState(false);
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // TASK 5: Sync context notifications to local state
  useEffect(() => {
    if (portNotifications && portNotifications.length > 0) {
      setNotifications(prev => {
        // Only add if not already present by ID
        const existingIds = new Set(prev.map(n => n.id));
        const newNotifs = portNotifications.filter(n => !existingIds.has(n.id));
        if (newNotifs.length === 0) return prev;
        return [...newNotifs, ...prev];
      });
    }
  }, [portNotifications]);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = event => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
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

  useEffect(() => {
    const tips = rawData?.tips || [];
    const nextNotifications = [
      {
        id: 'health-score',
        title: 'Portfolio Health',
        message: `Current health score: ${rawData?.healthScore || 0}/100`,
        isRead: false,
      },
      {
        id: 'returns',
        title: 'Return Snapshot',
        message: `Overall return is ${Number(totalReturnPercent || 0).toFixed(2)}% on net worth ${formatINR(totalCurrentValue || 0)}.`,
        isRead: false,
      },
      ...tips.slice(0, 2).map((tip, idx) => ({
        id: `tip-${idx}`,
        title: 'Portfolio Tip',
        message: tip,
        isRead: false,
      })),
    ];

    setNotifications(nextNotifications);
  }, [rawData, totalCurrentValue, totalReturnPercent]);

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

  const getPageTitle = () => {
    const item = navItems.find(i => i.path === location.pathname);
    if (item) return item.label;

    // Handle dynamic routes
    if (location.pathname.startsWith('/fund/')) return 'Fund Details';
    if (location.pathname.startsWith('/profile/')) return 'Profile Settings';

    return 'SmartInvest';
  };

  const getPageSubtitle = () => {
    const subTitles = {
      '/dashboard': 'Overview of your investment portfolio and health',
      '/investments': 'Track performance and analyze your holdings',
      '/manageFunds': 'Add new investments and manage your active SIPs',
      '/transactions': 'History of all your buy and sell activities',
      '/profile': 'Manage your goals, risk profile, and account settings',
    };

    if (subTitles[location.pathname]) return subTitles[location.pathname];
    if (location.pathname.startsWith('/fund/'))
      return 'Detailed analysis and historical performance';

    return 'Your personal wealth manager';
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markNotificationAsRead = notificationId => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId ? { ...notification, isRead: true } : notification
      )
    );
  };

  const dismissNotification = notificationId => {
    setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(notification => ({ ...notification, isRead: true })));
  };

  // Logout function
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const MdOutlinePersonIcon = MdPerson;

  return (
    <div className="flex h-screen bg-behind font-inter overflow-hidden">
      {/* qfq */}
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
        <header className="h-16 lg:h-20 bg-surface border-b border-border flex items-center justify-between px-4 md:px-8 shrink-0">
          <div className="flex items-center gap-4">
            {/* Mobile Hamburger Menu */}
            <button
              className="lg:hidden p-2 text-t-secondary hover:bg-slate-50 rounded-lg border-none bg-transparent"
              onClick={() => setSidebarOpen(true)}
            >
              <MdMenu size={24} />
            </button>
            <div>
              <h2 className="text-t-primary text-lg md:text-xl font-bold">{getPageTitle()}</h2>
              <p className="hidden md:block text-[10px] text-t-placeholder uppercase font-black tracking-widest mt-0.5">
                {getPageSubtitle()}
              </p>
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
              {/* Notification Dropdown */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setNotifOpen(!isNotifOpen)}
                  className="p-2.5 text-t-secondary hover:bg-slate-50 hover:text-primary rounded-xl transition-all border-none bg-transparent cursor-pointer relative"
                >
                  <MdOutlineNotifications size={22} />
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2.5 size-2 bg-primary rounded-full border-2 border-surface" />
                  )}
                </button>

                {isNotifOpen && (
                  <div className="absolute right-0 mt-3 w-80 bg-surface rounded-2xl shadow-2xl border border-border z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                    <div className="p-4 border-b border-border flex justify-between items-center">
                      <span className="font-bold text-sm">Notifications</span>
                      <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                          <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                            {unreadCount} New
                          </span>
                        )}
                        {notifications.length > 0 && (
                          <button
                            onClick={markAllNotificationsAsRead}
                            className="text-[10px] px-2 py-1 rounded-md font-bold text-primary hover:bg-primary/10 transition-colors border-none bg-transparent cursor-pointer"
                          >
                            MARK ALL AS READ
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-t-secondary">
                          You are all caught up.
                        </div>
                      ) : (
                        notifications.map((notification, index) => (
                          <div
                            key={notification.id}
                            className={`p-4 hover:bg-slate-50 transition-colors ${index !== notifications.length - 1 ? 'border-b border-slate-50' : ''}`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-xs font-bold text-t-primary">
                                  {notification.title}
                                </p>
                                <p className="text-[11px] text-t-secondary mt-1">
                                  {notification.message}
                                </p>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                {!notification.isRead && (
                                  <button
                                    onClick={() => markNotificationAsRead(notification.id)}
                                    aria-label="Mark as read"
                                    title="Mark as read"
                                    className="p-1.5 rounded-md text-primary hover:bg-primary/10 transition-colors border-none bg-transparent cursor-pointer"
                                  >
                                    <MdDone size={16} />
                                  </button>
                                )}
                                <button
                                  onClick={() => dismissNotification(notification.id)}
                                  aria-label="Dismiss notification"
                                  title="Dismiss notification"
                                  className="p-1.5 rounded-md text-t-secondary hover:bg-slate-100 transition-colors border-none bg-transparent cursor-pointer"
                                >
                                  <MdClose size={16} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

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
        <main className="flex-1 overflow-y-auto w-full custom-scrollbar">
          <div className="max-w-[1400px] mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppShell;
