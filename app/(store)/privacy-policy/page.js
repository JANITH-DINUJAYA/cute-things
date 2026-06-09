export const metadata = {
  title: 'Privacy Policy',
  description: 'Cute Things privacy policy — how we collect, use, and protect your personal information.',
};

export default function PrivacyPolicyPage() {
  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '64px 24px' }}>
      <h1 style={{ fontSize: 'clamp(28px,4vw,42px)', fontWeight: 900, margin: '0 0 8px' }}>
        Privacy <span className="gradient-brand-text">Policy</span>
      </h1>
      <p style={{ color: '#6b7280', marginBottom: 48 }}>Last updated: June 2026</p>

      {[
        { title: '1. Information We Collect', content: 'When you place an order, we collect your name, email address, phone number, and delivery address. We use this information solely to process and deliver your order.' },
        { title: '2. How We Use Your Information', content: 'Your personal information is used to: process and fulfill your order, send order confirmations and delivery updates, and respond to your customer service inquiries.' },
        { title: '3. Data Sharing', content: 'We do not sell or share your personal information with third parties, except with our delivery partner to complete your order delivery.' },
        { title: '4. Cookies & Analytics', content: 'We use cookies and analytics tools (including Meta Pixel and TikTok Pixel) to understand how visitors use our website and to improve our marketing. You can disable cookies in your browser settings.' },
        { title: '5. Data Security', content: 'Your information is stored securely using Google Firebase. We implement industry-standard security measures to protect against unauthorized access.' },
        { title: '6. Your Rights', content: 'You have the right to access, correct, or delete your personal data. To make a request, contact us at hello@cutethings.lk or via our social media pages.' },
        { title: '7. Contact', content: 'For privacy-related inquiries, contact us at hello@cutethings.lk or via Facebook/TikTok.' },
      ].map(({ title, content }) => (
        <div key={title} style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 10px' }}>{title}</h2>
          <p style={{ fontSize: 15, color: '#4b5563', lineHeight: 1.8, margin: 0 }}>{content}</p>
        </div>
      ))}
    </div>
  );
}
