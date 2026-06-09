'use client';

import { useState, useEffect } from 'react';
import DashboardClient from './DashboardClient';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/api/admin/stats');
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to load dashboard stats');
        }
        setStats(data.stats);
      } catch (err) {
        console.error('[load stats]', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: 20 }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton" style={{ height: 140, borderRadius: 12 }} />
          ))}
        </div>
        <div className="skeleton" style={{ height: 350, borderRadius: 12 }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="card" style={{ padding: 24, color: '#dc2626', background: '#fff5f5' }}>
        <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 700 }}>Error loading dashboard</h3>
        <p style={{ margin: 0, fontSize: 14 }}>{error}</p>
      </div>
    );
  }

  return <DashboardClient stats={stats} />;
}
