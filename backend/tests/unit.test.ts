import { describe, it, expect } from 'vitest';
import { normalizeEthiopianPhone } from '../src/utils/msisdn.js';
import { computeHmacSha256, timingSafeEqual, generateRandomOtp } from '../src/utils/crypto.js';
import { signAccessToken, verifyAuthToken, signGameRoundToken, verifyGameRoundToken } from '../src/utils/jwt.js';

describe('MSISDN Normalization', () => {
  it('normalizes local 10-digit format (0911234567)', () => {
    const res = normalizeEthiopianPhone('0911234567');
    expect(res.isValid).toBe(true);
    expect(res.e164).toBe('+251911234567');
    expect(res.local).toBe('0911234567');
    expect(res.masked).toBe('0911*****567');
    expect(res.mnoMsisdn).toBe('251911234567');
  });

  it('normalizes Safaricom Ethiopia 07 format (0712345678)', () => {
    const res = normalizeEthiopianPhone('0712345678');
    expect(res.isValid).toBe(true);
    expect(res.e164).toBe('+251712345678');
    expect(res.local).toBe('0712345678');
    expect(res.masked).toBe('0712*****678');
  });

  it('normalizes E.164 with country code (+251912345678)', () => {
    const res = normalizeEthiopianPhone('+251912345678');
    expect(res.isValid).toBe(true);
    expect(res.e164).toBe('+251912345678');
    expect(res.local).toBe('0912345678');
  });

  it('handles invalid numbers gracefully', () => {
    const res = normalizeEthiopianPhone('12345');
    expect(res.isValid).toBe(false);
  });
});

describe('Crypto & Signatures', () => {
  it('generates consistent HMAC-SHA256 signature', () => {
    const data = '1724500000.{"event":"subscription"}';
    const secret = 'test-secret';
    const sig1 = computeHmacSha256(data, secret);
    const sig2 = computeHmacSha256(data, secret);
    expect(sig1).toBe(sig2);
    expect(timingSafeEqual(sig1, sig2)).toBe(true);
  });

  it('generates 6-digit random OTP', () => {
    const otp = generateRandomOtp(6);
    expect(otp).toHaveLength(6);
    expect(/^\d{6}$/.test(otp)).toBe(true);
  });
});

describe('JWT & Anti-Cheat Tokens', () => {
  it('signs and verifies auth tokens', () => {
    const payload = { userId: 'usr-123', phone: '+251911000000', role: 'admin' as const };
    const token = signAccessToken(payload);
    const decoded = verifyAuthToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.userId).toBe('usr-123');
    expect(decoded?.role).toBe('admin');
  });

  it('signs and verifies game round anti-cheat token', () => {
    const token = signGameRoundToken({ uid: 'usr-456', gid: 'candy-blast', jti: 'nonce-789' });
    const decoded = verifyGameRoundToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.uid).toBe('usr-456');
    expect(decoded?.gid).toBe('candy-blast');
    expect(decoded?.jti).toBe('nonce-789');
  });
});
