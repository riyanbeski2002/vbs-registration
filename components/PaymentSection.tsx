import { REGISTRATION_FEE_PER_CHILD } from '@/lib/config';

const QR_CODE_SRC = '/qr.png';

interface PaymentSectionProps {
  numKids: number;
  totalAmount: number;
}

export default function PaymentSection({ numKids, totalAmount }: PaymentSectionProps) {
  return (
    <div className="jungle-card">
      <h2 className="section-heading">
        <span>💳</span> Registration Fee &amp; Payment
      </h2>

      {/* Fee breakdown */}
      <div
        style={{
          background: 'linear-gradient(135deg, #fefce8, #fef9c3)',
          border: '1.5px solid #fde047',
          borderRadius: '0.75rem',
          padding: '1rem 1.25rem',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
          <span style={{ color: '#713f12', fontWeight: 600 }}>Fee per child</span>
          <span style={{ color: '#713f12', fontWeight: 700 }}>₹{REGISTRATION_FEE_PER_CHILD}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
          <span style={{ color: '#713f12', fontWeight: 600 }}>Number of children</span>
          <span style={{ color: '#713f12', fontWeight: 700 }}>{numKids}</span>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            borderTop: '1.5px solid #fde047',
            paddingTop: '0.5rem',
            marginTop: '0.4rem',
          }}
        >
          <span style={{ color: '#78350f', fontWeight: 800, fontSize: '1.05rem' }}>Total Amount</span>
          <span
            style={{
              color: '#78350f',
              fontWeight: 800,
              fontSize: '1.25rem',
              fontFamily: 'var(--font-display)',
            }}
          >
            ₹{totalAmount}
          </span>
        </div>
      </div>

      {/* Payment instruction */}
      <p
        style={{
          color: '#374151',
          fontSize: '0.95rem',
          marginBottom: '1.25rem',
          lineHeight: 1.65,
          fontWeight: 600,
        }}
      >
        Please make the payment using the QR code below and upload the screenshot of the
        payment confirmation.
      </p>

      {/* QR code */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        <div
          style={{
            padding: '1rem',
            background: 'white',
            border: '3px solid #2d7a4f',
            borderRadius: '1rem',
            boxShadow: '0 4px 14px rgba(45,122,79,0.18)',
            display: 'inline-block',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={QR_CODE_SRC}
            alt="UPI Payment QR Code"
            width={200}
            height={200}
            style={{ display: 'block' }}
          />
        </div>

        <div
          style={{
            background: '#f0fdf4',
            border: '1px solid #86efac',
            borderRadius: '0.5rem',
            padding: '0.5rem 1rem',
            fontSize: '0.88rem',
            color: '#166534',
            fontWeight: 700,
            textAlign: 'center',
          }}
        >
          Scan QR to pay via any UPI app
          <br />
          <span style={{ fontWeight: 600, fontSize: '0.82rem', opacity: 0.8 }}>
            (PhonePe, GPay, Paytm, BHIM, etc.)
          </span>
        </div>
      </div>
    </div>
  );
}
