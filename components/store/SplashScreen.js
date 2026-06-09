'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Check if we've already shown the splash this session
    if (sessionStorage.getItem('ct_splash_shown')) {
      setVisible(false);
      return;
    }

    // Start fade-out after 2.2s, fully remove after 2.9s
    const fadeTimer = setTimeout(() => setFadeOut(true), 2200);
    const removeTimer = setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem('ct_splash_shown', '1');
    }, 2900);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(145deg, #1e1a1d 0%, #0e0c0e 50%, #1a1218 100%)',
          transition: 'opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
          opacity: fadeOut ? 0 : 1,
          pointerEvents: fadeOut ? 'none' : 'auto',
        }}
      >
        {/* Ambient glow blobs */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <div style={{
            position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
            width: 600, height: 600, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(197,168,128,0.12) 0%, transparent 70%)',
            animation: 'splashPulse 2s ease-in-out infinite',
          }} />
          <div style={{
            position: 'absolute', bottom: '10%', left: '10%',
            width: 300, height: 300, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(229,179,179,0.08) 0%, transparent 70%)',
          }} />
          <div style={{
            position: 'absolute', top: '10%', right: '5%',
            width: 250, height: 250, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(197,168,128,0.08) 0%, transparent 70%)',
          }} />
        </div>

        {/* Floating particles */}
        {['🌸', '✨', '💖', '🌷', '⭐', '🎀'].map((emoji, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              fontSize: 18 + (i % 3) * 6,
              top: `${8 + i * 14}%`,
              left: `${4 + i * 16}%`,
              opacity: 0.15,
              animation: `splashFloat${i % 3} ${3 + i * 0.4}s ease-in-out infinite`,
            }}
          >
            {emoji}
          </div>
        ))}

        {/* Center content */}
        <div style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0,
          animation: 'splashEntry 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        }}>
          {/* Logo ring */}
          <div style={{
            position: 'relative',
            width: 120,
            height: 120,
            marginBottom: 28,
          }}>
            {/* Rotating ring */}
            <div style={{
              position: 'absolute',
              inset: -6,
              borderRadius: '50%',
              border: '2px solid transparent',
              background: 'linear-gradient(#1e1a1d, #1e1a1d) padding-box, linear-gradient(135deg, #c5a880, #e5b3b3, #c5a880) border-box',
              animation: 'splashSpin 3s linear infinite',
            }} />
            {/* Logo */}
            <Image
              src="/logo.jpg"
              alt="Cute Things"
              width={120}
              height={120}
              style={{
                borderRadius: '50%',
                objectFit: 'cover',
                position: 'relative',
                zIndex: 1,
                boxShadow: '0 0 40px rgba(197, 168, 128, 0.3)',
              }}
              priority
            />
          </div>

          {/* Brand name */}
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 42,
            fontWeight: 300,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#ffffff',
            margin: 0,
            lineHeight: 1,
          }}>
            Cute Things
          </h1>

          {/* Gold line */}
          <div style={{
            width: 64,
            height: 1,
            background: 'linear-gradient(90deg, transparent, #c5a880, transparent)',
            margin: '14px 0',
            animation: 'splashLineExpand 1s 0.5s ease-out both',
          }} />

          {/* Tagline */}
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 11,
            fontWeight: 400,
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: 'rgba(197, 168, 128, 0.7)',
            margin: 0,
            animation: 'splashFadeIn 0.8s 0.6s ease-out both',
          }}>
            Plush · Gifts · Accessories
          </p>

          {/* Loading dots */}
          <div style={{
            display: 'flex',
            gap: 6,
            marginTop: 36,
            animation: 'splashFadeIn 0.5s 1s ease-out both',
          }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  background: '#c5a880',
                  animation: `splashDot 1.2s ${i * 0.2}s ease-in-out infinite`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes splashEntry {
          from { opacity: 0; transform: translateY(20px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes splashSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes splashPulse {
          0%, 100% { transform: translateX(-50%) scale(1);   opacity: 0.7; }
          50%       { transform: translateX(-50%) scale(1.2); opacity: 1; }
        }
        @keyframes splashFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes splashLineExpand {
          from { width: 0; opacity: 0; }
          to   { width: 64px; opacity: 1; }
        }
        @keyframes splashDot {
          0%, 100% { transform: translateY(0);   opacity: 0.4; }
          50%       { transform: translateY(-6px); opacity: 1; }
        }
        @keyframes splashFloat0 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50%       { transform: translateY(-14px) rotate(10deg); }
        }
        @keyframes splashFloat1 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50%       { transform: translateY(-20px) rotate(-8deg); }
        }
        @keyframes splashFloat2 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50%       { transform: translateY(-10px) rotate(6deg); }
        }
      `}</style>
    </>
  );
}
