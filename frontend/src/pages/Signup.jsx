import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, ArrowRight, TrendingUp, ShieldCheck, PieChart, Sun, Moon, Sparkles } from 'lucide-react';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';

import ThemeSelector from '../components/ThemeSelector';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(`${API}/auth/register`, {
        name: name,
        email: email,
        password: password
      });

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      navigate('/dashboard');
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || 'Sign up failed. Please try again.');
    }

    setLoading(false);
  };

  return (
    <div className="auth-split-page">
      <div className="auth-split-left">
        <div className="auth-split-brand">
          <div className="auth-brand-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/>
            </svg>
          </div>
          <span className="auth-brand-name">pennywise<i>.</i></span>
        </div>

        <div className="auth-split-hero">
          <h1 className="auth-hero-heading">Start your<br />financial journey.</h1>
          <p className="auth-hero-sub">Join thousands who track their spending, hit their savings goals, and finally feel in control of their money with a precision Rupee (₹) OS.</p>
        </div>

        <div className="auth-feature-list">
          <div className="auth-feature-item">
            <div className="auth-feature-icon"><TrendingUp size={16} /></div>
            <span>Categorized Rupee telemetry &amp; live cashflow</span>
          </div>
          <div className="auth-feature-item">
            <div className="auth-feature-icon"><PieChart size={16} /></div>
            <span>Automated monthly budget threshold guards</span>
          </div>
          <div className="auth-feature-item">
            <div className="auth-feature-icon"><ShieldCheck size={16} /></div>
            <span>Encrypted credentials &amp; scoped privacy</span>
          </div>
        </div>

        <div className="auth-deco-cards">
          <div className="auth-deco-card">
            <div className="auth-deco-label">Default Architecture</div>
            <div className="auth-deco-value" style={{ color: 'var(--green)' }}>INR (₹) Native</div>
            <div className="auth-deco-bar">
              <div className="auth-deco-bar-fill" style={{ width: '100%' }} />
            </div>
            <div className="auth-deco-meta">Pre-configured with 12 smart categories</div>
          </div>
        </div>
      </div>

      <div className="auth-split-right" style={{ position: 'relative' }}>
        {/* Floating Top Controls */}
        <div style={{ position: 'absolute', top: 20, right: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link
            to="/"
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.75rem', gap: 5 }}
            title="Return to 3D Landing Page"
          >
            <Sparkles size={13} /> 3D Landing
          </Link>
          <ThemeSelector compact={true} placement="bottom" showLabel={false} />
        </div>

        <div className="auth-form-box">
          <div className="auth-form-header">
            <h2 className="auth-form-title">Create account</h2>
            <p className="auth-form-sub">Start taking control of your personal finances today</p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label>Full name</label>
              <div className="auth-input-wrap">
                <User size={15} className="auth-input-icon" />
                <input
                  type="text"
                  placeholder="Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

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
                  placeholder="Create a strong password (6+ chars)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? <span className="auth-spinner" /> : <>Create Account <ArrowRight size={16} /></>}
            </button>
          </form>

          <p className="auth-form-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;