import { ACCEPTED_MIME_TYPES, MAX_FILE_SIZE_BYTES } from './config';

export type KidEntry = {
  id: string;
  name: string;
  age: string;
  gender: string;
  medicalCondition: string;
  allergies: string;
};

export type FormState = {
  parentName: string;
  phone: string;
  secondaryPhone: string;
  email: string;
  kids: KidEntry[];
  firstTimeAttending: string;
  regularChurchMember: string;
  paymentFile: File | null;
  consentGeneral: boolean;
  consentPicnic: boolean;
  consentPhoto: boolean;
  pickupAuthorization: string;
};

export type FormErrors = {
  parentName?: string;
  phone?: string;
  secondaryPhone?: string;
  email?: string;
  kids?: { name?: string; age?: string; gender?: string }[];
  firstTimeAttending?: string;
  regularChurchMember?: string;
  paymentFile?: string;
  consentGeneral?: string;
  consentPicnic?: string;
  consentPhoto?: string;
  pickupAuthorization?: string;
};

const INDIAN_PHONE_REGEX = /^(\+91[\-\s]?)?[6-9]\d{9}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateForm(form: FormState): FormErrors {
  const errors: FormErrors = {};

  if (!form.parentName.trim()) {
    errors.parentName = 'Parent name is required';
  }

  if (!INDIAN_PHONE_REGEX.test(form.phone.trim())) {
    errors.phone = 'Enter a valid 10-digit Indian mobile number (e.g. 9876543210)';
  }

  if (form.secondaryPhone.trim() && !INDIAN_PHONE_REGEX.test(form.secondaryPhone.trim())) {
    errors.secondaryPhone = 'Enter a valid 10-digit Indian mobile number';
  }

  if (!form.email.trim()) {
    errors.email = 'Email address is required';
  } else if (!EMAIL_REGEX.test(form.email.trim())) {
    errors.email = 'Enter a valid email address (e.g. name@gmail.com)';
  }

  const kidErrors = form.kids.map((k) => {
    const e: { name?: string; age?: string; gender?: string } = {};
    if (!k.name.trim()) e.name = 'Child name is required';
    if (!k.age.trim()) e.age = 'Child age is required';
    if (!k.gender) e.gender = 'Please select a gender';
    return e;
  });
  if (kidErrors.some((e) => Object.keys(e).length > 0)) {
    errors.kids = kidErrors;
  }

  if (!form.firstTimeAttending) {
    errors.firstTimeAttending = 'Please select an option';
  }

  if (!form.regularChurchMember) {
    errors.regularChurchMember = 'Please select an option';
  }

  if (form.paymentFile) {
    if (form.paymentFile.size > MAX_FILE_SIZE_BYTES) {
      errors.paymentFile = 'File must be under 5 MB';
    } else if (!ACCEPTED_MIME_TYPES.includes(form.paymentFile.type)) {
      errors.paymentFile = 'Only JPEG, PNG, WebP, or PDF files are allowed';
    }
  }

  if (!form.consentGeneral) {
    errors.consentGeneral = 'You must confirm consent before submitting';
  }

  if (!form.consentPicnic) {
    errors.consentPicnic = 'Please confirm consent for the Day 5 picnic';
  }

  if (!form.consentPhoto) {
    errors.consentPhoto = 'Please confirm photo/video consent';
  }

  if (!form.pickupAuthorization.trim() || form.pickupAuthorization.trim().length < 3) {
    errors.pickupAuthorization = 'Please specify who is authorized to pick up your child';
  }

  return errors;
}

export function hasErrors(errors: FormErrors): boolean {
  return Object.keys(errors).length > 0;
}
