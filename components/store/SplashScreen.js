'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

// How long the splash stays fully visible (ms)
const SPLASH_VISIBLE_MS  = 3200;
// How long the fade-out takes (ms) — must match CSS transition below
const SPLASH_FADEOUT_MS  = 800;

export default function SplashScreen() {
  const [visible, setVisible]   = useState(true);
  const [fadeOut, setFadeOut]   = useState(false);

  useEffect(() => {
    // Only show once per browser session
    if (sessionStorage.getItem('ct_splash_shown')) {
      setVisible(false);
      return;
    }

    const fadeTimer   = setTimeout(() => setFadeOut(true),  SPLASH_VISIBLE_MS);
    const removeTimer = setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem('ct_splash_shown', '1');
    }, SPLASH_VISIBLE_MS + SPLASH_FADEOUT_MS);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <>
      <div
        aria-hidden="true"
        style={{
          position:       'fixed',
          inset:          0,
          zIndex:         9999,
          display:        'flex',
          flexDirection:  'column',
          alignItems:     'center',
          justifyContent: 'center',
          background:     'linear-gradient(145deg, #0f0c10 0%, #1a1220 50%, #120e18 100%)',
          transition:     `opacity ${SPLASH_FADEOUT_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`,
          opacity:        fadeOut ? 0 : 1,
          pointerEvents:  fadeOut ? 'none' : 'auto',
        }}
      >
        {/* ── Ambient blobs ───────────────────────────────────────────── */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <div style={{
            position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)',
            width: 700, height: 700, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(197,168,128,.1) 0%, transparent 70%)',
            animation: 'splashPulse 3s ease-in-out infinite',
          }} />
          <div style={{
            position: 'absolute', bottom: '5%', left: '5%',
            width: 320, height: 320, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(229,179,179,.07) 0%, transparent 70%)',
          }} />
          <div style={{
            position: 'absolute', top: '5%', right: '5%',
            width: 280, height: 280, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(197,168,128,.07) 0%, transparent 70%)',
          }} />
        </div>

        {/* ── Floating emojis ─────────────────────────────────────────── */}
        {['🌸', '✨', '💖', '🌷', '⭐', '🎀', '🧸', '🎁'].map((emoji, i) => (
          <div key={i} style={{
            position:  'absolute',
            fontSize:  16 + (i % 4) * 6,
            top:       `${6 + i * 11}%`,
            left:      `${3 + i * 12}%`,
            opacity:   0.12,
            animation: `splashFloat${i % 3} ${3.5 + i * 0.35}s ease-in-out infinite`,
          }}>
            {emoji}
          </div>
        ))}

        {/* ── Centre content ───────────────────────────────────────────── */}
        <div style={{
          position:       'relative',
          display:        'flex',
          flexDirection:  'column',
          alignItems:     'center',
          animation:      'splashEntry 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        }}>

          {/* Spinning ring + logo */}
          <div style={{ position: 'relative', width: 130, height: 130, marginBottom: 32 }}>
            {/* Outer glow */}
            <div style={{
              position: 'absolute', inset: -12, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(197,168,128,.2) 0%, transparent 70%)',
            }} />
            {/* Spinning gradient ring */}
            <div style={{
              position:   'absolute',
              inset:       -5,
              borderRadius: '50%',
              border:      '2px solid transparent',
              background:  'linear-gradient(#0f0c10, #0f0c10) padding-box, linear-gradient(135deg, #c5a880 0%, #e5b3b3 50%, #c5a880 100%) border-box',
              animation:   'splashSpin 3s linear infinite',
            }} />
            {/* Logo image */}
            <Image
              src="/logo.jpg"
              alt="Cute Things"
              width={130}
              height={130}
              style={{
                borderRadius:  '50%',
                objectFit:     'cover',
                position:      'relative',
                zIndex:        1,
                boxShadow:     '0 0 48px rgba(197,168,128,.35)',
                border:        '2px solid rgba(197,168,128,.3)',
              }}
              priority
            />
          </div>

          {/* Brand name */}
          <h1 style={{
            fontFamily:    'var(--font-serif)',
            fontSize:      46,
            fontWeight:    300,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color:         '#ffffff',
            margin:        0,
            lineHeight:    1,
          }}>
            Cute Things
          </h1>

          {/* Animated gold divider */}
          <div style={{
            width:      72,
            height:     1,
            background: 'linear-gradient(90deg, transparent, #c5a880, transparent)',
            margin:     '16px 0',
            animation:  'splashLineExpand 1s 0.5s ease-out both',
          }} />

          {/* Tagline */}
          <p style={{
            fontFamily:    'var(--font-sans)',
            fontSize:      11,
            fontWeight:    400,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color:         'rgba(197,168,128,.65)',
            margin:        0,
            animation:     'splashFadeIn 0.8s 0.7s ease-out both',
          }}>
            Plush · Gifts · Accessories
          </p>

          {/* Loading dots */}
          <div style={{
            display:   'flex',
            gap:       7,
            marginTop: 40,
            animation: 'splashFadeIn 0.6s 1.1s ease-out both',
          }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{
                width:      6,
                height:     6,
                borderRadius: '50%',
                background: '#c5a880',
                animation:  `splashDot 1.4s ${i * 0.22}s ease-in-out infinite`,
              }} />
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes splashEntry {
          from { opacity: 0; transform: translateY(24px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0)     scale(1);    }
        }
        @keyframes splashSpin {
          from { transform: rotate(0deg);   }
          to   { transform: rotate(360deg); }
        }
        @keyframes splashPulse {
          0%, 100% { transform: translateX(-50%) scale(1);   opacity: 0.6; }
          50%       { transform: translateX(-50%) scale(1.3); opacity: 1;   }
        }
        @keyframes splashFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes splashLineExpand {
          from { width: 0;    opacity: 0; }
          to   { width: 72px; opacity: 1; }
        }
        @keyframes splashDot {
          0%, 100% { transform: translateY(0);   opacity: 0.35; }
          50%       { transform: translateY(-8px); opacity: 1;    }
        }
        @keyframes splashFloat0 {
          0%,100% { transform: translateY(0)     rotate(0deg);  }
          50%      { transform: translateY(-16px) rotate(12deg); }
        }
        @keyframes splashFloat1 {
          0%,100% { transform: translateY(0)     rotate(0deg);   }
          50%      { transform: translateY(-22px) rotate(-10deg); }
        }
        @keyframes splashFloat2 {
          0%,100% { transform: translateY(0)     rotate(0deg); }
          50%      { transform: translateY(-12px) rotate(7deg); }
        }
      `}</style>
    </>
  );
}
