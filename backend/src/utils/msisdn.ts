/**
 * Ethiopian MSISDN normalization utility
 * Standardizes Ethiopian phone numbers across formats:
 * - 0911234567 -> +251911234567 (E.164)
 * - 0711234567 -> +251711234567 (E.164)
 * - +251911234567 / 251911234567
 */

export interface NormalizedPhone {
  isValid: boolean;
  e164: string;         // +251911234567
  local: string;        // 0911234567
  masked: string;       // 0911*****567
  mnoMsisdn: string;    // 251911234567 (used by Partner MT API)
}

export function normalizeEthiopianPhone(input: string): NormalizedPhone {
  if (!input) {
    return { isValid: false, e164: '', local: '', masked: '', mnoMsisdn: '' };
  }

  const digits = input.replace(/\D/g, '');

  let nationalNumber = '';

  // Format 2519xxxxxxxx or 2517xxxxxxxx (12 digits)
  if (digits.length === 12 && (digits.startsWith('2519') || digits.startsWith('2517'))) {
    nationalNumber = digits.slice(3); // 9xxxxxxxx or 7xxxxxxxx
  }
  // Format 09xxxxxxxx or 07xxxxxxxx (10 digits)
  else if (digits.length === 10 && (digits.startsWith('09') || digits.startsWith('07'))) {
    nationalNumber = digits.slice(1);
  }
  // Format 9xxxxxxxx or 7xxxxxxxx (9 digits)
  else if (digits.length === 9 && (digits.startsWith('9') || digits.startsWith('7'))) {
    nationalNumber = digits;
  }

  if (nationalNumber.length === 9) {
    const e164 = `+251${nationalNumber}`;
    const local = `0${nationalNumber}`;
    const mnoMsisdn = `251${nationalNumber}`;
    // Mask: 0911*****567
    const masked = `${local.slice(0, 4)}*****${local.slice(-3)}`;

    return {
      isValid: true,
      e164,
      local,
      masked,
      mnoMsisdn
    };
  }

  return {
    isValid: false,
    e164: input,
    local: input,
    masked: input,
    mnoMsisdn: digits
  };
}
