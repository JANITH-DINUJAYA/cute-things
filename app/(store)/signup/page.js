'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { User, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';

function SignupFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignup(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Create Firebase Auth user
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);

      // 2. Update user profile display name
      await updateProfile(cred.user, { displayName: name.trim() });

      // 3. Write customer document to Firestore via API
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: cred.user.uid,
          name: name.trim(),
          email: email.toLowerCase().trim(),
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to create customer profile document');
      }

      // 4. Redirect
      router.push(redirect);
      router.refresh();
    } catch (err) {
      console.error('[signup]', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('This email address is already in use.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else {
        setError(err.message || 'Signup failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg,rgba(197,168,128,0.15),rgba(229,179,179,0.15))', border: '1.5px solid rgba(197,168,128,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#c5a880' }}>
            <User size={24} />
          </div>
          <h1 style={{ fontSize: 'clamp(24px,4vw,32px)', fontWeight: 800, margin: '0 0 8px', fontFamily: 'var(--font-serif)' }}>
            Create <span className="gradient-brand-text">Account</span>
          </h1>
          <p style={{ color: '#6b7280', fontSize: 14, margin: 0 }}>Join us to place orders and track delivery status 🌸</p>
        </div>

        {error && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 14px', color: '#991b1b', fontSize: 13, marginBottom: 20 }}>
            <AlertCircle size={16} style={{ marginTop: 2, flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Full Name</label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Janith Perera" className="input" style={{ paddingLeft: 42 }} disabled={loading} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="input" style={{ paddingLeft: 42 }} disabled={loading} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="input" style={{ paddingLeft: 42 }} disabled={loading} />
            </div>
            <p style={{ margin: '6px 0 0', fontSize: 11, color: '#9ca3af' }}>Minimum 6 characters</p>
          </div>

          <button type="submit" disabled={loading} className="btn-gold"
            style={{ padding: '14px', fontSize: 15, fontWeight: 700, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: loading ? 0.7 : 1, marginTop: 4 }}
          >
            {loading ? 'Creating Account…' : 'Create Account'} <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ marginTop: 24, textAlign: 'center', fontSize: 14, color: '#6b7280' }}>
          Already have an account?{' '}
          <Link href={`/login${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`} style={{ color: '#c5a880', fontWeight: 600, textDecoration: 'none' }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="skeleton" style={{ width: 400, height: 400, borderRadius: 20 }} />
      </div>
    }>
      <SignupFormContent />
    </Suspense>
  );
}
