import Logger from "../Logger/Logger";

// Простий EventEmitter для роботи з глобальними подіями
const listeners = {};

export const EventBus = {
  on(event, callback) {
    if (!listeners[event]) {
      listeners[event] = [];
    }
    listeners[event].push(callback);
    return () => this.off(event, callback);
  },

  off(event, callback) {
    if (listeners[event]) {
      listeners[event] = listeners[event].filter((cb) => cb !== callback);
    }
  },

  emit(event, data) {
    Logger.debug('EventBus', 'emit', { event, data });
    if (listeners[event]) {
      listeners[event].forEach((callback) => callback(data));
    }
  },
};
