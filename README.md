# 🚀 SmartInvest — Production-Ready Wealth Manager

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

SmartInvest is a high-performance, full-stack personal mutual fund portfolio manager designed for precision tracking and institutional-grade analysis. Built with the MERN stack, it provides a secure, data-driven environment for managing wealth through live NAV integration, advanced financial simulations, and automated goal tracking compliant with **Union Budget 2024** standards.

---

## 🌟 Key Features

### 📊 Portfolio Intelligence & Aggregation

- **Unified Positions**: Automatically groups individual SIP/Lumpsum installments into a clean aggregated view with weighted average cost basis and expandable sub-rows for detail.
- **Health Score (6 Pillars)**: A proprietary grading system assessing Diversification (Asset-Class based), Risk-Matching, Cost-Efficiency, Goal Alignment, and SIP Coverage.
- **Asset Allocation**: Dynamic visualization of portfolio distribution across Equity, Debt, Hybrid, and Liquid assets.
- **Compounded Expense Analysis**: Visualizes the "Silent Fee" impact by calculating the 10-year compounded opportunity cost of fund management fees.

### 🎯 Goal-Oriented Investing

- **Financial Goal Tracking**: Create and monitor objectives using **Time Value of Money (TVM)** principles.
- **Gap Analysis**: Real-time projection of future values using historical CAGR with safety rails (5% floor / 18% ceiling).
- **Annuity SIP Recommender**: Mathematically calculates the exact monthly investment needed to bridge goal shortfalls.

### 🛠️ Investment Management

- **Tax Estimator (Budget 2024)**: Precise estimation of Equity LTCG (12.5% after ₹1.25L exemption), STCG (20%), and Debt taxation (slab rate).
- **Professional Break-Even**: Calculates the true "No-Profit" point accounting for **Stamp Duty (0.005%)**, **STT (0.001%)**, and graded **Exit Loads**.
- **SIP Automation**: Manage active, paused, and stopped Systematic Investment Plans with automatic latest NAV fetching and 15-day early payment windows.

### 📉 Risk & Simulation

- **Market Stress Testing**: Simulates portfolio performance under historical "Moderate Correction" and "Severe Black-Swan Crash" scenarios.
- **What-If Backtesting**: backtesting—see what ₹10k invested at any point in history would be worth today using real NAV data arrays.

---

## 🏗️ Technical Architecture & Optimizations

### Backend (Precision Engine)

- **Data Integrity**: Multi-tier position tracking preserves granular purchase history for tax accuracy while delivering aggregated summaries for the UI.
- **Performance**: Extensive use of Mongoose `.lean()` and concurrent `Promise.all` fetching for sub-second dashboard loads.
- **Security**:
  - Integrated `express-rate-limit` to safeguard against brute-force attacks.
  - HTTP-only cookie-based JWT authentication for secure session management.
- **Reliability**: Centralized Zod validation layer ensuring strict data integrity across all API endpoints.

### Frontend (User Experience Focused)

- **Speed**: Reusable `PageSkeletons` mirror the UI during data fetching for a zero-jank experience.
- **Modularity**: Extracted repetitive logic into shared components like `Toast`, `FundSearch`, and `AppShell`.
- **Visualization**: Data-rich interactive charts powered by `Recharts` for intuitive portfolio analysis.

---

## 📂 Project Structure

```text
SmartInvest/
├── backend/                # Express & Node.js Server
│   ├── controller/         # Business logic for each resource
│   ├── db/                 # Database connection config
│   ├── middleware/         # Auth, logging, and validation middleware
│   ├── models/             # Mongoose schemas (User, Investment, SIP, etc.)
│   ├── routes/             # API endpoint definitions
│   ├── services/           # Reusable core logic (Calculations, Portfolio)
│   └── validation/         # Zod schemas for request validation
├── frontend/               # React & Vite Application
│   ├── src/
│   │   ├── api/            # Axios instance with interceptors
│   │   ├── components/     # Reusable UI (Skeletons, Toast, Shell)
│   │   ├── context/        # Global Auth & Portfolio state
│   │   ├── pages/          # Full-page components (Dashboard, Profile)
│   │   └── utils/          # Formatting & Math helpers
└── README.md               # You are here
```

---

## 🛠️ Tech Stack

**Frontend:** React 18, Vite, Tailwind CSS, Recharts, React Icons  
**Backend:** Node.js, Express.js, JWT, Zod, Cookie-Parser  
**Database:** MongoDB via Mongoose  
**External API:** [MFAPI.in](https://api.mfapi.in) for live Mutual Fund data

---

## 🏁 Getting Started

### 1. Prerequisites

- Node.js (v16+)
- MongoDB Atlas account (or local MongoDB instance)

### 2. Installation

```bash
# Clone the repository
git clone https://github.com/TirthDadhaniya/SmartInvest.git
cd SmartInvest

# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 3. Environment Variables

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
NODE_ENV=development
```

### 4. Run Application

```bash
# From the root directory
npm run dev
```

---

## 🤝 Contributing

Contributions are welcome! If you find a bug or want to suggest an improvement, please open an issue or submit a pull request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

_Developed with a focus on financial precision and engineering excellence._
