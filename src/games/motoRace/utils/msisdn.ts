/**
 * MSISDN Formatting & Masking for Moto Race Tournament
 * 
 * Strict Rule:
 * Show: First 5 digits & Last 2 digits
 * Mask: Middle 5 digits with '*****'
 * Example:
 * Actual MSISDN: 251911598830 -> Display: 25191*****30
 * 
 * Never expose the full MSISDN anywhere in visible UI.
 */

export function normalizeToMsisdn(rawPhone?: string): string {
  if (!rawPhone || !rawPhone.trim()) {
    return '251911598830';
  }
  const digits = rawPhone.replace(/\D/g, '');
  if (digits.startsWith('251') && digits.length >= 12) {
    return digits.slice(0, 12);
  }
  if (digits.startsWith('09') && digits.length === 10) {
    return '251' + digits.slice(1);
  }
  if (digits.startsWith('9') && digits.length === 9) {
    return '251' + digits;
  }
  if (digits.length >= 7) {
    return digits;
  }
  return '251911598830';
}

export function maskMsisdn(msisdnOrRawPhone?: string): string {
  const msisdn = normalizeToMsisdn(msisdnOrRawPhone);
  if (msisdn.length >= 7) {
    const first5 = msisdn.slice(0, 5);
    const last2 = msisdn.slice(-2);
    return `${first5}*****${last2}`;
  }
  return '25191*****30';
}
