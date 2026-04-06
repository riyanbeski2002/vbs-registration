'use client';

import { REGISTRATION_FEE_PER_CHILD } from '@/lib/config';
import { KidEntry } from '@/lib/validation';

interface KidErrors {
  name?: string;
  age?: string;
  gender?: string;
}

interface KidsRepeaterProps {
  kids: KidEntry[];
  onKidsChange: (kids: KidEntry[]) => void;
  errors?: KidErrors[];
}

const GENDERS = ['Male', 'Female'] as const;
const GENDER_STYLE: Record<string, string> = {
  Male: 'active-male',
  Female: 'active-female',
};

export default function KidsRepeater({ kids, onKidsChange, errors }: KidsRepeaterProps) {
  const addKid = () => {
    onKidsChange([
      ...kids,
      { id: crypto.randomUUID(), name: '', age: '', gender: '', medicalCondition: '', allergies: '' },
    ]);
  };

  const removeKid = (id: string) => onKidsChange(kids.filter((k) => k.id !== id));

  const updateKid = (id: string, field: keyof KidEntry, value: string) =>
    onKidsChange(kids.map((k) => (k.id === id ? { ...k, [field]: value } : k)));

  const total = kids.length * REGISTRATION_FEE_PER_CHILD;

  return (
    <div className="jungle-card">
      <h2 className="section-heading">
        <span>🧒</span> Child Details
      </h2>

      {/* Fee summary */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(200,168,75,0.12), rgba(200,168,75,0.06))',
          border: '1.5px solid rgba(200,168,75,0.4)',
          borderRadius: '0.75rem',
          padding: '0.75rem 1rem',
          marginBottom: '1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <span style={{ fontSize: '0.88rem', color: '#7a4f1d', fontWeight: 700 }}>
          ₹{REGISTRATION_FEE_PER_CHILD} per child
        </span>
        <span style={{ fontSize: '0.88rem', color: '#7a4f1d' }}>
          {kids.length} child{kids.length !== 1 ? 'ren' : ''} →{' '}
          <strong style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: '#0f2d1a' }}>
            ₹{total}
          </strong>
        </span>
      </div>

      {kids.map((kid, index) => {
        const kidErr = errors?.[index] ?? {};
        return (
          <div key={kid.id} className="kid-card">
            {/* Kid header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.95rem',
                color: '#1e6b3c',
                fontWeight: 600,
              }}>
                🌿 Child {index + 1}
              </span>
              {kids.length > 1 && (
                <button type="button" className="jungle-btn-danger" onClick={() => removeKid(kid.id)}>
                  ✕ Remove
                </button>
              )}
            </div>

            {/* Name + Age row */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem', marginBottom: '0.875rem' }}>
              <div>
                <label htmlFor={`kid-name-${kid.id}`} className="jungle-label">
                  Full Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  id={`kid-name-${kid.id}`}
                  type="text"
                  className={`jungle-input${kidErr.name ? ' error' : ''}`}
                  placeholder={`Child ${index + 1}'s name`}
                  value={kid.name}
                  onChange={(e) => updateKid(kid.id, 'name', e.target.value)}
                />
                {kidErr.name && <p className="error-text">{kidErr.name}</p>}
              </div>
              <div>
                <label htmlFor={`kid-age-${kid.id}`} className="jungle-label">
                  Age <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  id={`kid-age-${kid.id}`}
                  type="number"
                  min="1"
                  max="18"
                  className={`jungle-input${kidErr.age ? ' error' : ''}`}
                  placeholder="e.g. 7"
                  value={kid.age}
                  onChange={(e) => updateKid(kid.id, 'age', e.target.value)}
                  inputMode="numeric"
                />
                {kidErr.age && <p className="error-text">{kidErr.age}</p>}
              </div>
            </div>

            {/* Gender */}
            <div style={{ marginBottom: '0.875rem' }}>
              <label className="jungle-label">
                Gender <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div className="toggle-group">
                {GENDERS.map((g) => (
                  <button
                    key={g}
                    type="button"
                    className={`toggle-btn${kid.gender === g ? ` ${GENDER_STYLE[g]}` : ''}`}
                    onClick={() => updateKid(kid.id, 'gender', g)}
                  >
                    {g === 'Male' ? '👦 Male' : '👧 Female'}
                  </button>
                ))}
              </div>
              {kidErr.gender && <p className="error-text">{kidErr.gender}</p>}
            </div>

            {/* Medical + Allergies row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label htmlFor={`kid-medical-${kid.id}`} className="jungle-label">
                  Medical Conditions <span className="optional-tag">(optional)</span>
                </label>
                <textarea
                  id={`kid-medical-${kid.id}`}
                  className="jungle-textarea"
                  placeholder="Any conditions we should know about? Leave blank if none."
                  value={kid.medicalCondition}
                  onChange={(e) => updateKid(kid.id, 'medicalCondition', e.target.value)}
                  rows={2}
                />
              </div>
              <div>
                <label htmlFor={`kid-allergies-${kid.id}`} className="jungle-label">
                  Allergies <span className="optional-tag">(optional)</span>
                </label>
                <textarea
                  id={`kid-allergies-${kid.id}`}
                  className="jungle-textarea"
                  placeholder="Any allergies? Leave blank if none."
                  value={kid.allergies}
                  onChange={(e) => updateKid(kid.id, 'allergies', e.target.value)}
                  rows={2}
                />
              </div>
            </div>
          </div>
        );
      })}

      <button
        type="button"
        className="jungle-btn-secondary"
        onClick={addKid}
        style={{ marginTop: '0.25rem' }}
      >
        + Add Another Child
      </button>
    </div>
  );
}
