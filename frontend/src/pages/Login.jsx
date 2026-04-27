import React, { useState, useContext } from 'react';
import {
  MdOutlineAccountBalanceWallet,
  MdOutlineMail,
  MdOutlineLock,
  MdOutlineArrowForward,
  MdOutlineEnhancedEncryption,
} from 'react-icons/md';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/auth-context';
import { isBlank, isValidEmail } from '../utils/validation';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useContext(AuthContext);

  const successMessage = location.state?.message;

  const handleLogin = async e => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    const nextFieldErrors = {};
    if (isBlank(email)) {
      nextFieldErrors.email = 'Email is required';
    } else if (!isValidEmail(email)) {
      nextFieldErrors.email = 'Enter a valid email address';
    }

    if (isBlank(password)) {
      nextFieldErrors.password = 'Password is required';
    }

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/api/auth/login', { email, password });
      if (res.data.success) {
        login(res.data.data.user);
        navigate('/dashboard');
      }
    } catch (err) {
      if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        const newFieldErrors = {};
        errors.forEach(errItem => {
          const fieldName = errItem.field.replace('body.', '');
          newFieldErrors[fieldName] = errItem.message;
        });
        setFieldErrors(newFieldErrors);
      } else {
        setError(err.response?.data?.message || 'Failed to login. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-inter bg-behind text-t-primary min-h-screen flex flex-col">
      {/* Top Navigation */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-border px-6 md:px-10 py-4 bg-surface">
        {/* Logo and Name */}
        <div className="flex items-center gap-4 text-primary">
          <div className="size-10 flex items-center justify-center bg-primary/10 rounded-lg">
            <MdOutlineAccountBalanceWallet size={28} className="text-primary" />
          </div>
          <h2 className="text-t-primary text-2xl font-bold leading-tight tracking-tight">
            SmartInvest
          </h2>
        </div>
        {/* Right side */}
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
            className="flex min-w-21 cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-slate-100 text-t-primary text-sm font-bold hover:bg-slate-200 transition-colors border-none no-underline"
          >
            <span>Register</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6 bg-linear-to-br from-background-light to-primary/5">
        {/* Background */}
        <div className="max-w-360 w-full flex justify-center">
          {/* Card Container */}
          <div className="w-full max-w-120 bg-surface rounded-xl shadow-xl border border-border overflow-hidden">
            {/* Card Content */}
            <div className="p-8 md:p-10">
              {/* header */}
              <div className="text-center mb-8">
                <h1 className="text-t-primary text-3xl font-bold leading-tight tracking-tight mb-2">
                  Welcome Back
                </h1>
                <p className="text-t-secondary">Secure login to your investment portfolio.</p>
              </div>

              {/* notification messages */}
              {successMessage && !error && (
                <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 font-medium animate-in fade-in duration-200">
                  {successMessage}
                </div>
              )}

              {error && (
                <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 font-medium animate-in fade-in duration-200">
                  {error}
                </div>
              )}

              <form className="space-y-6" onSubmit={handleLogin} noValidate>
                <div className="flex flex-col gap-2">
                  <label className="text-t-primary text-sm font-semibold">Email Address</label>
                  <div className="relative">
                    <MdOutlineMail className="absolute left-4 top-1/2 -translate-y-1/2 text-t-placeholder text-xl" />
                    <input
                      className={`w-full pl-12 pr-4 py-3.5 rounded-lg border bg-surface text-t-primary focus:ring-2 focus:border-transparent outline-none transition-all placeholder:text-t-placeholder ${fieldErrors.email ? 'border-red-400 focus:ring-red-400' : 'border-border focus:ring-primary'}`}
                      placeholder="name@company.com"
                      type="email"
                      value={email}
                      onChange={e => {
                        setEmail(e.target.value);
                        setFieldErrors({ ...fieldErrors, email: '' });
                      }}
                    />
                  </div>
                  {fieldErrors.email && (
                    <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <label className="text-t-primary text-sm font-semibold">Password</label>
                  </div>
                  <div className="relative">
                    <MdOutlineLock className="absolute left-4 top-1/2 -translate-y-1/2 text-t-placeholder text-xl" />
                    <input
                      className={`w-full pl-12 pr-4 py-3.5 rounded-lg border bg-surface text-t-primary focus:ring-2 focus:border-transparent outline-none transition-all placeholder:text-t-placeholder ${fieldErrors.password ? 'border-red-400 focus:ring-red-400' : 'border-border focus:ring-primary'}`}
                      placeholder="••••••••"
                      type="password"
                      value={password}
                      onChange={e => {
                        setPassword(e.target.value);
                        setFieldErrors({ ...fieldErrors, password: '' });
                      }}
                    />
                  </div>
                  {fieldErrors.password && (
                    <p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary hover:bg-primary-hover text-t-inverse font-bold py-4 px-6 rounded-lg transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 border-none disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {loading ? (
                      <span className="animate-pulse">Authenticating...</span>
                    ) : (
                      <>
                        <span>Access Portfolio</span>
                        <MdOutlineArrowForward />
                      </>
                    )}
                  </button>
                </div>
              </form>

              <p className="text-center mt-8 text-sm text-t-secondary">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="text-primary font-semibold hover:underline no-underline"
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
        <p>&copy; 2026 SmartInvest. All rights reserved.</p>
        <div className="flex gap-6 mt-4 md:mt-0">
          <Link to="#" className="hover:text-primary transition-colors no-underline text-inherit">
            Privacy Policy
          </Link>
          <Link to="#" className="hover:text-primary transition-colors no-underline text-inherit">
            Terms of Service
          </Link>
          <Link to="#" className="hover:text-primary transition-colors no-underline text-inherit">
            Security
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default Login;
