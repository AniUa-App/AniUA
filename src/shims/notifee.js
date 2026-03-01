// Web stub for @notifee/react-native
const notifee = {
  createChannel: async () => 'default',
  displayNotification: async () => null,
  cancelNotification: async () => {},
  stopForegroundService: async () => {},
  registerForegroundService: () => {},
  onBackgroundEvent: () => {},
  onForegroundEvent: () => () => {},
  getInitialNotification: async () => null,
};
export default notifee;
export const AndroidForegroundServiceType = {};
export const AndroidImportance = { HIGH: 4, DEFAULT: 3 };
export const EventType = { PRESS: 1, ACTION_PRESS: 2, DISMISSED: 3 };
