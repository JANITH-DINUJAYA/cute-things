'use client';

import { useState, useEffect, useCallback } from 'react';
import { TrendingUp, Percent, Code, Trash2, Plus, Info, AlertTriangle } from 'lucide-react';
import useAuthStore from '@/store/authStore';

export default function MarketingPage() {
  const { role } = useAuthStore();
  const isSuper = role === 'superadmin';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [coupons, setCoupons] = useState([]);

  // Coupon inputs
  const [code, setCode] = useState('');
  const [type, setType] = useState('percentage');
  const [val, setVal] = useState('');
  const [expiry, setExpiry] = useState('');

  // Pixel status
  const [pixelIds, setPixelIds] = useState({ metaPixelId: '', tiktokPixelId: '' });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/settings');
      if (!res.ok) throw new Error('Failed to load marketing data');
      const data = await res.json();
      setPixelIds(data.pixels || { metaPixelId: '', tiktokPixelId: '' });
      setCoupons(data.coupons?.list || []);
    } catch (err) {
      console.error('Failed to load marketing data:', err);
      setError('Could not load marketing data. Please refresh.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function saveCoupons(newList) {
    const res = await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tab: 'coupons', data: { list: newList } }),
    });
    if (!res.ok) {
      const d = await res.json();
      throw new Error(d.error || 'Failed to save coupons');
    }
  }

  async function handleAddCoupon(e) {
    e.preventDefault();
    if (!isSuper || !code || !val) return;

    setSaving(true);
    setError('');
    try {
      const newCoupon = {
        code: code.toUpperCase().trim(),
        type,
        value: Number(val),
        expiry: expiry || null,
        active: true,
        createdAt: new Date().toISOString()
      };

      const newList = [...coupons, newCoupon];
      await saveCoupons(newList);
      setCoupons(newList);

      // Reset inputs
      setCode('');
      setVal('');
      setExpiry('');
    } catch (err) {
      console.error('Failed to save coupon:', err);
      setError(err.message || 'Error: Only SuperAdmin accounts can manage coupons.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteCoupon(index) {
    if (!isSuper) return;
    if (!confirm('Delete this coupon code?')) return;

    try {
      const newList = coupons.filter((_, i) => i !== index);
      await saveCoupons(newList);
      setCoupons(newList);
    } catch (err) {
      console.error('Failed to delete coupon:', err);
      setError(err.message || 'Error: Permission Denied.');
    }
  }

  if (loading) return <LoadingState />;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 32, alignItems: 'start' }} className="marketing-layout">
      {/* Left Column - Coupons */}
      <div>
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: '0.02em', fontFamily: 'var(--font-serif)' }}>Marketing</h2>
          <p style={{ margin: 0, color: '#6b7280', fontSize: 14 }}>Create discount codes and monitor active social pixels</p>
        </div>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', color: '#991b1b', fontSize: 13, marginBottom: 16 }}>
            <AlertTriangle size={14} /> {error}
          </div>
        )}

        {/* Coupons List */}
        <div className="card" style={{ padding: 24, marginBottom: 24 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 17, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Percent size={18} color="#c5a880" />
            Active Discount Coupons
          </h3>

          {coupons.length === 0 ? (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
              No active coupon codes created yet.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#faf8f6', borderBottom: '1px solid #eae3dc' }}>
                    {['Code', 'Discount', 'Expiry', 'Status', 'Actions'].map((h) => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#888888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((c, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #eae3dc' }}>
                      <td style={{ padding: '12px 14px', fontWeight: 700, color: '#1e1a1d', fontSize: 14, fontFamily: 'monospace' }}>{c.code}</td>
                      <td style={{ padding: '12px 14px', fontSize: 13, color: '#1e1a1d' }}>
                        {c.type === 'percentage' ? `${c.value}% Off` : `Rs. ${c.value.toLocaleString()} Off`}
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: 13, color: '#6b7280' }}>
                        {c.expiry ? new Date(c.expiry).toLocaleDateString() : 'Never'}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span className="badge badge-green">Active</span>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        {isSuper ? (
                          <button
                            onClick={() => handleDeleteCoupon(idx)}
                            style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 4 }}
                          >
                            <Trash2 size={14} />
                          </button>
                        ) : (
                          <span style={{ fontSize: 12, color: '#9ca3af' }}>ReadOnly</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Right Column - Coupon Creator & Pixel Info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Coupon Creator */}
        {isSuper ? (
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600 }}>Create Coupon</h3>
            <form onSubmit={handleAddCoupon} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Coupon Code</label>
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. CUTE10"
                  required
                  className="input"
                  style={{ textTransform: 'uppercase' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="input"
                    style={{ padding: '10px' }}
                  >
                    <option value="percentage">Percent (%)</option>
                    <option value="fixed">Fixed (Rs.)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Value</label>
                  <input
                    type="number"
                    value={val}
                    onChange={(e) => setVal(e.target.value)}
                    placeholder="10"
                    required
                    className="input"
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Expiry Date</label>
                <input
                  type="date"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  className="input"
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="btn-primary"
                style={{ width: '100%', marginTop: 8, opacity: saving ? 0.7 : 1 }}
              >
                <Plus size={16} /> {saving ? 'Saving…' : 'Create Coupon'}
              </button>
            </form>
          </div>
        ) : (
          <div className="card" style={{ padding: 20, background: '#faf8f6' }}>
            <AlertTriangle size={18} color="#b45309" style={{ marginBottom: 8 }} />
            <h4 style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 600, color: '#1e1a1d' }}>Creator Locked</h4>
            <p style={{ margin: 0, fontSize: 12, color: '#6b7280', lineHeight: 1.5 }}>
              Only SuperAdmin users can generate discount coupon codes.
            </p>
          </div>
        )}

        {/* Pixel Status */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Code size={18} color="#c5a880" />
            Pixel Tracking
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: '#1e1a1d' }}>Meta Pixel</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: pixelIds.metaPixelId ? '#10b981' : '#9ca3af' }} />
                <span style={{ fontSize: 13, color: '#6b7280', fontFamily: 'monospace' }}>
                  {pixelIds.metaPixelId || 'Not Configured'}
                </span>
              </div>
            </div>

            <div>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: '#1e1a1d' }}>TikTok Pixel</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: pixelIds.tiktokPixelId ? '#10b981' : '#9ca3af' }} />
                <span style={{ fontSize: 13, color: '#6b7280', fontFamily: 'monospace' }}>
                  {pixelIds.tiktokPixelId || 'Not Configured'}
                </span>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #eae3dc', paddingTop: 14 }}>
              <p style={{ margin: 0, fontSize: 12, color: '#888', lineHeight: 1.5 }}>
                Configure tracking keys inside <strong>Settings → Tracking Pixels</strong> tab.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .marketing-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

function LoadingState() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {[1, 2].map((i) => (
        <div key={i} className="skeleton" style={{ height: 100, borderRadius: 8 }} />
      ))}
    </div>
  );
}
