'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
          {videos.map((id) => (
            <div
              key={id}
              style={{
                flex: isMobile ? '0 0 100%' : `0 0 calc(${100 / visibleItems}% - 14px)`,
                display: 'flex',
                justifyContent: 'center',
                boxSizing: 'border-box',
              }}
            >
              {/* Compact Video Card */}
              <div style={{
                background: '#fff',
                borderRadius: 20,
                padding: 10,
                boxShadow: '0 8px 24px rgba(0,0,0,0.03)',
                border: '1px solid #eae3dc',
                height: 440,
                width: '100%',
                maxWidth: 280,
                overflow: 'hidden',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
              }}>
                <iframe
                  src={`https://www.tiktok.com/player/v1/${id}`}
                  style={{ width: '100%', height: '100%', border: 'none', borderRadius: 14 }}
                  allow="autoplay; encrypted-media"
                  allowFullScreen
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
