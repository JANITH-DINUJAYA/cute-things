'use client';

import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Eye, EyeOff, Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPwd,  setShowPwd]  = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Sign in with Firebase Auth
      const cred = await signInWithEmailAndPassword(auth, email, password);

      // 2. Force-refresh the ID token so custom claims (role) are included
      const idToken = await cred.user.getIdToken(/* forceRefresh */ true);

      // 3. Send token to session API
      const res = await fetch('/api/auth/session', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ idToken }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Sign out from Firebase client too so state is clean
        await auth.signOut();
        setError(data.error || 'Login failed. Please try again.');
        return;
      }

      // 4. Redirect to admin dashboard
      router.push('/admin');
      router.refresh();

    } catch (err) {
      console.error('[login]', err.code, err.message);
      if (
        err.code === 'auth/user-not-found'   ||
        err.code === 'auth/wrong-password'   ||
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/invalid-email'
      ) {
        setError('Invalid email or password.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many attempts. Please wait a few minutes and try again.');
      } else if (err.code === 'auth/network-request-failed') {
        setError('Network error. Check your internet connection.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
      background: 'linear-gradient(145deg, #0f0c10 0%, #1a1220 50%, #0e1520 100%)',
    }}>
      {/* Background glows */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', top: '-20%', right: '-10%',
          width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(197,168,128,.12) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-20%', left: '-10%',
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(229,179,179,.1) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%,-50%)',
          width: 800, height: 800, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(197,168,128,.04) 0%, transparent 60%)',
        }} />
      </div>

      <div style={{ position: 'relative', width: '100%', maxWidth: 440, margin: '0 24px' }}>

        {/* Logo + Brand */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: 16 }}>
            <div style={{
              position: 'absolute', inset: -4, borderRadius: '50%',
              background: 'linear-gradient(135deg, #c5a880, #e5b3b3)',
              opacity: 0.4, filter: 'blur(8px)',
            }} />
            <Image
              src="/logo.jpg"
              alt="Cute Things"
              width={72}
              height={72}
              style={{ borderRadius: '50%', objectFit: 'cover', position: 'relative', border: '2px solid rgba(197,168,128,.4)' }}
              priority
            />
          </div>
          <h1 style={{
            fontFamily: 'var(--font-serif)', fontSize: 32, fontWeight: 300,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            color: '#fff', margin: 0, lineHeight: 1,
          }}>
            Cute Things
          </h1>
          <p style={{ color: 'rgba(197,168,128,.6)', marginTop: 8, fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            Admin Portal
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,.04)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(197,168,128,.15)',
          borderRadius: 20,
          padding: '36px 32px',
          boxShadow: '0 32px 64px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.06)',
        }}>
          <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 500, margin: '0 0 24px', textAlign: 'center', letterSpacing: '0.02em' }}>
            Sign In to Dashboard
          </h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* Error message */}
            {error && (
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                background: 'rgba(239,68,68,.12)', border: '1px solid rgba(239,68,68,.25)',
                borderRadius: 10, padding: '12px 14px', color: '#fca5a5', fontSize: 13, lineHeight: 1.5,
              }}>
                <AlertCircle size={15} style={{ marginTop: 1, flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            {/* Email */}
            <div>
              <label style={{ display: 'block', color: 'rgba(255,255,255,.6)', fontSize: 12, fontWeight: 600, marginBottom: 8, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(197,168,128,.5)' }} />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="admin@cutethings.lk"
                  style={{
                    width: '100%', padding: '12px 14px 12px 40px',
                    background: 'rgba(255,255,255,.06)',
                    border: '1.5px solid rgba(197,168,128,.2)',
                    borderRadius: 10, color: '#fff', fontSize: 14, outline: 'none',
                    transition: 'border-color 0.2s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'rgba(197,168,128,.6)'}
                  onBlur={(e)  => e.target.style.borderColor = 'rgba(197,168,128,.2)'}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', color: 'rgba(255,255,255,.6)', fontSize: 12, fontWeight: 600, marginBottom: 8, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(197,168,128,.5)' }} />
                <input
                  id="password"
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  style={{
                    width: '100%', padding: '12px 44px 12px 40px',
                    background: 'rgba(255,255,255,.06)',
                    border: '1.5px solid rgba(197,168,128,.2)',
                    borderRadius: 10, color: '#fff', fontSize: 14, outline: 'none',
                    transition: 'border-color 0.2s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'rgba(197,168,128,.6)'}
                  onBlur={(e)  => e.target.style.borderColor = 'rgba(197,168,128,.2)'}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  style={{
                    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'rgba(197,168,128,.5)', padding: 0, display: 'flex',
                  }}
                >
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '14px',
                background: loading
                  ? 'rgba(197,168,128,.4)'
                  : 'linear-gradient(135deg, #c5a880, #d4b896)',
                border: 'none', borderRadius: 10,
                color: '#1e1a1d', fontSize: 14, fontWeight: 700,
                letterSpacing: '0.08em', textTransform: 'uppercase',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                marginTop: 4,
                boxShadow: loading ? 'none' : '0 4px 20px rgba(197,168,128,.3)',
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  Signing in…
                </>
              ) : (
                'Sign In to Admin Panel'
              )}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,.2)', fontSize: 12, marginTop: 24 }}>
          © {new Date().getFullYear()} Cute Things. Secure Admin Access Only.
        </p>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input::placeholder { color: rgba(255,255,255,.25); }
      `}</style>
    </div>
  );
}
