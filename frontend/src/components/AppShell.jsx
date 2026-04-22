import React, { useState, useEffect, useContext, useRef } from "react";
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
  MdOutlineTrendingUp,
  MdOutlineCalendarToday,
  MdOutlineSettings,
  MdClose,
  MdMenu,
  MdAdd,
  MdOutlineNotifications,
  MdOutlineExpandMore,
  MdOutlinePerson,
  MdOutlineLogout,
} from "react-icons/md";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { PortfolioContext } from "../context/PortfolioContext";
import { formatINR } from "../utils/formatters";

const AppShell = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const {
    totalCurrentValue,
    totalReturnsPercent,
    loading: portLoading,
  } = useContext(PortfolioContext);

  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isNotifOpen, setNotifOpen] = useState(false);
  const [isProfileOpen, setProfileOpen] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const navItems = [
    {
      path: "/dashboard",
      label: "Dashboard",
      icon: MdOutlineDashboard,
      activeIcon: MdDashboard,
    },
    {
      path: "/investments",
      label: "My Investments",
      icon: MdOutlinePieChart,
      activeIcon: MdPieChart,
    },
    {
      path: "/manageFunds",
      label: "Manage Funds",
      icon: MdOutlinePayments,
      activeIcon: MdPayments,
    },
    {
      path: "/transactions",
      label: "Transactions",
      icon: MdOutlineHistory,
      activeIcon: MdHistory,
    },
    { path: "/profile", label: "Profile", icon: MdOutlinePerson, activeIcon: MdPerson },
  ];

  const getPageTitle = () => {
    const item = navItems.find((i) => i.path === location.pathname);
    return item ? item.label : "SmartInvest";
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-behind font-inter overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-surface border-r border-border shrink-0">
        {/* Logo & Branding */}
        <div className="p-6 flex items-center gap-3 text-primary">
          <div className="size-9 flex items-center justify-center bg-primary/10 rounded-lg">
            <MdOutlineAccountBalanceWallet size={24} />
          </div>
          <h1 className="text-t-primary text-xl font-bold tracking-tight">SmartInvest</h1>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              title={item.label}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm group ${
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-t-secondary hover:bg-slate-100 hover:text-t-primary"
                }`
              }
            >
              {({ isActive }) => {
                const IconComponent = isActive ? item.activeIcon : item.icon;
                return (
                  <>
                    <IconComponent className="text-xl shrink-0 group-hover:scale-110 transition-transform" />
                    <span className="block md:hidden lg:block whitespace-nowrap">
                      {item.label}
                    </span>
                  </>
                );
              }}
            </NavLink>
          ))}
        </nav>

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
        className={`fixed top-0 left-0 bottom-0 w-72 bg-surface z-50 lg:hidden transition-transform duration-300 transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3 text-primary">
            <MdOutlineAccountBalanceWallet size={28} />
            <span className="text-t-primary text-xl font-bold">SmartInvest</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 text-t-secondary border-none bg-transparent"
          >
            <MdClose size={24} />
          </button>
        </div>
        <nav className="px-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-4 rounded-xl text-base font-bold no-underline ${
                  location.pathname === item.path
                    ? "bg-primary text-t-inverse"
                    : "text-t-secondary"
                }`}
              >
                <IconComponent className="text-2xl" />
                {item.label}
              </Link>
            );
          })}
        </nav>
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
            <button
              className="lg:hidden p-2 text-t-secondary hover:bg-slate-50 rounded-lg border-none bg-transparent"
              onClick={() => setSidebarOpen(true)}
            >
              <MdMenu size={24} />
            </button>
            <div>
              <h2 className="text-t-primary text-lg md:text-xl font-bold">
                {getPageTitle()}
              </h2>
              <p className="hidden md:block text-[10px] text-t-placeholder uppercase font-black tracking-widest mt-0.5">
                Welcome back, {user?.name?.split(" ")[0]}
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
                  className={`text-sm font-black text-t-primary ${portLoading ? "animate-pulse opacity-50" : ""}`}
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
                  className={`text-sm font-black ${totalReturnsPercent >= 0 ? "text-positive" : "text-negative"} ${portLoading ? "animate-pulse opacity-50" : ""}`}
                >
                  {totalReturnsPercent > 0 ? "+" : ""}
                  {parseFloat(totalReturnsPercent).toFixed(2)}%
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
                  <span className="absolute top-2 right-2.5 size-2 bg-primary rounded-full border-2 border-surface" />
                </button>

                {isNotifOpen && (
                  <div className="absolute right-0 mt-3 w-80 bg-surface rounded-2xl shadow-2xl border border-border z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                    <div className="p-4 border-b border-border flex justify-between items-center">
                      <span className="font-bold text-sm">Notifications</span>
                      <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                        2 New
                      </span>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      <div className="p-4 hover:bg-slate-50 border-b border-slate-50 cursor-pointer transition-colors">
                        <p className="text-xs font-bold text-t-primary">SIP Reminder</p>
                        <p className="text-[11px] text-t-secondary mt-1">
                          Your SIP for Parag Parikh Flexi Cap is due in 3 days.
                        </p>
                      </div>
                      <div className="p-4 hover:bg-slate-50 cursor-pointer transition-colors">
                        <p className="text-xs font-bold text-t-primary">New Feature</p>
                        <p className="text-[11px] text-t-secondary mt-1">
                          Check out your new Portfolio Stress Test in the Analytics tab!
                        </p>
                      </div>
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
                      {user?.name?.split(" ")[0]}
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
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppShell;
