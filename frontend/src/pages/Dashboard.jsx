import React from "react";

const Dashboard = () => {
  return (
    <>
      <div class="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 antialiased font-display">
        <div class="flex min-h-screen">
          {/* <!-- Persistent Sidebar (240px) --> */}
          <aside class="w-[240px] flex-shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col fixed h-full z-20">
            <div class="p-6 flex items-center gap-3">
              <div class="bg-primary size-8 rounded flex items-center justify-center text-white">
                <span class="material-symbols-outlined">account_balance_wallet</span>
              </div>
              <h1 class="text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                SmartInvest
              </h1>
            </div>
            <nav class="flex-1 px-4 space-y-1">
              <a
                class="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary font-medium"
                href="#"
              >
                <span class="material-symbols-outlined">dashboard</span>
                <span class="text-sm">Dashboard</span>
              </a>
              <a
                class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                href="#"
              >
                <span class="material-symbols-outlined">pie_chart</span>
                <span class="text-sm">Portfolio</span>
              </a>
              <a
                class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                href="#"
              >
                <span class="material-symbols-outlined">trending_up</span>
                <span class="text-sm">Market</span>
              </a>
              <a
                class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                href="#"
              >
                <span class="material-symbols-outlined">calendar_today</span>
                <span class="text-sm">SIPs</span>
              </a>
              <a
                class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                href="#"
              >
                <span class="material-symbols-outlined">history</span>
                <span class="text-sm">Transactions</span>
              </a>
            </nav>
            <div class="p-4 border-t border-slate-200 dark:border-slate-800">
              <div class="flex items-center gap-3 px-2 py-3">
                <div
                  class="size-10 rounded-full bg-slate-200 dark:bg-slate-700 bg-center bg-cover"
                  data-alt="User profile avatar portrait"
                  style='
                background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuBIGdRyYs_Ior6MMq5cYZJgns3FyDXPYnqOm58wmzyI7w_UZmZ7K_S99aqEs0O-SfNPltHi4orcILTVAmxFaEhjh31aKnGMBClp_8RNB3q5_pjxrPjd0O0twLtHp_lbN5Nt92FiGy6N8d16NiCZhOKeVLB5QssQ6p3TV9zGHTdjqjqgEEEwDxschY-PF2p8TtByDzDjAdS8c9G55bccohNDRs3sHwBV2QNN8fW8J5oLbINL_ZIoXHickBXjpycEG80Xe_1iyPuhbEHc");
              '
                ></div>
                <div class="flex flex-col min-w-0">
                  <p class="text-sm font-semibold truncate">Alex Rivera</p>
                  <p class="text-xs text-slate-500 truncate">Premium Member</p>
                </div>
                <span class="material-symbols-outlined text-slate-400 ml-auto text-sm">
                  settings
                </span>
              </div>
            </div>
          </aside>
          {/* Main Content Area */}
          <main class="flex-1 ml-[240px]">
            {/* Top Navbar */}
            <header class="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 h-16 flex items-center justify-between px-8">
              <div class="flex items-center gap-4">
                <h2 class="text-lg font-bold">Overview</h2>
                <div class="h-4 w-px bg-slate-200 dark:bg-slate-800"></div>
                <div class="flex items-center gap-2">
                  <span class="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                    Net Worth
                  </span>
                  <span class="text-lg font-bold text-primary">$52,140.50</span>
                  <span class="text-xs font-bold text-green-600 bg-green-100 px-1.5 py-0.5 rounded">
                    +15.3%
                  </span>
                </div>
              </div>
              <div class="flex items-center gap-6">
                <div class="relative w-64">
                  <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                    search
                  </span>
                  <input
                    class="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-lg pl-10 text-sm focus:ring-2 focus:ring-primary/20"
                    placeholder="Search assets..."
                    type="text"
                  />
                </div>
                <button class="bg-primary text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-primary/90 transition-all flex items-center gap-2">
                  <span class="material-symbols-outlined text-sm">add</span> Add Funds
                </button>
                <div class="relative">
                  <span class="material-symbols-outlined text-slate-500">
                    notifications
                  </span>
                  <div class="absolute -top-1 -right-1 size-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></div>
                </div>
              </div>
            </header>
            <div class="p-8 space-y-8 max-w-[1200px] mx-auto">
              {/* Row of 4 summary cards */}
              <div class="grid grid-cols-4 gap-6">
                <div class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <p class="text-slate-500 text-sm font-medium">Total Invested</p>
                  <p class="text-2xl font-bold mt-1">$45,200.00</p>
                  <div class="mt-4 flex items-center gap-1 text-slate-400 text-xs">
                    <span class="material-symbols-outlined text-xs">info</span> All time
                    principal
                  </div>
                </div>
                <div class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <p class="text-slate-500 text-sm font-medium">Current Value</p>
                  <p class="text-2xl font-bold mt-1 text-primary">$52,140.50</p>
                  <div class="mt-4 flex items-center gap-1 text-green-600 text-xs font-bold">
                    <span class="material-symbols-outlined text-xs">trending_up</span>{" "}
                    +15.3% growth
                  </div>
                </div>
                <div class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <p class="text-slate-500 text-sm font-medium">Unrealized P/L</p>
                  <p class="text-2xl font-bold mt-1 text-green-600">+$6,940.50</p>
                  <div class="mt-4 flex items-center gap-1 text-green-600 text-xs font-bold">
                    <span class="material-symbols-outlined text-xs">call_made</span>{" "}
                    +18.2% CAGR
                  </div>
                </div>
                <div class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <p class="text-slate-500 text-sm font-medium">Portfolio Health</p>
                  <p class="text-2xl font-bold mt-1">92/100</p>
                  <div class="mt-4 h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      class="h-full bg-green-500 rounded-full"
                      style="width: 92%"
                    ></div>
                  </div>
                </div>
              </div>
              {/* Allocation and Risk Row */}
              <div class="grid grid-cols-12 gap-6">
                {/* Allocation Donut Area */}
                <div class="col-span-8 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div class="flex items-center justify-between mb-6">
                    <h3 class="font-bold text-slate-800 dark:text-white">
                      Asset Allocation
                    </h3>
                    <select class="text-xs bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded p-1">
                      <option>Current Portfolio</option>
                      <option>Historical</option>
                    </select>
                  </div>
                  <div class="flex items-center gap-12">
                    <div class="relative size-48">
                      <svg class="size-full" viewbox="0 0 36 36">
                        <path
                          class="text-slate-100 dark:text-slate-800"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="4"
                        ></path>
                        {/* <!-- Equity 60% --> */}
                        <path
                          class="text-primary"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="currentColor"
                          stroke-dasharray="60, 100"
                          stroke-linecap="round"
                          stroke-width="4"
                        ></path>
                        {/* <!-- Debt 25% --> */}
                        <path
                          class="text-indigo-400"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="currentColor"
                          stroke-dasharray="25, 100"
                          stroke-dashoffset="-60"
                          stroke-linecap="round"
                          stroke-width="4"
                        ></path>
                        {/* <!-- Gold 15% --> */}
                        <path
                          class="text-yellow-500"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="currentColor"
                          stroke-dasharray="15, 100"
                          stroke-dashoffset="-85"
                          stroke-linecap="round"
                          stroke-width="4"
                        ></path>
                      </svg>
                      <div class="absolute inset-0 flex flex-col items-center justify-center">
                        <span class="text-2xl font-bold">100%</span>
                        <span class="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">
                          Invested
                        </span>
                      </div>
                    </div>
                    <div class="flex-1 grid grid-cols-2 gap-4">
                      <div class="flex items-center gap-3">
                        <div class="size-3 rounded-full bg-primary"></div>
                        <div class="flex flex-col">
                          <span class="text-xs text-slate-500">Equity</span>
                          <span class="text-sm font-bold">60% ($31,284)</span>
                        </div>
                      </div>
                      <div class="flex items-center gap-3">
                        <div class="size-3 rounded-full bg-indigo-400"></div>
                        <div class="flex flex-col">
                          <span class="text-xs text-slate-500">Debt</span>
                          <span class="text-sm font-bold">25% ($13,035)</span>
                        </div>
                      </div>
                      <div class="flex items-center gap-3">
                        <div class="size-3 rounded-full bg-yellow-500"></div>
                        <div class="flex flex-col">
                          <span class="text-xs text-slate-500">Gold</span>
                          <span class="text-sm font-bold">15% ($7,821)</span>
                        </div>
                      </div>
                      <div class="flex items-center gap-3">
                        <div class="size-3 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                        <div class="flex flex-col">
                          <span class="text-xs text-slate-500">Cash</span>
                          <span class="text-sm font-bold">0% ($0)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Risk Banner Column */}
                <div class="col-span-4 flex flex-col gap-6">
                  <div class="flex-1 bg-gradient-to-br from-primary to-indigo-700 p-6 rounded-xl text-white relative overflow-hidden">
                    <div class="relative z-10">
                      <h3 class="text-lg font-bold mb-2">Risk Appetite</h3>
                      <p class="text-sm opacity-80 mb-6 leading-relaxed">
                        Your current profile is Moderately Aggressive. Optimized for
                        12-15% annual returns.
                      </p>
                      <div class="bg-white/10 backdrop-blur-md rounded-lg p-4 flex items-center justify-between">
                        <div>
                          <p class="text-[10px] uppercase font-bold tracking-widest opacity-60">
                            Risk Score
                          </p>
                          <p class="text-xl font-bold">7.4 / 10</p>
                        </div>
                        <button class="bg-white text-primary text-xs font-bold px-3 py-1.5 rounded-lg">
                          Retest
                        </button>
                      </div>
                    </div>
                    <span class="material-symbols-outlined absolute -bottom-4 -right-4 text-9xl opacity-10">
                      shield
                    </span>
                  </div>
                </div>
              </div>
              {/* <!-- Upcoming SIP Strip --> */}
              <div class="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30 rounded-xl p-4 flex items-center justify-between">
                <div class="flex items-center gap-4">
                  <div class="bg-white dark:bg-slate-800 size-12 rounded-lg shadow-sm flex items-center justify-center text-indigo-600">
                    <span class="material-symbols-outlined">event_repeat</span>
                  </div>
                  <div>
                    <p class="text-sm font-bold text-slate-800 dark:text-white">
                      Next SIP Payment: Sep 05, 2023
                    </p>
                    <p class="text-xs text-slate-500">
                      Scheduled for 4 funds totaling{" "}
                      <span class="font-bold text-primary">$850.00</span>
                    </p>
                  </div>
                </div>
                <div class="flex gap-2">
                  <button class="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors">
                    Edit Plan
                  </button>
                  <button class="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors">
                    Skip Next
                  </button>
                </div>
              </div>
              {/* Widget Grid */}
              <div class="grid grid-cols-3 gap-6">
                <div class="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <h4 class="font-bold mb-4 text-sm flex items-center gap-2">
                    <span class="material-symbols-outlined text-primary text-sm">
                      stars
                    </span>{" "}
                    Top Performers
                  </h4>
                  <div class="space-y-4">
                    <div class="flex items-center justify-between">
                      <span class="text-xs font-medium truncate max-w-[120px]">
                        Vanguard S&amp;P 500
                      </span>
                      <span class="text-xs font-bold text-green-600">+22.4%</span>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-xs font-medium truncate max-w-[120px]">
                        Apple Inc (AAPL)
                      </span>
                      <span class="text-xs font-bold text-green-600">+18.1%</span>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-xs font-medium truncate max-w-[120px]">
                        Gold Spot (XAU)
                      </span>
                      <span class="text-xs font-bold text-green-600">+14.2%</span>
                    </div>
                  </div>
                </div>
                <div class="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <h4 class="font-bold mb-4 text-sm flex items-center gap-2">
                    <span class="material-symbols-outlined text-primary text-sm">
                      warning
                    </span>{" "}
                    Underperformers
                  </h4>
                  <div class="space-y-4">
                    <div class="flex items-center justify-between">
                      <span class="text-xs font-medium truncate max-w-[120px]">
                        Emerging Mkts ETF
                      </span>
                      <span class="text-xs font-bold text-red-500">-3.2%</span>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-xs font-medium truncate max-w-[120px]">
                        Real Estate Trust
                      </span>
                      <span class="text-xs font-bold text-red-500">-1.5%</span>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-xs font-medium truncate max-w-[120px]">
                        Bond Ladder II
                      </span>
                      <span class="text-xs font-bold text-red-500">-0.4%</span>
                    </div>
                  </div>
                </div>
                <div class="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center items-center text-center">
                  <div class="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
                    <span class="material-symbols-outlined">rocket_launch</span>
                  </div>
                  <h4 class="font-bold text-sm mb-1">New Investment Ideas</h4>
                  <p class="text-xs text-slate-500 mb-4">
                    Based on your risk score, explore AI picked stocks.
                  </p>
                  <button class="w-full py-2 bg-slate-100 dark:bg-slate-800 text-xs font-bold rounded-lg hover:bg-slate-200 transition-colors">
                    Explore
                  </button>
                </div>
              </div>
              {/* Recent Transactions Table */}
              <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div class="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <h3 class="font-bold text-slate-800 dark:text-white">
                    Recent Transactions
                  </h3>
                  <button class="text-primary text-xs font-bold hover:underline">
                    View All History
                  </button>
                </div>
                <div class="overflow-x-auto">
                  <table class="w-full text-left border-collapse">
                    <thead>
                      <tr class="bg-slate-50 dark:bg-slate-800/50">
                        <th class="px-6 py-3 text-xs font-bold text-slate-500 uppercase">
                          Asset / Type
                        </th>
                        <th class="px-6 py-3 text-xs font-bold text-slate-500 uppercase">
                          Date
                        </th>
                        <th class="px-6 py-3 text-xs font-bold text-slate-500 uppercase">
                          Amount
                        </th>
                        <th class="px-6 py-3 text-xs font-bold text-slate-500 uppercase">
                          Status
                        </th>
                        <th class="px-6 py-3 text-xs font-bold text-slate-500 uppercase text-right">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                      <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td class="px-6 py-4">
                          <div class="flex items-center gap-3">
                            <div class="size-8 rounded bg-primary/10 flex items-center justify-center text-primary">
                              <span class="material-symbols-outlined text-sm">
                                shopping_cart
                              </span>
                            </div>
                            <div class="flex flex-col">
                              <span class="text-sm font-bold">Vanguard S&amp;P 500</span>
                              <span class="text-[10px] text-slate-500">
                                Buy Order • Equity
                              </span>
                            </div>
                          </div>
                        </td>
                        <td class="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                          Aug 28, 2023
                        </td>
                        <td class="px-6 py-4 text-sm font-bold">$1,200.00</td>
                        <td class="px-6 py-4">
                          <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            Completed
                          </span>
                        </td>
                        <td class="px-6 py-4 text-right">
                          <button class="material-symbols-outlined text-slate-400 hover:text-slate-600">
                            more_horiz
                          </button>
                        </td>
                      </tr>
                      <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td class="px-6 py-4">
                          <div class="flex items-center gap-3">
                            <div class="size-8 rounded bg-primary/10 flex items-center justify-center text-primary">
                              <span class="material-symbols-outlined text-sm">
                                shopping_cart
                              </span>
                            </div>
                            <div class="flex flex-col">
                              <span class="text-sm font-bold">Microsoft Corp (MSFT)</span>
                              <span class="text-[10px] text-slate-500">
                                Buy Order • Stock
                              </span>
                            </div>
                          </div>
                        </td>
                        <td class="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                          Aug 25, 2023
                        </td>
                        <td class="px-6 py-4 text-sm font-bold">$450.00</td>
                        <td class="px-6 py-4">
                          <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            Completed
                          </span>
                        </td>
                        <td class="px-6 py-4 text-right">
                          <button class="material-symbols-outlined text-slate-400 hover:text-slate-600">
                            more_horiz
                          </button>
                        </td>
                      </tr>
                      <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td class="px-6 py-4">
                          <div class="flex items-center gap-3">
                            <div class="size-8 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                              <span class="material-symbols-outlined text-sm">sell</span>
                            </div>
                            <div class="flex flex-col">
                              <span class="text-sm font-bold">Emerging Markets ETF</span>
                              <span class="text-[10px] text-slate-500">
                                Sell Order • Equity
                              </span>
                            </div>
                          </div>
                        </td>
                        <td class="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                          Aug 20, 2023
                        </td>
                        <td class="px-6 py-4 text-sm font-bold">$2,100.00</td>
                        <td class="px-6 py-4">
                          <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                            Pending
                          </span>
                        </td>
                        <td class="px-6 py-4 text-right">
                          <button class="material-symbols-outlined text-slate-400 hover:text-slate-600">
                            more_horiz
                          </button>
                        </td>
                      </tr>
                      <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td class="px-6 py-4">
                          <div class="flex items-center gap-3">
                            <div class="size-8 rounded bg-primary/10 flex items-center justify-center text-primary">
                              <span class="material-symbols-outlined text-sm">
                                shopping_cart
                              </span>
                            </div>
                            <div class="flex flex-col">
                              <span class="text-sm font-bold">iShares Core Debt</span>
                              <span class="text-[10px] text-slate-500">
                                Buy Order • Debt
                              </span>
                            </div>
                          </div>
                        </td>
                        <td class="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                          Aug 15, 2023
                        </td>
                        <td class="px-6 py-4 text-sm font-bold">$800.00</td>
                        <td class="px-6 py-4">
                          <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            Completed
                          </span>
                        </td>
                        <td class="px-6 py-4 text-right">
                          <button class="material-symbols-outlined text-slate-400 hover:text-slate-600">
                            more_horiz
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
