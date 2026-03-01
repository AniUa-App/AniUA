// Web stub for reactotron-react-native
const noop = () => Reactotron;
const Reactotron = {
  configure: noop,
  useReactNative: noop,
  use: noop,
  connect: noop,
  log: () => {},
  warn: () => {},
  error: () => {},
  display: () => {},
  logImportant: () => {},
  clear: () => {},
};
export const trackGlobalErrors = () => () => {};
export const networking = () => () => {};
export const openInEditor = () => () => {};
export const overlay = () => () => {};
export const asyncStorage = () => () => {};
export const stateActionLogger = () => () => {};
export default Reactotron;
