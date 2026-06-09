export const metadata = {
  title: 'Shipping Policy',
  description: 'Learn about Cute Things delivery areas, shipping fees, and estimated delivery times across Sri Lanka.',
};

export default function ShippingPolicyPage() {
  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '64px 24px' }}>
      <h1 style={{ fontSize: 'clamp(28px,4vw,42px)', fontWeight: 900, margin: '0 0 8px' }}>
        Shipping <span className="gradient-brand-text">Policy</span>
      </h1>
      <p style={{ color: '#6b7280', marginBottom: 48 }}>Last updated: June 2026</p>

      {[
        {
          title: '🚚 Delivery Areas',
          content: 'We deliver island-wide across all districts of Sri Lanka, including Colombo, Gampaha, Kandy, Galle, Matara, Negombo, Jaffna, Trincomalee, Batticaloa, Kurunegala, and all other areas.',
        },
        {
          title: '💰 Shipping Fees',
          content: 'Standard shipping: Rs. 350 for all orders island-wide.\n\nWe may offer free shipping promotions on selected products or during special events — follow our TikTok and Facebook for updates.',
        },
        {
          title: '⏱️ Delivery Timeframe',
          content: 'Colombo and surrounding areas: 1–3 business days.\nOther districts: 2–5 business days.\n\nDelivery times may vary during peak seasons (holidays, festive periods).',
        },
        {
          title: '📦 Packaging',
          content: 'All orders are carefully packaged to ensure your cute products arrive in perfect condition. Gift orders receive special packaging upon request — add a note during checkout.',
        },
        {
          title: '💵 Payment on Delivery',
          content: 'We operate on a Cash on Delivery (COD) basis. Payment is collected by our delivery partner upon successful delivery. Please have the exact amount ready.',
        },
        {
          title: '📞 Order Tracking',
          content: 'You will receive email notifications at each stage: Order Confirmed → Processing → Dispatched → Delivered. You can also message us on Facebook or TikTok with your order number for updates.',
        },
        {
          title: '⚠️ Delivery Issues',
          content: 'If your order is not delivered within the estimated timeframe, please contact us immediately via social media. We will investigate and resolve the issue promptly.',
        },
      ].map(({ title, content }) => (
        <div key={title} style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 12px' }}>{title}</h2>
          <p style={{ fontSize: 15, color: '#4b5563', lineHeight: 1.8, whiteSpace: 'pre-line', margin: 0 }}>{content}</p>
        </div>
      ))}
    </div>
  );
}
