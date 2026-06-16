import { HelpCircle, Sparkles, Heart } from 'lucide-react';

export const metadata = {
  title: 'Frequently Asked Questions',
  description: 'Find answers to common questions about Cute Things — ordering, delivery, returns, and more.',
};

const faqs = [
  { q: 'How do I place an order?',            a: 'Browse our products, add items to your cart, and proceed to checkout. Fill in your delivery details, select your payment method, and click "Place Order". It\'s that easy!' },
  { q: 'What payment methods do you accept?', a: 'We accept Cash on Delivery (COD) across Sri Lanka, Bank Transfer (simply upload a screenshot of your payment slip during checkout), and Card Payments (Visa/Mastercard, currently for demonstration purposes).' },
  { q: 'How long does delivery take?',        a: 'Delivery typically takes 2–5 business days island-wide across Sri Lanka. We\'ll update you on your order status via email.' },
  { q: 'What is the shipping fee?',           a: 'Standard shipping is Rs. 350 island-wide. We may offer free shipping promotions — keep an eye on our TikTok for announcements!' },
  { q: 'Can I return or exchange a product?', a: 'Yes! If you receive a damaged or incorrect item, contact us within 24 hours of delivery via our social media pages and we\'ll arrange a replacement.' },
  { q: 'Do you ship island-wide?',            a: 'Yes, we deliver to all districts in Sri Lanka including Colombo, Gampaha, Kandy, Galle, Matara, Jaffna, and everywhere in between.' },
  { q: 'How can I track my order?',           a: 'You\'ll receive order status updates via email. You can also message us on Facebook or TikTok with your order number for a real-time update.' },
  { q: 'Are your products authentic?',        a: 'Yes! All our products are carefully sourced and quality-checked before listing. We stand behind the quality of every item we sell.' },
  { q: 'Can I order as a gift?',              a: 'Absolutely! Add a gift note in the Order Notes field during checkout. We\'ll make sure it\'s packaged beautifully for the recipient.' },
  { q: 'How do I contact customer support?',  a: 'Message us on Facebook (Cute Things) or TikTok (@cute.things516). We respond within 2–4 hours during business hours.' },
];

export default function FAQPage() {
  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '64px 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: 56 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 72, height: 72, borderRadius: '50%', background: 'rgba(197,168,128,0.1)', color: '#c5a880', marginBottom: 16 }}>
          <HelpCircle size={36} />
        </div>
        <h1 style={{ fontSize: 'clamp(28px,5vw,48px)', fontWeight: 900, margin: '0 0 16px' }}>
          Frequently Asked <span className="gradient-brand-text">Questions</span>
        </h1>
        <p style={{ fontSize: 17, color: '#6b7280' }}>Everything you need to know about shopping with us <Sparkles size={16} style={{ display: 'inline', color: '#c5a880' }} /></p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {faqs.map(({ q, a }, i) => (
          <details key={i} style={{ background: '#fff', border: '1.5px solid #f0f0f0', borderRadius: 14, overflow: 'hidden' }}>
            <summary style={{ padding: '18px 22px', cursor: 'pointer', fontSize: 15, fontWeight: 600, color: '#1a1a2e', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {q}
              <span style={{ color: '#e91e8c', fontSize: 20, fontWeight: 300, marginLeft: 16, flexShrink: 0 }}>+</span>
            </summary>
            <div style={{ padding: '0 22px 18px', fontSize: 15, color: '#4b5563', lineHeight: 1.7, borderTop: '1px solid #f9f0ff' }}>
              {a}
            </div>
          </details>
        ))}
      </div>

      <div style={{ marginTop: 48, background: 'linear-gradient(135deg,#fce4ec,#f3e5f5)', borderRadius: 20, padding: '32px', textAlign: 'center' }}>
        <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700 }}>Still have questions?</h3>
        <p style={{ color: '#4b5563', marginBottom: 20 }}>Message us on social media — we're happy to help! <Heart size={14} style={{ display: 'inline', color: '#e91e8c', fill: '#e91e8c' }} /></p>
        <a href="https://www.facebook.com/share/17Qros4sRV/" target="_blank" rel="noreferrer"
           className="btn-gold" style={{ textDecoration: 'none' }}>Contact Us</a>
      </div>
    </div>
  );
}
