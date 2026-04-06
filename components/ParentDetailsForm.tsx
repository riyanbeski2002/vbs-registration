'use client';

interface ParentDetailsFormProps {
  parentName: string;
  phone: string;
  secondaryPhone: string;
  email: string;
  firstTimeAttending: string;
  regularChurchMember: string;
  onParentNameChange: (v: string) => void;
  onPhoneChange: (v: string) => void;
  onSecondaryPhoneChange: (v: string) => void;
  onEmailChange: (v: string) => void;
  onFirstTimeAttendingChange: (v: string) => void;
  onRegularChurchMemberChange: (v: string) => void;
  errors: {
    parentName?: string;
    phone?: string;
    secondaryPhone?: string;
    email?: string;
    firstTimeAttending?: string;
    regularChurchMember?: string;
  };
}

export default function ParentDetailsForm({
  parentName, phone, secondaryPhone, email,
  firstTimeAttending, regularChurchMember,
  onParentNameChange, onPhoneChange, onSecondaryPhoneChange, onEmailChange,
  onFirstTimeAttendingChange, onRegularChurchMemberChange,
  errors,
}: ParentDetailsFormProps) {
  return (
    <div className="jungle-card">
      <h2 className="section-heading">
        <span>👨‍👩‍👧</span> Parent / Guardian Details
      </h2>

      {/* Parent Name */}
      <div style={{ marginBottom: '1.1rem' }}>
        <label htmlFor="parentName" className="jungle-label">
          Parent / Guardian Name <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <input
          id="parentName"
          type="text"
          className={`jungle-input${errors.parentName ? ' error' : ''}`}
          placeholder="Enter parent's full name"
          value={parentName}
          onChange={(e) => onParentNameChange(e.target.value)}
          autoComplete="name"
        />
        {errors.parentName && <p className="error-text">{errors.parentName}</p>}
      </div>

      {/* Phone row: primary + secondary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem', marginBottom: '1.1rem' }}>
        <div>
          <label htmlFor="phone" className="jungle-label">
            Primary Contact <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            id="phone"
            type="tel"
            className={`jungle-input${errors.phone ? ' error' : ''}`}
            placeholder="e.g. 9876543210"
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
            autoComplete="tel"
            inputMode="tel"
          />
          {errors.phone && <p className="error-text">{errors.phone}</p>}
        </div>
        <div>
          <label htmlFor="secondaryPhone" className="jungle-label">
            Secondary Contact <span className="optional-tag">(optional)</span>
          </label>
          <input
            id="secondaryPhone"
            type="tel"
            className={`jungle-input${errors.secondaryPhone ? ' error' : ''}`}
            placeholder="Alternate number"
            value={secondaryPhone}
            onChange={(e) => onSecondaryPhoneChange(e.target.value)}
            inputMode="tel"
          />
          {errors.secondaryPhone && <p className="error-text">{errors.secondaryPhone}</p>}
        </div>
      </div>

      {/* Email */}
      <div style={{ marginBottom: '1.25rem' }}>
        <label htmlFor="email" className="jungle-label">
          Email Address <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <input
          id="email"
          type="email"
          className={`jungle-input${errors.email ? ' error' : ''}`}
          placeholder="e.g. name@gmail.com"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          autoComplete="email"
          inputMode="email"
        />
        {errors.email && <p className="error-text">{errors.email}</p>}
      </div>

      {/* Divider */}
      <div style={{ height: '1px', background: 'rgba(200,168,75,0.25)', margin: '1.25rem 0' }} />

      {/* First time attending */}
      <div style={{ marginBottom: '1.1rem' }}>
        <label className="jungle-label">
          First time attending VBS? <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <div className="toggle-group">
          {['Yes', 'No'].map((opt) => (
            <button
              key={opt}
              type="button"
              className={`toggle-btn${firstTimeAttending === opt ? ' active' : ''}`}
              onClick={() => onFirstTimeAttendingChange(opt)}
            >
              {opt === 'Yes' ? '🌟 Yes' : '🔄 No, returning'}
            </button>
          ))}
        </div>
        {errors.firstTimeAttending && <p className="error-text">{errors.firstTimeAttending}</p>}
      </div>

      {/* Regular church member */}
      <div>
        <label className="jungle-label">
          Regular church member? <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <div className="toggle-group">
          {['Yes', 'No'].map((opt) => (
            <button
              key={opt}
              type="button"
              className={`toggle-btn${regularChurchMember === opt ? ' active' : ''}`}
              onClick={() => onRegularChurchMemberChange(opt)}
            >
              {opt === 'Yes' ? '⛪ Yes' : '👋 New visitor'}
            </button>
          ))}
        </div>
        {errors.regularChurchMember && <p className="error-text">{errors.regularChurchMember}</p>}
      </div>
    </div>
  );
}
