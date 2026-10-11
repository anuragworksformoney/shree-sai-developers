export function validatePhone(phone: string): boolean {
  if (!phone) return false;
  const cleaned = phone.replace(/[\s\-\(\)\+]/g, '');
  // Matches 10-digit Indian numbers with optional country code 91
  return /^(?:91)?[6-9]\d{9}$/.test(cleaned);
}

export function validateEmail(email: string): boolean {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function validateName(name: string): boolean {
  if (!name) return false;
  return name.trim().length >= 2;
}
