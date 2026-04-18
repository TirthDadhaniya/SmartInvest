import React from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  MdOutlineEventRepeat,
  MdOutlineInfo,
  MdOutlineTrendingUp,
  MdOutlineCallMade,
  // MdOutlinePieChart,
  // MdOutlineAccountBalanceWallet,
  // MdOutlinePerson,
  // MdOutlineMail,
  // MdOutlineLock,
  // MdOutlineCall,
  // MdLockOutline,
  // MdArrowForward,
  // MdOutlineArrowForward,
  // MdOutlineVerifiedUser,
  // MdOutlineEnhancedEncryption,
  // MdOutlineGppGood,
  // MdOutlineInfo,
} from "react-icons/md";
import Card from "../components/Card";

const Dashboard = () => {
  return (
    <div className="bg-base font-inter p-4 md:p-8 space-y-8 max-w-[1200px] mx-auto w-full animate-in fade-in duration-300">
      {/* SIP Reminder Strip */}
      {/* {nextSip && ()} */}
      <div className="bg-primary text-white p-4 rounded-xl flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-white/20 rounded-lg">
            <MdOutlineEventRepeat className="text-xl" />
          </div>
          <p className="text-sm font-medium">
            SIP Reminder: Your monthly investment is scheduled for{" "}
            <span className="font-bold">
              {/* {new Date(nextSip.nextDueDate).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })} */}
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

      {/* Summary Cards + Asset Allocation */}
      <div className="grid grid-cols-4 gap-6 font-inter">
        <Card
          title="Total Invested"
          value="$45,200.00"
          description="All time principal"
          icon={MdOutlineInfo}
        />
        <Card
          title="Current Value"
          value="$52,140.50"
          description="+15.3% growth"
          icon={MdOutlineTrendingUp}
        />
        <Card
          title="Unrealized P/L"
          value="+$6,940.50"
          description="+18.2% CAGR"
          icon={MdOutlineCallMade}
        />

        <div className="bg-surface p-6 rounded-card border border-border  shadow-sm">
          <p className="text-slate-500 text-sm font-medium">Portfolio Health</p>
          <p className="text-2xl font-bold mt-1">92/100</p>
          <div className="mt-4 h-1.5 w-full bg-slate-100  rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full"
              style={{ width: "92%" }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
