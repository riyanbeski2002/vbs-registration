'use client';

export default function HeroSection() {
  return (
    <div
      style={{
        position: 'relative',
        padding: 'clamp(5rem, 12vw, 7.5rem) 1.5rem clamp(4rem, 10vw, 6rem)',
        textAlign: 'center',
      }}
    >
      {/* Dark radial vignette behind text for legibility */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: [
            'radial-gradient(ellipse 80% 85% at 50% 48%, rgba(0,10,3,0.68) 0%, rgba(0,8,2,0.35) 55%, transparent 82%)',
            'radial-gradient(ellipse 50% 40% at 50% 20%, rgba(0,5,1,0.45) 0%, transparent 70%)',
          ].join(', '),
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative', zIndex: 3 }}>

        {/* ── Church name banner ── */}
        <div className="hero-badge" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.55rem',
          background: 'linear-gradient(135deg, rgba(60,180,100,0.22), rgba(30,120,65,0.12))',
          border: '1.5px solid rgba(80,200,120,0.55)',
          borderRadius: '9999px',
          padding: '0.36rem 1.1rem',
          marginBottom: '0.75rem',
          boxShadow: '0 2px 24px rgba(50,180,90,0.18), inset 0 1px 0 rgba(255,255,255,0.12)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}>
          <span style={{ fontSize: '0.85rem' }}>⛪</span>
          <span style={{
            fontSize: '0.72rem',
            color: 'rgba(160,255,190,0.95)',
            fontWeight: 800,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}>
            El Bethel AG International Church
          </span>
        </div>

        {/* ── Expedition badge ── */}
        <div
          className="hero-badge"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'linear-gradient(135deg, rgba(200,168,75,0.22), rgba(200,168,75,0.06))',
            border: '1.5px solid rgba(200,168,75,0.62)',
            borderRadius: '9999px',
            padding: '0.38rem 1.2rem',
            marginBottom: '1.75rem',
            marginLeft: '0.5rem',
            boxShadow: '0 2px 30px rgba(200,168,75,0.18), inset 0 1px 0 rgba(255,255,255,0.1)',
            animation: 'badge-float 4s ease-in-out infinite',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
        >
          <span style={{ fontSize: '0.9rem' }}>🧭</span>
          <span style={{
            fontSize: '0.74rem',
            color: '#f2dc82',
            fontWeight: 800,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
          }}>
            Vacation Bible School 2026
          </span>
          <span style={{ color: 'rgba(200,168,75,0.5)', fontSize: '0.68rem' }}>✦</span>
        </div>

        {/* ── Stacked title ── */}
        <h1 style={{ margin: '0 0 0.75rem 0', lineHeight: 1 }}>
          <span style={{
            display: 'block',
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.8rem, 5vw, 2.75rem)',
            color: 'rgba(255,255,255,0.88)',
            fontWeight: 600,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            textShadow: '0 2px 24px rgba(0,0,0,0.8)',
            marginBottom: '0.05rem',
          }}>
            Jungle
          </span>
          <span style={{
            display: 'block',
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(3.2rem, 11vw, 5.8rem)',
            color: '#c8a84b',
            fontWeight: 600,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            lineHeight: 0.88,
            textShadow: '0 0 90px rgba(200,168,75,0.5), 0 4px 24px rgba(0,0,0,0.75)',
            marginBottom: '0.18rem',
          }}>
            SAFARI
          </span>
          <span style={{
            display: 'block',
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(0.95rem, 3vw, 1.45rem)',
            color: 'rgba(255,255,255,0.72)',
            fontWeight: 400,
            letterSpacing: '0.35em',
            textTransform: 'uppercase',
            textShadow: '0 1px 12px rgba(0,0,0,0.65)',
          }}>
            Adventure
          </span>
        </h1>

        {/* ── Description ── */}
        <p style={{
          color: 'rgba(255,255,255,0.62)',
          fontSize: 'clamp(0.88rem, 2vw, 0.98rem)',
          maxWidth: '400px',
          margin: '0 auto 0.6rem',
          lineHeight: 1.78,
          fontWeight: 600,
          textShadow: '0 1px 8px rgba(0,0,0,0.6)',
        }}>
          5 days of wild fun, faith &amp; friendship — complete your expedition registration below!
        </p>

        {/* ── Church hosted-by line ── */}
        <p style={{
          color: 'rgba(160,255,190,0.72)',
          fontSize: '0.8rem',
          fontWeight: 700,
          letterSpacing: '0.06em',
          margin: '0 auto 1.75rem',
          textShadow: '0 1px 8px rgba(0,0,0,0.5)',
        }}>
          Hosted by <span style={{ color: 'rgba(180,255,210,0.92)', fontWeight: 800 }}>El Bethel AG International Church</span>
        </p>

        {/* ── Stats chips ── */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '0.45rem',
          flexWrap: 'wrap',
          marginBottom: '2.5rem',
        }}>
          {[
            { icon: '📅', label: '5 Days' },
            { icon: '🦁', label: 'Jungle Theme' },
            { icon: '🧺', label: 'Day 5 Picnic' },
            { icon: '🎒', label: 'Ages 4–16' },
          ].map(({ icon, label }) => (
            <div key={label} className="hero-chip" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.28rem',
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '9999px',
              padding: '0.26rem 0.8rem',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
            }}>
              <span style={{ fontSize: '0.78rem' }}>{icon}</span>
              <span style={{ color: 'rgba(255,255,255,0.78)', fontSize: '0.75rem', fontWeight: 700 }}>{label}</span>
            </div>
          ))}
        </div>

        {/* ── Decorative divider ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.55rem', opacity: 0.45 }}>
          <span style={{ fontSize: '0.88rem' }}>🌴</span>
          <div style={{ height: '1px', width: '44px', background: 'linear-gradient(to right, transparent, rgba(200,168,75,0.9))' }} />
          <span style={{ color: '#c8a84b', fontSize: '0.8rem', letterSpacing: '0.1em' }}>✦✦✦</span>
          <div style={{ height: '1px', width: '44px', background: 'linear-gradient(to left, transparent, rgba(200,168,75,0.9))' }} />
          <span style={{ fontSize: '0.88rem' }}>🌴</span>
        </div>

        {/* ── Scroll cue ── */}
        <div style={{
          marginTop: '2.25rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.3rem',
          opacity: 0.38,
          animation: 'scroll-bounce 2s ease-in-out infinite',
        }}>
          <span style={{ fontSize: '0.62rem', color: 'rgba(200,168,75,0.9)', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
            Scroll to register
          </span>
          <svg width="18" height="22" viewBox="0 0 18 22" fill="none">
            <path d="M9 2 L9 16 M3 11 L9 18 L15 11" stroke="#c8a84b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

      </div>
    </div>
  );
}
