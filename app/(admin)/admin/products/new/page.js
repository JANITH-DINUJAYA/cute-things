'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase/client';
import { collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import { ArrowLeft, Upload, X, Star } from 'lucide-react';
import Image from 'next/image';

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function NewProductPage() {
  const router  = useRouter();
  const [form, setForm] = useState({
    name: '', description: '', sku: '', price: '',
    discountPrice: '', stock: '', weight: '',
    status: 'active', isFeatured: false, categoryId: '',
  });
  const [categories, setCategories] = useState([]);
  const [images,   setImages]   = useState([]); // array of imgbb URLs
  const [uploading,setUploading] = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState('');

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

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  }

  // Upload image to imgbb via our proxy API
  async function handleImageUpload(e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    setError('');
    try {
      for (const file of files) {
        const reader = new FileReader();
        const base64 = await new Promise((res, rej) => {
          reader.onload = () => res(reader.result);
          reader.onerror = rej;
          reader.readAsDataURL(file);
        });
        const resp = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64, name: file.name }),
        });
        if (!resp.ok) throw new Error('Image upload failed');
        const data = await resp.json();
        setImages((prev) => [...prev, data.url]);
      }
    } catch (err) {
      setError('Image upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.name || !form.price || !form.stock) {
      setError('Name, price, and stock are required.');
      return;
    }
    setSaving(true);
    try {
      const selectedCat = categories.find((c) => c.id === form.categoryId);
      const categorySlug = selectedCat ? selectedCat.slug : '';

      await addDoc(collection(db, 'products'), {
        name:          form.name.trim(),
        slug:          slugify(form.name),
        description:   form.description.trim(),
        sku:           form.sku.trim(),
        price:         parseFloat(form.price),
        discountPrice: form.discountPrice ? parseFloat(form.discountPrice) : null,
        stock:         parseInt(form.stock),
        weight:        form.weight ? parseFloat(form.weight) : null,
        status:        form.status,
        isFeatured:    form.isFeatured,
        images,
        categoryId:    form.categoryId || '',
        category:      categorySlug,
        categorySlug:  categorySlug,
        createdAt:     serverTimestamp(),
        updatedAt:     serverTimestamp(),
      });
      router.push('/admin/products');
    } catch (err) {
      setError('Failed to save: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <button onClick={() => router.back()}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: 14, marginBottom: 24 }}>
        <ArrowLeft size={16} /> Back
      </button>

      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 32 }}>Add New Product</h2>

      {error && (
        <div style={{ background: '#fff5f5', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 16px', color: '#dc2626', fontSize: 14, marginBottom: 20 }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Images */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Product Images</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
            {images.map((url, i) => (
              <div key={i} style={{ position: 'relative', width: 96, height: 96, borderRadius: 10, overflow: 'hidden', border: '2px solid #e5e7eb' }}>
                <Image src={url} alt={`img-${i}`} fill style={{ objectFit: 'cover' }} />
                <button type="button" onClick={() => setImages(images.filter((_, j) => j !== i))}
                  style={{ position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: '50%', background: 'rgba(0,0,0,.6)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                  <X size={12} />
                </button>
                {i === 0 && <span style={{ position: 'absolute', bottom: 4, left: 4, background: '#e91e8c', color: '#fff', fontSize: 9, fontWeight: 700, padding: '2px 5px', borderRadius: 4 }}>MAIN</span>}
              </div>
            ))}

            <label style={{
              width: 96, height: 96, borderRadius: 10, border: '2px dashed #d1d5db',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              cursor: uploading ? 'wait' : 'pointer', gap: 4, background: '#fafafa', color: '#9ca3af',
            }}>
              {uploading ? '⏳' : <><Upload size={18} /><span style={{ fontSize: 11 }}>Upload</span></>}
              <input type="file" multiple accept="image/*" onChange={handleImageUpload} disabled={uploading} style={{ display: 'none' }} />
            </label>
          </div>
          <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>First image will be the main product image. Uploaded to imgbb.</p>
        </div>

        {/* Basic Info */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Basic Information</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Product Name <span style={{ color: '#e91e8c' }}>*</span></label>
              <input name="name" value={form.name} onChange={handleChange} required className="input" placeholder="e.g. Cute Bear Plushie" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={4}
                className="input" style={{ resize: 'vertical', fontFamily: 'inherit' }} placeholder="Describe this adorable product…" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>SKU</label>
                <input name="sku" value={form.sku} onChange={handleChange} className="input" placeholder="CT-001" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Weight (grams)</label>
                <input name="weight" type="number" value={form.weight} onChange={handleChange} className="input" placeholder="250" />
              </div>
            </div>
          </div>
        </div>

        {/* Pricing & Stock */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Pricing & Stock</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Price (Rs.) <span style={{ color: '#e91e8c' }}>*</span></label>
              <input name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleChange} required className="input" placeholder="1500" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Discount Price (Rs.)</label>
              <input name="discountPrice" type="number" min="0" step="0.01" value={form.discountPrice} onChange={handleChange} className="input" placeholder="1200" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Stock Qty <span style={{ color: '#e91e8c' }}>*</span></label>
              <input name="stock" type="number" min="0" value={form.stock} onChange={handleChange} required className="input" placeholder="50" />
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Settings</h3>
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

        {/* Submit */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button type="submit" disabled={saving} className="btn-primary" style={{ flex: 1, padding: 14, fontSize: 15, opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Saving…' : '+ Save Product'}
          </button>
          <button type="button" onClick={() => router.back()} className="btn-outline" style={{ padding: '14px 24px' }}>
            Cancel
          </button>
        </div>
      </form>

      <style>{`
        @media(max-width:600px){
          div[style*="grid-template-columns: 1fr 1fr 1fr"]{grid-template-columns:1fr 1fr!important}
          .settings-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
