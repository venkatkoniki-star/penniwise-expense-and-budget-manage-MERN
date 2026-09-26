import React from 'react';

export function Scene() {
  return (
    <div
      className="shader-frame"
      style={{
        width: '100%',
        height: '100%',
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        background: '#080808',
      }}
    >
      <iframe
        title="Pennywise — Tactical Expense & Budget Management OS"
        src="/landing-pages/sublevel-studio.html"
        sandbox="allow-downloads allow-forms allow-modals allow-popups allow-same-origin allow-scripts allow-top-navigation allow-top-navigation-by-user-activation"
        loading="eager"
        style={{
          position: 'absolute',
          inset: 0,
          display: 'block',
          width: '100%',
          height: '100%',
          border: 0,
          background: '#080808',
        }}
      />
    </div>
  );
}

export default Scene;
