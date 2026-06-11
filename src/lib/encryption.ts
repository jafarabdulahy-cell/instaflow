import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.TOKEN_ENCRYPTION_KEY || '';
const IV_LENGTH = 16;
const ALGORITHM = 'aes-256-cbc';

/**
 * Encrypts a text string using AES-256-CBC
 */
export function encrypt(text: string): string {
  if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 64) {
    // در Development اگر کلید نباشد، متن را بدون رمزگذاری برمی‌گردانیم
    // در Production باید حتماً کلید باشد
    if (process.env.NODE_ENV === 'production') {
      throw new Error('TOKEN_ENCRYPTION_KEY must be set in production');
    }
    return text;
  }

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY, 'hex'),
    iv
  );
  
  const encrypted = Buffer.concat([
    cipher.update(text, 'utf8'),
    cipher.final(),
  ]);
  
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

/**
 * Decrypts an encrypted text string
 */
export function decrypt(text: string): string {
  if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 64) {
    // در Development اگر کلید نباشد، متن را بدون رمزگشایی برمی‌گردانیم
    if (process.env.NODE_ENV === 'production') {
      throw new Error('TOKEN_ENCRYPTION_KEY must be set in production');
    }
    return text;
  }

  // اگر متن شامل ':' نباشد، یعنی رمزگذاری نشده است
  if (!text.includes(':')) {
    return text;
  }

  const parts = text.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = Buffer.from(parts[1], 'hex');
  
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY, 'hex'),
    iv
  );
  
  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);
  
  return decrypted.toString('utf8');
}

/**
 * Generates a random encryption key (32 bytes = 64 hex characters)
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Generates a random state for OAuth CSRF protection
 */
export function generateOAuthState(): string {
  return crypto.randomBytes(32).toString('hex');
}
