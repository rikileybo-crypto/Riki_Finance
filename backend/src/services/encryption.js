import CryptoJS from 'crypto-js';

const KEY = process.env.ENCRYPTION_KEY;

export function encrypt(text) {
  return CryptoJS.AES.encrypt(text, KEY).toString();
}

export function decrypt(ciphertext) {
  const bytes = CryptoJS.AES.decrypt(ciphertext, KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}
