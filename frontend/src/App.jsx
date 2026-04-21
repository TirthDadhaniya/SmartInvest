import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Investments from "./pages/Investments";
import ManageFunds from "./pages/ManageFunds";
import Fund from "./pages/Fund";
import Transactions from "./pages/Transactions";
import Profile from "./pages/Profile";
import AppShell from "./components/AppShell";
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Routes mapped inside AppShell */}
        <Route path="/" element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="investments" element={<Investments />} />
          <Route path="manageFunds" element={<ManageFunds />} />
          <Route path="fund" element={<Fund />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
