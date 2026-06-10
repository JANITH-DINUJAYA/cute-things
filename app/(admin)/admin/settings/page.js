'use client';

import { useState, useEffect, useCallback } from 'react';
import { Settings, Truck, Code, Save, Info, AlertTriangle } from 'lucide-react';
import useAuthStore from '@/store/authStore';

export default function SettingsPage() {
  const { role } = useAuthStore();
  const isSuper = role === 'superadmin';

  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Setting States
  const [general, setGeneral] = useState({
    siteName: 'Cute Things',
    tagline: 'Adorable Gifts & Plushies',
    contactEmail: 'hello@cutethings.lk',
    phone: '',
    address: '',
    facebookUrl: '',
    tiktokUrl: '',
    maintenanceMode: false
  });

  const [shipping, setShipping] = useState({
    defaultFee: 350,
    freeShippingThreshold: 5000
  });

  const [pixels, setPixels] = useState({
    metaPixelId: '',
    tiktokPixelId: ''
  });

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/settings');
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to load settings');
      }
      const data = await res.json();

      if (data.general  && Object.keys(data.general).length)  setGeneral((g)  => ({ ...g,  ...data.general  }));
      if (data.shipping && Object.keys(data.shipping).length) setShipping((s) => ({ ...s,  ...data.shipping }));
      if (data.pixels   && Object.keys(data.pixels).length)   setPixels((p)   => ({ ...p,  ...data.pixels   }));
    } catch (err) {
      console.error('Failed to load settings:', err);
      setError(err.message || 'Failed to load settings from database.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  async function handleSave(e) {
    e.preventDefault();
    if (!isSuper) return;

    setSaving(true);
    setSuccess('');
    setError('');

    try {
      let tabData;
      if (activeTab === 'general') {
        tabData = general;
      } else if (activeTab === 'shipping') {
        tabData = {
          defaultFee: Number(shipping.defaultFee),
          freeShippingThreshold: shipping.freeShippingThreshold ? Number(shipping.freeShippingThreshold) : null
        };
      } else if (activeTab === 'pixels') {
        tabData = pixels;
      }

      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tab: activeTab, data: tabData }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to save');

      setSuccess('Settings saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to save settings:', err);
      setError(err.message || 'Permission Denied or Connection Error.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingState />;

  return (
    <div style={{ maxWidth: 800 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: '0.02em', fontFamily: 'var(--font-serif)' }}>Settings</h2>
        <p style={{ margin: 0, color: '#6b7280', fontSize: 14 }}>Configure store metadata, shipping limits, and marketing pixels</p>
      </div>

      {!isSuper && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '12px 16px', color: '#b45309', fontSize: 13, marginBottom: 24 }}>
          <AlertTriangle size={16} />
          <span>You are logged in as an Admin/Staff. Only the <strong>SuperAdmin</strong> has write access to settings. Fields are read-only.</span>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #eae3dc', marginBottom: 24, gap: 4, overflowX: 'auto' }}>
        {[
          { id: 'general',  label: 'General Info',     icon: Settings },
          { id: 'shipping', label: 'Shipping Fees',    icon: Truck    },
          { id: 'pixels',   label: 'Tracking Pixels',  icon: Code     },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSuccess('');
                setError('');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 16px',
                border: 'none',
                borderBottom: isActive ? '2px solid #c5a880' : '2px solid transparent',
                background: 'none',
                color: isActive ? '#c5a880' : '#888888',
                fontWeight: isActive ? 600 : 500,
                fontSize: 14,
                cursor: 'pointer',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
              }}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Form Card */}
      <div className="card" style={{ padding: 32 }}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {success && (
            <div style={{ padding: '10px 14px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 6, color: '#065f46', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Info size={16} /> {success}
            </div>
          )}

          {error && (
            <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 6, color: '#991b1b', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertTriangle size={16} /> {error}
            </div>
          )}

          {/* TAB: General Settings */}
          {activeTab === 'general' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1e1a1d', marginBottom: 6 }}>Site Name</label>
                <input
                  value={general.siteName}
                  onChange={(e) => setGeneral((g) => ({ ...g, siteName: e.target.value }))}
                  disabled={!isSuper}
                  className="input"
                  placeholder="e.g. Cute Things"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1e1a1d', marginBottom: 6 }}>Tagline</label>
                <input
                  value={general.tagline}
                  onChange={(e) => setGeneral((g) => ({ ...g, tagline: e.target.value }))}
                  disabled={!isSuper}
                  className="input"
                  placeholder="e.g. Adorable Gifts & Plushies"
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="settings-grid-2">
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1e1a1d', marginBottom: 6 }}>Contact Email</label>
                  <input
                    type="email"
                    value={general.contactEmail}
                    onChange={(e) => setGeneral((g) => ({ ...g, contactEmail: e.target.value }))}
                    disabled={!isSuper}
                    className="input"
                    placeholder="hello@cutethings.lk"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1e1a1d', marginBottom: 6 }}>Phone Number</label>
                  <input
                    value={general.phone}
                    onChange={(e) => setGeneral((g) => ({ ...g, phone: e.target.value }))}
                    disabled={!isSuper}
                    className="input"
                    placeholder="+94 77 123 4567"
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1e1a1d', marginBottom: 6 }}>Address</label>
                <textarea
                  value={general.address}
                  onChange={(e) => setGeneral((g) => ({ ...g, address: e.target.value }))}
                  disabled={!isSuper}
                  rows={2}
                  className="input"
                  style={{ fontFamily: 'inherit' }}
                  placeholder="Boutique Office Address..."
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="settings-grid-2">
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1e1a1d', marginBottom: 6 }}>Facebook Page URL</label>
                  <input
                    value={general.facebookUrl}
                    onChange={(e) => setGeneral((g) => ({ ...g, facebookUrl: e.target.value }))}
                    disabled={!isSuper}
                    className="input"
                    placeholder="https://facebook.com/..."
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1e1a1d', marginBottom: 6 }}>TikTok Profile URL</label>
                  <input
                    value={general.tiktokUrl}
                    onChange={(e) => setGeneral((g) => ({ ...g, tiktokUrl: e.target.value }))}
                    disabled={!isSuper}
                    className="input"
                    placeholder="https://tiktok.com/@..."
                  />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                <input
                  type="checkbox"
                  id="maintenanceMode"
                  checked={general.maintenanceMode}
                  onChange={(e) => setGeneral((g) => ({ ...g, maintenanceMode: e.target.checked }))}
                  disabled={!isSuper}
                  style={{ width: 16, height: 16, cursor: isSuper ? 'pointer' : 'not-allowed' }}
                />
                <label htmlFor="maintenanceMode" style={{ fontSize: 13, fontWeight: 600, color: '#1e1a1d', cursor: 'pointer' }}>
                  Enable Maintenance Mode (Blocks storefront access)
                </label>
              </div>
            </div>
          )}

          {/* TAB: Shipping Settings */}
          {activeTab === 'shipping' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1e1a1d', marginBottom: 6 }}>Default Shipping Fee (Rs.)</label>
                <input
                  type="number"
                  value={shipping.defaultFee}
                  onChange={(e) => setShipping((s) => ({ ...s, defaultFee: e.target.value }))}
                  disabled={!isSuper}
                  className="input"
                  placeholder="350"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1e1a1d', marginBottom: 6 }}>
                  Free Shipping Threshold (Rs. — Leave empty to disable)
                </label>
                <input
                  type="number"
                  value={shipping.freeShippingThreshold || ''}
                  onChange={(e) => setShipping((s) => ({ ...s, freeShippingThreshold: e.target.value }))}
                  disabled={!isSuper}
                  className="input"
                  placeholder="e.g. 5000"
                />
              </div>
            </div>
          )}

          {/* TAB: Pixels Settings */}
          {activeTab === 'pixels' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1e1a1d', marginBottom: 6 }}>Meta Pixel ID</label>
                <input
                  value={pixels.metaPixelId}
                  onChange={(e) => setPixels((p) => ({ ...p, metaPixelId: e.target.value }))}
                  disabled={!isSuper}
                  className="input"
                  placeholder="e.g. 123456789012345"
                />
                <p style={{ margin: '4px 0 0', fontSize: 11, color: '#9ca3af' }}>Tracks content views, cart actions, and checkout page events on Facebook & Instagram.</p>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1e1a1d', marginBottom: 6 }}>TikTok Pixel ID</label>
                <input
                  value={pixels.tiktokPixelId}
                  onChange={(e) => setPixels((p) => ({ ...p, tiktokPixelId: e.target.value }))}
                  disabled={!isSuper}
                  className="input"
                  placeholder="e.g. C1234567890ABCDEF"
                />
                <p style={{ margin: '4px 0 0', fontSize: 11, color: '#9ca3af' }}>Tracks and optimizes campaigns targeting TikTok social-commerce traffic.</p>
              </div>
            </div>
          )}

          {/* Save Button */}
          {isSuper && (
            <button
              type="submit"
              disabled={saving}
              className="btn-primary"
              style={{ padding: '12px 24px', alignSelf: 'flex-start', marginTop: 12 }}
            >
              <Save size={16} /> {saving ? 'Saving…' : 'Save Settings'}
            </button>
          )}
        </form>
      </div>

      <style>{`
        @media (max-width: 600px) {
          .settings-grid-2 { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function LoadingState() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {[1, 2].map((i) => (
        <div key={i} className="skeleton" style={{ height: 120, borderRadius: 8 }} />
      ))}
    </div>
  );
}
