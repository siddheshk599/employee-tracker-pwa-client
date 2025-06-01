import * as cryptoJs from 'crypto-js';
import SecureStorage from 'secure-web-storage';

export const secureStorage = new SecureStorage(localStorage, {
  hash: (key) => {
    key = cryptoJs.SHA256(key);
    return key.toString();
  },
  encrypt: (data) => {
    data = cryptoJs.AES.encrypt(data, "siddheshk599");
    data = data.toString();
    return data;
  },
  decrypt: (data) => {
    data = cryptoJs.AES.decrypt(data, "siddheshk599");
    data = data.toString(cryptoJs.enc.Utf8);
    return data;
  }
});