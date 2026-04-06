'use client';

interface ConsentSectionProps {
  consentGeneral: boolean;
  consentPicnic: boolean;
  consentPhoto: boolean;
  pickupAuthorization: string;
  onConsentGeneralChange: (v: boolean) => void;
  onConsentPicnicChange: (v: boolean) => void;
  onConsentPhotoChange: (v: boolean) => void;
  onPickupAuthorizationChange: (v: string) => void;
  errors: {
    consentGeneral?: string;
    consentPicnic?: string;
    consentPhoto?: string;
    pickupAuthorization?: string;
  };
}

export default function ConsentSection({
  consentGeneral, consentPicnic, consentPhoto, pickupAuthorization,
  onConsentGeneralChange, onConsentPicnicChange, onConsentPhotoChange,
  onPickupAuthorizationChange,
  errors,
}: ConsentSectionProps) {
  const consents = [
    {
      id: 'consentGeneral',
      checked: consentGeneral,
      onChange: onConsentGeneralChange,
      icon: '✅',
      text: 'I confirm that the information given above is correct and I give consent for my child/children to attend VBS.',
      error: errors.consentGeneral,
    },
    {
      id: 'consentPicnic',
      checked: consentPicnic,
      onChange: onConsentPicnicChange,
      icon: '🧺',
      text: 'I give permission for my child/children to participate in the Day 5 outdoor picnic activity.',
      error: errors.consentPicnic,
    },
    {
      id: 'consentPhoto',
      checked: consentPhoto,
      onChange: onConsentPhotoChange,
      icon: '📸',
      text: 'I consent to photos and videos of my child being taken during VBS and used for church social media and communications.',
      error: errors.consentPhoto,
    },
  ];

  return (
    <div className="jungle-card">
      <h2 className="section-heading">
        <span>📋</span> Consent &amp; Authorization
      </h2>

      {/* Consent checkboxes */}
      {consents.map(({ id, checked, onChange, icon, text, error }) => (
        <div key={id}>
          <label
            htmlFor={id}
            className={`consent-row${error ? ' error-row' : ''}`}
            style={{ cursor: 'pointer' }}
          >
            <input
              id={id}
              type="checkbox"
              className="consent-checkbox"
              checked={checked}
              onChange={(e) => onChange(e.target.checked)}
            />
            <span style={{ color: '#374151', fontSize: '0.92rem', lineHeight: 1.65, fontWeight: 600 }}>
              <span style={{ marginRight: '0.35rem' }}>{icon}</span>
              {text}
            </span>
          </label>
          {error && <p className="error-text" style={{ marginBottom: '0.5rem', paddingLeft: '0.25rem' }}>{error}</p>}
        </div>
      ))}

      {/* Divider */}
      <div style={{ height: '1px', background: 'rgba(200,168,75,0.3)', margin: '1.1rem 0' }} />

      {/* Pickup authorization */}
      <div>
        <label htmlFor="pickupAuthorization" className="jungle-label">
          🚗 Pickup Authorization <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <p style={{ color: '#6b7280', fontSize: '0.82rem', marginBottom: '0.5rem', fontWeight: 600 }}>
          List the names of all people authorized to pick up your child.
        </p>
        <textarea
          id="pickupAuthorization"
          className={`jungle-textarea${errors.pickupAuthorization ? ' error' : ''}`}
          placeholder="e.g. John Samuel, Mary John, David Thomas"
          value={pickupAuthorization}
          onChange={(e) => onPickupAuthorizationChange(e.target.value)}
          rows={2}
        />
        {errors.pickupAuthorization && (
          <p className="error-text">{errors.pickupAuthorization}</p>
        )}
      </div>
    </div>
  );
}
