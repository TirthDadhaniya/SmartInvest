import { useState } from "react";
import {
  MdOutlineAccountBalanceWallet,
  MdOutlinePerson,
  MdOutlineMail,
  MdOutlineLock,
  MdOutlineArrowForward,
} from "react-icons/md";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFieldErrors({ ...fieldErrors, [e.target.name]: "" });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    // Basic frontend check for confirm password before API hit
    if (formData.password !== formData.confirmPassword) {
      setFieldErrors({ confirmPassword: "Passwords do not match." });
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/api/auth/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      if (res.data.success) {
        navigate("/login", { state: { message: "Account created successfully. Please log in." } });
      }
    } catch (err) {
      if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        const newFieldErrors = {};
        errors.forEach((errItem) => {
          // errItem.field comes from Zod like 'body.email', we just want 'email'
          const fieldName = errItem.field.replace('body.', '');
          newFieldErrors[fieldName] = errItem.message;
        });
        setFieldErrors(newFieldErrors);
      } else {
        setError(err.response?.data?.message || "Failed to register. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-behind text-t-primary min-h-screen flex flex-col font-inter">
      {/* Top Navigation */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-border px-6 md:px-10 py-4 bg-surface">
        <div className="flex items-center gap-4 text-primary">
          <div className="size-8 flex items-center justify-center bg-primary/10 rounded-lg">
            <MdOutlineAccountBalanceWallet className="text-primary" />
          </div>
          <h2 className="text-t-primary text-xl font-bold leading-tight tracking-tight">SmartInvest</h2>
        </div>
        <div className="flex flex-1 justify-end gap-8">
          <div className="hidden md:flex items-center gap-9">
            <Link to="#" className="text-t-secondary text-sm font-medium hover:text-primary transition-colors">
              Features
            </Link>
            <Link to="#" className="text-t-secondary text-sm font-medium hover:text-primary transition-colors">
              Pricing
            </Link>
            <Link to="#" className="text-t-secondary text-sm font-medium hover:text-primary transition-colors">
              About
            </Link>
          </div>
          <Link
            to="/login"
            className="flex min-w-[84px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-slate-100 text-t-primary text-sm font-bold hover:bg-slate-200 transition-colors border-none no-underline"
          >
            <span>Log In</span>
          </Link>
        </div>
      </header>
      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-background-light to-primary/5">
        <div className="max-w-[1440px] w-full flex justify-center">
          <div className="w-full max-w-[520px] bg-surface rounded-xl shadow-xl border border-border overflow-hidden">
            <div className="p-8 md:p-10">
              <div className="text-center mb-8">
                <h1 className="text-t-primary text-3xl font-bold leading-tight tracking-tight mb-2">
                  Create your account
                </h1>
              </div>

              {error && (
                <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 font-medium animate-in fade-in duration-200">
                  {error}
                </div>
              )}

              <form className="space-y-5" onSubmit={handleRegister} noValidate>
                <div className="flex flex-col gap-2">
                  <label className="text-t-primary text-sm font-semibold">Full Name</label>
                  <div className="relative">
                    <MdOutlinePerson className="absolute left-4 top-1/2 -translate-y-1/2 text-t-placeholder text-xl" />
                    <input
                      className={`w-full pl-12 pr-4 py-3.5 rounded-lg border bg-surface text-t-primary focus:ring-2 focus:border-transparent outline-none transition-all placeholder:text-t-placeholder ${fieldErrors.name ? 'border-red-400 focus:ring-red-400' : 'border-border focus:ring-primary'}`}
                      placeholder="Enter your full name"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>
                  {fieldErrors.name && <p className="text-xs text-red-500 mt-1">{fieldErrors.name}</p>}
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="text-t-primary text-sm font-semibold">Email Address</label>
                  <div className="relative">
                    <MdOutlineMail className="absolute left-4 top-1/2 -translate-y-1/2 text-t-placeholder text-xl" />
                    <input
                      className={`w-full pl-12 pr-4 py-3.5 rounded-lg border bg-surface text-t-primary focus:ring-2 focus:border-transparent outline-none transition-all placeholder:text-t-placeholder ${fieldErrors.email ? 'border-red-400 focus:ring-red-400' : 'border-border focus:ring-primary'}`}
                      placeholder="name@company.com"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                  {fieldErrors.email && <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>}
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="text-t-primary text-sm font-semibold">Password</label>
                  <div className="relative">
                    <MdOutlineLock className="absolute left-4 top-1/2 -translate-y-1/2 text-t-placeholder text-xl" />
                    <input
                      className={`w-full pl-12 pr-4 py-3.5 rounded-lg border bg-surface text-t-primary focus:ring-2 focus:border-transparent outline-none transition-all placeholder:text-t-placeholder ${fieldErrors.password ? 'border-red-400 focus:ring-red-400' : 'border-border focus:ring-primary'}`}
                      placeholder="••••••••"
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                    />
                  </div>
                  {fieldErrors.password ? (
                    <p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>
                  ) : (
                    <p className="text-xs text-t-secondary mt-1">Must be at least 8 characters with 1 uppercase, 1 lowercase & 1 number.</p>
                  )}
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="text-t-primary text-sm font-semibold">Confirm Password</label>
                  <div className="relative">
                    <MdOutlineLock className="absolute left-4 top-1/2 -translate-y-1/2 text-t-placeholder text-xl" />
                    <input
                      className={`w-full pl-12 pr-4 py-3.5 rounded-lg border bg-surface text-t-primary focus:ring-2 focus:border-transparent outline-none transition-all placeholder:text-t-placeholder ${fieldErrors.confirmPassword ? 'border-red-400 focus:ring-red-400' : 'border-border focus:ring-primary'}`}
                      placeholder="••••••••"
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                  </div>
                  {fieldErrors.confirmPassword && <p className="text-xs text-red-500 mt-1">{fieldErrors.confirmPassword}</p>}
                </div>
                
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary hover:bg-primary-hover text-t-inverse font-bold py-4 px-6 rounded-lg transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 border-none disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {loading ? (
                      <span className="animate-pulse">Creating Account...</span>
                    ) : (
                      <>
                        <span>Create Account</span>
                        <MdOutlineArrowForward />
                      </>
                    )}
                  </button>
                </div>
              </form>

              <p className="text-center mt-8 text-sm text-t-secondary">
                Already have an account?{" "}
                <Link to="/login" className="text-primary font-semibold hover:underline no-underline">
                  Log in here
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
            Cookie Policy
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default Register;
