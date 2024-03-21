import { Injectable } from '@angular/core';
import { environment } from '@environment/environment';
import * as CryptoJS from 'crypto-js';

const ENCRYPT_SECRET_KEY = environment.encryptedKey;

@Injectable({
  providedIn: 'root'
})
export class CryptoService {
  encryptValue(value: string): string {
    const cipherText = CryptoJS.AES.encrypt(value, ENCRYPT_SECRET_KEY);
    return cipherText.toString();
  }

  decryptValue(encryptedString: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedString, ENCRYPT_SECRET_KEY);
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
    return decryptedData;
  }
}
