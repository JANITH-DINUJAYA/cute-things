'use client';

import { useState } from 'react';
import Link from 'next/link';
import * as Lucide from 'lucide-react';

// Map category slugs/names to Lucide icons
export function getCategoryIcon(slug = '') {
  const normalized = slug.toLowerCase().trim();
  switch (normalized) {
    case 'plush-toys':
    case 'plushtoys':
      return Lucide.Heart;
    case 'accessories':
    case 'accesories':
      return Lucide.Gem;
    case 'gifts':
    case 'gift':
    case 'gidt':
      return Lucide.Gift;
    case 'anime-plushies':
    case 'anime':
    case 'animes':
      return Lucide.Sparkles;
    default:
      return Lucide.Tag;
  }
}

// How many categories show per "row" — we fix 4 columns, so 2 rows = 8
const ITEMS_PER_PAGE = 8;

export default function CategoryGrid({ categories = [] }) {
  const [expanded, setExpanded] = useState(false);

  const visibleCategories = categories.filter((c) => c.isVisible !== false);
  const hasMore = visibleCategories.length > ITEMS_PER_PAGE;
  const displayed = expanded ? visibleCategories : visibleCategories.slice(0, ITEMS_PER_PAGE);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 14,
        width: '100%',
      }}
        className="category-grid-responsive"
      >
        {displayed.map((cat) => {
          const IconComponent = getCategoryIcon(cat.slug || cat.name);
          return (
            <Link
              key={cat.id || cat.slug || cat.name}
              href={`/shop/${cat.slug}`}
              style={{ textDecoration: 'none' }}
            >
              <div
                className="category-card"
                style={{
                  padding: '18px 12px',
                  borderRadius: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '100px',
                  gap: 10,
                }}
              >
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: 'rgba(197, 168, 128, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#c5a880',
                  flexShrink: 0,
                }}>
                  <IconComponent size={18} />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <h3 style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#1e1a1d',
                    margin: '0 0 2px',
                    fontFamily: 'var(--font-sans)',
                    lineHeight: 1.3,
                  }}>
                    {cat.name}
                  </h3>
                  {cat.desc && (
                    <p style={{ fontSize: 10, color: 'rgba(30,26,29,.4)', margin: 0 }}>
                      {cat.desc}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            padding: '9px 28px',
            fontSize: 12,
            fontWeight: 600,
            borderRadius: '9999px',
            border: '1.5px solid #c5a880',
            color: '#c5a880',
            background: 'transparent',
            cursor: 'pointer',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#c5a880';
            e.currentTarget.style.color = '#fff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#c5a880';
          }}
        >
          {expanded ? 'Show Less' : `Load More (${visibleCategories.length - ITEMS_PER_PAGE} more)`}
        </button>
      )}

      <style>{`
        @media (max-width: 640px) {
          .category-grid-responsive {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 10px !important;
          }
        }
        @media (min-width: 641px) and (max-width: 900px) {
          .category-grid-responsive {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
      `}</style>
    </div>
  );
}
