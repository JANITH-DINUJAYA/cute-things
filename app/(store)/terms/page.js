export const metadata = {
  title: 'Terms & Conditions',
  description: 'Terms and conditions for using the Cute Things website and purchasing our products.',
};

export default function TermsPage() {
  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '64px 24px' }}>
      <h1 style={{ fontSize: 'clamp(28px,4vw,42px)', fontWeight: 900, margin: '0 0 8px' }}>
        Terms & <span className="gradient-brand-text">Conditions</span>
      </h1>
      <p style={{ color: '#6b7280', marginBottom: 48 }}>Last updated: June 2026</p>

      {[
        { title: '1. Acceptance of Terms',      content: 'By accessing and using the Cute Things website and placing orders, you agree to be bound by these Terms and Conditions.' },
        { title: '2. Products & Availability',  content: 'All products are subject to availability. We reserve the right to limit quantities or discontinue products at any time. Product images are for illustrative purposes and may slightly differ from the actual product.' },
        { title: '3. Pricing',                  content: 'All prices are displayed in Sri Lankan Rupees (LKR). Prices are subject to change without notice. The price at the time of order confirmation is the price you will pay.' },
        { title: '4. Orders & Payment',         content: 'Orders are processed on a Cash on Delivery basis. By placing an order, you commit to being available to receive the delivery and make payment upon delivery.' },
        { title: '5. Delivery',                 content: 'We aim to deliver within the stated timeframes but cannot guarantee specific delivery dates. Delivery delays may occur due to unforeseen circumstances.' },
        { title: '6. Cancellations',            content: 'Orders can only be cancelled before dispatch. To cancel, contact us immediately via social media with your order number.' },
        { title: '7. Returns & Refunds',        content: 'We accept returns only for damaged or incorrect items reported within 24 hours of delivery. Refunds are issued as store credit or product replacement.' },
        { title: '8. Intellectual Property',    content: 'All content on this website including images, text, and logos are the property of Cute Things and may not be reproduced without permission.' },
        { title: '9. Limitation of Liability',  content: 'Cute Things shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or website.' },
        { title: '10. Governing Law',           content: 'These terms are governed by the laws of Sri Lanka. Any disputes shall be subject to the jurisdiction of Sri Lankan courts.' },
      ].map(({ title, content }) => (
        <div key={title} style={{ marginBottom: 28, paddingBottom: 28, borderBottom: '1px solid #f5f5f5' }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, margin: '0 0 10px', color: '#1a1a2e' }}>{title}</h2>
          <p style={{ fontSize: 15, color: '#4b5563', lineHeight: 1.8, margin: 0 }}>{content}</p>
        </div>
      ))}
    </div>
  );
}
