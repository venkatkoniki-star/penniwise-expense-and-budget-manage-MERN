import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  LayoutDashboard,
  LogIn,
  UserPlus,
  Zap,
  TrendingUp,
  Wallet,
  Activity,
  BarChart3,
  ShieldCheck,
  Eye,
  EyeOff,
} from 'lucide-react';
import Scene from '../Scene';
import ThemeSelector from '../components/ThemeSelector';
import AppLogo from '../components/AppLogo';

// Live telemetry dataset for the hero HUD
const TELEMETRY_DATA = {
  month: {
    label: 'Current Month',
    balance: '₹4,82,650.00',
    balanceDelta: '+₹24,800 (+5.4%)',
    inflow: '₹1,25,000.00',
    outflow: '₹42,350.00',
    savingsRate: '66.1%',
    budgetSpent: '₹42,350',
    budgetTotal: '₹75,000',
    budgetPct: 56.4,
  },
  '30d': {
    label: 'Last 30 Days',
    balance: '₹5,18,400.00',
    balanceDelta: '+₹46,200 (+9.8%)',
    inflow: '₹1,65,000.00',
    outflow: '₹58,900.00',
    savingsRate: '64.3%',
    budgetSpent: '₹58,900',
    budgetTotal: '₹85,000',
    budgetPct: 69.2,
  },
  year: {
    label: 'Year to Date',
    balance: '₹18,92,400.00',
    balanceDelta: '+₹7,40,000 (+64.2%)',
    inflow: '₹14,20,000.00',
    outflow: '₹4,85,600.00',
    savingsRate: '65.8%',
    budgetSpent: '₹4,85,600',
    budgetTotal: '₹7,50,000',
    budgetPct: 64.7,
  },
};

const LandingPage = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState(null);
  const [showHero, setShowHero] = useState(true);
  const [timeframe, setTimeframe] = useState('month');

  useEffect(() => {
    setToken(localStorage.getItem('token'));

    // Handle postMessage navigation requests from the embedded 3D scene iframe
    const handleMessage = (event) => {
      if (event.data && event.data.type === 'NAVIGATE' && event.data.url) {
        navigate(event.data.url);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [navigate]);

  const activeData = TELEMETRY_DATA[timeframe] || TELEMETRY_DATA.month;

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: '#000', position: 'relative' }}>
      {/* ── 1. The Real Interactive 3D Canvas Scene Frame ── */}
      <Scene />

      {/* ── 2. Top Tactical HUD Bar ── */}
      <header className="landing-top-hud">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <AppLogo size="sm" onClick={() => navigate('/')} />
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              fontSize: '0.62rem',
              fontFamily: 'var(--font-mono)',
              color: '#00ed64',
              background: 'rgba(0, 237, 100, 0.1)',
              border: '1px solid rgba(0, 237, 100, 0.25)',
              padding: '2px 7px',
              borderRadius: 12,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            <span className="pulse-dot" style={{ width: 5, height: 5 }} /> 3D OS ONLINE
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Toggle 3D Fullscreen / Hero View */}
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setShowHero(!showHero)}
            style={{ padding: '6px 12px', borderRadius: 20, fontSize: '0.74rem', gap: 6 }}
            title={showHero ? 'Hide Hero (Pure 3D Canvas)' : 'Show Hero Section'}
          >
            {showHero ? <EyeOff size={13} /> : <Eye size={13} />}
            <span>{showHero ? '3D Canvas Mode' : 'Show Hero'}</span>
          </button>

          <ThemeSelector compact={true} placement="bottom" showLabel={false} />

          {token ? (
            <Link
              to="/dashboard"
              className="btn btn-primary btn-sm"
              style={{ padding: '6px 14px', borderRadius: 20, fontSize: '0.78rem' }}
            >
              <LayoutDashboard size={13} /> Open Dashboard <ArrowRight size={12} />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="btn btn-secondary btn-sm"
                style={{ padding: '6px 14px', borderRadius: 20, fontSize: '0.78rem' }}
              >
                <LogIn size={13} /> Sign In
              </Link>
              <Link
                to="/signup"
                className="btn btn-primary btn-sm"
                style={{ padding: '6px 14px', borderRadius: 20, fontSize: '0.78rem' }}
              >
                <UserPlus size={13} /> Get Started <ArrowRight size={12} />
              </Link>
            </>
          )}
        </div>
      </header>

      {/* ── 3. Hero Section Overlaid on the 3D Scene ── */}
      <div
        className={`hero-3d-overlay ${showHero ? 'visible' : 'collapsed'}`}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 100,
          pointerEvents: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px 20px 20px',
          opacity: showHero ? 1 : 0,
          transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
          transform: showHero ? 'scale(1)' : 'scale(0.96) translateY(20px)',
        }}
      >
        <div
          className="hero-3d-card"
          style={{
            pointerEvents: 'auto',
            maxWidth: 880,
            width: '100%',
            background: 'rgba(8, 8, 12, 0.84)',
            backdropFilter: 'blur(26px) saturate(140%)',
            WebkitBackdropFilter: 'blur(26px) saturate(140%)',
            border: '1px solid rgba(255, 77, 0, 0.32)',
            borderRadius: 24,
            padding: '28px 34px',
            boxShadow: '0 24px 70px rgba(0, 0, 0, 0.85), 0 0 35px rgba(255, 77, 0, 0.15)',
            textAlign: 'center',
          }}
        >
          {/* Radar badge */}
          <div
            className="hero-badge-pill"
            style={{ marginBottom: 16, cursor: 'default', display: 'inline-flex' }}
          >
            <span className="hero-pulse-dot" />
            <span>Tactical Capital OS · Live 3D Interactive Telemetry</span>
          </div>

          {/* Master Headline */}
          <h1
            style={{
              fontSize: 'clamp(1.9rem, 4.2vw, 3.2rem)',
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              color: '#fff',
              marginBottom: 14,
            }}
          >
            Master Your Capital with{' '}
            <span className="text-gradient-orange">Tactical Precision.</span>
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: 'clamp(0.9rem, 1.4vw, 1.05rem)',
              color: 'var(--text-secondary)',
              lineHeight: 1.55,
              maxWidth: 680,
              margin: '0 auto 22px',
              fontWeight: 500,
            }}
          >
            The high-speed expense and budget operating system built for modern creators, engineers, and wealth
            builders. Real-time Rupee (₹) telemetry, proactive budget guardrails, and instant financial diagnostics.
          </p>

          {/* CTA Buttons */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              flexWrap: 'wrap',
              marginBottom: 24,
            }}
          >
            <Link to="/signup" className="hero-btn-primary" style={{ padding: '11px 24px', fontSize: '0.92rem' }}>
              <Zap size={16} />
              <span>Get Started Free (₹)</span>
              <ArrowRight size={15} />
            </Link>

            <Link to="/dashboard" className="hero-btn-secondary" style={{ padding: '11px 22px', fontSize: '0.92rem' }}>
              <LayoutDashboard size={15} />
              <span>Launch Dashboard</span>
            </Link>

            <button
              type="button"
              className="hero-btn-ghost"
              onClick={() => setShowHero(false)}
              style={{ padding: '11px 20px', fontSize: '0.88rem' }}
            >
              <EyeOff size={14} />
              <span>Explore 3D Scene</span>
            </button>
          </div>

          {/* Mini Live Telemetry Strip on the 3D card */}
          <div
            style={{
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              borderRadius: 14,
              padding: '16px 20px',
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 14,
              textAlign: 'left',
            }}
          >
            <div>
              <div style={{ fontSize: '0.66rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Liquid Capital
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#fff' }}>
                {activeData.balance}
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--green)', fontWeight: 600 }}>
                {activeData.balanceDelta}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.66rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Gross Inflow
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--green)' }}>
                {activeData.inflow}
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                Verified Deposits
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.66rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Outflow Deductions
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>
                {activeData.outflow}
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                {activeData.budgetPct}% of Guardrail
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.66rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Savings Velocity
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#00d4ff' }}>
                {activeData.savingsRate}
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--green)', fontWeight: 600 }}>
                ● Target Optimal
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Reopen Button when Hero is collapsed to pure 3D canvas */}
      {!showHero && (
        <button
          type="button"
          onClick={() => setShowHero(true)}
          style={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 22px',
            background: 'rgba(10, 10, 14, 0.85)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 77, 0, 0.4)',
            borderRadius: 30,
            color: '#fff',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.78rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.7), 0 0 15px rgba(255, 77, 0, 0.25)',
          }}
        >
          <Eye size={14} color="var(--accent)" />
          <span>Show Hero Telemetry</span>
        </button>
      )}
    </div>
  );
};

export default LandingPage;
