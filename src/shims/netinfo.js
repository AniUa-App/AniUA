// Web stub for @react-native-community/netinfo
const NetInfo = {
  fetch: () => Promise.resolve({ isConnected: true, isInternetReachable: true, type: 'wifi' }),
  addEventListener: () => () => {},
  useNetInfo: () => ({ isConnected: true, isInternetReachable: true, type: 'wifi' }),
  configure: () => {},
};
export default NetInfo;
export const useNetInfo = () => ({ isConnected: true, isInternetReachable: true, type: 'wifi' });
