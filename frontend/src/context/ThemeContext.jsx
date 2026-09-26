import React, { createContext, useContext, useEffect, useState } from 'react';

export const THEMES = [
  {
    id: 'comic',
    name: 'Comic Book',
    icon: 'Zap',
    color: '#ff2a4b',
    description: 'Pop art graphic novel, bold ink & 3D punch shadows',
    badge: 'DEFAULT'
  },
  {
    id: 'dark',
    name: 'Tactical Dark',
    icon: 'Moon',
    color: '#ff4d00',
    description: 'Obsidian terminal & electric orange HUD',
    badge: 'OLED'
  },
  {
    id: 'light',
    name: 'Clean Light',
    icon: 'Sun',
    color: '#3b82f6',
    description: 'Crisp minimal slate & ice white surfaces',
    badge: 'MINIMAL'
  },
  {
    id: 'gaming',
    name: 'Cyber Gaming',
    icon: 'Gamepad2',
    color: '#00f0ff',
    description: 'RGB Cyberpunk neon, cyan laser & acid green',
    badge: 'NEON RGB'
  },
  {
    id: 'money',
    name: 'Wealth & Money',
    icon: 'Coins',
    color: '#00e676',
    description: 'Deep emerald vault, mint cashflow & bullion gold',
    badge: 'EMERALD'
  }
];

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Default to 'comic' theme unless user explicitly changed it
    const userSelected = localStorage.getItem('theme_user_selected');
    if (!userSelected) {
      return 'comic';
    }
    return localStorage.getItem('theme') || 'comic';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    // Adjust browser color scheme for scrollbars & native controls
    const isLightScheme = theme === 'light' || theme === 'comic';
    document.documentElement.style.colorScheme = isLightScheme ? 'light' : 'dark';
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => {
      const idx = THEMES.findIndex((t) => t.id === prev);
      const nextIdx = (idx + 1) % THEMES.length;
      localStorage.setItem('theme_user_selected', 'true');
      return THEMES[nextIdx].id;
    });
  };

  const selectTheme = (themeId) => {
    if (THEMES.some((t) => t.id === themeId)) {
      localStorage.setItem('theme_user_selected', 'true');
      setTheme(themeId);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: selectTheme, toggleTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
