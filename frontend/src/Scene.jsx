import React from 'react';
import { SublevelStudioLandingPage } from '@designcodeio/threeui';
import '@designcodeio/threeui/style.css';

export function Scene() {
  return (
    <div className="shader-frame" style={{ width: '100%', height: '100%', minHeight: '100vh', position: 'relative' }}>
      <SublevelStudioLandingPage style={{ width: '100%', height: '100%', minHeight: '100vh' }} />
    </div>
  );
}

export default Scene;
