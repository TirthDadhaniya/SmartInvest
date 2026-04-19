import React from "react";
import {
  MdOutlineDiamond,
  MdOutlineDashboard,
  MdOutlinePieChart,
  MdOutlineTrendingUp,
  MdOutlineCalendarToday,
  MdOutlineHistory,
  MdOutlineSettings,
  MdOutlineAdd,
  MdOutlineNotifications,
  MdOutlineExpandMore,
} from "react-icons/md";

const AppShell = () => {
  return (
    <div className="flex min-h-screen bg-base text-t-primary font-display antialiased relative">
      <aside className="w-60 left-0 shrink-0 border-r font-inter border-border bg-surface flex flex-col fixed h-full z-20">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-primary size-8 rounded flex items-center justify-center text-white">
            <MdOutlineDiamond className="text-[20px]" />
          </div>
          <h1 className="font-inter text-xl font-bold tracking-tight text-t-primary leading-none">
            SmartInvest
          </h1>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          <a
            className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary font-medium"
            href="#"
          >
            <MdOutlineDashboard className="text-lg" />
            <span className="text-sm">Dashboard</span>
          </a>
          <a
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600  hover:bg-slate-100 transition-colors"
            href="#"
          >
            <MdOutlinePieChart className="text-lg" />
            <span className="text-sm">Portfolio</span>
          </a>
          <a
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600  hover:bg-slate-100  transition-colors"
            href="#"
          >
            <MdOutlineTrendingUp className="text-lg" />
            <span className="text-sm">Market</span>
          </a>
          <a
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600  hover:bg-slate-100  transition-colors"
            href="#"
          >
            <MdOutlineCalendarToday className="text-lg" />
            <span className="text-sm">SIPs</span>
          </a>
          <a
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600  hover:bg-slate-100  transition-colors"
            href="#"
          >
            <MdOutlineHistory className="text-lg" />
            <span className="text-sm">Transactions</span>
          </a>
        </nav>
        <div className="p-4 border-t border-slate-200 ">
          <div className="flex items-center gap-3 px-2 py-3">
            <div
              className="size-10 rounded-full bg-slate-200  bg-center bg-cover"
              data-alt="User profile avatar portrait"
              style={{
                backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuBIGdRyYs_Ior6MMq5cYZJgns3FyDXPYnqOm58wmzyI7w_UZmZ7K_S99aqEs0O-SfNPltHi4orcILTVAmxFaEhjh31aKnGMBClp_8RNB3q5_pjxrPjd0O0twLtHp_lbN5Nt92FiGy6N8d16NiCZhOKeVLB5QssQ6p3TV9zGHTdjqjqgEEEwDxschY-PF2p8TtByDzDjAdS8c9G55bccohNDRs3sHwBV2QNN8fW8J5oLbINL_ZIoXHickBXjpycEG80Xe_1iyPuhbEHc")`,
              }}
            ></div>
            <div className="flex flex-col min-w-0">
              <p className="text-sm font-semibold truncate">Alex Rivera</p>
              <p className="text-xs text-slate-500 truncate">Premium Member</p>
            </div>
            <MdOutlineSettings className="text-slate-400 ml-auto text-sm" />
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-h-screen transition-all duration-300 ease-out md:ml-[80px] lg:ml-[240px] w-full max-w-[100vw]">
        <header className="font-inter sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-border h-16 flex items-center justify-between px-8">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold">Dashboard</h2>
            <div className="h-4 w-px bg-slate-200 "></div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                Net Worth
              </span>
              <span className="text-lg font-bold text-primary">$52,140.50</span>
              <span className="text-xs font-bold text-green-600 bg-green-100 px-1.5 py-0.5 rounded">
                +15.3%
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="bg-primary text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-primary/90 transition-all flex items-center gap-2">
              <MdOutlineAdd className="text-sm" /> Add Funds
            </button>
            {/* Notifications */}
            <div className="relative">
              <button className="p-2 text-t-secondary hover:bg-slate-100 rounded-lg relative transition-colors border-none bg-transparent cursor-pointer">
                <MdOutlineNotifications className="text-xl" />
                <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button className="flex items-center gap-1.5 p-1 hover:bg-slate-100 rounded-lg transition-colors border-none bg-transparent cursor-pointer">
                <div className="size-8 rounded-full bg-slate-200 flex items-center justify-center text-t-secondary font-bold text-sm"></div>
                <MdOutlineExpandMore className="text-sm text-t-placeholder" />
              </button>
            </div>
          </div>
        </header>
      </main>
    </div>
  );
};

export default AppShell;
