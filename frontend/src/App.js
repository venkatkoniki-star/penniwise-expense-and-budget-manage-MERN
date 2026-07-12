import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Budgets from './pages/Budgets';
import Report from './pages/Report';

function App() {
  const token = localStorage.getItem('token');

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={token ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/transactions" element={token ? <Transactions /> : <Navigate to="/login" />} />
        <Route path="/budgets" element={token ? <Budgets /> : <Navigate to="/login" />} />
        <Route path="/reports" element={token ? <Report /> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;