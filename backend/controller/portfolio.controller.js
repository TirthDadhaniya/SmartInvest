const User = require("../models/User");
const Goal = require("../models/Goal");
const SIP = require("../models/SIP");
const portfolioService = require("../services/portfolio.service");
const calcService = require("../services/calculation.service");
const axios = require("axios");

/**
 * Provides a comprehensive summary of the user's portfolio.
 * GET /api/portfolio/summary
 */
exports.summary = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch All Data Concurrently for speed
    const [stats, goalsCount, sipsCount, user] = await Promise.all([
      portfolioService.getPortfolioStats(userId),
      Goal.countDocuments({ userID: userId }),
      SIP.countDocuments({ userID: userId }),
      User.findById(userId).select("riskPreference").lean(),
    ]);

    const { totalInvested, totalCurrentValue, investments } = stats;

    if (investments.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          financials: {
            netWorth: "0.00",
            totalInvested: "0.00",
            totalProfitLoss: "0.00",
            totalPLPercentage: "0.00%",
          },
          health: {
            score: 0,
            metrics: {
              equityAllocation: "0.00%",
              weightedExpenseRatio: "0.00%",
              categoriesFound: [],
              allocationChart: [],
            },
            breakdown: {},
            tips: ["Add investments to see your portfolio analysis."],
          },
          funds: [],
          message: "You have no investments yet.",
        },
      });
    }

    let equityCurrentValue = 0;
    let totalExpenseWeight = 0;
    const categoryAllocation = {};
    const uniqueCategories = new Set();

    const processedFunds = investments.map((inv) => {
      const category = portfolioService.simplifyCategory(inv.scheme_category);
      uniqueCategories.add(category);
      
      categoryAllocation[category] = (categoryAllocation[category] || 0) + inv.currentValue;

      if (category === "equity" || category === "index") {
        equityCurrentValue += inv.currentValue;
      }
      
      const expenseRatio = inv.expenseRatio || 1.0;
      totalExpenseWeight += inv.investedAmount * expenseRatio;

      const unrealizedPL = inv.currentValue - inv.investedAmount;
      const plPercentage = (unrealizedPL / inv.investedAmount) * 100;

      return {
        code: inv.scheme_code,
        fundName: inv.scheme_name,
        category,
        currentNav: inv.currentNav,
        currentValue: inv.currentValue.toFixed(2),
        unrealizedPL: unrealizedPL.toFixed(2),
        plPercentage: plPercentage.toFixed(2) + "%",
      };
    });

    const totalProfitLoss = totalCurrentValue - totalInvested;
    const totalPLPercentage = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;
    const equityPercentage = totalCurrentValue > 0 ? (equityCurrentValue / totalCurrentValue) * 100 : 0;
    const weightedExpenseRatio = totalInvested > 0 ? totalExpenseWeight / totalInvested : 0;
    const categoryCount = uniqueCategories.size;

    // HEALTH SCORE (0-100)
    let scoreBreakdown = { diversification: 0, allocation: 0, riskMatch: 0, expenseRatio: 0, goals: 0, sips: 0 };

    // 1. Diversification (Max 30)
    if (categoryCount === 1) scoreBreakdown.diversification = 5;
    else if (categoryCount === 2) scoreBreakdown.diversification = 15;
    else if (categoryCount === 3) scoreBreakdown.diversification = 25;
    else if (categoryCount >= 4) scoreBreakdown.diversification = 30;

    // 2. Allocation Balance (Max 25)
    if (equityPercentage >= 40 && equityPercentage <= 70) scoreBreakdown.allocation = 25;
    else if (equityPercentage > 70 && equityPercentage <= 85) scoreBreakdown.allocation = 18;
    else if (equityPercentage < 40) scoreBreakdown.allocation = 15;
    else if (equityPercentage > 85) scoreBreakdown.allocation = 10;

    // 3. Risk Match (Max 15)
    const riskMap = { Conservative: 1, Moderate: 2, Aggressive: 3 };
    const userRisk = riskMap[user?.riskPreference] || 2;
    let portfolioRisk = 2; 
    if (equityPercentage < 40) portfolioRisk = 1;
    if (equityPercentage > 70) portfolioRisk = 3;

    const riskDifference = Math.abs(userRisk - portfolioRisk);
    if (riskDifference === 0) scoreBreakdown.riskMatch = 15;
    else if (riskDifference === 1) scoreBreakdown.riskMatch = 8;
    else if (riskDifference === 2) scoreBreakdown.riskMatch = 3;

    // 4. Expense Ratio (Max 10)
    if (weightedExpenseRatio <= 1.0 && weightedExpenseRatio >= 0.5) scoreBreakdown.expenseRatio = 8;
    else if (weightedExpenseRatio < 0.5) scoreBreakdown.expenseRatio = 10;
    else scoreBreakdown.expenseRatio = 5;

    // 5. Goal Alignment (Max 10)
    scoreBreakdown.goals = goalsCount >= 2 ? 10 : (goalsCount === 1 ? 5 : 0);

    // 6. SIP Consistency (Max 10)
    scoreBreakdown.sips = sipsCount >= 2 ? 10 : (sipsCount === 1 ? 5 : 0);

    const finalScore = Object.values(scoreBreakdown).reduce((sum, val) => sum + val, 0);

    // 7. Actionable Tips
    const tips = [];
    if (equityPercentage > 85) tips.push("Your portfolio is heavily weighted in equity. Consider adding Debt funds for stability.");
    if (equityPercentage < 40) tips.push("Your portfolio has low equity exposure. Consider adding Equity funds for growth potential.");
    if (weightedExpenseRatio > 1.0) tips.push("Your portfolio has a high weighted expense ratio. Consider switching to funds with lower expense ratios.");
    if (categoryCount === 1) tips.push("Your portfolio is concentrated in one category. Consider diversifying across more categories.");
    if (goalsCount === 0) tips.push("Link your investments to financial goals to stay motivated.");
    if (sipsCount === 0) tips.push("Set up a monthly SIP to automate your wealth creation.");

    const donutChartData = Object.keys(categoryAllocation).map((cat) => ({
      name: cat,
      value: categoryAllocation[cat].toFixed(2),
      percentage: ((categoryAllocation[cat] / totalCurrentValue) * 100).toFixed(2) + "%",
    }));

    res.status(200).json({
      success: true,
      data: {
        financials: {
          netWorth: totalCurrentValue.toFixed(2),
          totalInvested: totalInvested.toFixed(2),
          totalProfitLoss: totalProfitLoss.toFixed(2),
          totalPLPercentage: totalPLPercentage.toFixed(2) + "%",
        },
        health: {
          score: finalScore,
          metrics: {
            equityAllocation: equityPercentage.toFixed(2) + "%",
            weightedExpenseRatio: weightedExpenseRatio.toFixed(2) + "%",
            categoriesFound: Array.from(uniqueCategories),
            allocationChart: donutChartData,
          },
          breakdown: scoreBreakdown,
          tips: tips,
        },
        funds: processedFunds,
      },
    });
  } catch (error) {
    console.error("[Portfolio Summary Error]", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Calculates LTCG tax estimates and after-tax returns.
 * GET /api/portfolio/tax-analysis
 */
exports.getTaxAnalysis = async (req, res) => {
  try {
    const stats = await portfolioService.getPortfolioStats(req.user._id);
    if (stats.investments.length === 0) {
      return res.json({ 
        success: true, 
        data: { taxInfo: calcService.calculateLTCGTax(0), investments: [] } 
      });
    }

    const taxInfo = calcService.calculateLTCGTax(stats.totalProfitLoss);

    const investmentsWithTax = stats.investments.map((inv) => {
      let proportionalTax = 0;
      if (stats.totalProfitLoss > 0 && inv.profitLoss > 0) {
        proportionalTax = (inv.profitLoss / stats.totalProfitLoss) * taxInfo.estimatedTax;
      }
      return {
        ...inv,
        estimatedTax: proportionalTax,
        afterTaxProfit: inv.profitLoss - proportionalTax,
        afterTaxReturn: ((inv.profitLoss - proportionalTax) / inv.investedAmount) * 100,
      };
    });

    res.json({
      success: true,
      data: {
        taxInfo,
        totalInvested: stats.totalInvested,
        totalCurrentValue: stats.totalCurrentValue,
        netReturnAfterTax: taxInfo.netProfitAfterTax,
        netReturnPercentAfterTax: stats.totalInvested > 0 ? (taxInfo.netProfitAfterTax / stats.totalInvested) * 100 : 0,
        investments: investmentsWithTax,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Calculates break-even NAVs considering exit loads.
 * GET /api/portfolio/break-even
 */
exports.getBreakEven = async (req, res) => {
  try {
    const stats = await portfolioService.getPortfolioStats(req.user._id);
    const data = stats.investments.map((inv) => {
      const be = calcService.calculateBreakEvenNAV(inv.purchaseNAV, inv.scheme_category, inv.purchaseDate);
      return {
        _id: inv._id,
        scheme_code: inv.scheme_code,
        scheme_name: inv.scheme_name,
        scheme_category: inv.scheme_category,
        purchaseNAV: inv.purchaseNAV,
        currentNAV: inv.currentNav,
        breakEvenNAV: be.breakEvenNAV,
        exitLoadPct: be.exitLoadPct,
        holdingDays: be.holdingDays,
        isAboveBreakEven: inv.currentNav >= be.breakEvenNAV,
        marginFromBreakEven: ((inv.currentNav - be.breakEvenNAV) / be.breakEvenNAV) * 100,
      };
    });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Simulates historical returns for a fund and amount.
 * POST /api/portfolio/what-if
 */
exports.getWhatIf = async (req, res) => {
  try {
    const { scheme_code, amount, date } = req.body;
    if (!scheme_code || !amount || !date) {
      return res.status(400).json({ success: false, message: "scheme_code, amount, and date are required" });
    }

    const response = await axios.get(`https://api.mfapi.in/mf/${scheme_code}`);
    const mfData = response.data;
    if (!mfData.data || mfData.data.length === 0) {
      return res.status(404).json({ success: false, message: "Fund data not found" });
    }

    const targetDate = new Date(date);
    const history = mfData.data;
    let purchaseNAV = null;
    
    // Find first available NAV on or before target date
    for (let i = 0; i < history.length; i++) {
      const [d, m, y] = history[i].date.split("-");
      if (new Date(`${y}-${m}-${d}`) <= targetDate) {
        purchaseNAV = parseFloat(history[i].nav);
        break;
      }
    }

    if (!purchaseNAV) {
      return res.status(400).json({ success: false, message: "No NAV data available for that date" });
    }

    const currentNAV = parseFloat(history[0].nav);
    const units = amount / purchaseNAV;
    const currentValue = units * currentNAV;
    const yearsDiff = calcService.getYearsBetween(targetDate, new Date());
    const annualReturn = calcService.calculateCAGR(amount, currentValue, yearsDiff);

    res.json({
      success: true,
      data: {
        scheme_code,
        scheme_name: mfData.meta?.scheme_name || "Unknown",
        amount,
        investmentDate: date,
        purchaseNAV,
        currentNAV,
        units,
        currentValue,
        profit: currentValue - amount,
        absoluteReturn: ((currentValue - amount) / amount) * 100,
        annualizedReturn: annualReturn * 100,
        holdingDays: Math.floor(yearsDiff * 365.25),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Returns a quick 1-year historical simulation for the user's best fund.
 * GET /api/portfolio/quick-what-if
 */
exports.getQuickWhatIf = async (req, res) => {
  try {
    const stats = await portfolioService.getPortfolioStats(req.user._id, { includeHistory: true });
    if (stats.investments.length === 0) return res.json({ success: true, data: null });

    // Identify best performing fund
    const bestFund = stats.investments.reduce((prev, current) => 
      (prev.plPercentage > current.plPercentage) ? prev : current
    );

    const fundHistory = stats.fullDataMap[bestFund.scheme_code]?.data;
    if (!fundHistory) return res.json({ success: true, data: null });

    const amount = 10000;
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    let pastNAV = null;
    for (let i = 0; i < fundHistory.length; i++) {
      const [d, m, y] = fundHistory[i].date.split("-");
      if (new Date(`${y}-${m}-${d}`) <= oneYearAgo) {
        pastNAV = parseFloat(fundHistory[i].nav);
        break;
      }
    }

    if (!pastNAV) return res.json({ success: true, data: null });

    const currentNAV = parseFloat(fundHistory[0].nav);
    const currentValue = (amount / pastNAV) * currentNAV;

    res.json({
      success: true,
      data: {
        scheme_name: bestFund.scheme_name,
        scheme_code: bestFund.scheme_code,
        amount,
        currentValue: Math.round(currentValue),
        profit: Math.round(currentValue - amount),
        returnPercent: Math.round(((currentValue - amount) / amount) * 10000) / 100,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Returns gap analysis for all user goals (projected vs target).
 * GET /api/portfolio/goal-gaps
 */
exports.getGoalGaps = async (req, res) => {
  try {
    const goals = await Goal.find({ userID: req.user._id }).lean();
    if (goals.length === 0) return res.json({ success: true, data: [] });

    const stats = await portfolioService.getPortfolioStats(req.user._id);
    const now = new Date();
    const holdingYears = calcService.getYearsBetween(stats.earliestInvestmentDate, now);
    const annualReturn = calcService.calculateCAGR(stats.totalInvested, stats.totalCurrentValue, holdingYears);
    const annualReturnPct = annualReturn * 100;

    const goalsWithGap = goals.map((goal) => {
      const monthsRemaining = calcService.getMonthsBetween(now, goal.targetDate);
      const projectedValue = stats.totalCurrentValue * Math.pow(1 + annualReturn / 12, monthsRemaining);
      const gap = goal.targetAmount - projectedValue;
      const progressPercent = Math.min(100, (stats.totalCurrentValue / goal.targetAmount) * 100);

      let extraSIPNeeded = gap > 0 
        ? calcService.calculateRequiredSIP(gap, monthsRemaining, annualReturnPct > 0 ? annualReturnPct : 12) 
        : 0;
      
      return {
        ...goal,
        progressPercent,
        projectedValue: Math.round(projectedValue),
        gap: Math.max(0, Math.round(gap)),
        gapStatus: gap <= 0 ? "on_track" : "behind",
        gapMessage: gap <= 0 
          ? `On track! Goal is reachable within ${monthsRemaining} months.` 
          : `Projected short by ₹${Math.round(gap).toLocaleString("en-IN")}. Extra SIP needed: ₹${Math.round(extraSIPNeeded).toLocaleString("en-IN")}/mo.`,
        extraSIPNeeded: Math.round(extraSIPNeeded),
        monthsRemaining
      };
    });

    res.json({ success: true, data: goalsWithGap });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Simulates portfolio value under market correction scenarios.
 * GET /api/portfolio/stress-test
 */
exports.getStressTest = async (req, res) => {
  try {
    const stats = await portfolioService.getPortfolioStats(req.user._id);
    if (stats.investments.length === 0) {
      return res.json({ success: true, data: { totalCurrentValue: 0, scenarios: {} } });
    }

    let moderateTotalLoss = 0;
    let severeTotalLoss = 0;

    const investmentStress = stats.investments.map(inv => {
      const stressDrop = calcService.getStressDrop(inv.scheme_category);
      moderateTotalLoss += inv.currentValue * stressDrop;
      severeTotalLoss += inv.currentValue * Math.min(1, stressDrop * 1.6);
      return {
        scheme_name: inv.scheme_name,
        scheme_category: inv.scheme_category,
        currentValue: Math.round(inv.currentValue),
        assumedDrop: stressDrop * 100
      };
    });

    res.json({
      success: true,
      data: {
        totalCurrentValue: Math.round(stats.totalCurrentValue),
        scenarios: {
          moderate: { 
            label: "Moderate Correction", 
            estimatedLoss: Math.round(moderateTotalLoss), 
            portfolioValue: Math.round(stats.totalCurrentValue - moderateTotalLoss), 
            lossPct: (moderateTotalLoss / stats.totalCurrentValue) * 100 
          },
          severe: { 
            label: "Severe Crash", 
            estimatedLoss: Math.round(severeTotalLoss), 
            portfolioValue: Math.round(stats.totalCurrentValue - severeTotalLoss), 
            lossPct: (severeTotalLoss / stats.totalCurrentValue) * 100 
          },
        },
        investments: investmentStress
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Returns annual and 10-year opportunity cost of fund expenses.
 * GET /api/portfolio/expense-drain
 */
exports.getExpenseDrain = async (req, res) => {
  try {
    const stats = await portfolioService.getPortfolioStats(req.user._id);
    if (stats.investments.length === 0) {
      return res.json({ success: true, data: { totalCurrentValue: 0, annualCost: 0 } });
    }

    const investmentDetails = stats.investments.map(inv => {
      const er = inv.expenseRatio > 0 ? inv.expenseRatio : calcService.getDefaultExpenseRatio(inv.scheme_category);
      return {
        scheme_name: inv.scheme_name,
        currentValue: Math.round(inv.currentValue),
        expenseRatio: er,
        annualCost: (inv.currentValue * er) / 100
      };
    });

    const annualCost = (stats.totalCurrentValue * stats.weightedExpenseRatio) / 100;

    res.json({
      success: true,
      data: {
        totalCurrentValue: Math.round(stats.totalCurrentValue),
        weightedExpenseRatio: Math.round(stats.weightedExpenseRatio * 100) / 100,
        annualCost: Math.round(annualCost),
        tenYearCost: Math.round(annualCost * 10),
        investments: investmentDetails
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Returns a graded assessment of the user's portfolio.
 * GET /api/portfolio/report-card
 */
exports.getReportCard = async (req, res) => {
  try {
    const userId = req.user._id;
    const [stats, goals, sips] = await Promise.all([
      portfolioService.getPortfolioStats(userId),
      Goal.find({ userID: userId }).lean(),
      SIP.find({ userID: userId }).lean(),
    ]);

    if (stats.investments.length === 0) {
      return res.json({ success: true, data: { overallGrade: "N/A" } });
    }

    const reportCard = calcService.calculateReportCard(stats, goals, sips, req.user.riskPreference);

    res.json({
      success: true,
      data: reportCard
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
