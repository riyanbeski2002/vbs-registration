'use client';

export type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error';

interface SubmitSectionProps {
  status: SubmitStatus;
  errorMessage?: string;
}

export default function SubmitSection({ status, errorMessage }: SubmitSectionProps) {
  const isDisabled = status === 'submitting' || status === 'success';

  const buttonText = {
    idle: 'Complete Registration',
    submitting: 'Submitting...',
    success: 'Submitted ✓',
    error: 'Try Again',
  }[status];

  return (
    <div style={{ marginBottom: '2rem' }}>
      {/* Error message */}
      {status === 'error' && (
        <div
          style={{
            background: '#fef2f2',
            border: '1.5px solid #fca5a5',
            borderRadius: '0.75rem',
            padding: '0.875rem 1rem',
            marginBottom: '1rem',
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'flex-start',
          }}
          role="alert"
        >
          <span style={{ fontSize: '1.1rem' }}>⚠️</span>
          <div>
            <p style={{ color: '#991b1b', fontWeight: 700, marginBottom: '0.2rem' }}>
              Submission failed
            </p>
            <p style={{ color: '#7f1d1d', fontSize: '0.88rem' }}>
              {errorMessage ?? 'Something went wrong. Please check your connection and try again.'}
            </p>
          </div>
        </div>
      )}

      <button
        type="submit"
        className="jungle-btn-primary"
        disabled={isDisabled}
        aria-busy={status === 'submitting'}
      >
        {status === 'submitting' && (
          <span style={{ marginRight: '0.5rem' }}>
            <Spinner />
          </span>
        )}
        {buttonText}
      </button>

      <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '0.8rem', marginTop: '0.75rem' }}>
        🔒 Your information is safe and will only be used for VBS registration.
      </p>

      {/* Contact help line */}
      <div style={{
        marginTop: '1.25rem',
        textAlign: 'center',
        padding: '0.75rem 1rem',
        background: 'rgba(255,255,255,0.35)',
        border: '1px solid rgba(200,168,75,0.3)',
        borderRadius: '0.625rem',
        fontSize: '0.82rem',
        color: '#374151',
        lineHeight: 1.6,
      }}>
        <span style={{ fontWeight: 700, color: '#1a5c34' }}>Need help?</span> Contact us at{' '}
        <a href="tel:+919343715552" style={{ color: '#1a5c34', fontWeight: 700, textDecoration: 'none' }}>
          +91 93437 15552
        </a>
        {' '}or{' '}
        <a href="mailto:ebethelchurch@gmail.com" style={{ color: '#1a5c34', fontWeight: 700, textDecoration: 'none' }}>
          ebethelchurch@gmail.com
        </a>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg
      style={{
        display: 'inline-block',
        width: '1.1rem',
        height: '1.1rem',
        verticalAlign: 'middle',
        animation: 'spin 0.8s linear infinite',
      }}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
      <path
        d="M12 2 A10 10 0 0 1 22 12"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
