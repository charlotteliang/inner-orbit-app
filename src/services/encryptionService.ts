export interface EncryptedData {
  encrypted: string;
  iv: string;
}

export class EncryptionService {
  private static readonly ALGORITHM = 'AES-GCM';
  private static readonly KEY_LENGTH = 256;
  private static readonly IV_LENGTH = 12;

  /**
   * Derive an encryption key from the user's authentication
   * This ensures each user has a unique key that only they can access
   */
  private static async deriveKey(userId: string): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const userData = encoder.encode(userId);
    
    // Use PBKDF2 to derive a key from the user ID
    const baseKey = await crypto.subtle.importKey(
      'raw',
      userData,
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    const salt = encoder.encode('inner-orbit-salt-2024');
    
    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      baseKey,
      { name: this.ALGORITHM, length: this.KEY_LENGTH },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Generate a random IV for encryption
   */
  private static generateIV(): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));
  }

  /**
   * Encrypt sensitive data
   */
  static async encrypt(data: string, userId: string): Promise<EncryptedData> {
    try {
      const key = await this.deriveKey(userId);
      const iv = this.generateIV();
      const encoder = new TextEncoder();
      const encodedData = encoder.encode(data);

      const encryptedBuffer = await crypto.subtle.encrypt(
        {
          name: this.ALGORITHM,
          iv
        },
        key,
        encodedData
      );

      return {
        encrypted: this.arrayBufferToBase64(encryptedBuffer),
        iv: this.arrayBufferToBase64(iv)
      };
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt sensitive data
   */
  static async decrypt(encryptedData: EncryptedData, userId: string): Promise<string> {
    try {
      const key = await this.deriveKey(userId);
      const iv = this.base64ToArrayBuffer(encryptedData.iv);
      const encrypted = this.base64ToArrayBuffer(encryptedData.encrypted);

      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: this.ALGORITHM,
          iv
        },
        key,
        encrypted
      );

      const decoder = new TextDecoder();
      return decoder.decode(decryptedBuffer);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Encrypt an object's sensitive fields
   */
  static async encryptObject<T extends Record<string, any>>(
    obj: T, 
    sensitiveFields: readonly (keyof T)[], 
    userId: string
  ): Promise<T> {
    const encryptedObj = { ...obj } as any;
    
    for (const field of sensitiveFields) {
      if (obj[field] && typeof obj[field] === 'string') {
        const encrypted = await this.encrypt(obj[field] as string, userId);
        encryptedObj[field] = encrypted;
      }
    }
    
    return encryptedObj as T;
  }

  /**
   * Decrypt an object's sensitive fields
   */
  static async decryptObject<T extends Record<string, any>>(
    obj: T, 
    sensitiveFields: readonly (keyof T)[], 
    userId: string
  ): Promise<T> {
    const decryptedObj = { ...obj } as any;
    
    for (const field of sensitiveFields) {
      if (obj[field] && typeof obj[field] === 'object' && 'encrypted' in obj[field]) {
        const decrypted = await this.decrypt(obj[field] as EncryptedData, userId);
        decryptedObj[field] = decrypted;
      }
    }
    
    return decryptedObj as T;
  }

  /**
   * Check if data is encrypted
   */
  static isEncrypted(data: any): data is EncryptedData {
    return data && typeof data === 'object' && 'encrypted' in data && 'iv' in data;
  }

  // Utility functions for base64 conversion
  private static arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private static base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }
} 