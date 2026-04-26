import React, { useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { AuthContext } from './auth-context';
import { PortfolioContext } from './portfolio-context';

export const PortfolioProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  
  const [portfolioData, setPortfolioData] = useState({
    totalCurrentValue: 0,
    totalInvested: 0,
    totalProfitLoss: 0,
    unrealizedProfit: 0,
    realizedProfit: 0,
    totalProfit: 0,
    totalReturnPercent: 0,
    rawData: null,
    loading: false,
    error: null,
    notifications: []
  });

  const fetchPortfolio = async () => {
    if (!user) {
      setPortfolioData({
        totalCurrentValue: 0,
        totalInvested: 0,
        totalProfitLoss: 0,
        unrealizedProfit: 0,
        realizedProfit: 0,
        totalProfit: 0,
        totalReturnPercent: 0,
        rawData: null,
        loading: false,
        error: null,
        notifications: []
      });
      return;
    }

    setPortfolioData((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const [res, drainRes] = await Promise.all([
        api.get("/api/portfolio/summary"),
        api.get("/api/portfolio/expense-drain").catch(() => null),
      ]);

      // Adapted to new SmartInvest backend response shape
      const payload = res.data.data;
      const drainData = drainRes?.data?.success ? drainRes.data.data : null;

      if (!payload) {
        throw new Error("Invalid portfolio data received");
      }

      // If financials is missing, it's an empty portfolio
      const financials = payload.financials || {
        totalInvested: 0,
        netWorth: 0,
        totalProfitLoss: 0,
        unrealizedProfit: 0,
        realizedProfit: 0,
        totalProfit: 0,
        totalReturnPercent: 0,
        totalPLPercentage: 0,
      };

      const totalInvested = parseFloat(financials.totalInvested) || 0;
      const totalCurrentValue =
        parseFloat(financials.totalCurrentValue) || parseFloat(financials.netWorth) || 0;
      const unrealizedProfit =
        parseFloat(financials.unrealizedProfit) ||
        parseFloat(financials.totalCurrentValue) - totalInvested ||
        0;
      const realizedProfit = parseFloat(financials.realizedProfit) || 0;
      const totalProfit =
        parseFloat(financials.totalProfit) || parseFloat(financials.totalProfitLoss) || 0;
      const totalProfitLoss =
        parseFloat(financials.totalProfitLoss) || unrealizedProfit;
      const totalReturnPercent =
        parseFloat(financials.totalReturnPercent) || parseFloat(financials.totalPLPercentage) || 0;
      const weightedExpRatio =
        drainData?.weightedExpenseRatio ||
        parseFloat(payload.health?.metrics?.weightedExpenseRatio) ||
        0;

      // Connecting expense cost with backend data
      const annualExpenseCost =
        drainData?.annualCost || totalInvested * (weightedExpRatio / 100);
      const tenYearOpportunityCost =
        drainData?.tenYearCost || annualExpenseCost * 10 * 1.5;

      const mappedData = {
        totalInvested: totalInvested,
        totalCurrentValue,
        unrealizedProfit,
        realizedProfit,
        totalProfit,
        totalProfitLoss,
        totalReturnPercent,

        categoryAllocation:
          payload.health?.metrics?.allocationChart?.map((item) => ({
            name: item.name,
            percent: parseFloat(item.percentage) || 0,
            value: parseFloat(item.value) || 0,
          })) || [],

        assetAllocation: {
          equity:
            parseFloat(
              payload.health?.metrics?.allocationChart?.find(
                (i) => i.name.toLowerCase() === "equity",
              )?.percentage,
            ) || 0,
          debt:
            parseFloat(
              payload.health?.metrics?.allocationChart?.find(
                (i) => i.name.toLowerCase() === "debt",
              )?.percentage,
            ) || 0,
          hybrid:
            parseFloat(
              payload.health?.metrics?.allocationChart?.find(
                (i) => i.name.toLowerCase() === "hybrid",
              )?.percentage,
            ) || 0,
        },

        healthScore: payload.health?.score || 0,
        investments: payload.funds || [],
        tips: payload.health?.tips || [],

        expenseInfo: {
          weightedExpenseRatio: weightedExpRatio,
          annualExpenseCost: annualExpenseCost,
          tenYearOpportunityCost: tenYearOpportunityCost,
        },
      };

      // TASK 5: Generate Notifications from tips
      const generatedNotifications = (mappedData.tips || []).map((tip, idx) => ({
        id: `tip-${Date.now()}-${idx}`,
        text: tip,
        isRead: false,
        timestamp: new Date().toISOString(),
        type: "tip"
      }));

      setPortfolioData({
        totalCurrentValue: mappedData.totalCurrentValue,
        totalInvested: mappedData.totalInvested,
        totalProfitLoss: mappedData.totalProfitLoss,
        unrealizedProfit: mappedData.unrealizedProfit,
        realizedProfit: mappedData.realizedProfit,
        totalProfit: mappedData.totalProfit,
        totalReturnPercent: mappedData.totalReturnPercent,
        rawData: mappedData,
        loading: false,
        error: null,
        notifications: generatedNotifications
      });
    } catch (err) {
      console.error("Portfolio fetch error:", err);
      const message =
        err.response?.status === 401
          ? "Session expired. Please login again."
          : err.response?.data?.message || "Failed to fetch portfolio summary.";

      setPortfolioData((prev) => ({
        ...prev,
        loading: false,
        error: message,
      }));
    }
  };

  useEffect(() => {
    fetchPortfolio();
    // eslint-disable-next-line
  }, [user]);

  return (
    <PortfolioContext.Provider value={{ ...portfolioData, fetchPortfolio }}>
      {children}
    </PortfolioContext.Provider>
  );
};
