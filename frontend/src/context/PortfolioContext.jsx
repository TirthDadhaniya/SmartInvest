import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { AuthContext } from './AuthContext';

export const PortfolioContext = createContext();

export const PortfolioProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  
  const [portfolioData, setPortfolioData] = useState({
    totalCurrentValue: 0,
    totalInvested: 0,
    totalProfitLoss: 0,
    totalReturnsPercent: 0,
    rawData: null,
    loading: false,
    error: null
  });

  const fetchPortfolio = async () => {
    if (!user) {
      setPortfolioData({
        totalCurrentValue: 0,
        totalInvested: 0,
        totalProfitLoss: 0,
        totalReturnsPercent: 0,
        rawData: null,
        loading: false,
        error: null
      });
      return;
    }

    setPortfolioData(prev => ({ ...prev, loading: true, error: null }));
    try {
      const res = await api.get('/api/portfolio/summary');
      
      // Adapted to new SmartInvest backend response shape
      const payload = res.data.data; 

      if (!payload || !payload.financials) {
        throw new Error("Invalid portfolio data received");
      }

      const totalInvested = parseFloat(payload.financials.totalInvested) || 0;
      const weightedExpRatio = parseFloat(payload.health?.metrics?.weightedExpenseRatio) || 0;

      // Mocking 10-year opportunity cost roughly based on annual drain
      const annualExpenseCost = totalInvested * (weightedExpRatio / 100);
      const tenYearOpportunityCost = annualExpenseCost * 10 * 1.5; // compounded roughly

      const mappedData = {
        totalInvested: totalInvested,
        totalCurrentValue: parseFloat(payload.financials.netWorth) || 0,
        totalProfitLoss: parseFloat(payload.financials.totalProfitLoss) || 0,
        totalReturnPercent: parseFloat(payload.financials.totalPLPercentage) || 0,
        
        categoryAllocation: payload.health?.metrics?.allocationChart?.map(item => ({
          name: item.name,
          percent: parseFloat(item.percentage) || 0,
          value: parseFloat(item.value) || 0
        })) || [],
      
        assetAllocation: {
            equity: payload.health?.metrics?.allocationChart?.find(i => i.name === 'equity')?.percentage || 0,
            debt: payload.health?.metrics?.allocationChart?.find(i => i.name === 'debt')?.percentage || 0,
            hybrid: payload.health?.metrics?.allocationChart?.find(i => i.name === 'hybrid')?.percentage || 0
        },

        healthScore: payload.health?.score || 0,
        investments: payload.funds || [],
        
        expenseInfo: {
          weightedExpenseRatio: weightedExpRatio,
          annualExpenseCost: annualExpenseCost,
          tenYearOpportunityCost: tenYearOpportunityCost
        }
      };

      setPortfolioData({
        totalCurrentValue: mappedData.totalCurrentValue,
        totalInvested: mappedData.totalInvested,
        totalProfitLoss: mappedData.totalProfitLoss,
        totalReturnsPercent: mappedData.totalReturnPercent,
        rawData: mappedData,
        loading: false,
        error: null
      });
    } catch (err) {
      setPortfolioData(prev => ({ ...prev, loading: false, error: 'Failed to fetch portfolio' }));
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
