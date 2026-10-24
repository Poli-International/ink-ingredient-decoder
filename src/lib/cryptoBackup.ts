// Client-side Web Crypto helper for encrypting / decrypting studio backups with a password
// Uses PBKDF2 (100,000 iterations) + AES-GCM (256-bit). 100% offline, native browser API.

export interface EncryptedBackupPayload {
  version: 1;
  encrypted: true;
  saltHex: string;
  ivHex: string;
  cipherTextBase64: string;
  timestamp: string;
}

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBuffer(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptBackupData(
  plainObject: unknown,
  passphrase: string
): Promise<EncryptedBackupPayload> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt);

  const enc = new TextEncoder();
  const plainText = JSON.stringify(plainObject);
  const cipherBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    enc.encode(plainText)
  );

  return {
    version: 1,
    encrypted: true,
    saltHex: bufferToHex(salt.buffer),
    ivHex: bufferToHex(iv.buffer),
    cipherTextBase64: arrayBufferToBase64(cipherBuffer),
    timestamp: new Date().toISOString(),
  };
}

export async function decryptBackupData(
  payload: EncryptedBackupPayload,
  passphrase: string
): Promise<unknown> {
  const salt = hexToBuffer(payload.saltHex);
  const iv = hexToBuffer(payload.ivHex);
  const key = await deriveKey(passphrase, salt);

  const cipherBuffer = base64ToArrayBuffer(payload.cipherTextBase64);
  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv as BufferSource },
    key,
    cipherBuffer
  );

  const dec = new TextDecoder();
  const plainText = dec.decode(decryptedBuffer);
  return JSON.parse(plainText);
}

// Convenient string helpers for modal export/import
export async function encryptBackup(plainObject: unknown, passphrase: string): Promise<string> {
  const payload = await encryptBackupData(plainObject, passphrase);
  return JSON.stringify(payload, null, 2);
}

export async function decryptBackup(jsonOrPayload: string | EncryptedBackupPayload, passphrase: string): Promise<any> {
  const payload: EncryptedBackupPayload =
    typeof jsonOrPayload === 'string' ? JSON.parse(jsonOrPayload) : jsonOrPayload;
  return decryptBackupData(payload, passphrase);
}
