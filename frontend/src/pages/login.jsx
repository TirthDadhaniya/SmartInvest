import React from "react";
import {
  MdOutlineAccountBalanceWallet,
  MdOutlinePerson,
  MdOutlineMail,
  MdOutlineLock,
  MdOutlineCall,
  MdLockOutline,
  MdArrowForward,
  MdOutlineArrowForward,
  MdOutlineVerifiedUser,
  MdOutlineEnhancedEncryption,
  MdOutlineGppGood,
} from "react-icons/md";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  return (
    <div className="bg-behind text-t-primary min-h-screen flex flex-col font-display">
      {/* Top Navigation */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-border px-6 md:px-10 py-4 bg-surface">
        <div className="flex items-center gap-4 text-primary">
          <div className="size-8 flex items-center justify-center bg-primary/10 rounded-lg">
            <MdOutlineAccountBalanceWallet className="text-primary" />
          </div>
          <h2 className="text-t-primary text-xl font-bold leading-tight tracking-tight">
            SmartInvest
          </h2>
        </div>
        <div className="flex flex-1 justify-end gap-8">
          <div className="hidden md:flex items-center gap-9">
            <Link
              to="#"
              className="text-t-secondary text-sm font-medium hover:text-primary transition-colors"
            >
              Features
            </Link>
            <Link
              to="#"
              className="text-t-secondary text-sm font-medium hover:text-primary transition-colors"
            >
              Pricing
            </Link>
            <Link
              to="#"
              className="text-t-secondary text-sm font-medium hover:text-primary transition-colors"
            >
              About
            </Link>
          </div>
          <Link
            to="/register"
            className="flex min-w-[84px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-slate-100 text-t-primary text-sm font-bold hover:bg-slate-200 transition-colors border-none"
          >
            <span>Register</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-background-light to-primary/5">
        <div className="max-w-[1440px] w-full flex justify-center">
          <div className="w-full max-w-[480px] bg-surface rounded-xl shadow-xl border border-border overflow-hidden">
            <div className="p-8 md:p-10">
              <div className="text-center mb-8">
                <h1 className="text-t-primary text-3xl font-bold leading-tight tracking-tight mb-2">
                  Welcome Back
                </h1>
                <p className="text-t-secondary">
                  Secure login to your investment portfolio.
                </p>
              </div>
              {/* 
              {error && (
                <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 font-medium animate-in fade-in duration-200">
                  {error}
                </div>
              )} */}

              <form className="space-y-6">
                <div className="flex flex-col gap-2">
                  <label className="text-t-primary text-sm font-semibold">
                    Email Address
                  </label>
                  <div className="relative">
                    <MdOutlineMail className="absolute left-4 top-1/2 -translate-y-1/2 text-t-placeholder text-xl" />
                    <input
                      className="w-full pl-12 pr-4 py-3.5 rounded-lg border border-border bg-surface text-t-primary focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-t-placeholder"
                      placeholder="name@company.com"
                      type="email"
                      // value={email}
                      // onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <label className="text-t-primary text-sm font-semibold">
                      Password
                    </label>
                  </div>
                  <div className="relative">
                    <MdOutlineLock className="absolute left-4 top-1/2 -translate-y-1/2 text-t-placeholder text-xl" />
                    <input
                      className="w-full pl-12 pr-4 py-3.5 rounded-lg border border-border bg-surface text-t-primary focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-t-placeholder"
                      placeholder="••••••••"
                      type="password"
                      // value={password}
                      // onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 py-2">
                  <input
                    type="checkbox"
                    className="size-4 rounded border-border text-primary focus:ring-primary"
                    id="remember-me"
                  />
                  <label
                    htmlFor="remember-me"
                    className="text-sm font-medium text-t-secondary user-select-none cursor-pointer"
                  >
                    Remember me on this device
                  </label>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    // disabled={loading}
                    className="w-full bg-primary hover:bg-primary-hover text-t-inverse font-bold py-4 px-6 rounded-lg transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 border-none disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {/* {loading ? (
                      <span className="animate-pulse">Authenticating...</span>
                    ) : (
                      <>
                        <span>Access Portfolio</span>
                        <MdOutlineArrowForward />
                      </>
                    )} */}
                  </button>
                </div>
              </form>

              <div className="mt-8 pt-8 border-t border-border">
                <div className="flex items-center justify-center gap-2 opacity-60 grayscale hover:grayscale-0 transition-all">
                  <MdOutlineEnhancedEncryption className="text-sm" />
                  <span className="text-xs font-bold uppercase tracking-widest text-t-secondary">
                    256-bit Bank Level Security
                  </span>
                </div>
              </div>

              <p className="text-center mt-8 text-sm text-t-secondary">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-primary font-semibold hover:underline"
                >
                  Register here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Simple */}
      <footer className="py-6 px-10 flex flex-col md:flex-row items-center justify-between text-xs text-t-secondary border-t border-border bg-surface">
        <p>&copy; 2024 SmartInvest Technologies Inc. All rights reserved.</p>
        <div className="flex gap-6 mt-4 md:mt-0">
          <Link to="#" className="hover:text-primary transition-colors">
            Privacy Policy
          </Link>
          <Link to="#" className="hover:text-primary transition-colors">
            Terms of Service
          </Link>
          <Link to="#" className="hover:text-primary transition-colors">
            Security
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default Login;
