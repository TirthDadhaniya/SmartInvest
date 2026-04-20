import React from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  MdOutlineEventRepeat,
  MdOutlineInfo,
  MdOutlineTrendingUp,
  MdOutlineCallMade,
  MdShield,
  MdOutlineWarning,
  MdOutlineLeakAdd,
  // MdOutlinePieChart,
  // MdOutlineAccountBalanceWallet,
  // MdOutlinePerson,
  // MdOutlineMail,
  // MdOutlineLock,
  // MdOutlineCall,
  // MdLockOutline,
  // MdArrowForward,
  // MdOutlineArrowForward,
  // MdOutlineVerifiedUser,
  // MdOutlineEnhancedEncryption,
  // MdOutlineGppGood,
  // MdOutlineInfo,
} from "react-icons/md";
import { FaShieldHalved } from "react-icons/fa6";

import Card from "../components/Card";

const Dashboard = () => {
  return (
    <>
      <div className="bg-behind font-inter p-4 md:p-8 space-y-8 mx-auto w-full animate-in fade-in duration-300">
        {/* SIP Reminder Strip */}
        {/* {nextSip && ()} */}
        <div className="bg-primary text-white p-4 rounded-xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-white/20 rounded-lg">
              <MdOutlineEventRepeat className="text-xl" />
            </div>
            <p className="text-sm font-medium">
              SIP Reminder: Your monthly investment is scheduled for{" "}
              <span className="font-bold">
                {/* {new Date(nextSip.nextDueDate).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })} */}
              </span>
              .
            </p>
          </div>
          <Link
            to="/manage"
            className="text-xs font-bold uppercase tracking-widest bg-white text-primary px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors no-underline"
          >
            Adjust Amount
          </Link>
        </div>

        {/* Upcoming SIP Strip */}
        <div className="bg-indigo-50  border border-indigo-100  rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white  size-12 rounded-lg shadow-sm flex items-center justify-center text-indigo-600">
              <MdOutlineEventRepeat />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 ">
                Next SIP Payment: Sep 05, 2023
              </p>
              <p className="text-xs text-slate-500">
                Scheduled for 4 funds totaling{" "}
                <span className="font-bold text-primary">$850.00</span>
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">
              Edit Plan
            </button>
            <button className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors">
              Skip Next
            </button>
          </div>
        </div>

        {/* Summary Cards*/}
        <div className="grid grid-cols-4 gap-6 font-inter">
          <Card
            title="Total Invested"
            value="$45,200.00"
            description="All time principal"
            icon={MdOutlineInfo}
          />
          <Card
            title="Current Value"
            value="$52,140.50"
            description="+15.3% growth"
            icon={MdOutlineTrendingUp}
          />
          <Card
            title="Unrealized P/L"
            value="+$6,940.50"
            description="+18.2% CAGR"
            icon={MdOutlineCallMade}
          />

          <div className="bg-surface p-6 rounded-card border border-border  shadow-sm">
            <p className="text-slate-500 text-sm font-medium">Portfolio Health</p>
            <p className="text-2xl font-bold mt-1">92/100</p>
            <div className="mt-4 h-1.5 w-full bg-slate-100  rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full"
                style={{ width: "92%" }}
              ></div>
            </div>
          </div>
        </div>

        {/* Allocation and Risk Row */}
        <div className="grid grid-cols-12 gap-6">
          {/* Allocation Donut Area */}
          <div className="col-span-8 bg-surface p-6 rounded-xl border border-border shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-inter font-bold text-t-primary ">Asset Allocation</h3>
              <select className="text-xs bg-slate-50 border-slate-200 rounded p-1">
                <option>Current Portfolio</option>
                <option>Historical</option>
              </select>
            </div>
            <div className="flex items-center gap-12">
              <div className="relative size-48">
                <svg className="size-full" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100 "
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></path>
                  {/* Equity 60% */}
                  <path
                    className="text-primary"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeDasharray="60, 100"
                    strokeLinecap="round"
                    strokeWidth="4"
                  ></path>
                  {/* Debt 25% */}
                  <path
                    className="text-indigo-400"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeDasharray="25, 100"
                    strokeDashoffset="-60"
                    strokeLinecap="round"
                    strokeWidth="4"
                  ></path>
                  {/* Gold 15% */}
                  <path
                    className="text-yellow-500"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeDasharray="15, 100"
                    strokeDashoffset="-85"
                    strokeLinecap="round"
                    strokeWidth="4"
                  ></path>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold">100%</span>
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">
                    Invested
                  </span>
                </div>
              </div>
              <div className="flex-1 grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="size-3 rounded-full bg-primary"></div>
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-500">Equity</span>
                    <span className="text-sm font-bold">60% ($31,284)</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="size-3 rounded-full bg-indigo-400"></div>
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-500">Debt</span>
                    <span className="text-sm font-bold">25% ($13,035)</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="size-3 rounded-full bg-yellow-500"></div>
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-500">Gold</span>
                    <span className="text-sm font-bold">15% ($7,821)</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="size-3 rounded-full bg-slate-200 "></div>
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-500">Cash</span>
                    <span className="text-sm font-bold">0% ($0)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Risk Banner Column */}
          <div className="col-span-4 flex flex-col gap-6">
            <div className="flex-1 bg-gradient-to-br from-primary to-indigo-700 p-6 rounded-xl text-white relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-lg font-bold mb-2">Risk Appetite</h3>
                <p className="text-sm opacity-80 mb-6 leading-relaxed">
                  Your current profile is Moderately Aggressive. Optimized for 12-15%
                  annual returns.
                </p>
                <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-widest opacity-60">
                      Risk Score
                    </p>
                    <p className="text-xl font-bold">7.4 / 10</p>
                  </div>
                  <button className="bg-white text-primary text-xs font-bold px-3 py-1.5 rounded-lg">
                    Retest
                  </button>
                </div>
              </div>
              <MdShield className="absolute -bottom-4 -right-4 text-9xl opacity-10" />
            </div>
          </div>
        </div>

        {/* RISK & STRESS TEST SECTION */}
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12">
            <div className="bg-gradient-to-r from-blue-700 to-indigo-700 p-6 rounded-xl text-white flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-blue-200 font-bold mb-1">
                  RISK PROFILE
                </p>
                <h3 className="text-xl font-bold">Moderately Aggressive</h3>
                <p className="text-sm text-blue-100 mt-1 max-w-md">
                  Your portfolio is optimized for long-term capital appreciation with
                  significant equity exposure.
                </p>
              </div>
              <div className="flex gap-2">
                <FaShieldHalved className="text-[48px] opacity-20" />
              </div>
            </div>
          </div>

          {/* STRESS TEST CARD */}
          <div className="col-span-8 bg-white p-6 rounded-xl border border-border shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                PORTFOLIO STRESS TEST
              </p>
              <MdOutlineWarning className="text-amber-500" />
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg">
                <p className="text-[12px] font-bold text-amber-900 mb-2">
                  Moderate Correction (-25%)
                </p>
                <div className="flex items-end justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] text-amber-700 uppercase font-bold">
                      Projected Value
                    </p>
                    <p className="text-xl font-black text-amber-900">₹39,105</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 line-through">₹52,140</p>
                    <p className="text-xs font-bold text-error">-₹13,035</p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-orange-50 border border-orange-100 rounded-lg">
                <p className="text-[12px] font-bold text-orange-900 mb-2">
                  Severe Crash (-40%)
                </p>
                <div className="flex items-end justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] text-orange-700 uppercase font-bold">
                      Projected Value
                    </p>
                    <p className="text-xl font-black text-orange-900">₹31,284</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 line-through">₹52,140</p>
                    <p className="text-xs font-bold text-error">-₹20,856</p>
                  </div>
                </div>
              </div>
            </div>
            <p className="mt-4 text-[10px] text-slate-400 italic">
              Disclaimer: These scenarios are based on historical index volatility and are
              not guaranteed projections of future returns.
            </p>
          </div>
          {/* SILENT FEE COST */}
          <div className="col-span-4 bg-white p-6 rounded-xl border border-border shadow-sm overflow-hidden">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-4">
              SILENT FEE COST
            </p>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center relative">
                  <MdOutlineLeakAdd className="text-slate-400" />
                  <div className="absolute bottom-0 left-0 w-full h-1/2 bg-error/20 rounded-b-full"></div>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">
                    Annual Drain
                  </p>
                  <p className="text-lg font-bold text-slate-900">₹650.00</p>
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">
                  10-Year Opportunity Cost
                </p>
                <p className="text-2xl font-black text-error">₹8,450.00</p>
                <p className="text-[10px] text-slate-400 mt-2">
                  Based on weighted average expense ratio of 1.25%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM GRID: TRANSACTIONS & GOALS */}
        <div className="grid grid-cols-12 gap-6">
          {/* RECENT TRANSACTIONS */}
          <div className="col-span-8 bg-white rounded-xl border border-border shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                RECENT TRANSACTIONS
              </p>
              <button className="text-[12px] font-bold text-primary hover:underline">
                View All
              </button>
            </div>
            <table className="w-full text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Date
                  </th>
                  <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Instrument
                  </th>
                  <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Type
                  </th>
                  <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 text-right">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="px-6 py-4 text-sm text-slate-600">Aug 28, 2023</td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-900">
                      Vanguard S&amp;P 500 ETF
                    </p>
                    <p className="text-[10px] text-slate-400">VOO • Equity</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold px-2 py-1 rounded bg-green-50 text-green-700 uppercase">
                      Buy
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-slate-900">
                    ₹5,000.00
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-slate-600">Aug 15, 2023</td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-900">
                      BlackRock Core Bond
                    </p>
                    <p className="text-[10px] text-slate-400">BND • Debt</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold px-2 py-1 rounded bg-green-50 text-green-700 uppercase">
                      Buy
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-slate-900">
                    ₹2,500.00
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-slate-600">Aug 05, 2023</td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-900">SBI Bluechip Fund</p>
                    <p className="text-[10px] text-slate-400">SIP • Equity</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold px-2 py-1 rounded bg-green-50 text-green-700 uppercase">
                      Buy
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-slate-900">
                    ₹10,000.00
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          {/* RIGHT COLUMN: GOALS & WHAT-IF */}
          <div className="col-span-4 space-y-6">
            {/* WHAT-IF WIDGET */}
            <div className="bg-surface-variant p-6 rounded-xl border border-outline relative overflow-hidden group">
              <div className="relative z-10">
                <p className="text-[10px] uppercase tracking-widest text-primary font-bold mb-3">
                  QUICK WHAT-IF
                </p>
                <p className="text-[13px] leading-relaxed text-slate-700 mb-4">
                  If you had invested <span className="font-bold">₹10,000</span> in your
                  best performing fund (Vanguard S&amp;P 500) 1 year ago, it would be
                  worth
                  <span className="text-primary font-bold">₹12,240</span> today.
                </p>
                <button className="w-full bg-primary text-white py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                  Try Simulator
                  <span className="material-symbols-outlined text-[18px]">bolt</span>
                </button>
              </div>
              <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-slate-200 text-8xl opacity-30 select-none group-hover:scale-110 transition-transform">
                insights
              </span>
            </div>
            {/* GOAL GAP ALERT */}
            <div className="bg-white p-6 rounded-xl border border-outline shadow-sm">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-4">
                FINANCIAL GOALS
              </p>
              <div className="space-y-4">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-[12px] font-bold text-slate-900">
                      Retirement 2045
                    </p>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-green-100 text-green-700 uppercase tracking-tighter">
                      On Track
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Projected to complete 4 months early.
                  </p>
                </div>
                <div className="p-3 bg-error/5 border border-error/10 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-[12px] font-bold text-slate-900">Education</p>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-error-container text-on-error-container uppercase tracking-tighter">
                      Behind Schedule
                    </span>
                  </div>
                  <p className="text-[10px] text-error font-medium">
                    Need ₹5,000/month extra to close gap.
                  </p>
                </div>
              </div>
            </div>
            {/* DIVERSIFICATION TIPS */}
            <div className="bg-amber-50/50 p-6 rounded-xl border border-amber-100">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-amber-600 text-[20px]">
                  lightbulb
                </span>
                <p className="text-[10px] uppercase tracking-widest text-amber-800 font-bold">
                  DIVERSIFICATION TIPS
                </p>
              </div>
              <ul className="space-y-3">
                <li className="text-[12px] text-slate-700 flex gap-2">
                  <span className="text-amber-500 font-bold">•</span>
                  You are overweight in US Tech (42% of Equity). Consider rebalancing into
                  Emerging Markets.
                </li>
                <li className="text-[12px] text-slate-700 flex gap-2">
                  <span className="text-amber-500 font-bold">•</span>
                  Liquid cash is 15% above target. Opportunity to increase SIP by 5%.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
