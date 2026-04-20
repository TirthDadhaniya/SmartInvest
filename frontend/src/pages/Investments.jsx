import React from "react";
import {
  MdOutlineDownload,
  MdOutlineSearch,
  MdOutlineFilterList,
  MdOutlineSort,
} from "react-icons/md";

const Investments = () => {
  return (
    <div className="bg-behind font-inter p-4 md:p-8 space-y-8 mx-auto w-full animate-in fade-in duration-300">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-t-primary mb-2">
            Investment Portfolio
          </h1>
          <p className="text-t-secondary font-medium">
            Real-time tracking of your active mutual funds and equity holdings.{" "}
          </p>
        </div>
        <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed border-none cursor-pointer">
          <MdOutlineDownload className="text-lg" />
          Export to CSV
        </button>
      </div>
      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-surface p-4 rounded-xl border border-border shadow-sm">
        <div className="relative w-full md:w-80">
          <MdOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-t-placeholder text-xl" />
          <input
            type="text"
            placeholder="Search funds..."
            // value={search}
            // onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-border rounded-lg pl-10 pr-4 py-2 text-sm outline-none focus:ring-1 focus:border-primary focus:ring-primary transition-all"
          />
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <MdOutlineFilterList className="text-t-secondary hidden sm:block" />
            <select
              // value={categoryFilter}
              // onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-white border border-border rounded-lg px-3 py-2 text-sm font-bold text-t-primary outline-none focus:border-primary transition-colors cursor-pointer"
            >
              <option>All</option>
              <option>Equity</option>
              <option>Debt</option>
              <option>Hybrid</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <MdOutlineSort className="text-t-secondary hidden sm:block" />
            <select
              // value={sortOrder}
              // onChange={(e) => setSortOrder(e.target.value)}
              className="bg-white border border-border rounded-lg px-3 py-2 text-sm font-bold text-t-primary outline-none focus:border-primary transition-colors cursor-pointer"
            >
              <option>Name (A-Z)</option>
              <option>Returns % (High to Low)</option>
              <option>Invested Amount (High to Low)</option>
              <option>Current Value (High to Low)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Fund Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="flex bg-slate-50 border-b border-slate-200 ">
          <div class="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-widest w-[22%]">
            Fund Name &amp; Category
          </div>
          <div class="py-4 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest w-[16%] text-right">
            Invested vs Current
          </div>
          <div class="py-4 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest w-[12%] text-right">
            Returns (%)
          </div>
          <div class="py-4 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest w-[12%] text-right">
            NAV &amp; Date
          </div>
          <div class="py-4 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest w-[15%] text-center">
            Break-Even
          </div>
          <div class="py-4 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest w-[15%] text-center">
            7-Day Trend
          </div>
          <div class="py-4 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest w-[13%] text-right">
            Actions
          </div>
        </div>
      </div>
      {/* <thead>
                <tr class="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                  
                </tr>
              </thead> */}
      {/* <tbody class="divide-y divide-slate-100 dark:divide-slate-800"> */}
      {/* <tr class="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors"></tr> */}
    </div>
  );
};

export default Investments;
