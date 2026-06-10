'use client';

import { useRouter, usePathname } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import useAuthStore from '@/store/authStore';
import { LogOut, ExternalLink, Menu, User, Lock, Mail, X, Save, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

// Map pathname to page title
function getPageTitle(pathname) {
  if (pathname === '/admin')                    return 'Dashboard';
  if (pathname.startsWith('/admin/products'))   return 'Products';
  if (pathname.startsWith('/admin/orders'))     return 'Orders';
  if (pathname.startsWith('/admin/customers'))  return 'Customers';
  if (pathname.startsWith('/admin/categories')) return 'Categories';
  if (pathname.startsWith('/admin/marketing'))  return 'Marketing';
  if (pathname.startsWith('/admin/users'))      return 'User Management';
  if (pathname.startsWith('/admin/settings'))   return 'Settings';
  return 'Admin Panel';
}

export default function AdminTopbar({ onMenuToggle }) {
  const router    = useRouter();
  const pathname  = usePathname();
  const { clearAuth, adminUser, setAdminUser } = useAuthStore();
  const title = getPageTitle(pathname);

  // Profile modal state
  const [profileOpen, setProfileOpen] = useState(false);
  const [displayName, setDisplayName] = useState(adminUser?.displayName ?? '');
  const [email, setEmail]             = useState(adminUser?.email ?? '');
  const [password, setPassword]       = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [saving, setSaving]           = useState(false);
  const [profileError, setProfileError]   = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  async function handleLogout() {
    await signOut(auth);
    await fetch('/api/auth/session', { method: 'DELETE' });
    clearAuth();
    router.push('/auth/login');
  }

  function openProfile() {
    setDisplayName(adminUser?.displayName ?? '');
    setEmail(adminUser?.email ?? '');
    setPassword('');
    setConfirmPass('');
    setProfileError('');
    setProfileSuccess('');
    setProfileOpen(true);
  }

  async function handleSaveProfile(e) {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    if (password && password !== confirmPass) {
      setProfileError('Passwords do not match.');
      return;
    }
    if (password && password.length < 6) {
      setProfileError('Password must be at least 6 characters.');
      return;
    }

    const body = {};
    if (displayName && displayName !== adminUser?.displayName) body.displayName = displayName;
    if (email && email !== adminUser?.email)                   body.email       = email;
    if (password)                                              body.password    = password;

    if (Object.keys(body).length === 0) {
      setProfileError('No changes to save.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/update-profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile');

      // Update local auth store
      setAdminUser({ ...adminUser, displayName: displayName || adminUser?.displayName });
      setProfileSuccess('Profile updated successfully!');
      setPassword('');
      setConfirmPass('');
    } catch (err) {
      setProfileError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <header style={{
        height: 64, background: '#fff',
        borderBottom: '1px solid #f0f0f0',
        display: 'flex', alignItems: 'center',
        padding: '0 24px',
        justifyContent: 'space-between',
        boxShadow: '0 1px 4px rgba(0,0,0,.04)',
        position: 'sticky', top: 0, zIndex: 20,
        gap: 12,
      }}>
        {/* Left — hamburger + title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Hamburger for mobile */}
          <button
            id="admin-menu-btn"
            onClick={onMenuToggle}
            className="admin-hamburger"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#374151', padding: 6, borderRadius: 8,
              display: 'none', alignItems: 'center',
            }}
          >
            <Menu size={22} />
          </button>

          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#1a1a2e', whiteSpace: 'nowrap' }}>{title}</h1>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          {/* View Store — hide label on small screens */}
          <Link href="/" target="_blank"
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: 10,
              border: '1.5px solid #e5e7eb', background: '#fff',
              textDecoration: 'none', fontSize: 13, fontWeight: 500, color: '#374151',
              transition: 'all .2s',
            }}>
            <ExternalLink size={14} />
            <span className="topbar-label">View Store</span>
          </Link>

          {/* Profile / Change Password */}
          <button
            id="admin-profile-btn"
            onClick={openProfile}
            title="Edit Profile"
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: 10,
              border: '1.5px solid #e5e7eb', background: '#fff',
              fontSize: 13, fontWeight: 500, color: '#374151',
              cursor: 'pointer', transition: 'all .2s',
            }}
          >
            <User size={14} />
            <span className="topbar-label">My Profile</span>
          </button>

          {/* Logout */}
          <button
            id="admin-logout-btn"
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: 10,
              border: '1.5px solid #fee2e2', background: '#fff5f5',
              fontSize: 13, fontWeight: 500, color: '#dc2626',
              cursor: 'pointer', transition: 'all .2s',
            }}>
            <LogOut size={14} />
            <span className="topbar-label">Logout</span>
          </button>
        </div>
      </header>

      {/* Profile Modal */}
      {profileOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 24 }}>
          <div className="card" style={{ width: '100%', maxWidth: 440, padding: 28, maxHeight: '90vh', overflowY: 'auto' }}>
            {/* Modal header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#1a1a2e' }}>Edit My Profile</h3>
                <p style={{ margin: 0, fontSize: 12, color: '#9ca3af', marginTop: 2 }}>Update your display name, email, or password</p>
              </div>
              <button onClick={() => setProfileOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 4 }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {profileSuccess && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 8, padding: '10px 14px', color: '#065f46', fontSize: 13 }}>
                  <CheckCircle size={15} /> {profileSuccess}
                </div>
              )}
              {profileError && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', color: '#991b1b', fontSize: 13 }}>
                  <AlertCircle size={15} /> {profileError}
                </div>
              )}

              {/* Display Name */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1e1a1d', marginBottom: 6 }}>
                  <User size={13} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                  Display Name
                </label>
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="input"
                  placeholder="Your name"
                />
              </div>

              {/* Email */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1e1a1d', marginBottom: 6 }}>
                  <Mail size={13} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  placeholder="your@email.com"
                />
              </div>

              {/* Divider */}
              <div style={{ borderTop: '1px solid #eae3dc', paddingTop: 4 }}>
                <p style={{ margin: '0 0 12px', fontSize: 12, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Lock size={12} /> Leave password fields blank to keep your current password
                </p>
              </div>

              {/* New Password */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1e1a1d', marginBottom: 6 }}>New Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input"
                  placeholder="min 6 characters"
                  autoComplete="new-password"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1e1a1d', marginBottom: 6 }}>Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  className="input"
                  placeholder="Repeat password"
                  autoComplete="new-password"
                />
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button type="button" onClick={() => setProfileOpen(false)} className="btn-outline" style={{ flex: 1, padding: '12px' }}>
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary"
                  style={{ flex: 1, padding: '12px', opacity: saving ? 0.7 : 1 }}
                >
                  <Save size={15} /> {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .admin-hamburger { display: flex !important; }
          .topbar-label { display: none !important; }
        }
      `}</style>
    </>
  );
}
