import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Wallet, Zap, Gamepad2, Coins, ShieldCheck, Sparkles, Flame, Terminal } from 'lucide-react';

/**
 * AppLogo — Dynamically adapts branding, iconography, typography,
 * and visual effects based on the active OS theme.
 *
 * Specific themes:
 * - comic: Vintage action comic book reference (starburst KAPOW badge, 3D extruded title, issue #1 banner)
 * - gaming: Cyberpunk arcade neon glitch (RGB scanlines, glowing cyan/magenta, retro pixel font)
 * - money: Bullion royal treasury (gold bullion crest, emerald vault)
 * - light: Minimalist sapphire slate (geometric clean enterprise)
 * - dark: Tactical stealth carbon (orange pulse radar core)
 */
export const AppLogo = ({ size = 'md', showSub = false, className = '', onClick }) => {
  const { theme } = useTheme();

  // Dimension presets
  const dims = {
    sm: { iconBox: 26, iconSize: 13, text: '0.94rem', sub: '0.52rem', gap: 7 },
    md: { iconBox: 32, iconSize: 16, text: '1.12rem', sub: '0.62rem', gap: 9 },
    lg: { iconBox: 42, iconSize: 22, text: '1.45rem', sub: '0.72rem', gap: 12 },
  }[size] || { iconBox: 32, iconSize: 16, text: '1.12rem', sub: '0.62rem', gap: 9 };

  switch (theme) {
    case 'comic':
      // 💥 VINTAGE ACTION COMIC BOOK REFERENCE (Marvel / DC Pop-Art homage)
      return (
        <div
          className={`app-logo-brand theme-comic ${className}`}
          onClick={onClick}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: dims.gap,
            cursor: onClick ? 'pointer' : 'default',
            userSelect: 'none',
            position: 'relative',
          }}
          title="PENNYWISE COMICS — Issue #1"
        >
          {/* Jagged Comic Starburst Burst Badge */}
          <div
            style={{
              position: 'relative',
              width: dims.iconBox + 6,
              height: dims.iconBox + 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: 'rotate(-4deg)',
              flexShrink: 0,
              filter: 'drop-shadow(2.5px 2.5px 0px #000000)',
            }}
          >
            <svg
              viewBox="0 0 100 100"
              width={dims.iconBox + 6}
              height={dims.iconBox + 6}
              style={{ overflow: 'visible' }}
            >
              {/* Starburst explosion points */}
              <polygon
                points="50,2 62,28 92,12 80,42 100,58 72,68 76,98 50,82 24,98 28,68 0,58 20,42 8,12 38,28"
                fill="#ffe600"
                stroke="#000000"
                strokeWidth="4"
                strokeLinejoin="round"
              />
            </svg>
            <span
              style={{
                position: 'absolute',
                fontSize: dims.iconSize + 2,
                fontWeight: 900,
                color: '#ff2a4b',
                fontFamily: '"Impact", "Arial Black", sans-serif',
                lineHeight: 1,
                transform: 'rotate(4deg)',
                textShadow: '1px 1px 0px #000, -1px -1px 0 #ffe600',
              }}
            >
              ₹
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span
                style={{
                  fontSize: dims.text,
                  fontWeight: 900,
                  letterSpacing: '0.04em',
                  color: '#ffe600',
                  textTransform: 'uppercase',
                  textShadow: '2px 2px 0px #000, 4px 4px 0px #ff2a4b, 5.5px 5.5px 0px #000',
                  fontFamily: '"Impact", "Arial Black", "Plus Jakarta Sans", sans-serif',
                  lineHeight: 1.1,
                  transform: 'skewX(-4deg)',
                }}
              >
                PENNYWISE<span style={{ color: '#ff2a4b' }}>!</span>
              </span>

              {/* Vintage Comic Corner Price Box Stamp */}
              <span
                style={{
                  fontSize: '0.52rem',
                  fontWeight: 900,
                  fontFamily: '"Impact", "Arial Black", sans-serif',
                  background: '#ffffff',
                  color: '#000000',
                  border: '1.5px solid #000000',
                  boxShadow: '1.5px 1.5px 0 #000000',
                  padding: '0 4px',
                  borderRadius: 2,
                  lineHeight: 1.2,
                  transform: 'rotate(2deg)',
                  letterSpacing: '0.02em',
                }}
              >
                12¢
              </span>
            </div>

            {showSub && (
              <span
                style={{
                  fontSize: dims.sub,
                  fontWeight: 800,
                  color: '#000000',
                  background: '#ffe600',
                  padding: '1px 5px',
                  borderRadius: 2,
                  border: '1.5px solid #000000',
                  boxShadow: '1.5px 1.5px 0 #000000',
                  marginTop: 3,
                  letterSpacing: '0.06em',
                  width: 'fit-content',
                  textTransform: 'uppercase',
                  fontFamily: '"Impact", "Arial Black", sans-serif',
                }}
              >
                ★ ACTION COMICS #1 · CODE APPROVED ★
              </span>
            )}
          </div>
        </div>
      );

    case 'gaming':
      // 🕹️ CYBERPUNK ARCADE NEON GLITCH (Retro 80s Synthwave)
      return (
        <div
          className={`app-logo-brand theme-gaming ${className}`}
          onClick={onClick}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: dims.gap,
            cursor: onClick ? 'pointer' : 'default',
            userSelect: 'none',
          }}
          title="PENNYWISE // NEON ARCADE"
        >
          <div
            style={{
              width: dims.iconBox,
              height: dims.iconBox,
              borderRadius: 6,
              background: 'linear-gradient(135deg, #00f0ff, #ff007f)',
              border: '1.5px solid #00f0ff',
              boxShadow: '0 0 14px rgba(0, 240, 255, 0.75), inset 0 0 8px rgba(255, 0, 127, 0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Gamepad2 size={dims.iconSize} color="#05010a" strokeWidth={2.6} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span
              style={{
                fontSize: dims.text,
                fontWeight: 800,
                color: '#ffffff',
                fontFamily: 'var(--font-mono)',
                letterSpacing: '-0.02em',
                textShadow: '0 0 10px rgba(0, 240, 255, 0.8), 0 0 20px rgba(255, 0, 127, 0.6)',
                lineHeight: 1.1,
              }}
            >
              pennywise<span style={{ color: '#00f0ff', animation: 'pulse 1s infinite' }}>_</span>
            </span>
            {showSub && (
              <span
                style={{
                  fontSize: dims.sub,
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  color: '#00f0ff',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  marginTop: 2,
                  textShadow: '0 0 6px rgba(0, 240, 255, 0.6)',
                }}
              >
                [ INSERT COIN · LVL 99 ]
              </span>
            )}
          </div>
        </div>
      );

    case 'money':
      // 💎 BULLION GOLD & EMERALD ROYAL TREASURY
      return (
        <div
          className={`app-logo-brand theme-money ${className}`}
          onClick={onClick}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: dims.gap,
            cursor: onClick ? 'pointer' : 'default',
            userSelect: 'none',
          }}
          title="PENNYWISE · THE ROYAL TREASURY"
        >
          <div
            style={{
              width: dims.iconBox,
              height: dims.iconBox,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #ffd700 0%, #ff9900 100%)',
              border: '1px solid #ffe066',
              boxShadow: '0 0 16px rgba(255, 215, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Coins size={dims.iconSize} color="#081e10" strokeWidth={2.4} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span
              style={{
                fontSize: dims.text,
                fontWeight: 800,
                color: '#ffffff',
                letterSpacing: '-0.01em',
                lineHeight: 1.1,
              }}
            >
              pennywise<span style={{ color: '#00e676', fontStyle: 'normal' }}>.</span>
            </span>
            {showSub && (
              <span
                style={{
                  fontSize: dims.sub,
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  color: '#ffd700',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginTop: 2,
                }}
              >
                ★ ROYAL TREASURY · VAULT ★
              </span>
            )}
          </div>
        </div>
      );

    case 'light':
      // ☀️ SAPPHIRE SLATE (Modern Minimalist Enterprise)
      return (
        <div
          className={`app-logo-brand theme-light ${className}`}
          onClick={onClick}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: dims.gap,
            cursor: onClick ? 'pointer' : 'default',
            userSelect: 'none',
          }}
          title="PENNYWISE · SAPPHIRE"
        >
          <div
            style={{
              width: dims.iconBox,
              height: dims.iconBox,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              boxShadow: '0 2px 10px rgba(59, 130, 246, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Wallet size={dims.iconSize} color="#ffffff" strokeWidth={2.2} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span
              style={{
                fontSize: dims.text,
                fontWeight: 800,
                color: '#0f172a',
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
              }}
            >
              pennywise<span style={{ color: '#3b82f6', fontStyle: 'normal' }}>.</span>
            </span>
            {showSub && (
              <span
                style={{
                  fontSize: dims.sub,
                  fontWeight: 600,
                  fontFamily: 'var(--font-mono)',
                  color: '#64748b',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  marginTop: 2,
                }}
              >
                PRO LEDGER · CLOUD
              </span>
            )}
          </div>
        </div>
      );

    case 'dark':
    default:
      // ⚡ TACTICAL STEALTH CARBON (Default Precision Financial Terminal)
      return (
        <div
          className={`app-logo-brand theme-dark ${className}`}
          onClick={onClick}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: dims.gap,
            cursor: onClick ? 'pointer' : 'default',
            userSelect: 'none',
          }}
          title="PENNYWISE · TACTICAL OS"
        >
          <div
            style={{
              width: dims.iconBox,
              height: dims.iconBox,
              borderRadius: 7,
              background: 'linear-gradient(135deg, #ff5714 0%, #d93d00 100%)',
              border: '1px solid rgba(255, 77, 0, 0.4)',
              boxShadow: '0 0 14px rgba(255, 77, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: dims.iconSize, fontWeight: 900, color: '#ffffff', lineHeight: 1 }}>
              ₹
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span
              style={{
                fontSize: dims.text,
                fontWeight: 800,
                color: '#ffffff',
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
              }}
            >
              pennywise<span style={{ color: '#ff4d00', fontStyle: 'normal' }}>.</span>
            </span>
            {showSub && (
              <span
                style={{
                  fontSize: dims.sub,
                  fontWeight: 600,
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-muted)',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  marginTop: 2,
                }}
              >
                TACTICAL OS · INR (₹)
              </span>
            )}
          </div>
        </div>
      );
  }
};

export default AppLogo;
