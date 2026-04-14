import React from "react";

const ManageFunds = () => {
  return (
    <>
      <div class="bg-background text-on-background antialiased">
        {/* <!-- SideNavBar --> */}
        <aside class="w-[240px] h-screen fixed left-0 top-0 border-r border-slate-200 bg-slate-50 flex flex-col py-6 px-4 space-y-2 z-40">
          <div class="mb-8 px-2">
            <h1 class="text-xl font-black tracking-tight text-slate-900">SmartInvest</h1>
            <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Institutional Grade
            </p>
          </div>
          <nav class="flex-1 space-y-1">
            <a
              class="flex items-center gap-3 px-3 py-2 text-slate-500 hover:bg-slate-100 transition-colors duration-200 rounded-lg group"
              href="#"
            >
              <span class="material-symbols-outlined">dashboard</span>
              <span class="font-medium text-sm">Dashboard</span>
            </a>
            <a
              class="flex items-center gap-3 px-3 py-2 text-blue-600 font-bold border-r-2 border-blue-600 bg-blue-50/50 transition-colors duration-200 rounded-l-lg group"
              href="#"
            >
              <span class="material-symbols-outlined">account_balance_wallet</span>
              <span class="font-bold text-sm">Portfolio</span>
            </a>
            <a
              class="flex items-center gap-3 px-3 py-2 text-slate-500 hover:bg-slate-100 transition-colors duration-200 rounded-lg group"
              href="#"
            >
              <span class="material-symbols-outlined">show_chart</span>
              <span class="font-medium text-sm">Markets</span>
            </a>
            <a
              class="flex items-center gap-3 px-3 py-2 text-slate-500 hover:bg-slate-100 transition-colors duration-200 rounded-lg group"
              href="#"
            >
              <span class="material-symbols-outlined">analytics</span>
              <span class="font-medium text-sm">Analysis</span>
            </a>
          </nav>
          <div class="pt-4 border-t border-slate-200">
            <a
              class="flex items-center gap-3 px-3 py-2 text-slate-500 hover:bg-slate-100 transition-colors duration-200 rounded-lg group"
              href="#"
            >
              <span class="material-symbols-outlined">settings</span>
              <span class="font-medium text-sm">Settings</span>
            </a>
          </div>
        </aside>
        {/* TopNavBar */}
        <header class="fixed top-0 right-0 left-[240px] h-16 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-8 z-30 shadow-sm">
          <div class="flex-1 max-w-xl">
            <div class="relative group">
              <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                search
              </span>
              <input
                class="w-full bg-slate-100 border-none rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="Search instruments, funds or analysis..."
                type="text"
              />
            </div>
          </div>
          <div class="flex items-center gap-6">
            <button class="bg-primary text-white px-5 py-2 rounded-lg text-sm font-bold shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform">
              Execute Trade
            </button>
            <div class="flex items-center gap-4 text-slate-500">
              <span class="material-symbols-outlined cursor-pointer hover:text-primary transition-colors">
                notifications
              </span>
              <div class="h-8 w-8 rounded-full bg-primary-container flex items-center justify-center border border-primary/10">
                <span class="material-symbols-outlined text-primary text-xl">
                  account_circle
                </span>
              </div>
            </div>
          </div>
        </header>
        {/* Main Content */}
        <main class="ml-[240px] pt-16 min-h-screen">
          <div class="max-w-[1200px] mx-auto px-8 py-10">
            {/* Page Header */}
            <div class="mb-8">
              <h2 class="text-[30px] font-extrabold text-slate-900 tracking-tight">
                Manage Funds
              </h2>
              <p class="text-on-surface-variant text-sm font-medium mt-1">
                Add investments, buy more, sell, and manage your SIPs
              </p>
            </div>
            {/* Tab Navigation */}
            <div class="flex items-center gap-8 mb-8 border-b border-slate-200">
              <button class="pb-4 text-sm font-bold text-primary border-b-2 border-primary transition-all">
                Investments
              </button>
              <button class="pb-4 text-sm font-medium text-slate-500 hover:text-slate-900 transition-all">
                SIPs
              </button>
            </div>
            {/* TAB 1: Investments */}
            <section class="space-y-6">
              {/* Add New Investment Form Card */}
              <div class="bg-surface rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div class="p-6">
                  <div class="flex items-center gap-2 mb-6">
                    <span class="material-symbols-outlined text-primary">add_circle</span>
                    <h3 class="font-bold text-slate-900">Add New Investment</h3>
                  </div>
                  <div class="grid grid-cols-12 gap-4 items-end">
                    <div class="col-span-4">
                      <label class="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 block">
                        Fund Search
                      </label>
                      <div class="relative">
                        <select class="w-full bg-slate-50 border-outline-variant rounded-lg py-2.5 text-sm focus:ring-primary focus:border-primary appearance-none px-4">
                          <option>Select a Mutual Fund</option>
                          <option>Sapphire Bluechip Equity Fund</option>
                          <option>Precision Index 50 Direct</option>
                          <option>Growth &amp; Alpha Opportunities</option>
                        </select>
                        <span class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                          expand_more
                        </span>
                      </div>
                    </div>
                    <div class="col-span-2">
                      <label class="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 block">
                        Purchase Date
                      </label>
                      <input
                        class="w-full bg-slate-50 border-outline-variant rounded-lg py-2 text-sm focus:ring-primary focus:border-primary px-4"
                        type="date"
                      />
                    </div>
                    <div class="col-span-2">
                      <label class="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 block">
                        Invest By
                      </label>
                      <div class="flex bg-slate-50 p-1 rounded-lg border border-outline-variant">
                        <button class="flex-1 py-1 text-xs font-bold bg-white shadow-sm rounded-md text-primary">
                          Amount
                        </button>
                        <button class="flex-1 py-1 text-xs font-medium text-slate-500 hover:text-slate-700">
                          Units
                        </button>
                      </div>
                    </div>
                    <div class="col-span-2">
                      <label class="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 block">
                        Amount (₹)
                      </label>
                      <input
                        class="w-full bg-slate-50 border-outline-variant rounded-lg py-2 text-sm focus:ring-primary focus:border-primary px-4"
                        placeholder="10,000"
                        type="number"
                      />
                    </div>
                    <div class="col-span-2">
                      <button class="w-full bg-primary text-white h-[42px] rounded-lg text-sm font-bold shadow-lg shadow-primary/20 active:scale-[0.98] transition-all">
                        Add Investment
                      </button>
                    </div>
                  </div>
                  <div class="mt-4 flex items-center gap-2 text-slate-500 bg-slate-50/50 p-3 rounded-lg border border-dashed border-slate-200">
                    <span class="material-symbols-outlined text-sm">info</span>
                    <p class="text-xs font-medium">
                      NAV on selected date:
                      <span class="text-slate-900 font-bold">₹412.45</span> | Units to be
                      credited: <span class="text-slate-900 font-bold">24.24</span>
                    </p>
                  </div>
                </div>
              </div>
              {/* <!-- Your Holdings Table --> */}
              <div class="bg-surface rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div class="p-6 border-b border-slate-50">
                  <div class="flex justify-between items-center">
                    <h3 class="font-bold text-slate-900">Your Holdings</h3>
                    <div class="flex items-center gap-2">
                      <span class="text-xs text-slate-400 font-medium italic">
                        Data as of today, 10:45 AM
                      </span>
                    </div>
                  </div>
                </div>
                <div class="overflow-x-auto">
                  <table class="w-full text-left border-collapse">
                    <thead>
                      <tr class="bg-slate-50/50">
                        <th class="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                          Fund Name
                        </th>
                        <th class="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right">
                          Units Held
                        </th>
                        <th class="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right">
                          Avg Pur. NAV
                        </th>
                        <th class="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right">
                          Current NAV
                        </th>
                        <th class="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right">
                          Current Value
                        </th>
                        <th class="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-center">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                      <tr class="hover:bg-slate-50/80 transition-colors">
                        <td class="px-6 py-4">
                          <div class="flex flex-col">
                            <span class="text-sm font-bold text-slate-900">
                              Sapphire Bluechip Equity Direct-G
                            </span>
                            <span class="text-[10px] w-fit mt-1 px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-bold uppercase tracking-tighter">
                              Equity - Large Cap
                            </span>
                          </div>
                        </td>
                        <td class="px-6 py-4 text-right">
                          <span class="text-sm font-medium text-slate-900">1,245.82</span>
                        </td>
                        <td class="px-6 py-4 text-right">
                          <span class="text-sm font-medium text-slate-600">₹382.12</span>
                        </td>
                        <td class="px-6 py-4 text-right">
                          <span class="text-sm font-bold text-slate-900">₹442.10</span>
                        </td>
                        <td class="px-6 py-4 text-right">
                          <span class="text-sm font-black text-slate-900">₹5,50,776</span>
                        </td>
                        <td class="px-6 py-4">
                          <div class="flex items-center justify-center gap-2">
                            <button class="px-3 py-1.5 text-xs font-bold text-primary border border-primary/20 rounded-md hover:bg-primary/5 transition-colors">
                              Buy More
                            </button>
                            <button class="px-3 py-1.5 text-xs font-bold text-error border border-error/20 rounded-md hover:bg-error/5 transition-colors">
                              Sell
                            </button>
                          </div>
                        </td>
                      </tr>
                      <tr class="hover:bg-slate-50/80 transition-colors">
                        <td class="px-6 py-4">
                          <div class="flex flex-col">
                            <span class="text-sm font-bold text-slate-900">
                              Precision Liquid Overnight Fund
                            </span>
                            <span class="text-[10px] w-fit mt-1 px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold uppercase tracking-tighter">
                              Debt - Liquid
                            </span>
                          </div>
                        </td>
                        <td class="px-6 py-4 text-right">
                          <span class="text-sm font-medium text-slate-900">4,500.00</span>
                        </td>
                        <td class="px-6 py-4 text-right">
                          <span class="text-sm font-medium text-slate-600">₹100.00</span>
                        </td>
                        <td class="px-6 py-4 text-right">
                          <span class="text-sm font-bold text-slate-900">₹104.56</span>
                        </td>
                        <td class="px-6 py-4 text-right">
                          <span class="text-sm font-black text-slate-900">₹4,70,520</span>
                        </td>
                        <td class="px-6 py-4">
                          <div class="flex items-center justify-center gap-2">
                            <button class="px-3 py-1.5 text-xs font-bold text-primary border border-primary/20 rounded-md hover:bg-primary/5 transition-colors">
                              Buy More
                            </button>
                            <button class="px-3 py-1.5 text-xs font-bold text-error border border-error/20 rounded-md hover:bg-error/5 transition-colors">
                              Sell
                            </button>
                          </div>
                        </td>
                      </tr>
                      <tr class="hover:bg-slate-50/80 transition-colors">
                        <td class="px-6 py-4">
                          <div class="flex flex-col">
                            <span class="text-sm font-bold text-slate-900">
                              Global Tech Growth ETF
                            </span>
                            <span class="text-[10px] w-fit mt-1 px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 font-bold uppercase tracking-tighter">
                              Thematic - Tech
                            </span>
                          </div>
                        </td>
                        <td class="px-6 py-4 text-right">
                          <span class="text-sm font-medium text-slate-900">842.15</span>
                        </td>
                        <td class="px-6 py-4 text-right">
                          <span class="text-sm font-medium text-slate-600">
                            ₹1,120.40
                          </span>
                        </td>
                        <td class="px-6 py-4 text-right">
                          <span class="text-sm font-bold text-slate-900">₹1,450.25</span>
                        </td>
                        <td class="px-6 py-4 text-right">
                          <span class="text-sm font-black text-slate-900">
                            ₹12,21,328
                          </span>
                        </td>
                        <td class="px-6 py-4">
                          <div class="flex items-center justify-center gap-2">
                            <button class="px-3 py-1.5 text-xs font-bold text-primary border border-primary/20 rounded-md hover:bg-primary/5 transition-colors">
                              Buy More
                            </button>
                            <button class="px-3 py-1.5 text-xs font-bold text-error border border-error/20 rounded-md hover:bg-error/5 transition-colors">
                              Sell
                            </button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div class="p-4 border-t border-slate-100 flex items-center justify-between">
                  <span class="text-xs font-medium text-slate-500">
                    Showing 1-10 of 24 holdings
                  </span>
                  <div class="flex items-center gap-1">
                    <button
                      class="w-8 h-8 flex items-center justify-center rounded border border-slate-200 text-slate-400 disabled:opacity-50"
                      disabled=""
                    >
                      <span class="material-symbols-outlined text-sm">chevron_left</span>
                    </button>
                    <button class="w-8 h-8 flex items-center justify-center rounded border border-primary bg-primary-container text-primary text-xs font-bold">
                      1
                    </button>
                    <button class="w-8 h-8 flex items-center justify-center rounded border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50">
                      2
                    </button>
                    <button class="w-8 h-8 flex items-center justify-center rounded border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50">
                      3
                    </button>
                    <button class="w-8 h-8 flex items-center justify-center rounded border border-slate-200 text-slate-400">
                      <span class="material-symbols-outlined text-sm">chevron_right</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>
            {/* <!-- SIPs Tab Content (Section 2 - Structure for visual completeness though not the active tab by default) --> */}
            <section class="mt-12 opacity-50 pointer-events-none filter grayscale">
              <div class="flex items-center gap-2 mb-4">
                <span class="material-symbols-outlined text-slate-400">
                  history_toggle_off
                </span>
                <h3 class="text-lg font-bold text-slate-400">SIP Management Preview</h3>
              </div>
              {/* <!-- Layout for SIP Content --> */}
              <div class="grid grid-cols-12 gap-6">
                <div class="col-span-8 bg-surface rounded-xl border border-slate-200 p-6">
                  <h4 class="font-bold text-slate-900 mb-6">Start a New SIP</h4>
                  <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-4">
                      <div>
                        <label class="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 block">
                          Fund Search
                        </label>
                        <div class="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-400">
                          Select Mutual Fund
                        </div>
                      </div>
                      <div>
                        <label class="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 block">
                          Monthly Amount (₹)
                        </label>
                        <div class="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-400">
                          ₹ 5,000
                        </div>
                      </div>
                    </div>
                    <div class="space-y-4">
                      <div class="grid grid-cols-2 gap-4">
                        <div>
                          <label class="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 block">
                            Start Date
                          </label>
                          <div class="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-400">
                            01/10/2023
                          </div>
                        </div>
                        <div>
                          <label class="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 block">
                            Returns (%)
                          </label>
                          <div class="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-400">
                            12%
                          </div>
                        </div>
                      </div>
                      <div>
                        <label class="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 block">
                          Duration
                        </label>
                        <div class="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-400">
                          10 Years
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="col-span-4 bg-primary-container rounded-xl p-6 border border-primary/10">
                  <h4 class="font-bold text-primary mb-6">Live Preview</h4>
                  <div class="space-y-4">
                    <div class="flex justify-between items-center">
                      <span class="text-xs font-medium text-on-primary-container">
                        Total Invested
                      </span>
                      <span class="text-sm font-black text-on-primary-container">
                        ₹6,00,000
                      </span>
                    </div>
                    <div class="flex justify-between items-center">
                      <span class="text-xs font-medium text-on-primary-container">
                        Future Value
                      </span>
                      <span class="text-lg font-black text-on-primary-container">
                        ₹11,50,000
                      </span>
                    </div>
                    <div class="pt-4 border-t border-primary/10">
                      <button class="w-full bg-primary text-white py-2 rounded-lg font-bold text-sm">
                        Start SIP
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>
        {/* <!-- Floating Helper (Mocking contextual awareness) --> */}
        <div class="fixed bottom-8 right-8 z-50">
          <button class="bg-slate-900 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform group">
            <span class="material-symbols-outlined">support_agent</span>
            <div class="absolute right-16 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Need Investment Advice?
            </div>
          </button>
        </div>
      </div>
    </>
  );
};

export default ManageFunds;
