export const REGISTRATION_FEE_PER_CHILD = 500; // rupees — change this to update fee everywhere

export const APPS_SCRIPT_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL ?? '';

export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export const ACCEPTED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
];

export const ACCEPTED_FILE_EXTENSIONS = '.jpg,.jpeg,.png,.webp,.pdf';
