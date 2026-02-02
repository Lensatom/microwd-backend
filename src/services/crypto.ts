import crypto from 'crypto';
import { CRYPTO_SECRET } from '../config/env';


export const encodeWithCrypto = (data: string, ttlSeconds?: number): string => {
  if (!CRYPTO_SECRET) {
    throw new Error('CRYPTO_SECRET is not defined in environment variables');
  }
  const key = crypto.createHash('sha256').update(CRYPTO_SECRET!).digest();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const nowMs = Date.now();
  const payload = ttlSeconds && ttlSeconds > 0
    ? JSON.stringify({ d: data, exp: nowMs + ttlSeconds * 1000 })
    : data;
  const ciphertext = Buffer.concat([cipher.update(payload, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  const ivB64 = iv.toString('base64');
  const ctB64 = ciphertext.toString('base64');
  const tagB64 = tag.toString('base64');
  return `${ivB64}:${ctB64}:${tagB64}`;
};

export const decodeWithCrypto = (encryptedData: string): {isValid: boolean, decoded: string} => {
  if (!CRYPTO_SECRET) {
    throw new Error('CRYPTO_SECRET is not defined in environment variables');
  }
  const [ivB64, ctB64, tagB64] = encryptedData.split(':');
  if (!ivB64 || !ctB64 || !tagB64) {
    throw new Error('Invalid encrypted payload format');
  }
  const iv = Buffer.from(ivB64, 'base64');
  const ciphertext = Buffer.from(ctB64, 'base64');
  const tag = Buffer.from(tagB64, 'base64');

  const key = crypto.createHash('sha256').update(CRYPTO_SECRET!).digest();
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  const text = decrypted.toString('utf8');
  
  try {
    const obj = JSON.parse(text);
    if (obj && typeof obj === 'object' && 'd' in obj) {
      if (typeof obj.exp === 'number' && Date.now() > obj.exp) {
        throw new Error('Encrypted payload expired');
      }
      return {isValid: true, decoded: String(obj.d)};
    }
    return {isValid: true, decoded: text};
  } catch {
    return {isValid: false, decoded: text};
  }
};