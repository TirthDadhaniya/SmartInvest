import React from "react";

const Dashboard = () => {
  return (
    <div className="p-4 md:p-8 space-y-8 max-w-[1200px] mx-auto w-full animate-in fade-in duration-300">
      {/* SIP Reminder Strip */}
      {nextSip && (
        <div className="bg-primary text-white p-4 rounded-xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-white/20 rounded-lg">
              <MdOutlineEventRepeat className="text-xl" />
            </div>
            <p className="text-sm font-medium">
              SIP Reminder: Your monthly investment is scheduled for{" "}
              <span className="font-bold">
                {new Date(nextSip.nextDueDate).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
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
      )}

      {/* Summary Cards + Asset Allocation */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left: Summary Metrics */}
        <div className="col-span-12 lg:col-span-8 grid grid-cols-2 gap-6">
          <div className="bg-surface p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
            <p className="text-[10px] uppercase tracking-widest text-t-secondary font-bold mb-1">
              TOTAL INVESTED
            </p>
            <h3 className="text-2xl font-bold text-t-primary">
              {formatINR(totalInvested)}
            </h3>
          </div>
          <div className="bg-surface p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
            <p className="text-[10px] uppercase tracking-widest text-t-secondary font-bold mb-1">
              CURRENT VALUE
            </p>
            <h3 className="text-2xl font-bold text-t-primary">
              {formatINR(totalCurrentValue)}
            </h3>
            <div className="mt-3 flex items-center gap-2 text-blue-700 text-[12px] font-bold">
              <MdOutlinePieChart className="text-sm" /> Portfolio active
            </div>
          </div>
          <div className="bg-surface p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
            <p className="text-[10px] uppercase tracking-widest text-t-secondary font-bold mb-1">
              PROFIT/LOSS
            </p>
            <div className="flex items-baseline gap-2">
              <h3
                className={`text-2xl font-bold ${isProfit ? "text-positive" : "text-negative"}`}
              >
                {isProfit ? "+" : ""}
                {formatINR(totalProfitLoss)}
              </h3>
              <span
                className={`text-sm font-bold px-2 py-0.5 rounded-full ${isProfit ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}
              >
                {isProfit ? "+" : ""}
                {formatPercent(totalReturnPercent)}
              </span>
            </div>
          </div>
          <div className="bg-surface p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
            <p className="text-[10px] uppercase tracking-widest text-t-secondary font-bold mb-1">
              HEALTH SCORE
            </p>
            <div className="flex items-center gap-4">
              <h3 className="text-2xl font-bold text-t-primary">
                {healthScore}
                <span className="text-slate-400 font-normal text-lg">/100</span>
              </h3>
              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${healthScore > 70 ? "bg-green-500" : healthScore > 40 ? "bg-amber-500" : "bg-red-500"}`}
                  style={{ width: `${healthScore}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Asset Allocation Donut */}
        <div className="col-span-12 lg:col-span-4 bg-surface p-6 rounded-xl border border-border shadow-sm">
          <p className="text-[10px] uppercase tracking-widest text-t-secondary font-bold mb-6">
            ASSET ALLOCATION
          </p>
          {pieData.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-t-placeholder h-40">
              <MdOutlinePieChart className="text-4xl mb-2 opacity-50" />
              <p className="font-medium text-sm">No data</p>
            </div>
          ) : (
            <>
              <div className="relative w-40 h-40 mx-auto mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                      isAnimationActive={true}
                      animationDuration={800}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-xs text-t-secondary uppercase font-bold tracking-tight">
                    Equity
                  </p>
                  <p className="text-xl font-black text-t-primary">
                    {Math.round(assetAllocation.equity)}%
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                {pieData.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center text-[12px]"
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: item.color }}
                      ></span>{" "}
                      {item.name}
                    </span>
                    <span className="font-bold">
                      {formatINR((item.value / 100) * totalCurrentValue)}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Risk Banner */}
      <div
        className={`p-6 rounded-xl text-white flex items-center justify-between bg-gradient-to-r ${riskBg} relative overflow-hidden`}
      >
        <div>
          <p className="text-[10px] uppercase tracking-widest text-white/60 font-bold mb-1">
            RISK PROFILE
          </p>
          <h3 className="text-xl font-bold">
            {riskLevel === "High"
              ? "Moderately Aggressive"
              : riskLevel === "Low"
                ? "Conservative"
                : "Balanced"}
          </h3>
          <p className="text-sm text-white/80 mt-1 max-w-md">{riskText}</p>
        </div>
        <MdOutlineShield className="text-[48px] text-white/20" />
      </div>

      {/* Stress Test + Silent Fee Cost Row */}
      <div className="grid grid-cols-12 gap-6">
        {/* STRESS TEST CARD */}
        <div className="col-span-12 lg:col-span-8 bg-surface p-6 rounded-xl border border-border shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <p className="text-[10px] uppercase tracking-widest text-t-secondary font-bold">
              PORTFOLIO STRESS TEST
            </p>
            <MdOutlineWarning className="text-amber-500 text-xl" />
          </div>
          {stressData && stressData.scenarios ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Moderate */}
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg">
                  <p className="text-[12px] font-bold text-amber-900 mb-2">
                    {stressData.scenarios.moderate?.label || "Moderate Correction (-25%)"}
                  </p>
                  <div className="flex items-end justify-between">
                    <div className="space-y-1">
                      <p className="text-[10px] text-amber-700 uppercase font-bold">
                        Projected Value
                      </p>
                      <p className="text-xl font-black text-amber-900">
                        {formatINR(stressData.scenarios.moderate?.portfolioValue || 0)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 line-through">
                        {formatINR(stressData.totalCurrentValue)}
                      </p>
                      <p className="text-xs font-bold text-red-500">
                        -{formatINR(stressData.scenarios.moderate?.estimatedLoss || 0)}
                      </p>
                    </div>
                  </div>
                </div>
                {/* Severe */}
                <div className="p-4 bg-orange-50 border border-orange-100 rounded-lg">
                  <p className="text-[12px] font-bold text-orange-900 mb-2">
                    {stressData.scenarios.severe?.label || "Severe Crash (-40%)"}
                  </p>
                  <div className="flex items-end justify-between">
                    <div className="space-y-1">
                      <p className="text-[10px] text-orange-700 uppercase font-bold">
                        Projected Value
                      </p>
                      <p className="text-xl font-black text-orange-900">
                        {formatINR(stressData.scenarios.severe?.portfolioValue || 0)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 line-through">
                        {formatINR(stressData.totalCurrentValue)}
                      </p>
                      <p className="text-xs font-bold text-red-500">
                        -{formatINR(stressData.scenarios.severe?.estimatedLoss || 0)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <p className="mt-4 text-[10px] text-slate-400 italic">
                Disclaimer: These scenarios are based on historical index volatility and
                are not guaranteed projections of future returns.
              </p>
            </>
          ) : (
            <div className="text-center py-8 text-t-secondary text-sm">
              Add investments to see stress test analysis.
            </div>
          )}
        </div>

        {/* SILENT FEE COST CARD */}
        <div className="col-span-12 lg:col-span-4 bg-surface p-6 rounded-xl border border-border shadow-sm">
          <p className="text-[10px] uppercase tracking-widest text-t-secondary font-bold mb-4">
            SILENT FEE COST
          </p>
          {expenseInfo ? (
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center relative">
                  <MdOutlineTrendingDown className="text-slate-400 text-xl" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">
                    Annual Drain
                  </p>
                  <p className="text-lg font-bold text-t-primary">
                    {formatINR(expenseInfo.annualExpenseCost)}
                  </p>
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                <p className="text-[10px] uppercase font-bold text-t-secondary mb-1">
                  10-Year Opportunity Cost
                </p>
                <p className="text-2xl font-black text-red-500">
                  {formatINR(expenseInfo.tenYearOpportunityCost)}
                </p>
                <p className="text-[10px] text-slate-400 mt-2">
                  Based on weighted average expense ratio of{" "}
                  {expenseInfo.weightedExpenseRatio}%
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-t-secondary text-sm">
              No expense data available.
            </div>
          )}
        </div>
      </div>

      {/* Bottom Grid: Transactions + Right Column (What-If, Goals, Tips) */}
      <div className="grid grid-cols-12 gap-6">
        {/* RECENT TRANSACTIONS */}
        <div className="col-span-12 lg:col-span-8 bg-surface rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border flex justify-between items-center">
            <p className="text-[10px] uppercase tracking-widest text-t-secondary font-bold">
              RECENT TRANSACTIONS
            </p>
            <Link
              to="/transactions"
              className="text-[12px] font-bold text-primary hover:underline no-underline"
            >
              View All
            </Link>
          </div>
          {transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-t-placeholder">
              <MdOutlineShoppingCart className="text-4xl mb-2 opacity-50" />
              <span className="text-xs font-bold text-t-secondary">
                No transactions recorded yet.
              </span>
            </div>
          ) : (
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
                {transactions.slice(0, 5).map((tx) => (
                  <tr key={tx._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(tx.date).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-t-primary truncate max-w-[200px]">
                        {tx.fundName}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {tx.schemeCode} • {tx.type === "buy" ? "Purchase" : "Redemption"}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${tx.type === "buy" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-t-primary">
                      {formatINR(tx.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* RIGHT COLUMN: Quick What-If + Goal Gaps + Tips */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* QUICK WHAT-IF WIDGET */}
          <div className="bg-slate-50 p-6 rounded-xl border border-border relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-[10px] uppercase tracking-widest text-primary font-bold mb-3">
                QUICK WHAT-IF
              </p>
              {quickWhatIf ? (
                <p className="text-[13px] leading-relaxed text-slate-700 mb-4">
                  If you had invested{" "}
                  <span className="font-bold">{formatINR(quickWhatIf.amount)}</span> in
                  your best performing fund (
                  {quickWhatIf.fundName?.split(" ").slice(0, 3).join(" ")}) 1 year ago, it
                  would be worth{" "}
                  <span className="text-primary font-bold">
                    {formatINR(quickWhatIf.currentValue)}
                  </span>{" "}
                  today.
                </p>
              ) : (
                <p className="text-[13px] text-slate-500 mb-4">
                  Add investments to see historical insights.
                </p>
              )}
              <button
                onClick={() => navigate("/investments")}
                className="w-full bg-primary text-white py-2 rounded-lg text-sm font-bold hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 border-none cursor-pointer"
              >
                Try Simulator <MdOutlineTrendingUp className="text-lg" />
              </button>
            </div>
            <MdOutlineTrendingUp className="absolute -bottom-4 -right-4 text-slate-200 text-8xl opacity-30 select-none group-hover:scale-110 transition-transform" />
          </div>

          {/* GOAL GAP ALERTS */}
          <div className="bg-surface p-6 rounded-xl border border-border shadow-sm">
            <p className="text-[10px] uppercase tracking-widest text-t-secondary font-bold mb-4">
              FINANCIAL GOALS
            </p>
            {goalGaps.length === 0 ? (
              <div className="text-center py-4 text-t-secondary text-sm">
                <Link
                  to="/profile"
                  className="text-primary font-bold hover:underline no-underline"
                >
                  Set your first goal →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {goalGaps.slice(0, 3).map((goal) => (
                  <div
                    key={goal._id}
                    className={`p-3 rounded-lg ${goal.gapStatus === "on_track" ? "bg-slate-50" : "bg-red-50/50 border border-red-100"}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-[12px] font-bold text-t-primary">{goal.name}</p>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tight ${
                          goal.gapStatus === "on_track"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {goal.gapStatus === "on_track" ? "On Track" : "Behind Schedule"}
                      </span>
                    </div>
                    <p
                      className={`text-[10px] font-medium ${goal.gapStatus === "on_track" ? "text-slate-500" : "text-red-600"}`}
                    >
                      {goal.gapStatus === "on_track"
                        ? goal.gapMessage
                            ?.replace(/^.*?(\d)/, "$1")
                            .replace(/At your current.*?,\s*/, "") ||
                          `Projected to complete ahead of schedule.`
                        : `Need ${formatINR(goal.extraSIPNeeded)}/month extra to close gap.`}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* DIVERSIFICATION TIPS */}
          <div className="bg-amber-50/50 p-6 rounded-xl border border-amber-100">
            <div className="flex items-center gap-2 mb-3">
              <MdOutlineWarning className="text-amber-600 text-xl" />
              <p className="text-[10px] uppercase tracking-widest text-amber-800 font-bold">
                DIVERSIFICATION TIPS
              </p>
            </div>
            <ul className="space-y-3">
              {tips.map((tip, idx) => (
                <li key={idx} className="text-[12px] text-slate-700 flex gap-2">
                  <span className="text-amber-500 font-bold">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
