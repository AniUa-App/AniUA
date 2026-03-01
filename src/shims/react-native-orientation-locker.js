// Web stub for react-native-orientation-locker
const Orientation = {
  lockToPortrait: () => {},
  lockToLandscape: () => {},
  lockToLandscapeLeft: () => {},
  lockToLandscapeRight: () => {},
  unlockAllOrientations: () => {},
  getOrientation: (cb) => cb(null, 'PORTRAIT'),
  getDeviceOrientation: (cb) => cb(null, 'PORTRAIT'),
  addOrientationListener: () => {},
  removeOrientationListener: () => {},
  addDeviceOrientationListener: () => {},
  removeDeviceOrientationListener: () => {},
  getInitialOrientation: () => 'PORTRAIT',
};
export default Orientation;
