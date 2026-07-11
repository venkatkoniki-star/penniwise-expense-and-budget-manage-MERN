import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, ArrowRight, TrendingUp, ShieldCheck, PieChart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split-page">
      {/* ── Left panel ── */}
      <div className="auth-split-left">
        <div className="auth-split-brand">
          <div className="auth-brand-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/>
            </svg>
          </div>
          <span className="auth-brand-name">Pennywise</span>
        </div>

        <div className="auth-split-hero">
          <h1 className="auth-hero-heading">Start your<br />financial journey.</h1>
          <p className="auth-hero-sub">Join thousands who track their spending, hit their savings goals, and finally feel in control of their money.</p>
        </div>

        <div className="auth-feature-list">
          <div className="auth-feature-item">
            <div className="auth-feature-icon"><TrendingUp size={16} /></div>
            <span>Real-time expense tracking</span>
          </div>
          <div className="auth-feature-item">
            <div className="auth-feature-icon"><PieChart size={16} /></div>
            <span>Monthly reports &amp; breakdowns</span>
          </div>
          <div className="auth-feature-item">
            <div className="auth-feature-icon"><ShieldCheck size={16} /></div>
            <span>Secure &amp; private — only you can see your data</span>
          </div>
        </div>

        <div className="auth-deco-cards">
          <div className="auth-deco-card">
            <div className="auth-deco-label">This month's savings</div>
            <div className="auth-deco-value" style={{ color: '#10B981' }}>+₹14,250</div>
            <div className="auth-deco-bar">
              <div className="auth-deco-bar-fill" style={{ width: '68%' }} />
            </div>
            <div className="auth-deco-meta">68% of monthly goal</div>
          </div>
          <div className="auth-deco-card auth-deco-card-sm">
            <div className="auth-deco-label">Budget used</div>
            <div className="auth-deco-value" style={{ color: '#4F46E5' }}>42%</div>
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="auth-split-right">
        <div className="auth-form-box">
          <div className="auth-form-header">
            <h2 className="auth-form-title">Create your account</h2>
            <p className="auth-form-sub">Free forever. No credit card needed.</p>
          </div>

          {error && (
            <div className="auth-error">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label>Full name</label>
              <div className="auth-input-wrap">
                <User size={15} className="auth-input-icon" />
                <input
                  type="text"
                  placeholder="Jane Doe"
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
                  placeholder="you@example.com"
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
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? (
                <span className="auth-spinner" />
              ) : (
                <>Create account <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p className="auth-form-switch">
            Already have an account?{' '}
            <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;