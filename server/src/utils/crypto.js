
import crypto from 'crypto';
import { promisify } from 'util';
import bcrypt from 'bcryptjs';

const randomBytes = promisify(crypto.randomBytes);

/**
 * Generate a random hexadecimal string
 * @param {number} length - Length of the random string in bytes
 * @returns {Promise<string>} Random hexadecimal string
 */
export const generateRandomHex = async (length = 32) => {
  const buffer = await randomBytes(Math.ceil(length / 2));
  return buffer.toString('hex').slice(0, length);
};

/**
 * Generate a secure random string for API keys
 * @returns {Promise<string>} Random base64url encoded string
 */
export const generateApiKey = async () => {
  const buffer = await randomBytes(32);
  return buffer.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
};

/**
 * Hash a password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
};

/**
 * Compare a plain text password with a hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} True if passwords match
 */
export const comparePasswords = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

/**
 * Generate a wallet address
 * @returns {Promise<string>} A new wallet address
 */
export const generateWalletAddress = async () => {
  // This is a simplified version - in a real app, you'd use a proper
  // cryptographic library to generate a proper blockchain address
  const prefix = '0x';
  const randomBytes = await generateRandomHex(40); // 40 hex chars = 20 bytes
  return prefix + randomBytes;
};

/**
 * Create a hash of some data
 * @param {string} data - Data to hash
 * @param {string} algorithm - Hash algorithm (default: sha256)
 * @returns {string} Hash string
 */
export const createHash = (data, algorithm = 'sha256') => {
  return crypto
    .createHash(algorithm)
    .update(data)
    .digest('hex');
};

/**
 * Create an HMAC signature
 * @param {string} data - Data to sign
 * @param {string} secret - Secret key
 * @param {string} algorithm - Hash algorithm (default: sha256)
 * @returns {string} HMAC signature
 */
export const createHmac = (data, secret, algorithm = 'sha256') => {
  return crypto
    .createHmac(algorithm, secret)
    .update(data)
    .digest('hex');
};

/**
 * Generate a random OTP (One Time Password)
 * @param {number} length - Length of OTP (default: 6)
 * @returns {string} Random numeric OTP
 */
export const generateOTP = (length = 6) => {
  const digits = '0123456789';
  let otp = '';
  
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  
  return otp;
};

export default {
  generateRandomHex,
  generateApiKey,
  hashPassword,
  comparePasswords,
  generateWalletAddress,
  createHash,
  createHmac,
  generateOTP
};
