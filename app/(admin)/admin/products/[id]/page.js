'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { db } from '@/lib/firebase/client';
import { doc, getDoc, updateDoc, deleteDoc, serverTimestamp, collection, getDocs } from 'firebase/firestore';
import { ArrowLeft, Upload, X, Star, Trash2, Save } from 'lucide-react';
import Image from 'next/image';

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

const LabelInput = ({ label, required, children }) => (
  <div>
    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
      {label} {required && <span style={{ color: '#e91e8c' }}>*</span>}
    </label>
    {children}
  </div>
);

export default function EditProductPage() {
  const router = useRouter();
  const { id }  = useParams();

  const [form, setForm] = useState({
    name: '', description: '', sku: '', price: '',
    discountPrice: '', stock: '', weight: '',
    status: 'active', isFeatured: false, categoryId: '',
  });
  const [categories, setCategories] = useState([]);
  const [images,    setImages]    = useState([]);
  const [uploading, setUploading] = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [deleting,  setDeleting]  = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [error,     setError]     = useState('');
  const [loading,   setLoading]   = useState(true);

  // ── Load categories ──────────────────────────────────────────────────
  useEffect(() => {
    async function loadCategories() {
      try {
        const snap = await getDocs(collection(db, 'categories'));
        const list = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setCategories(list);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    }
    loadCategories();
  }, []);

  // ── Load existing product ────────────────────────────────────────────
  const load = useCallback(async () => {
    try {
      const snap = await getDoc(doc(db, 'products', id));
      if (!snap.exists()) { router.replace('/admin/products'); return; }
      const d = snap.data();
      setForm({
        name:          d.name          ?? '',
        description:   d.description   ?? '',
        sku:           d.sku           ?? '',
        price:         d.price         ?? '',
        discountPrice: d.discountPrice ?? '',
        stock:         d.stock         ?? '',
        weight:        d.weight        ?? '',
        status:        d.status        ?? 'active',
        isFeatured:    d.isFeatured    ?? false,
        categoryId:    d.categoryId    ?? '',
      });
      setImages(d.images ?? []);
    } catch (err) {
      setError('Failed to load product: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => { load(); }, [load]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  }

  // ── Image upload ─────────────────────────────────────────────────────
  async function handleImageUpload(e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    setError('');
    try {
      for (const file of files) {
        const base64 = await new Promise((res, rej) => {
          const r = new FileReader();
          r.onload  = () => res(r.result);
          r.onerror = rej;
          r.readAsDataURL(file);
        });
        const resp = await fetch('/api/upload', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ image: base64, name: file.name }),
        });
        if (!resp.ok) throw new Error('Upload failed');
        const data = await resp.json();
        setImages((prev) => [...prev, data.url]);
      }
    } catch (err) {
      setError('Image upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  }

  // ── Save ─────────────────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.name || !form.price || form.stock === '') {
      setError('Name, price, and stock are required.');
      return;
    }
    setSaving(true);
    try {
      const selectedCat = categories.find((c) => c.id === form.categoryId);
      const categorySlug = selectedCat ? selectedCat.slug : '';

      await updateDoc(doc(db, 'products', id), {
        name:          form.name.trim(),
        slug:          slugify(form.name),
        description:   form.description.trim(),
        sku:           form.sku.trim(),
        price:         parseFloat(form.price),
        discountPrice: form.discountPrice ? parseFloat(form.discountPrice) : null,
        stock:         parseInt(form.stock, 10),
        weight:        form.weight ? parseFloat(form.weight) : null,
        status:        form.status,
        isFeatured:    form.isFeatured,
        images,
        categoryId:    form.categoryId || '',
        category:      categorySlug,
        categorySlug:  categorySlug,
        updatedAt:     serverTimestamp(),
      });
      router.push('/admin/products');
    } catch (err) {
      setError('Failed to save: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  // ── Delete ────────────────────────────────────────────────────────────
  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteDoc(doc(db, 'products', id));
      router.replace('/admin/products');
    } catch (err) {
      setError('Delete failed: ' + err.message);
      setDeleting(false);
      setConfirmDel(false);
    }
  }

  // ── Reorder: move image up ────────────────────────────────────────────
  function moveImageUp(i) {
    if (i === 0) return;
    const arr = [...images];
    [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
    setImages(arr);
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%' }}>
        {[1,2,3].map((k) => <div key={k} className="skeleton" style={{ height: 120, borderRadius: 16 }} />)}
      </div>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      {/* Back & title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <button onClick={() => router.back()}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: 14 }}>
          <ArrowLeft size={16} /> Back
        </button>
        <button onClick={() => setConfirmDel(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fff5f5', border: '1.5px solid #fecaca', color: '#dc2626', borderRadius: 10, padding: '8px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
          <Trash2 size={14} /> Delete Product
        </button>
      </div>

      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 32, margin: '0 0 28px' }}>Edit Product</h2>

      {error && (
        <div style={{ background: '#fff5f5', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 16px', color: '#dc2626', fontSize: 14, marginBottom: 20 }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Images */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Product Images</h3>
          <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 16, marginTop: 4 }}>
            First image is the main image. Click ↑ to reorder, ✕ to remove.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {images.map((url, i) => (
              <div key={i} style={{ position: 'relative', width: 96, height: 96, borderRadius: 10, overflow: 'hidden', border: i === 0 ? '2px solid #e91e8c' : '2px solid #e5e7eb', flexShrink: 0 }}>
                <Image src={url} alt={`img-${i}`} fill style={{ objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.35)', opacity: 0, transition: 'opacity .15s' }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = 0}>
                  <button type="button" onClick={() => setImages(images.filter((_, j) => j !== i))}
                    style={{ position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: '50%', background: 'rgba(220,38,38,.9)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                    <X size={11} />
                  </button>
                  {i > 0 && (
                    <button type="button" onClick={() => moveImageUp(i)}
                      style={{ position: 'absolute', bottom: 4, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,.7)', border: 'none', cursor: 'pointer', color: '#fff', fontSize: 10, padding: '2px 6px', borderRadius: 4 }}>
                      ↑ Main
                    </button>
                  )}
                </div>
                {i === 0 && <span style={{ position: 'absolute', bottom: 4, left: 4, background: '#e91e8c', color: '#fff', fontSize: 9, fontWeight: 700, padding: '2px 5px', borderRadius: 4 }}>MAIN</span>}
              </div>
            ))}
            <label style={{ width: 96, height: 96, borderRadius: 10, border: '2px dashed #d1d5db', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: uploading ? 'wait' : 'pointer', gap: 4, background: '#fafafa', color: '#9ca3af', flexShrink: 0 }}>
              {uploading ? '⏳' : <><Upload size={18} /><span style={{ fontSize: 11 }}>Upload</span></>}
              <input type="file" multiple accept="image/*" onChange={handleImageUpload} disabled={uploading} style={{ display: 'none' }} />
            </label>
          </div>
        </div>

        {/* Basic Info */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>Basic Information</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <LabelInput label="Product Name" required>
              <input name="name" value={form.name} onChange={handleChange} required className="input" placeholder="e.g. Cute Bear Plushie" />
            </LabelInput>
            <LabelInput label="Description">
              <textarea name="description" value={form.description} onChange={handleChange} rows={4}
                className="input" style={{ resize: 'vertical', fontFamily: 'inherit' }} placeholder="Describe this adorable product…" />
            </LabelInput>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <LabelInput label="SKU">
                <input name="sku" value={form.sku} onChange={handleChange} className="input" placeholder="CT-001" />
              </LabelInput>
              <LabelInput label="Weight (grams)">
                <input name="weight" type="number" value={form.weight} onChange={handleChange} className="input" placeholder="250" />
              </LabelInput>
            </div>
          </div>
        </div>

        {/* Pricing & Stock */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>Pricing & Stock</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <LabelInput label="Price (Rs.)" required>
              <input name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleChange} required className="input" placeholder="1500" />
            </LabelInput>
            <LabelInput label="Discount Price (Rs.)">
              <input name="discountPrice" type="number" min="0" step="0.01" value={form.discountPrice ?? ''} onChange={handleChange} className="input" placeholder="1200" />
            </LabelInput>
            <LabelInput label="Stock Qty" required>
              <input name="stock" type="number" min="0" value={form.stock} onChange={handleChange} required className="input" placeholder="50" />
            </LabelInput>
          </div>
        </div>

        {/* Settings */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>Settings</h3>
          <div className="settings-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Category</label>
              <select name="categoryId" value={form.categoryId} onChange={handleChange} className="input">
                <option value="">Select Category...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Status</label>
              <select name="status" value={form.status} onChange={handleChange} className="input">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 22 }}>
              <input type="checkbox" id="isFeatured" name="isFeatured" checked={form.isFeatured} onChange={handleChange}
                style={{ width: 18, height: 18, accentColor: '#e91e8c', cursor: 'pointer' }} />
              <label htmlFor="isFeatured" style={{ fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Star size={16} color="#f59e0b" fill="#f59e0b" /> Featured Product
              </label>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button type="submit" disabled={saving} className="btn-primary"
            style={{ flex: 1, padding: 14, fontSize: 15, opacity: saving ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Save size={16} /> {saving ? 'Saving…' : 'Save Changes'}
          </button>
          <button type="button" onClick={() => router.back()} className="btn-outline" style={{ padding: '14px 24px' }}>
            Cancel
          </button>
        </div>
      </form>

      {/* Delete confirmation modal */}
      {confirmDel && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 24 }}>
          <div className="card" style={{ padding: 32, maxWidth: 380, width: '100%', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
            <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700 }}>Delete Product?</h3>
            <p style={{ color: '#6b7280', marginBottom: 24, fontSize: 14 }}>
              This will permanently remove the product from your store. This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setConfirmDel(false)} className="btn-outline" style={{ flex: 1 }}>Cancel</button>
              <button onClick={handleDelete} disabled={deleting}
                style={{ flex: 1, background: '#dc2626', color: '#fff', border: 'none', borderRadius: 9999, padding: 12, fontWeight: 600, cursor: 'pointer', opacity: deleting ? 0.7 : 1 }}>
                {deleting ? 'Deleting…' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media(max-width:640px){
          div[style*="grid-template-columns: 1fr 1fr 1fr"]{grid-template-columns:1fr 1fr!important}
          div[style*="grid-template-columns: 1fr 1fr"]{grid-template-columns:1fr!important}
          .settings-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
