'use client';

import { useState, useRef, useEffect } from 'react';
import HeroSection from '@/components/HeroSection';
import ForestBackground from '@/components/ForestBackground';
import ParentDetailsForm from '@/components/ParentDetailsForm';
import KidsRepeater from '@/components/KidsRepeater';
import PaymentSection from '@/components/PaymentSection';
import UploadSection from '@/components/UploadSection';
import ConsentSection from '@/components/ConsentSection';
import SubmitSection, { SubmitStatus } from '@/components/SubmitSection';
import { FormState, FormErrors, validateForm, hasErrors } from '@/lib/validation';
import { submitRegistration } from '@/lib/api';
import { REGISTRATION_FEE_PER_CHILD } from '@/lib/config';

const initialState: FormState = {
  parentName: '',
  phone: '',
  secondaryPhone: '',
  email: '',
  kids: [{ id: crypto.randomUUID(), name: '', age: '', gender: '', medicalCondition: '', allergies: '' }],
  firstTimeAttending: '',
  regularChurchMember: '',
  paymentFile: null,
  consentGeneral: false,
  consentPicnic: false,
  consentPhoto: false,
  pickupAuthorization: '',
};

export default function RegistrationPage() {
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [submissionId, setSubmissionId] = useState('');
  const [submitError, setSubmitError] = useState('');
  const errorBannerRef = useRef<HTMLDivElement>(null);

  const totalAmount = form.kids.length * REGISTRATION_FEE_PER_CHILD;

  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('.forest-reveal-hidden');
    if (!els.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('forest-reveal-visible');
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '-50px' }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    const validationErrors = validateForm(form);
    if (hasErrors(validationErrors)) {
      setErrors(validationErrors);
      setTimeout(() => {
        errorBannerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
      return;
    }

    setErrors({});
    setStatus('submitting');

    try {
      const result = await submitRegistration(form, totalAmount);
      setSubmissionId(result.submissionId);
      setStatus('success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setStatus('error');
      setSubmitError(err instanceof Error ? err.message : 'Submission failed. Please try again.');
    }
  };

  if (status === 'success') {
    return <SuccessScreen submissionId={submissionId} totalAmount={totalAmount} />;
  }

  return (
    <div style={{ position: 'relative', zIndex: 1 }}>
      <ForestBackground />
      <HeroSection />

      {/* Forest form area label */}
      <div style={{ textAlign: 'center', padding: '0.5rem 1rem 0' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.65rem',
          color: 'rgba(200,248,220,0.55)',
          fontSize: '0.72rem',
          fontWeight: 800,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
        }}>
          <div style={{ width: '30px', height: '1px', background: 'rgba(100,220,140,0.35)' }} />
          🌿 Field Registration
          <div style={{ width: '30px', height: '1px', background: 'rgba(100,220,140,0.35)' }} />
        </div>
      </div>

      <div style={{ maxWidth: '660px', margin: '0 auto', padding: '1rem 1rem 4rem' }}>

        {hasErrors(errors) && (
          <div
            ref={errorBannerRef}
            role="alert"
            style={{
              background: 'rgba(255, 240, 240, 0.82)',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              border: '1px solid rgba(252,165,165,0.65)',
              borderTop: '1px solid rgba(255,200,200,0.85)',
              borderRadius: '0.75rem',
              padding: '0.875rem 1rem',
              marginBottom: '1rem',
              color: '#991b1b',
              fontWeight: 600,
              fontSize: '0.9rem',
              boxShadow: '0 8px 24px rgba(220,50,50,0.15)',
            }}
          >
            ⚠️ Please fix the errors below before submitting.
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="forest-reveal-hidden">
            <ParentDetailsForm
              parentName={form.parentName}
              phone={form.phone}
              secondaryPhone={form.secondaryPhone}
              email={form.email}
              firstTimeAttending={form.firstTimeAttending}
              regularChurchMember={form.regularChurchMember}
              onParentNameChange={(v) => setForm((f) => ({ ...f, parentName: v }))}
              onPhoneChange={(v) => setForm((f) => ({ ...f, phone: v }))}
              onSecondaryPhoneChange={(v) => setForm((f) => ({ ...f, secondaryPhone: v }))}
              onEmailChange={(v) => setForm((f) => ({ ...f, email: v }))}
              onFirstTimeAttendingChange={(v) => setForm((f) => ({ ...f, firstTimeAttending: v }))}
              onRegularChurchMemberChange={(v) => setForm((f) => ({ ...f, regularChurchMember: v }))}
              errors={{
                parentName: errors.parentName,
                phone: errors.phone,
                secondaryPhone: errors.secondaryPhone,
                email: errors.email,
                firstTimeAttending: errors.firstTimeAttending,
                regularChurchMember: errors.regularChurchMember,
              }}
            />
          </div>

          <div className="forest-reveal-hidden">
            <KidsRepeater
              kids={form.kids}
              onKidsChange={(kids) => setForm((f) => ({ ...f, kids }))}
              errors={errors.kids}
            />
          </div>

          <div className="forest-reveal-hidden">
            <PaymentSection numKids={form.kids.length} totalAmount={totalAmount} />
          </div>

          <div className="forest-reveal-hidden">
            <UploadSection
              file={form.paymentFile}
              onChange={(file) => setForm((f) => ({ ...f, paymentFile: file }))}
              error={errors.paymentFile}
            />
          </div>

          <div className="forest-reveal-hidden">
            <ConsentSection
              consentGeneral={form.consentGeneral}
              consentPicnic={form.consentPicnic}
              consentPhoto={form.consentPhoto}
              pickupAuthorization={form.pickupAuthorization}
              onConsentGeneralChange={(v) => setForm((f) => ({ ...f, consentGeneral: v }))}
              onConsentPicnicChange={(v) => setForm((f) => ({ ...f, consentPicnic: v }))}
              onConsentPhotoChange={(v) => setForm((f) => ({ ...f, consentPhoto: v }))}
              onPickupAuthorizationChange={(v) => setForm((f) => ({ ...f, pickupAuthorization: v }))}
              errors={{
                consentGeneral: errors.consentGeneral,
                consentPicnic: errors.consentPicnic,
                consentPhoto: errors.consentPhoto,
                pickupAuthorization: errors.pickupAuthorization,
              }}
            />
          </div>

          <div className="forest-reveal-hidden">
            <SubmitSection status={status} errorMessage={submitError} />
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Success Screen ───────────────────────────────────────────────

function SuccessScreen({ submissionId, totalAmount }: { submissionId: string; totalAmount: number }) {
  return (
    <div style={{ position: 'relative', zIndex: 1 }}>
      <ForestBackground />
      <HeroSection />
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem 1rem 4rem' }}>
        <div style={{
          background: [
            'radial-gradient(circle at 8% 10%, rgba(255,255,255,0.52) 0%, transparent 18%)',
            'radial-gradient(circle at 88% 8%, rgba(255,255,255,0.42) 0%, transparent 16%)',
            'radial-gradient(circle at 45% 92%, rgba(255,255,255,0.36) 0%, transparent 18%)',
            'rgba(238, 252, 242, 0.78)',
          ].join(', '),
          backdropFilter: 'blur(22px) saturate(150%)',
          WebkitBackdropFilter: 'blur(22px) saturate(150%)',
          borderRadius: '1.25rem',
          boxShadow: '0 28px 72px rgba(0,18,4,0.52), 0 8px 24px rgba(0,12,3,0.3), inset 0 1px 0 rgba(255,255,255,0.75)',
          border: '1px solid rgba(255,255,255,0.62)',
          borderTop: '1px solid rgba(255,255,255,0.82)',
          padding: '2.5rem 1.75rem',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Glass top edge highlight */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
            background: 'linear-gradient(90deg, rgba(60,180,100,0.5), rgba(200,168,75,0.8), rgba(60,180,100,0.5))',
          }} />

          <div style={{ fontSize: '4rem', marginBottom: '0.875rem' }}>🎉</div>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.85rem',
            color: '#0f2d1a',
            marginBottom: '0.75rem',
            fontWeight: 600,
          }}>
            Registration Submitted!
          </h2>
          <p style={{ color: '#374151', fontSize: '1rem', lineHeight: 1.7, marginBottom: '1.5rem', fontWeight: 600 }}>
            Thank you! Your VBS registration has been submitted successfully.
            <br />We will confirm your spot shortly. 🌿
          </p>

          <div style={{
            background: 'rgba(255,255,255,0.35)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid rgba(200,168,75,0.45)',
            borderTop: '1px solid rgba(255,255,255,0.7)',
            borderRadius: '0.75rem',
            padding: '1rem 1.25rem',
            marginBottom: '1.25rem',
            textAlign: 'left',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: '#7a4f1d', fontWeight: 600, fontSize: '0.9rem' }}>Reference ID</span>
              <span style={{ color: '#0f2d1a', fontWeight: 800, fontFamily: 'monospace', fontSize: '0.95rem' }}>{submissionId}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#7a4f1d', fontWeight: 600, fontSize: '0.9rem' }}>Amount Paid</span>
              <span style={{ color: '#0f2d1a', fontWeight: 800, fontFamily: 'var(--font-display)' }}>₹{totalAmount}</span>
            </div>
          </div>

          <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>
            📱 Save your reference ID for your records. Contact us if you have any questions.
          </p>

          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
            {['🌿', '🦁', '🌴', '🦒', '🐘', '🌿'].map((e, i) => (
              <span key={i} style={{ fontSize: '1.4rem' }}>{e}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
