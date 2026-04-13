const Investment = require("../models/Investment");
const User = require("../models/User");
const Goal = require("../models/Goal");
const SIP = require("../models/SIP");
const axios = require("axios");
const { simplifyCategory } = require("../services/portfolio.service");

exports.summary = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch All Data Concurrently
    const [investments, goalsCount, sipsCount, user] = await Promise.all([
      Investment.find({ userID: userId }),
      Goal.countDocuments({ userID: userId }),
      SIP.countDocuments({ userID: userId }),
      User.findById(userId).select("riskPreference"),
    ]);

    // Check for user investments
    if (investments.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          healthScore: 0,
          message:
            "You have no investments yet. Start investing to see your portfolio health score!",
        },
      });
    }

    // Set up your starting variables
    let totalInvested = 0;
    let totalCurrentValue = 0;
    let equityCurrentValue = 0;
    let totalExpenseWeight = 0;
    const uniqueCategories = new Set();
    let categoryAllocation = {};

    const processedFunds = await Promise.all(
      investments.map(async (inv) => {
        let currentNav = 0;
        let currentValue = inv.investedAmount; // Fallback in case API fails
        try {
          const response = await axios.get(
            `https://api.mfapi.in/mf/${inv.scheme_code}/latest`,
          );
          currentNav = parseFloat(response.data.data[0].nav);
          currentValue = currentNav * inv.units;
        } catch (error) {
          console.error(`Failed to fetch NAV for ${inv.scheme_code}`);
        }

        const unrealizedPL = currentValue - inv.investedAmount;
        const plPercentage = (unrealizedPL / inv.investedAmount) * 100;
        totalInvested += inv.investedAmount;
        totalCurrentValue += currentValue;

        const category = simplifyCategory(inv.scheme_category);
        uniqueCategories.add(category);

        // If this category doesn't exist in our object yet, start it at 0
        if (!categoryAllocation[category]) {
          categoryAllocation[category] = 0;
        }
        // Add this fund's current value to its category bucket
        categoryAllocation[category] += currentValue;

        if (category === "equity" || category === "index") {
          equityCurrentValue += inv.investedAmount;
        }
        const expenseRatio = inv.expenseRatio ? inv.expenseRatio : 1.0;
        totalExpenseWeight += inv.investedAmount * expenseRatio;

        return {
          code: inv.scheme_code,
          fundName: inv.scheme_name,
          category,
          currentNav,
          currentValue: currentValue.toFixed(2),
          unrealizedPL: unrealizedPL.toFixed(2),
          plPercentage: plPercentage.toFixed(2) + "%",
        };
      }),
    );

    const totalProfitLoss = totalCurrentValue - totalInvested;
    const totalPLPercentage = (totalProfitLoss / totalInvested) * 100;
    const equityPercentage = (equityCurrentValue / totalInvested) * 100;
    const weightedExpenseRatio = totalExpenseWeight / totalInvested;
    const categoryCount = uniqueCategories.size;

    // HEALTH SCORE (The 100 Points)
    let score = {
      diversification: 0,
      allocation: 0,
      riskMatch: 0,
      expenseRation: 0,
      goals: 0,
      sips: 0,
    };

    // Diversification (Max 30)
    if (categoryCount === 1) score.diversification = 5;
    if (categoryCount === 2) score.diversification = 15;
    if (categoryCount === 3) score.diversification = 25;
    if (categoryCount >= 4) score.diversification = 30;

    // Allocation Balance (Max 25)
    if (equityPercentage >= 40 && equityPercentage <= 70) score.allocation = 25;
    if (equityPercentage > 70 && equityPercentage <= 85) score.allocation = 18;
    if (equityPercentage < 40) score.allocation = 15;
    if (equityPercentage > 85) score.allocation = 10;

    // Risk Match (Max 15)
    const riskMap = { Conservative: 1, Moderate: 2, Aggressive: 3 };
    const userRisk = riskMap[user.riskPreference];
    let portfolioRisk = 2; // Default to Moderate
    if (equityPercentage < 40) portfolioRisk = 1;
    if (equityPercentage > 70) portfolioRisk = 3;

    const riskDifference = Math.abs(userRisk - portfolioRisk);
    if (riskDifference === 0) score.riskMatch = 15;
    else if (riskDifference === 1) score.riskMatch = 8;
    else if (riskDifference === 2) score.riskMatch = 3;

    // Expense Ratio (Max 10)
    if (weightedExpenseRatio <= 1.0 && weightedExpenseRatio >= 0.5)
      score.expenseRation = 8;
    if (weightedExpenseRatio < 0.5) score.expenseRation = 10;
    if (weightedExpenseRatio > 1.0) score.expenseRation = 5;

    // Goal Alignment (Max 10)
    if (goalsCount === 1) score.goals = 5;
    if (goalsCount >= 2) score.goals = 10;

    // SIP Consistency (Max 10)
    if (sipsCount === 1) score.sips = 5;
    if (sipsCount >= 2) score.sips = 10;

    // Calculate the Final Score
    const finalScore = Object.values(score).reduce((sum, val) => sum + val, 0);

    // Generate Actionable Tips
    const tips = [];
    if (equityPercentage > 85) {
      tips.push(
        "Your portfolio is heavily weighted in equity. Consider adding Debt funds for stability.",
        // Your portfolio is highly aggressive. Consider adding Debt funds for stability.
      );
    }
    if (equityPercentage < 40) {
      tips.push(
        "Your portfolio has low equity exposure. Consider adding Equity funds for growth potential.",
      );
    }
    if (weightedExpenseRatio > 1.0) {
      tips.push(
        "Your portfolio has a high weighted expense ratio. Consider switching to funds with lower expense ratios.",
      );
    }
    if (categoryCount === 1) {
      tips.push(
        "Your portfolio is concentrated in one category. Consider diversifying across more categories for better risk management.",
        // "Your investments are concentrated in one category. Add variety to reduce risk."
      );
    }
    if (goalsCount === 0) {
      tips.push(
        "You haven't linked your investments to any financial goals. Setting up goals can help you stay motivated and track your progress.",
        // "Link your investments to financial goals to stay motivated."
      );
    }
    if (sipsCount === 0) {
      tips.push(
        "You don't have any SIPs set up. Setting up a monthly SIP can help automate your wealth creation and take advantage of rupee cost averaging.",
        // "Set up a monthly SIP to automate your wealth creation."
      );
    }

    // Convert the object into an array of neatly formatted items for the Donut Chart
    const donutChartData = Object.keys(categoryAllocation).map((category) => {
      return {
        name: category, // e.g., "equity"
        value: categoryAllocation[category].toFixed(2), // e.g., "15000.00"
        percentage:
          ((categoryAllocation[category] / totalCurrentValue) * 100).toFixed(2) + "%",
      };
    });

    // last 5 transactions

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
          breakdown: score,
          tips: tips,
        },
        funds: processedFunds,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
