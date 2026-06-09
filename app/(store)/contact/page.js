'use client';

import { useState } from 'react';
import { Mail, Phone, Facebook, Music2, Send, CheckCircle } from 'lucide-react';

export default function ContactPage() {
  const [form, setForm]       = useState({ name: '', email: '', message: '' });
  const [sent, setSent]       = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    // Simple simulation — in production connect to Brevo or similar
    await new Promise((r) => setTimeout(r, 1000));
    setSent(true);
    setLoading(false);
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '64px 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: 56 }}>
        <h1 style={{ fontSize: 'clamp(28px,5vw,48px)', fontWeight: 900, margin: '0 0 16px' }}>
          Contact <span className="gradient-brand-text">Us</span>
        </h1>
        <p style={{ fontSize: 17, color: '#6b7280' }}>We'd love to hear from you 💌</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'start' }}>

        {/* Contact Info */}
        <div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
            {[
              { icon: Facebook, label: 'Facebook', value: 'Cute Things', href: 'https://www.facebook.com/share/17Qros4sRV/', color: '#1877f2' },
              { icon: Music2,   label: 'TikTok',   value: '@cute.things516', href: 'https://www.tiktok.com/@cute.things516', color: '#000' },
              { icon: Mail,     label: 'Email',    value: 'hello@cutethings.lk', href: 'mailto:hello@cutethings.lk', color: '#e91e8c' },
            ].map(({ icon: Icon, label, value, href, color }) => (
              <a key={label} href={href} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 16, textDecoration: 'none', padding: '16px 20px', background: '#fafafa', border: '1px solid #f0f0f0', borderRadius: 14, transition: 'all .2s' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={20} color={color} />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 12, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1a1a2e' }}>{value}</p>
                </div>
              </a>
            ))}
          </div>

          <div style={{ background: 'linear-gradient(135deg,#fce4ec,#f3e5f5)', borderRadius: 16, padding: 24 }}>
            <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 700 }}>Response Time</h3>
            <p style={{ color: '#4b5563', fontSize: 14, margin: 0, lineHeight: 1.7 }}>
              We typically respond within <strong>2–4 hours</strong> via social media DM. For fastest response, message us on <strong>Facebook or TikTok</strong>. 💬
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="card" style={{ padding: 32 }}>
          {sent ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <CheckCircle size={48} color="#10b981" style={{ marginBottom: 16 }} />
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Message Sent!</h3>
              <p style={{ color: '#6b7280' }}>We'll get back to you soon. 💖</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <h3 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 700 }}>Send a Message</h3>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Your Name</label>
                <input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} required className="input" placeholder="Janith Perera" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Email Address</label>
                <input type="email" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} required className="input" placeholder="you@email.com" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Message</label>
                <textarea value={form.message} onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))} required rows={5} className="input" style={{ resize: 'vertical', fontFamily: 'inherit' }} placeholder="How can we help you?" />
              </div>
              <button type="submit" disabled={loading} className="btn-primary" style={{ fontSize: 15, padding: 14, opacity: loading ? 0.7 : 1 }}>
                <Send size={16} /> {loading ? 'Sending…' : 'Send Message'}
              </button>
            </form>
          )}
        </div>
      </div>

      <style>{`@media(max-width:640px){div[style*="grid-template-columns: 1fr 1fr"]{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}
