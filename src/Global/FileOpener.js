import { NativeModules } from 'react-native';

const { FileOpener } = NativeModules;

if (!FileOpener) {
  throw new Error('FileOpener native module is not available. Make sure it is properly linked.');
}

export default FileOpener; 