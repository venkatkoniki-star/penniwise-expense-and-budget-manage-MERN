import React, { useState, useRef, useEffect } from 'react';
import { Moon, Sun, Gamepad2, Coins, Zap, Palette, Check, ChevronUp } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ICON_MAP = {
  Moon: Moon,
  Sun: Sun,
  Gamepad2: Gamepad2,
  Coins: Coins,
  Zap: Zap,
};

const THEME_PREVIEWS = {
  dark: ['#060608', '#0c0c10', '#ff4d00', '#00ed64'],
  light: ['#f8f9fc', '#ffffff', '#ff4d00', '#059669'],
  gaming: ['#0a0614', '#120d24', '#00f0ff', '#ff0055'],
  money: ['#05140b', '#0a2013', '#00e676', '#ffd700'],
  comic: ['#fffbf0', '#ffffff', '#ff2a4b', '#ffd600'],
};

export const ThemeSelector = ({ compact = false, showLabel = true, placement = 'top' }) => {
  const { theme, setTheme, themes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentTheme = themes.find((t) => t.id === theme) || themes[0];
  const CurrentIcon = ICON_MAP[currentTheme.icon] || Palette;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="theme-selector-container" ref={dropdownRef} style={{ position: 'relative', width: compact ? 'auto' : '100%' }}>
      {/* Trigger Button */}
      <button
        type="button"
        className={`theme-trigger-btn ${compact ? 'compact' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title={`Current Theme: ${currentTheme.name}. Click to change.`}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            className="theme-icon-chip"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 22,
              height: 22,
              borderRadius: 6,
              background: 'var(--surface-3)',
              color: currentTheme.color,
              boxShadow: `0 0 8px ${currentTheme.color}33`,
            }}
          >
            <CurrentIcon size={13} />
          </span>
          {showLabel && (
            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', lineHeight: 1.2 }}>
              <span style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {currentTheme.name}
              </span>
              <span style={{ fontSize: '0.62rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                {currentTheme.badge}
              </span>
            </div>
          )}
        </div>
        <ChevronUp
          size={13}
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
            color: 'var(--text-muted)',
            marginLeft: 'auto'
          }}
        />
      </button>

      {/* Floating Theme Menu */}
      {isOpen && (
        <div
          className="theme-menu-popover"
          style={{
            position: 'absolute',
            ...(placement === 'top'
              ? { bottom: 'calc(100% + 8px)', left: 0 }
              : { top: 'calc(100% + 8px)', right: 0 }),
            width: compact ? 260 : '100%',
            minWidth: 240,
            maxWidth: 'calc(100vw - 32px)',
            zIndex: 1000,
          }}
        >
          <div className="theme-menu-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Palette size={13} color="var(--accent)" />
              <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-mono)' }}>
                Select OS Atmosphere
              </span>
            </div>
          </div>

          <div className="theme-list">
            {themes.map((t) => {
              const IconComp = ICON_MAP[t.icon] || Palette;
              const isSelected = t.id === theme;
              const previews = THEME_PREVIEWS[t.id] || [];

              return (
                <button
                  key={t.id}
                  type="button"
                  className={`theme-option-item ${isSelected ? 'active' : ''}`}
                  onClick={() => {
                    setTheme(t.id);
                    setIsOpen(false);
                  }}
                >
                  <div className="theme-option-icon" style={{ color: t.color }}>
                    <IconComp size={16} />
                  </div>

                  <div className="theme-option-details">
                    <div className="theme-option-title-row">
                      <span className="theme-option-title">{t.name}</span>
                      <span className="theme-option-badge" style={{ borderColor: `${t.color}55`, color: t.color }}>
                        {t.badge}
                      </span>
                    </div>
                    <span className="theme-option-desc">{t.description}</span>
                    
                    {/* Color Swatch Dots */}
                    <div className="theme-swatch-row">
                      {previews.map((c, i) => (
                        <span
                          key={i}
                          className="theme-swatch-dot"
                          style={{ background: c }}
                        />
                      ))}
                    </div>
                  </div>

                  {isSelected && (
                    <div className="theme-selected-indicator">
                      <Check size={14} color="var(--accent)" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeSelector;
