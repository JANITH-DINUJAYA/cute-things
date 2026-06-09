import { Cormorant_Garamond, Montserrat } from 'next/font/google';
import './globals.css';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-serif',
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
});

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['300', '400', '500', '600', '700', '800'],
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'Cute Things — Plush Toys, Gifts & Cute Accessories in Sri Lanka',
    template: '%s | Cute Things',
  },
  description:
    'Shop cute plush toys, anime gifts, keychains, and adorable accessories in Sri Lanka. Fast delivery. Cash on delivery available.',
  keywords: [
    'cute gifts Sri Lanka',
    'plush toys Sri Lanka',
    'anime gifts Sri Lanka',
    'cute accessories Sri Lanka',
    'cute things Sri Lanka',
    'teddy bears Sri Lanka',
  ],
  icons: {
    icon: [
      { url: '/logo.jpg', type: 'image/jpeg' },
    ],
    apple: [
      { url: '/logo.jpg', sizes: '180x180', type: 'image/jpeg' },
    ],
    shortcut: '/logo.jpg',
  },
  openGraph: {
    type:        'website',
    locale:      'en_LK',
    siteName:    'Cute Things',
    title:       'Cute Things — Plush Toys, Gifts & Cute Accessories in Sri Lanka',
    description: 'Shop cute plush toys, anime gifts, keychains & adorable accessories.',
    images: [{ url: '/logo.jpg', width: 512, height: 512, alt: 'Cute Things' }],
  },
  twitter: { card: 'summary_large_image', images: ['/logo.jpg'] },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }) {
  const metaPixelId  = process.env.NEXT_PUBLIC_META_PIXEL_ID  || '';
  const tiktokPixelId = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID || '';

  return (
    <html lang="en" className={`${montserrat.variable} ${cormorant.variable}`}>
      <head>
        {/* Meta Pixel */}
        {metaPixelId && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
                n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
                document,'script','https://connect.facebook.net/en_US/fbevents.js');
                fbq('init','${metaPixelId}');fbq('track','PageView');
              `,
            }}
          />
        )}
        {/* TikTok Pixel */}
        {tiktokPixelId && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                !function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
                ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];
                ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
                for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
                ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};
                ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";
                ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=i;ttq._t=ttq._t||{};ttq._t[e]=+new Date;
                ttq._o=ttq._o||{};ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript";
                o.async=!0;o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];
                a.parentNode.insertBefore(o,a)};ttq.load('${tiktokPixelId}');ttq.page();}(window,document,'ttq');
              `,
            }}
          />
        )}
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
