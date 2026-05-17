# SmartInvest - Professional Wealth Management Platform
## Comprehensive Technical Documentation & Presentation Guide

**Version:** 1.1.0  
**Compliance:** Union Budget 2024 Standards  
**Logic Verified:** May 2026  

---

## 1. Project Overview
SmartInvest is a high-performance, professional-grade Mutual Fund Portfolio Manager built on the MERN stack. It differentiates itself from basic trackers by providing **precision financial analysis**, **regulatory-compliant tax estimation**, and **goal-oriented wealth projections**. It is designed to be the "Check Engine" light for a user's financial life—ensuring that every rupee invested is optimized for growth and risk management.

---

## 2. Core Features & Business Logic

### 📊 Portfolio Intelligence & Health
*   **Real-time Dashboard**: Dynamically fetches the latest NAVs from external APIs (`mfapi.in`) to provide live Net Worth, Total Returns, and P&L tracking.
*   **Proprietary Health Score (0-100)**:
    *   **Diversification (30 pts)**: Rewards variety across **Asset Classes** (Equity, Debt, Hybrid, Liquid) rather than just fund categories to prevent over-diversification within the same class.
    *   **Allocation Balance (25 pts)**: Evaluates equity exposure against the "Golden Ratio" (typically 40-70%) for long-term wealth creation.
    *   **Risk Matching (15 pts)**: Compares the portfolio's actual volatility (based on equity %) against the user's selected Risk Preference (Conservative, Moderate, Aggressive).
    *   **Cost Efficiency (10 pts)**: Penalizes high weighted expense ratios, calculated on the **Current Market Value** for professional accuracy.
    *   **Goal Alignment (10 pts)**: Checks if user's money is linked to specific life milestones (e.g., Retirement, Dream House).
    *   **SIP Consistency (10 pts)**: Measures "SIP Coverage"—whether the current total SIP amount is mathematically sufficient to meet the aggregate requirements of all linked goals.

### 💰 Professional Tax Estimator (Budget 2024 Standards)
SmartInvest implements a granular, investment-by-investment tax analysis using FIFO (First-In-First-Out) principles:
*   **Equity LTCG**: Taxed at **12.5%** with a **₹1.25 Lakh** annual exemption (post-July 2024 rules) for units held > 12 months.
*   **Equity STCG**: Taxed at **20%** for holdings held for less than 12 months (365 days).
*   **Debt/Liquid Funds**: Taxed at the user's **Income Tax Slab Rate** (estimated at a standard 30%), regardless of holding period (post-April 2023 rules).
*   **Intelligent Holding Analysis**: Automatically calculates the exact days since purchase for every individual installment to determine the correct tax bucket.

### 📉 Exit Strategy & Break-Even NAV
Calculates the "No Profit, No Loss" point by accounting for hidden transaction costs often ignored by retail apps.
**Formula:**
$$BreakEvenNAV = \frac{PurchaseNAV}{(1 - StampDuty) \times (1 - ExitLoad) \times (1 - STT)}$$
*   **Stamp Duty**: 0.005% (applied on purchase).
*   **STT**: 0.001% (Securities Transaction Tax applied on equity redemptions).
*   **Exit Load Logic**: 
    *   **Equity/Hybrid**: 1% for redemptions < 365 days.
    *   **Liquid Funds**: Graded 7-day scale (0.0070% on Day 1, dropping to 0% after a week).
    *   **Debt Funds**: 0.5% for redemptions within 30 days.

### 🎯 Goal Tracking & SIP Recommendations
*   **Gap Analysis**: Projects the future value of current investments using the user's **actual historical CAGR**.
*   **Safety Rails**: Applies a **5% Floor** (pessimism protection) and an **18% Ceiling** (euphoria protection) to ensure projections stay within realistic historical limits.
*   **Required SIP**: If a shortfall exists, the engine uses the **Annuity Formula** to calculate the exact monthly SIP needed:
$$Required\ SIP = \frac{GoalGap \times r}{(1+r) \times ((1+r)^n - 1)}$$
*(Where $r$ = monthly return and $n$ = months remaining)*

### 🧮 Advanced Simulations
*   **Historical What-If**: Backtests any fund with a custom amount and date to see historical performance with 100% accuracy using real historical NAV arrays.
*   **Growth Calculator**: Side-by-side comparison of a **Monthly SIP vs. Upfront Lumpsum** for the same total investment, highlighting the **Opportunity Cost** of not investing upfront.
*   **Stress Testing (Shock Simulation)**:
    *   **Moderate Correction**: Simulates a 2008-style broad market dip.
    *   **Severe Crash**: Simulates a "Black Swan" event (COVID-19 style), applying specific asset class sensitivities (e.g., Small Caps at a 64% wipeout).
*   **Compounded Expense Drain**: Illustrates the "Silent Wealth Killer" by showing the **Future Value of fees** if they were invested instead of paid.

---

## 3. Technical Architecture

### Backend (Node.js & Express)
*   **Data Integrity**: Centralized **Zod Validation** schemas for all incoming requests.
*   **Security**: 
    *   **HTTP-only Cookie** authentication using JWT (prevents XSS-based token theft).
    *   `express-rate-limit` for DDoS and brute-force protection.
*   **Performance**: Extensive use of **Mongoose `.lean()`** queries and **`Promise.all`** for ultra-fast data retrieval and parallel API operations.
*   **Dual-Layer Accounting**: preserves every individual purchase date for FIFO tax logic while aggregating views by fund for UI clarity.

### Frontend (React & Vite)
*   **Global State**: `AuthContext` and `PortfolioContext` for seamless user and financial data synchronization.
*   **UI/UX Philosophy**: 
    *   **Tailwind CSS** for a responsive, professional aesthetic.
    *   **PageSkeletons** mirror the UI during data fetching for a zero-jank experience.
    *   **Recharts** for interactive performance and allocation visualization.
*   **Automation**: 15-day SIP payment window and automated NAV fallback logic.

---

## 4. Database Models
*   **User**: Profiles, credentials, and risk preferences.
*   **Investment**: Tracks cost basis, units, category, and metadata.
*   **SIP**: Tracks systematic plan status (active/paused), next due dates, and linked goals.
*   **Transaction**: Audit log of all buys, sells, and SIP executions.
*   **Goal**: Financial objectives with target amounts and timelines.

---

## 5. Key Presentation Highlights (Regulatory Compliance)
*   **Budget 2024 Ready**: Seamless transition to 12.5% LTCG and 20% STCG with updated ₹1.25L threshold.
*   **Finance Act 2023 Ready**: Correctly taxes Debt funds as per individual income slabs.
*   **Stamp Duty (July 2020)**: Correctly accounted for in cost-basis per unit.
*   **FIFO Standard**: Industry-standard tax calculation ensuring maximum accuracy for partial redemptions.

---
*Developed with a focus on engineering excellence and financial precision.*
