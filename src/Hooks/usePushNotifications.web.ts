// Web stub — no push notifications on web
export interface UsePushNotificationsResult {
  token: string | null;
  isRegistered: boolean;
  isLoading: boolean;
  error: Error | null;
  unreadCount: number;
  registerForPushNotifications: () => Promise<boolean>;
  subscribeToAnime: (slug: string) => Promise<boolean>;
  unsubscribeFromAnime: (slug: string) => Promise<boolean>;
  getSubscribedSlugs: () => string[];
  isSubscribedTo: (slug: string) => boolean;
}

export function usePushNotifications(): UsePushNotificationsResult {
  return {
    token: null,
    isRegistered: false,
    isLoading: false,
    error: null,
    unreadCount: 0,
    registerForPushNotifications: async () => false,
    subscribeToAnime: async () => false,
    unsubscribeFromAnime: async () => false,
    getSubscribedSlugs: () => [],
    isSubscribedTo: () => false,
  };
}

export default usePushNotifications;
