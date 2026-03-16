import React from "react";

const FundRow = () => {
  return (
    <>
      <table>
        <thead>
          <tr>
            <th>Fund Name &amp; Category</th>
            <th>Invested VS Current</th>
            <th>Returns (%)</th>
            <th>Nav & Date</th>
            <th>7-Day Trend</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <div>
                <p>Vanguard 500 Index</p>
                <span>Large Cap Equity</span>
              </div>
            </td>
            <td>
              <div>$25,000.00</div>
              <span>Cur: $32.450.12</span>
            </td>
            <td>
              <div>+29.8%</div>
              <span>Abs. Returns</span>
            </td>
            <td>
              <div>
                <p>$412.45</p>
              </div>
              <span>24 May 2024</span>
            </td>
            <td>Graph</td>
            <td>
              <p>Transact</p>
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
};

export default FundRow;
