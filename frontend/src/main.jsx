import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { PortfolioProvider } from "./context/PortfolioContext.jsx";

createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <PortfolioProvider>
      <App />
    </PortfolioProvider>
  </AuthProvider>
);
