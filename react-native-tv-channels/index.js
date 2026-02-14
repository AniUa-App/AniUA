import { NativeModules } from 'react-native';

const { TvChannels } = NativeModules;

function ensureAvailable() {
  if (!TvChannels) {
    return Promise.reject(new Error('TvChannels native module is not available'));
  }
  return null;
}

class TvChannelsModule {
  // --- Channel Management ---

  static createChannel(config) {
    const error = ensureAvailable();
    if (error) return error;
    return TvChannels.createChannel(config);
  }

  static updateChannel(channelId, config) {
    const error = ensureAvailable();
    if (error) return error;
    return TvChannels.updateChannel(channelId, config);
  }

  static deleteChannel(channelId) {
    const error = ensureAvailable();
    if (error) return error;
    return TvChannels.deleteChannel(channelId);
  }

  static getChannels() {
    const error = ensureAvailable();
    if (error) return error;
    return TvChannels.getChannels();
  }

  static findChannelByName(name) {
    const error = ensureAvailable();
    if (error) return error;
    return TvChannels.findChannelByName(name);
  }

  // --- Program Management ---

  static addProgram(channelId, data) {
    const error = ensureAvailable();
    if (error) return error;
    return TvChannels.addProgram(channelId, data);
  }

  static addPrograms(channelId, programs) {
    const error = ensureAvailable();
    if (error) return error;
    return TvChannels.addPrograms(channelId, programs);
  }

  static updateProgram(programId, data) {
    const error = ensureAvailable();
    if (error) return error;
    return TvChannels.updateProgram(programId, data);
  }

  static removeProgram(programId) {
    const error = ensureAvailable();
    if (error) return error;
    return TvChannels.removeProgram(programId);
  }

  static clearChannelPrograms(channelId) {
    const error = ensureAvailable();
    if (error) return error;
    return TvChannels.clearChannelPrograms(channelId);
  }

  static getPrograms(channelId) {
    const error = ensureAvailable();
    if (error) return error;
    return TvChannels.getPrograms(channelId);
  }

  static findProgram(channelId, internalProviderId) {
    const error = ensureAvailable();
    if (error) return error;
    return TvChannels.findProgram(channelId, internalProviderId);
  }

  // --- Watch Next ---

  static addToWatchNext(data) {
    const error = ensureAvailable();
    if (error) return error;
    return TvChannels.addToWatchNext(data);
  }

  static removeFromWatchNext(programId) {
    const error = ensureAvailable();
    if (error) return error;
    return TvChannels.removeFromWatchNext(programId);
  }

  static findWatchNextProgram(internalProviderId) {
    const error = ensureAvailable();
    if (error) return error;
    return TvChannels.findWatchNextProgram(internalProviderId);
  }

  static clearWatchNext() {
    const error = ensureAvailable();
    if (error) return error;
    return TvChannels.clearWatchNext();
  }

  // --- Utility ---

  static isAndroidTV() {
    const error = ensureAvailable();
    if (error) return error;
    return TvChannels.isAndroidTV();
  }

  static requestChannelBrowsable(channelId) {
    const error = ensureAvailable();
    if (error) return error;
    return TvChannels.requestChannelBrowsable(channelId);
  }

  static debug() {
    const error = ensureAvailable();
    if (error) return error;
    return TvChannels.debug();
  }

  // --- Convenience ---

  static syncChannel(channelConfig, programs) {
    const error = ensureAvailable();
    if (error) return error;
    return TvChannels.syncChannel(channelConfig, programs);
  }
}

export default TvChannelsModule;
