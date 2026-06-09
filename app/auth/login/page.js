'use client';

import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc }               from 'firebase/firestore';
import { auth, db }                  from '@/lib/firebase/client';
import { useRouter }                 from 'next/navigation';
import { Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react';

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

      // 2. Get the ID token (includes custom claims like role)
      const idToken = await cred.user.getIdToken();

      // 3. Verify the user exists in our Firestore users collection
      const userDoc = await getDoc(doc(db, 'users', cred.user.uid));
      if (!userDoc.exists()) {
        await auth.signOut();
        setError('Your account does not have admin access.');
        return;
      }

      // 4. Store token in session cookie via API
      await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      // 5. Redirect to admin dashboard
      router.push('/admin');
      router.refresh();
    } catch (err) {
      console.error(err);
      if (
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/invalid-credential'
      ) {
        setError('Invalid email or password.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
         style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>

      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div style={{
          position: 'absolute', top: '-20%', right: '-10%',
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(233,30,140,.15) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-20%', left: '-10%',
          width: '400px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(156,39,176,.15) 0%, transparent 70%)',
        }} />
      </div>

      <div className="relative w-full max-w-md mx-4">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 72, height: 72, borderRadius: '20px',
            background: 'linear-gradient(135deg, #e91e8c, #9c27b0)',
            boxShadow: '0 8px 32px rgba(233,30,140,.4)', marginBottom: 16,
          }}>
            <span style={{ fontSize: 32 }}>🌸</span>
          </div>
          <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 700, margin: 0 }}>
            Cute Things
          </h1>
          <p style={{ color: 'rgba(255,255,255,.5)', marginTop: 4, fontSize: 14 }}>
            Admin Panel — Secure Login
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,.05)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,.12)',
          borderRadius: 24,
          padding: 40,
          boxShadow: '0 24px 64px rgba(0,0,0,.3)',
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Error */}
            {error && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'rgba(239,68,68,.15)', border: '1px solid rgba(239,68,68,.3)',
                borderRadius: 10, padding: '10px 14px', color: '#fca5a5', fontSize: 14,
              }}>
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {/* Email */}
            <div>
              <label style={{ display: 'block', color: 'rgba(255,255,255,.7)', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,.4)' }} />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@cutethings.lk"
                  style={{
                    width: '100%', padding: '11px 14px 11px 40px',
                    background: 'rgba(255,255,255,.08)',
                    border: '1.5px solid rgba(255,255,255,.15)',
                    borderRadius: 10, color: '#fff', fontSize: 14, outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', color: 'rgba(255,255,255,.7)', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,.4)' }} />
                <input
                  id="password"
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  style={{
                    width: '100%', padding: '11px 40px 11px 40px',
                    background: 'rgba(255,255,255,.08)',
                    border: '1.5px solid rgba(255,255,255,.15)',
                    borderRadius: 10, color: '#fff', fontSize: 14, outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,.4)' }}
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: 15, marginTop: 4, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Signing in…' : 'Sign In to Admin Panel'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,.3)', fontSize: 12, marginTop: 24 }}>
          © {new Date().getFullYear()} Cute Things. All rights reserved.
        </p>
      </div>
    </div>
  );
}
