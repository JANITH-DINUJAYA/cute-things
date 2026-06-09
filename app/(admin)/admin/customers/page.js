'use client';

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase/client';
import { collection, query, orderBy, getDocs, doc, updateDoc } from 'firebase/firestore';
import { Search, User, Mail, Phone, DollarSign, ShoppingBag, Edit, Check } from 'lucide-react';
import useAuthStore from '@/store/authStore';

export default function CustomersPage() {
  const { hasPermission } = useAuthStore();
  const canManage = hasPermission('manageCustomers');

  const [customers, setCustomers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editNote, setEditNote] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'customers'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setCustomers(data);
      setFiltered(data);
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const s = search.toLowerCase();
    setFiltered(
      customers.filter(
        (c) =>
          c.name?.toLowerCase().includes(s) ||
          c.email?.toLowerCase().includes(s) ||
          c.phone?.toLowerCase().includes(s)
      )
    );
  }, [search, customers]);

  async function handleSaveNote(id) {
    try {
      await updateDoc(doc(db, 'customers', id), {
        notes: editNote,
        updatedAt: new Date()
      });
      setEditingId(null);
      load();
    } catch (err) {
      console.error('Failed to save notes:', err);
    }
  }

  if (loading) return <LoadingState />;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: '0.02em', fontFamily: 'var(--font-serif)' }}>Customers</h2>
        <p style={{ margin: 0, color: '#6b7280', fontSize: 14 }}>Manage client accounts and notes</p>
      </div>

      {/* Stats Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div className="card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 8, background: 'rgba(197, 168, 128, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c5a880' }}>
            <User size={20} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 12, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Customers</p>
            <p style={{ margin: 0, fontSize: 20, fontWeight: 600, color: '#1e1a1d' }}>{customers.length}</p>
          </div>
        </div>
        <div className="card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 8, background: 'rgba(197, 168, 128, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c5a880' }}>
            <DollarSign size={20} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 12, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Customer Spend</p>
            <p style={{ margin: 0, fontSize: 20, fontWeight: 600, color: '#1e1a1d' }}>
              Rs. {customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 24 }}>
        <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
        <input
          id="customer-search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email or phone…"
          className="input"
          style={{ paddingLeft: 42 }}
        />
      </div>

      {/* Customer Directory Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '64px 24px', textAlign: 'center', color: '#9ca3af' }}>
            <User size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
            <p style={{ margin: 0 }}>No customers found matching your criteria.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#faf8f6' }}>
                  {['Customer', 'Contact Info', 'Orders', 'Total Spent', 'Staff Notes', 'Actions'].map((h) => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#888888', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} style={{ borderTop: '1px solid #eae3dc' }}>
                    {/* Customer Identity */}
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(197, 168, 128, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c5a880', fontWeight: 600, fontSize: 14 }}>
                          {c.name?.[0]?.toUpperCase() ?? 'U'}
                        </div>
                        <div>
                          <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#1e1a1d' }}>{c.name || 'Anonymous'}</p>
                          <p style={{ margin: 0, fontSize: 11, color: '#9ca3af' }}>Joined {c.createdAt?.toDate ? c.createdAt.toDate().toLocaleDateString() : 'recently'}</p>
                        </div>
                      </div>
                    </td>
                    {/* Contact Details */}
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13, color: '#1e1a1d' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Mail size={13} color="#9ca3af" /> {c.email}</span>
                        {c.phone && <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Phone size={13} color="#9ca3af" /> {c.phone}</span>}
                      </div>
                    </td>
                    {/* Orders Count */}
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 500 }}>
                        <ShoppingBag size={14} color="#9ca3af" />
                        {c.orderCount ?? 0}
                      </div>
                    </td>
                    {/* Total Spent */}
                    <td style={{ padding: '16px', fontSize: 14, fontWeight: 600, color: '#1e1a1d' }}>
                      Rs. {(c.totalSpent ?? 0).toLocaleString()}
                    </td>
                    {/* Notes field */}
                    <td style={{ padding: '16px', width: '35%' }}>
                      {editingId === c.id ? (
                        <div style={{ display: 'flex', gap: 8 }}>
                          <input
                            value={editNote}
                            onChange={(e) => setEditNote(e.target.value)}
                            placeholder="Add customer history notes…"
                            className="input"
                            style={{ padding: '6px 10px', fontSize: 13 }}
                          />
                          <button
                            onClick={() => handleSaveNote(c.id)}
                            style={{ padding: 8, background: '#1e1a1d', border: 'none', borderRadius: 6, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                          >
                            <Check size={14} />
                          </button>
                        </div>
                      ) : (
                        <div style={{ fontSize: 13, color: '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                          <span style={{ fontStyle: c.notes ? 'normal' : 'italic' }}>
                            {c.notes || 'No customer notes entered.'}
                          </span>
                          {canManage && (
                            <button
                              onClick={() => {
                                setEditingId(c.id);
                                setEditNote(c.notes || '');
                              }}
                              style={{ background: 'none', border: 'none', color: '#c5a880', cursor: 'pointer', padding: 4 }}
                            >
                              <Edit size={12} />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                    {/* Actions column */}
                    <td style={{ padding: '16px' }}>
                      <span style={{ fontSize: 12, color: '#9ca3af' }}>Active Client</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {[1, 2, 3].map((i) => (
        <div key={i} className="skeleton" style={{ height: 68, borderRadius: 8 }} />
      ))}
    </div>
  );
}
