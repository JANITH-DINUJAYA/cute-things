'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Converts a Cloudinary player embed URL into a direct .mp4 URL.
 * e.g. https://player.cloudinary.com/embed/?cloud_name=abc&public_id=xyz
 *   → https://res.cloudinary.com/abc/video/upload/xyz.mp4
 * All other URLs are returned as-is.
 */
function normalizeVideoUrl(url) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === 'player.cloudinary.com') {
      const cloudName = parsed.searchParams.get('cloud_name');
      const publicId  = parsed.searchParams.get('public_id');
      if (cloudName && publicId) {
        return `https://res.cloudinary.com/${cloudName}/video/upload/${publicId}.mp4`;
      }
    }
  } catch (_) { /* not a valid URL, fall through */ }
  return url;
}

export default function TikTokCarousel({ videos = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!videos || videos.length === 0) return null;

  // Max index is length - 3 on desktop, or length - 1 on mobile
  const visibleItems = isMobile ? 1 : Math.min(3, videos.length);
  const maxIndex = Math.max(0, videos.length - visibleItems);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? maxIndex : prev - 1));
  };

  return (
    <div style={{ position: 'relative', maxWidth: 1100, margin: '0 auto', padding: '0 32px' }}>
      
      {/* Slider Window Container */}
      <div style={{ overflow: 'hidden', padding: '16px 0' }}>
        <div style={{
          display: 'flex',
          gap: 20,
          transform: `translateX(-${currentIndex * (isMobile ? 100 : (100 / visibleItems)) }%)`,
          transition: 'transform 0.4s ease-in-out',
        }} className="tiktok-slider-row">
          {videos.map((url, idx) => (
            <div
              key={idx}
              style={{
                flex: isMobile ? '0 0 100%' : `0 0 calc(${100 / visibleItems}% - 14px)`,
                display: 'flex',
                justifyContent: 'center',
                boxSizing: 'border-box',
              }}
            >
              {/* Compact Video Card (Phone Preview Shell) */}
              <div style={{
                background: '#000',
                borderRadius: 24,
                boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
                border: '4px solid #1e1a1d',
                height: 440,
                width: '100%',
                maxWidth: 260,
                overflow: 'hidden',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
              }}>
                <video
                  src={normalizeVideoUrl(url)}
                  controls
                  loop
                  muted
                  playsInline
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: 18,
                    background: '#000',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      {videos.length > visibleItems && (
        <>
          <button
            onClick={prevSlide}
            style={{
              position: 'absolute',
              left: 4,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10,
              width: 40,
              height: 40,
              borderRadius: '50%',
              border: '1px solid #eae3dc',
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              color: '#c5a880',
              transition: 'all 0.2s',
            }}
            aria-label="Previous videos"
          >
            <ChevronLeft size={20} />
          </button>
          
          <button
            onClick={nextSlide}
            style={{
              position: 'absolute',
              right: 4,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10,
              width: 40,
              height: 40,
              borderRadius: '50%',
              border: '1px solid #eae3dc',
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              color: '#c5a880',
              transition: 'all 0.2s',
            }}
            aria-label="Next videos"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}
    </div>
  );
}
