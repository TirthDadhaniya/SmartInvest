import React from "react";

const Investment = () => {
  return (
    <>
      <div>
        <div className="sidebar">
          <div className="logo">
            <h3>SmartInvest</h3>
          </div>
          <nav>
            <a href="#">Dashboard</a>
            <a href="#">Investments</a>
            <a href="#">Manage Funds</a>
            <a href="#">Transactions</a>
            <a href="#">Profile</a>
          </nav>
        </div>
        <div className="main">
          <div className="topbar">
            <input type="text" placeholder="Search investments..." />
            <div className="user-profile">
              <img src="https://via.placeholder.com/40" alt="User Avatar" />
              <span>John Doe</span>
            </div>
          </div>
          <div className="content">
            <div className="heading">
              <div>
                <h3>Investment Portfolio</h3>
              </div>
              <div>
                <p>Real-time tracking of your active mutual funds and equity holdings.</p>
                <button>+ Add Investment</button>
              </div>
            </div>
            <div className="stats">
              <div className="stat1">
                <p>Total Invested</p>
                <h3>$124,500.00</h3>
              </div>
              <div className="stat2">
                <p>Current Value</p>
                <h3>$142,850.25</h3>
              </div>
              <div className="stat3">
                <p>Unrealized Gains</p>
                <h3>+$18,350.25</h3>
              </div>
              <div className="stat4">
                <p>Annualized XIRR</p>
                <h3>16.42%</h3>
              </div>
            </div>
            <div className="tab-table">
              <div className="tabs">
                <button className="active">Mutual Funds (8)</button>
                <button>ETFs (4)</button>
                <button>Direct Stocks (12)</button>
                <button>Fixed Income (2)</button>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Fund Name & Category</th>
                    <th>Invested vs Current</th>
                    <th>Returns (%)</th>
                    <th>NAV & Date</th>
                    <th>7-Day Trend</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <h3>Vanguard 500 Index Fund</h3>
                      <p>LARGE CAP EQUITY</p>
                    </td>
                    <td>
                      <h5>$25,000.00</h5>
                      <p>Cur: $32,450.12</p>
                    </td>
                    <td>
                      <h5>+29.8%</h5>
                      <p>Abs. Returns</p>
                    </td>
                    <td>
                      <h5>$412.45</h5>
                      <p>24 May 2024</p>
                    </td>
                    <td>Graph</td>
                    <td>Transact</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Investment;
