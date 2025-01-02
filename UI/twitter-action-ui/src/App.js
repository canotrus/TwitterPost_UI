import React, { useState, useEffect } from "react";
import AccountList from "./components/AccountList";
import ActionsForm from "./components/ActionsForm";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from "./components/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";

// AppContent bileşenini oluşturuyoruz
const AppContent = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true'
  });
  const [loginError, setLoginError] = useState("");
  
  const [accounts, setAccounts] = useState([]);

  const handleSelect = (id) => {
    setAccounts((prev) =>
      prev.map((account) =>
        account.id === id ? { ...account, selected: !account.selected } : account
      )
    );
  };

  const handleSubmit = (data) => {
    const selectedAccounts = accounts.filter((account) => account.selected);
    console.log("Seçilen Hesaplar:", selectedAccounts);
    console.log("Tweet İşlemleri:", data);
  };

  const handleLogin = (success) => {
    if (success) {
      setIsLoggedIn(true);
      setLoginError("");
    } else {
      setLoginError("Giriş başarısız. Lütfen tekrar deneyin.");
    }
  };

  const MainApp = () => {
    return (
      <div style={{ padding: "20px" }}>
        <ActionsForm />
      </div>
    );
  };

  return (
    <Routes>
      <Route path="/login" element={
        <LoginPage 
          onLogin={handleLogin}
          error={loginError}
          setError={setLoginError}
        />} 
      />
      <Route
        path="/"
        element={
          <ProtectedRoute isLoggedIn={isLoggedIn}>
            <MainApp />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

// Ana App bileşeni
const App = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;
