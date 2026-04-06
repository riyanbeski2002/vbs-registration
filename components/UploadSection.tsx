'use client';

import { useEffect, useRef, useState } from 'react';
import { ACCEPTED_FILE_EXTENSIONS, ACCEPTED_MIME_TYPES, MAX_FILE_SIZE_BYTES } from '@/lib/config';

interface UploadSectionProps {
  file: File | null;
  onChange: (file: File | null) => void;
  error?: string;
}

export default function UploadSection({ file, onChange, error }: UploadSectionProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Cleanup previous object URL to avoid memory leaks
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFile = (selected: File) => {
    setLocalError(null);

    if (selected.size > MAX_FILE_SIZE_BYTES) {
      setLocalError('File must be under 5 MB. Please compress and try again.');
      onChange(null);
      return;
    }

    if (!ACCEPTED_MIME_TYPES.includes(selected.type)) {
      setLocalError('Only JPEG, PNG, WebP, or PDF files are accepted.');
      onChange(null);
      return;
    }

    // Clean up previous URL
    if (previewUrl) URL.revokeObjectURL(previewUrl);

    if (selected.type.startsWith('image/')) {
      setPreviewUrl(URL.createObjectURL(selected));
    } else {
      setPreviewUrl(null);
    }

    onChange(selected);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) handleFile(selected);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const selected = e.dataTransfer.files?.[0];
    if (selected) handleFile(selected);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleRemove = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setLocalError(null);
    onChange(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const displayError = localError || error;

  return (
    <div className="jungle-card">
      <h2 className="section-heading">
        <span>📸</span> Upload Payment Screenshot
      </h2>

      <p style={{ color: '#4b5563', fontSize: '0.92rem', marginBottom: '1rem', fontWeight: 600 }}>
        After making the payment, upload a clear screenshot of the confirmation.{' '}
        <span style={{ color: '#6b7280' }}>(Max 5 MB — JPG, PNG, WebP, or PDF)</span>
      </p>

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => inputRef.current?.click()}
        style={{
          border: `2px dashed ${displayError ? '#ef4444' : '#2d7a4f'}`,
          borderRadius: '0.875rem',
          padding: '1.5rem',
          textAlign: 'center',
          cursor: 'pointer',
          background: displayError ? '#fef2f2' : '#f0fdf4',
          transition: 'background 0.2s',
          marginBottom: '0.5rem',
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        aria-label="Upload payment screenshot"
      >
        <input
          ref={inputRef}
          id="paymentFile"
          type="file"
          accept={ACCEPTED_FILE_EXTENSIONS}
          onChange={handleInputChange}
          style={{ display: 'none' }}
          aria-describedby={displayError ? 'upload-error' : undefined}
        />

        {file ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
            {previewUrl ? (
              // Image preview
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt="Payment screenshot preview"
                style={{
                  maxHeight: '180px',
                  maxWidth: '100%',
                  borderRadius: '0.5rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  objectFit: 'contain',
                }}
              />
            ) : (
              // PDF icon
              <div style={{ fontSize: '3rem' }}>📄</div>
            )}
            <p style={{ color: '#166534', fontWeight: 700, fontSize: '0.9rem' }}>
              ✓ {file.name}
            </p>
            <p style={{ color: '#4b5563', fontSize: '0.8rem' }}>
              {(file.size / 1024).toFixed(0)} KB — Click or tap to change
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.25rem' }}>📤</div>
            <p style={{ color: '#2d7a4f', fontWeight: 700, fontSize: '0.95rem' }}>
              Tap to upload or drag &amp; drop
            </p>
            <p style={{ color: '#6b7280', fontSize: '0.82rem' }}>
              JPG, PNG, WebP, PDF up to 5 MB
            </p>
          </div>
        )}
      </div>

      {/* Remove button */}
      {file && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); handleRemove(); }}
          className="jungle-btn-danger"
          style={{ marginTop: '0.5rem' }}
        >
          ✕ Remove file
        </button>
      )}

      {displayError && (
        <p id="upload-error" className="error-text">
          {displayError}
        </p>
      )}
    </div>
  );
}
