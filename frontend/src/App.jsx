import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Investment from "./pages/Investment";
import ManageFunds from "./pages/ManageFunds";
import Fund from "./pages/Fund";
import Transactions from "./pages/Transactions";
import Profile from "./pages/Profile";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/investment" element={<Investment />} />
        <Route path="/manageFunds" element={<ManageFunds />} />
        <Route path="/fund" element={<Fund />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
};

export default App;
