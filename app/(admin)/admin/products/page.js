'use client';

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase/client';
import { collection, query, orderBy, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Search, Pencil, Trash2, Package, AlertTriangle, Star } from 'lucide-react';
import useAuthStore from '@/store/authStore';

const STATUS_STYLES = {
  active:       { bg: '#e8f5e9', color: '#2e7d32', label: 'Active'        },
  inactive:     { bg: '#f5f5f5', color: '#616161', label: 'Inactive'      },
  out_of_stock: { bg: '#ffebee', color: '#c62828', label: 'Out of Stock'  },
};

export default function ProductsPage() {
  const { hasPermission } = useAuthStore();
  const canManage = hasPermission('manageProducts');

  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [confirm,  setConfirm]  = useState(null); // id to delete

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const q    = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setProducts(data);
      setFiltered(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const s = search.toLowerCase();
    setFiltered(products.filter((p) =>
      p.name?.toLowerCase().includes(s) ||
      p.sku?.toLowerCase().includes(s)
    ));
  }, [search, products]);

  async function handleDelete(id) {
    await deleteDoc(doc(db, 'products', id));
    setConfirm(null);
    load();
  }

  async function toggleStatus(product) {
    const newStatus = product.status === 'active' ? 'inactive' : 'active';
    await updateDoc(doc(db, 'products', product.id), { status: newStatus, updatedAt: new Date() });
    load();
  }

  if (loading) return <LoadingState />;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Products</h2>
          <p style={{ margin: 0, color: '#6b7280', fontSize: 14 }}>{products.length} total products</p>
        </div>
        {canManage && (
          <Link href="/admin/products/new" className="btn-primary" style={{ textDecoration: 'none', padding: '10px 20px' }}>
            <Plus size={16} /> Add Product
          </Link>
        )}
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 24 }}>
        <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
        <input
          id="product-search"
          value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or SKU…"
          className="input" style={{ paddingLeft: 42 }}
        />
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '64px 24px', textAlign: 'center', color: '#9ca3af' }}>
            <Package size={40} style={{ opacity: .3, marginBottom: 12 }} />
            <p style={{ margin: 0 }}>{search ? 'No products match your search.' : 'No products yet. Add your first product!'}</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#fafafa' }}>
                  {['Product', 'SKU', 'Price', 'Stock', 'Status', 'Featured', 'Actions'].map((h) => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const sc = STATUS_STYLES[p.status] ?? STATUS_STYLES.inactive;
                  return (
                    <tr key={p.id} style={{ borderTop: '1px solid #f5f5f5' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#fafafa'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 48, height: 48, borderRadius: 10, overflow: 'hidden', background: '#f9f0ff', flexShrink: 0 }}>
                            {p.images?.[0]
                              ? <Image src={p.images[0]} alt={p.name} width={48} height={48} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                              : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c5a880' }}><Package size={20} /></div>
                            }
                          </div>
                          <div>
                            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#1a1a2e', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: '#6b7280', fontFamily: 'monospace' }}>{p.sku || '—'}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: '#e91e8c' }}>Rs. {(p.discountPrice ?? p.price)?.toLocaleString()}</span>
                        {p.discountPrice && <span style={{ display: 'block', fontSize: 11, color: '#9ca3af', textDecoration: 'line-through' }}>Rs. {p.price?.toLocaleString()}</span>}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: p.stock <= 5 ? '#d97706' : '#1a1a2e' }}>{p.stock ?? 0}</span>
                        {p.stock <= 5 && p.stock > 0 && <AlertTriangle size={12} color="#d97706" style={{ marginLeft: 4 }} />}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {canManage ? (
                          <button onClick={() => toggleStatus(p)}
                            style={{ background: sc.bg, color: sc.color, border: 'none', borderRadius: 9999, padding: '4px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                            {sc.label}
                          </button>
                        ) : (
                          <span style={{ background: sc.bg, color: sc.color, borderRadius: 9999, padding: '4px 12px', fontSize: 12, fontWeight: 600 }}>{sc.label}</span>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        {p.isFeatured ? <Star size={16} fill="#c5a880" color="#c5a880" /> : <span style={{ color: '#d1d5db' }}>—</span>}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {canManage && (
                          <div style={{ display: 'flex', gap: 8 }}>
                            <Link href={`/admin/products/${p.id}`}
                              style={{ width: 32, height: 32, borderRadius: 8, border: '1.5px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', textDecoration: 'none', background: '#fff' }}>
                              <Pencil size={14} />
                            </Link>
                            <button onClick={() => setConfirm(p.id)}
                              style={{ width: 32, height: 32, borderRadius: 8, border: '1.5px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626', background: '#fff5f5', cursor: 'pointer' }}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {confirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="card" style={{ padding: 32, maxWidth: 380, width: '90%', textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#fff5f5', border: '1.5px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#dc2626' }}>
              <AlertTriangle size={24} />
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700 }}>Delete Product?</h3>
            <p style={{ color: '#6b7280', marginBottom: 24, fontSize: 14 }}>This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setConfirm(null)} className="btn-outline" style={{ flex: 1 }}>Cancel</button>
              <button onClick={() => handleDelete(confirm)}
                style={{ flex: 1, background: '#dc2626', color: '#fff', border: 'none', borderRadius: 9999, padding: '12px', fontWeight: 600, cursor: 'pointer' }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {[1,2,3,4,5].map((i) => (
        <div key={i} className="skeleton" style={{ height: 64, borderRadius: 12 }} />
      ))}
    </div>
  );
}
