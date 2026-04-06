import { APPS_SCRIPT_URL } from './config';
import { FormState } from './validation';

export async function submitRegistration(
  form: FormState,
  totalAmount: number
): Promise<{ submissionId: string }> {
  if (!APPS_SCRIPT_URL) {
    throw new Error('Apps Script URL is not configured');
  }

  const base64Content = await fileToBase64(form.paymentFile!);

  const payload = {
    parentName: form.parentName.trim(),
    phone: form.phone.trim(),
    secondaryPhone: form.secondaryPhone.trim(),
    email: form.email.trim(),
    firstTimeAttending: form.firstTimeAttending,
    regularChurchMember: form.regularChurchMember,
    kids: form.kids.map((k) => ({
      name: k.name.trim(),
      age: k.age.trim(),
      gender: k.gender,
      medicalCondition: k.medicalCondition.trim() || 'None',
      allergies: k.allergies.trim() || 'None',
    })),
    totalAmount,
    consentGeneral: form.consentGeneral,
    consentPicnic: form.consentPicnic,
    consentPhoto: form.consentPhoto,
    pickupAuthorization: form.pickupAuthorization.trim(),
    file: {
      filename: form.paymentFile!.name,
      mimeType: form.paymentFile!.type,
      base64Content,
    },
  };

  // IMPORTANT: Must use Content-Type: text/plain to avoid CORS preflight.
  // Apps Script doesn't respond to OPTIONS requests, so application/json breaks.
  const response = await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Server error: ${response.status}`);
  }

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error ?? 'Submission failed. Please try again.');
  }

  return { submissionId: data.submissionId };
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]); // strip data URI prefix
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}
