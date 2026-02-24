// Web implementation of Storage using localStorage
export class Storage {
  setItem(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  getItem(key, defaultValue = null) {
    try {
      const value = localStorage.getItem(key);
      return value !== null ? JSON.parse(value) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  removeItem(key) {
    localStorage.removeItem(key);
  }

  clearStorage() {
    localStorage.clear();
  }

  containsKey(key) {
    return localStorage.getItem(key) !== null;
  }

  getMMKVInstance() {
    return null;
  }
}

export default new Storage();
