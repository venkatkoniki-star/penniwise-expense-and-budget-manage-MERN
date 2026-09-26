import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, TrendingUp, ShieldCheck, PieChart, Sun, Moon, Sparkles } from 'lucide-react';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';

import ThemeSelector from '../components/ThemeSelector';
import AppLogo from '../components/AppLogo';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post(`${API}/auth/login`, {
        email: email,
        password: password
      });

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      navigate('/dashboard');
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    }

    setLoading(false);
  };

  return (
    <div className="auth-split-page">
      <div className="auth-split-left">
        <div className="auth-split-brand" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
          <AppLogo size="lg" showSub={true} />
        </div>

        <div className="auth-split-hero">
          <h1 className="auth-hero-heading">Your money,<br />under control.</h1>
          <p className="auth-hero-sub">Track spending, set budgets, and understand where every rupee goes — all in one clean financial operating system.</p>
        </div>

        <div className="auth-feature-list">
          <div className="auth-feature-item">
            <div className="auth-feature-icon"><TrendingUp size={16} /></div>
            <span>Real-time Rupee (₹) expense tracking</span>
          </div>
          <div className="auth-feature-item">
            <div className="auth-feature-icon"><PieChart size={16} /></div>
            <span>Monthly reports &amp; interactive telemetry</span>
          </div>
          <div className="auth-feature-item">
            <div className="auth-feature-icon"><ShieldCheck size={16} /></div>
            <span>Encrypted &amp; private — strictly scoped to your account</span>
          </div>
        </div>

        <div className="auth-deco-cards">
          <div className="auth-deco-card">
            <div className="auth-deco-label">Monthly Savings Velocity</div>
            <div className="auth-deco-value" style={{ color: 'var(--green)' }}>+₹14,250.00</div>
            <div className="auth-deco-bar">
              <div className="auth-deco-bar-fill" style={{ width: '68%' }} />
            </div>
            <div className="auth-deco-meta">68% of monthly savings target achieved</div>
          </div>
        </div>
      </div>

      <div className="auth-split-right" style={{ position: 'relative' }}>
        {/* Floating Top Atmosphere Controls */}
        <div style={{ position: 'absolute', top: 20, right: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
          <ThemeSelector compact={true} placement="bottom" showLabel={false} />
        </div>

        <div className="auth-form-box">
          <div className="auth-form-header">
            <h2 className="auth-form-title">Welcome back</h2>
            <p className="auth-form-sub">Sign in to your account to access your console</p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label>Email address</label>
              <div className="auth-input-wrap">
                <Mail size={15} className="auth-input-icon" />
                <input
                  type="email"
                  placeholder="operator@pennywise.app"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <label>Password</label>
              <div className="auth-input-wrap">
                <Lock size={15} className="auth-input-icon" />
                <input
                  type="password"
                  placeholder="Enter your secret password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? <span className="auth-spinner" /> : <>Sign In <ArrowRight size={16} /></>}
            </button>
          </form>

          <p className="auth-form-switch">
            Don't have an account? <Link to="/signup">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;