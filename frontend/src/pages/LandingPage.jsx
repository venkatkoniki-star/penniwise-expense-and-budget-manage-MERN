import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Sparkles, LayoutDashboard, LogIn, UserPlus } from 'lucide-react';
import Scene from '../Scene';
import ThemeSelector from '../components/ThemeSelector';

const LandingPage = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState(null);

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

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: '#000', position: 'relative' }}>
      {/* Sleek Floating Tactical Top HUD */}
      <header className="landing-top-hud">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: 6,
              background: 'linear-gradient(135deg, #ff5714, #d93d00)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 10px rgba(255, 77, 0, 0.5)',
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 900, color: '#fff', lineHeight: 1 }}>₹</span>
          </div>
          <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
            pennywise<i style={{ color: '#ff4d00', fontStyle: 'normal' }}>.</i>
          </span>
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
            <span className="pulse-dot" style={{ width: 5, height: 5 }} /> ONLINE
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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

      {/* 3D Interactive Scene Frame */}
      <Scene />
    </div>
  );
};

export default LandingPage;
