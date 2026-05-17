/**
 * Toast.jsx
 * ─────────
 * Shared notification component supporting multiple types (success, error).
 * Renders a fixed-position banner in the top-right corner.
 */
import React from "react";
import { MdOutlineCheckCircle, MdOutlineErrorOutline } from "react-icons/md";

const Toast = ({ message, type = "success" }) => {
  if (!message) return null;

  const isError = type === "error";

  return (
    <div
      className={`fixed top-20 right-8 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 z-110 animate-in slide-in-from-right-10 duration-300 ${
        isError
          ? "bg-red-50 border border-red-200 text-red-800"
          : "bg-green-50 border border-green-200 text-green-800"
      }`}
    >
      {isError ? (
        <MdOutlineErrorOutline className="text-xl text-red-600" />
      ) : (
        <MdOutlineCheckCircle className="text-xl text-green-600" />
      )}
      <span className="text-sm font-bold">{message}</span>
    </div>
  );
};

export default Toast;
