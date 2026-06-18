'use client';

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase/client';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { Plus, Pencil, Trash2, Tag, X, AlertTriangle } from 'lucide-react';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [modal,      setModal]      = useState(null); // null | 'new' | { category }
  const [confirm,    setConfirm]    = useState(null);
  const [saving,     setSaving]     = useState(false);
  const [form,       setForm]       = useState({ name: '', emoji: '', isVisible: true, parentId: '', sortOrder: 0 });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // NOTE: We do NOT use orderBy('sortOrder') here because Firestore excludes
      // documents that don't have the sortOrder field from ordered queries.
      // Categories seeded via the seed script may not have sortOrder, so we
      // fetch all and sort client-side.
      const snap = await getDocs(collection(db, 'categories'));
      if (snap.empty) {
        const DEFAULT_CATEGORIES = [
          { name: 'Plush Toys',  slug: 'plush-toys',    isVisible: true, sortOrder: 1, parentId: null, createdAt: new Date(), updatedAt: new Date() },
          { name: 'Accessories', slug: 'accessories',   isVisible: true, sortOrder: 2, parentId: null, createdAt: new Date(), updatedAt: new Date() },
          { name: 'Gifts',       slug: 'gifts',         isVisible: true, sortOrder: 3, parentId: null, createdAt: new Date(), updatedAt: new Date() },
          { name: 'Anime',       slug: 'anime-plushies',isVisible: true, sortOrder: 4, parentId: null, createdAt: new Date(), updatedAt: new Date() }
        ];
        for (const cat of DEFAULT_CATEGORIES) {
          await addDoc(collection(db, 'categories'), cat);
        }
        const reloadSnap = await getDocs(collection(db, 'categories'));
        const data = reloadSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setCategories(sortCategories(data));
      } else {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setCategories(sortCategories(data));
      }
    } catch (err) {
      console.error('Failed to load or seed categories:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  function sortCategories(list) {
    return [...list].sort((a, b) => {
      const aOrder = a.sortOrder ?? 999;
      const bOrder = b.sortOrder ?? 999;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return (a.name || '').localeCompare(b.name || '');
    });
  }

  useEffect(() => { load(); }, [load]);

  function slugify(str) {
    return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  async function saveCategory() {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const data = {
        name:       form.name.trim(),
        emoji:      form.emoji.trim(),
        slug:       slugify(form.name),
        parentId:   form.parentId || null,
        isVisible:  form.isVisible,
        sortOrder:  parseInt(form.sortOrder) || 0,
        updatedAt:  new Date(),
      };
      if (modal === 'new') {
        await addDoc(collection(db, 'categories'), { ...data, createdAt: serverTimestamp() });
      } else {
        await updateDoc(doc(db, 'categories', modal.id), data);
      }
      setModal(null);
      setForm({ name: '', emoji: '', isVisible: true, parentId: '', sortOrder: 0 });
      load();
    } finally { setSaving(false); }
  }

  async function deleteCategory(id) {
    await deleteDoc(doc(db, 'categories', id));
    setConfirm(null);
    load();
  }

  function openEdit(cat) {
    setForm({ name: cat.name, emoji: cat.emoji || '', isVisible: cat.isVisible ?? true, parentId: cat.parentId || '', sortOrder: cat.sortOrder || 0 });
    setModal(cat);
  }

  const topLevel = categories.filter((c) => !c.parentId);
  const getChildren = (parentId) => categories.filter((c) => c.parentId === parentId);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Categories</h2>
          <p style={{ margin: 0, color: '#6b7280', fontSize: 14 }}>{categories.length} categories</p>
        </div>
        <button onClick={() => { setForm({ name: '', emoji: '', isVisible: true, parentId: '', sortOrder: 0 }); setModal('new'); }}
          className="btn-primary" style={{ padding: '10px 20px' }}>
          <Plus size={16} /> Add Category
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 56, borderRadius: 12 }} />)}
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {categories.length === 0 ? (
            <div style={{ padding: '64px 24px', textAlign: 'center', color: '#9ca3af' }}>
              <Tag size={40} style={{ opacity: .3, marginBottom: 12 }} />
              <p>No categories yet. Add your first!</p>
            </div>
          ) : (
            <div>
              {topLevel.map((cat) => (
                <div key={cat.id}>
                  <CategoryRow cat={cat} onEdit={openEdit} onDelete={setConfirm} isChild={false} />
                  {getChildren(cat.id).map((child) => (
                    <CategoryRow key={child.id} cat={child} onEdit={openEdit} onDelete={setConfirm} isChild />
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create / Edit Modal */}
      {modal !== null && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 24 }}>
          <div className="card" style={{ width: '100%', maxWidth: 400, padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontWeight: 700 }}>{modal === 'new' ? 'Add Category' : 'Edit Category'}</h3>
              <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><X size={20} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Emoji (optional)</label>
                <input value={form.emoji} onChange={(e) => setForm(f => ({ ...f, emoji: e.target.value }))} className="input" placeholder="e.g. 🧸" maxLength={4} style={{ maxWidth: 120 }} />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Name *</label>
                <input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} className="input" placeholder="e.g. Plush Toys" />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Parent Category</label>
                <select value={form.parentId} onChange={(e) => setForm(f => ({ ...f, parentId: e.target.value }))} className="input">
                  <option value="">None (Top Level)</option>
                  {topLevel.filter(c => c.id !== modal?.id).map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Sort Order</label>
                <input type="number" value={form.sortOrder} onChange={(e) => setForm(f => ({ ...f, sortOrder: e.target.value }))} className="input" placeholder="0" />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                <input type="checkbox" checked={form.isVisible} onChange={(e) => setForm(f => ({ ...f, isVisible: e.target.checked }))} style={{ width: 16, height: 16, accentColor: '#e91e8c' }} />
                Visible on store
              </label>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <button onClick={() => setModal(null)} className="btn-outline" style={{ flex: 1 }}>Cancel</button>
              <button onClick={saveCategory} disabled={saving} className="btn-primary" style={{ flex: 1, opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {confirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="card" style={{ padding: 28, maxWidth: 360, width: '90%', textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#fff5f5', border: '1.5px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: '#dc2626' }}>
              <AlertTriangle size={24} />
            </div>
            <h3 style={{ margin: '0 0 8px' }}>Delete "{confirm.name}"?</h3>
            <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 20 }}>Products in this category won't be deleted but will lose their category.</p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setConfirm(null)} className="btn-outline" style={{ flex: 1 }}>Cancel</button>
              <button onClick={() => deleteCategory(confirm.id)} style={{ flex: 1, background: '#dc2626', color: '#fff', border: 'none', borderRadius: 9999, padding: 12, fontWeight: 600, cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CategoryRow({ cat, onEdit, onDelete, isChild }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', padding: '14px 20px',
      borderBottom: '1px solid #f5f5f5',
      paddingLeft: isChild ? 48 : 20,
      background: isChild ? '#fafafa' : '#fff',
    }}>
      {isChild && <span style={{ marginRight: 8, color: '#d1d5db', fontSize: 18 }}>└</span>}
      <Tag size={16} color={isChild ? '#9ca3af' : '#e91e8c'} style={{ marginRight: 10, flexShrink: 0 }} />
      <span style={{ flex: 1, fontSize: 14, fontWeight: isChild ? 400 : 600 }}>{cat.emoji ? `${cat.emoji} ` : ''}{cat.name}</span>
      <span style={{ fontSize: 12, color: '#9ca3af', marginRight: 16 }}>/{cat.slug}</span>
      <span className={`badge badge-${cat.isVisible ? 'green' : 'gray'}`} style={{ fontSize: 11, marginRight: 12 }}>
        {cat.isVisible ? 'Visible' : 'Hidden'}
      </span>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => onEdit(cat)} style={{ width: 30, height: 30, borderRadius: 8, border: '1.5px solid #e5e7eb', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#6b7280' }}>
          <Pencil size={13} />
        </button>
        <button onClick={() => onDelete(cat)} style={{ width: 30, height: 30, borderRadius: 8, border: '1.5px solid #fecaca', background: '#fff5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#dc2626' }}>
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}
