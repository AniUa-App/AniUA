import {MMKV} from 'react-native-mmkv';

export class Storage {
  constructor() {
    this.storage = new MMKV();
  }

  setItem(key, value) {
    this.storage.set(key, JSON.stringify(value));
  }

  getItem(key, defaultValue = null) {
    const value = this.storage.getString(key);
    return value ? JSON.parse(value) : defaultValue;
  }

  removeItem(key) {
    this.storage.delete(key);
  }

  clearStorage() {
    this.storage.clearAll();
  }

  containsKey(key) {
    return this.storage.contains(key);
  }

  getMMKVInstance() {
    return this.storage;
  }
}

export default new Storage();
