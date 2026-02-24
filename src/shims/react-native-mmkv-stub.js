// Web stub for react-native-mmkv
// Storage.web.js handles the actual replacement via platform extension files,
// but this stub prevents bundler errors for any direct imports.
export function createMMKV() {
  return {
    set: (key, value) => localStorage.setItem(key, value),
    getString: (key) => localStorage.getItem(key),
    delete: (key) => localStorage.removeItem(key),
    clearAll: () => localStorage.clear(),
    contains: (key) => localStorage.getItem(key) !== null,
  };
}
