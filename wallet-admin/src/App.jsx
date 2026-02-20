import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";
import { LoginPage, TokenManager } from "./pages/LoginPage.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import UserManagement from "./pages/UserManagement.jsx";
import UserDetails from "./pages/UserDetails.jsx";
import Transactions from "./pages/Transactions.jsx";
import WalletManagement from "./pages/WalletManagement.jsx";
import Reports from "./pages/Reports.jsx";
import Header from "./components/Header.jsx";
import KYCManagement from "./components/KYCManagement.jsx";
import Footer from "./components/Footer.jsx";
import { ThemeModeProvider } from "./context/ThemeContext.jsx";
import { ScopedCssBaseline } from "@mui/material";

function App() {
  const [currentPage, setCurrentPage] = React.useState("dashboard");
  const [selectedUser, setSelectedUser] = React.useState(null);

  const handleLogout = () => {
    TokenManager.clearTokens();
    window.location.href = "/login";
  };

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard setCurrentPage={setCurrentPage} />;
      case "userManagement":
        return (
          <UserManagement
            setCurrentPage={setCurrentPage}
            setSelectedUser={setSelectedUser}
          />
        );
      case "kyc":
        return <KYCManagement setCurrentPage={setCurrentPage} />;
      case "transactions":
        return <Transactions />;
      case "userDetails":
        return (
          <UserDetails user={selectedUser} setCurrentPage={setCurrentPage} />
        );
      case "walletManagement":
        return <WalletManagement />;
      case "reports":
        return <Reports />;
      default:
        return <Dashboard setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <ThemeModeProvider>
      <ScopedCssBaseline />
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route
            path="/*"
            element={
              <div className="app">
                <Header
                  setCurrentPage={setCurrentPage}
                  onLogout={handleLogout}
                />
                <main className="main-content">{renderPage()}</main>
                <Footer />
              </div>
            }
          />
        </Route>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
    </ThemeModeProvider>
  );
}

export default App;
