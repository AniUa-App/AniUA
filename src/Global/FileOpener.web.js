// Web stub — FileOpener is not available on web
export default {
  openFile: () => Promise.reject(new Error('FileOpener is not available on web')),
  installAPK: () => Promise.reject(new Error('FileOpener is not available on web')),
};
