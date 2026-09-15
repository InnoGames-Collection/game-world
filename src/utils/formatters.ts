/**
 * Formatting helpers for TelePlay Ethiopia
 */

export function formatCurrencyETB(amount: number): string {
  return new Intl.NumberFormat('en-ET', {
    style: 'currency',
    currency: 'ETB',
    maximumFractionDigits: 0,
  }).format(amount).replace('ETB', '').trim() + ' ETB';
}

export function formatNumberWithCommas(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

export function formatEthiopianPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('251')) {
    const local = cleaned.slice(3);
    if (local.length === 9) {
      return `+251 ${local.slice(0, 2)} ${local.slice(2, 5)} ${local.slice(5)}`;
    }
  } else if (cleaned.startsWith('09') || cleaned.startsWith('07')) {
    return `+251 ${cleaned.slice(1, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  return phone;
}

export function maskPhoneNumber(phone: string): string {
  if (!phone) return '0912*****678';
  let cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.startsWith('251')) {
    cleaned = '0' + cleaned.slice(3);
  }
  if (!cleaned.startsWith('0') && (cleaned.startsWith('9') || cleaned.startsWith('7'))) {
    cleaned = '0' + cleaned;
  }
  
  // Standard Ethiopian mobile number: 10 digits (e.g. 0912345678 or 0712345678)
  if (cleaned.length === 10) {
    const prefix = cleaned.slice(0, 4); // '0912'
    const suffix = cleaned.slice(-3);   // '678'
    return `${prefix}*****${suffix}`;
  } else if (cleaned.length > 7) {
    const prefix = cleaned.slice(0, 4);
    const suffix = cleaned.slice(-3);
    return `${prefix}*****${suffix}`;
  }
  
  return '0912*****678';
}

export function formatTimeRemaining(ms: number): string {
  if (ms <= 0) return '00:00';
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export function getRankBadgeColor(rank: number): { bg: string; text: string; border: string } {
  if (rank === 1) return { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/40' };
  if (rank === 2) return { bg: 'bg-slate-300/20', text: 'text-slate-200', border: 'border-slate-400/40' };
  if (rank === 3) return { bg: 'bg-amber-700/20', text: 'text-amber-500', border: 'border-amber-700/40' };
  return { bg: 'bg-slate-800/40', text: 'text-slate-400', border: 'border-slate-800' };
}
