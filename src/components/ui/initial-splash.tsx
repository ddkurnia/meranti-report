'use client';

import { useEffect, useRef } from 'react';

export function InitialSplash() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function hide() {
      const target = ref.current;
      if (!target) return;
      target.style.transition = 'opacity 0.3s';
      target.style.opacity = '0';
      setTimeout(() => target.remove(), 300);
    }

    if (document.readyState === 'complete') hide();
    else window.addEventListener('load', hide);
    // Safety: force hide after 4s even if load event never fires
    const timer = setTimeout(hide, 4000);
    return () => {
      window.removeEventListener('load', hide);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div
      ref={ref}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 16,
        background: '#ffffff',
      }}
    >
      <img
        src="/loading-logo.png"
        alt=""
        style={{ width: 96, height: 96, objectFit: 'contain' }}
      />
      <div
        style={{
          width: 28, height: 28,
          border: '3px solid #e5e7eb',
          borderTopColor: '#dc2626',
          borderRadius: '50%',
          animation: 'splash-spin 0.8s linear infinite',
        }}
      />
      <style>{`@keyframes splash-spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
