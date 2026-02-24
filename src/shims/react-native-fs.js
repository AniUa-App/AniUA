// Web stub for react-native-fs
const RNFS = {
  DocumentDirectoryPath: '',
  DownloadDirectoryPath: '',
  ExternalStorageDirectoryPath: '',
  getFSInfo: async () => ({ freeSpace: 0, totalSpace: 0 }),
  exists: async () => false,
  mkdir: async () => {},
  writeFile: async () => {},
  unlink: async () => {},
  readDir: async () => [],
  readFile: async () => '',
  downloadFile: () => ({ promise: Promise.resolve({ statusCode: 200 }) }),
  stopDownload: () => {},
};
export default RNFS;
