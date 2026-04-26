/**
 * Toast.jsx
 * ─────────
 * Shared success-toast notification component.
 * Renders a fixed-position banner in the top-right corner.
 *
 * Usage:
 *   import Toast from "../components/Toast";
 *   const [msg, setMsg] = useState("");
 *   <Toast message={msg} />
 */
import React from "react";
import { MdOutlineCheckCircle } from "react-icons/md";

const Toast = ({ message }) => {
  if (!message) return null;

  return (
    <div className="fixed top-20 right-8 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 z-110 animate-in slide-in-from-right-10 duration-300">
      <MdOutlineCheckCircle className="text-xl text-green-600" />
      <span className="text-sm font-bold">{message}</span>
    </div>
  );
};

export default Toast;
