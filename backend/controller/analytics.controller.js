const SIP = require("../models/SIP");
const Goal = require("../models/Goal");
const axios = require("axios");
const portfolioService = require("../services/portfolio.service");
const calcService = require("../services/calculation.service");
const { getYearsBetween, getMonthsBetween } = require("../utils/date");

// 1. POST-TAX RETURNS — GET /api/analytics/tax-analysis
exports.getTaxAnalysis = async (req, res) => {
  try {
    const stats = await portfolioService.getPortfolioStats(req.user._id);
    if (stats.investments.length === 0) {
      return res.json({ success: true, data: { taxInfo: calcService.calculateLTCGTax(0), investments: [] } });
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

// 2. BREAK-EVEN NAV — GET /api/analytics/break-even
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

// 3. WHAT-IF SIMULATOR — POST /api/analytics/what-if
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
    for (let i = 0; i < history.length; i++) {
      const [d, m, y] = history[i].date.split("-");
      if (new Date(`${y}-${m}-${d}`) <= targetDate) {
        purchaseNAV = parseFloat(history[i].nav);
        break;
      }
    }

    if (!purchaseNAV) {
      return res.status(400).json({ success: false, message: "No NAV data available for date" });
    }

    const currentNAV = parseFloat(history[0].nav);
    const units = amount / purchaseNAV;
    const currentValue = units * currentNAV;
    const yearsDiff = getYearsBetween(targetDate, new Date());
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

// 4. DASHBOARD QUICK WHAT-IF — GET /api/analytics/quick-what-if
exports.getQuickWhatIf = async (req, res) => {
  try {
    const stats = await portfolioService.getPortfolioStats(req.user._id, { includeHistory: true });
    if (stats.investments.length === 0) return res.json({ success: true, data: null });

    const bestFund = stats.investments.reduce((prev, current) => (prev.plPercentage > current.plPercentage) ? prev : current);
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

// 5. GOAL GAP ALERT — GET /api/analytics/goal-gaps
exports.getGoalGaps = async (req, res) => {
  try {
    const goals = await Goal.find({ userID: req.user._id });
    if (goals.length === 0) return res.json({ success: true, data: [] });

    const stats = await portfolioService.getPortfolioStats(req.user._id);
    const now = new Date();
    const holdingYears = getYearsBetween(stats.earliestInvestmentDate, now);
    const annualReturn = calcService.calculateCAGR(stats.totalInvested, stats.totalCurrentValue, holdingYears);
    const annualReturnPct = annualReturn * 100;

    const goalsWithGap = goals.map((goal) => {
      const monthsRemaining = getMonthsBetween(now, goal.targetDate);
      const projectedValue = stats.totalCurrentValue * Math.pow(1 + annualReturn / 12, monthsRemaining);
      const gap = goal.targetAmount - projectedValue;
      const progressPercent = Math.min(100, (stats.totalCurrentValue / goal.targetAmount) * 100);

      let extraSIPNeeded = gap > 0 ? calcService.calculateRequiredSIP(gap, monthsRemaining, annualReturnPct > 0 ? annualReturnPct : 12) : 0;
      
      return {
        ...goal.toObject(),
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

// 6. PORTFOLIO STRESS TEST — GET /api/analytics/stress-test
exports.getStressTest = async (req, res) => {
  try {
    const stats = await portfolioService.getPortfolioStats(req.user._id);
    if (stats.investments.length === 0) return res.json({ success: true, data: { totalCurrentValue: 0, scenarios: {} } });

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
          moderate: { label: "Moderate Correction", estimatedLoss: Math.round(moderateTotalLoss), portfolioValue: Math.round(stats.totalCurrentValue - moderateTotalLoss), lossPct: (moderateTotalLoss / stats.totalCurrentValue) * 100 },
          severe: { label: "Severe Crash", estimatedLoss: Math.round(severeTotalLoss), portfolioValue: Math.round(stats.totalCurrentValue - severeTotalLoss), lossPct: (severeTotalLoss / stats.totalCurrentValue) * 100 },
        },
        investments: investmentStress
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 7. EXPENSE RATIO DRAIN — GET /api/analytics/expense-drain
exports.getExpenseDrain = async (req, res) => {
  try {
    const stats = await portfolioService.getPortfolioStats(req.user._id);
    if (stats.investments.length === 0) return res.json({ success: true, data: { totalCurrentValue: 0, annualCost: 0 } });

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

// 8. PORTFOLIO REPORT CARD — GET /api/analytics/report-card
exports.getReportCard = async (req, res) => {
  try {
    const [stats, goals, sips] = await Promise.all([
      portfolioService.getPortfolioStats(req.user._id),
      Goal.find({ userID: req.user._id }),
      SIP.find({ userID: req.user._id }),
    ]);

    if (stats.investments.length === 0) return res.json({ success: true, data: { overallGrade: "N/A" } });

    const reportCard = calcService.calculateReportCard(stats, goals, sips, req.user.riskPreference);

    res.json({
      success: true,
      data: reportCard
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
