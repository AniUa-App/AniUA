export interface ChannelConfig {
  displayName: string;
  description?: string;
  internalProviderName?: string;
  appLinkIntentUri?: string;
  logoUrl?: string;
}

export interface ChannelInfo {
  id: number;
  displayName: string;
  isBrowsable: boolean;
  internalProviderName?: string;
}

export interface ProgramConfig {
  title: string;
  intentUri: string;
  description?: string;
  posterArtUri?: string;
  thumbnailUri?: string;
  internalProviderId?: string;
  type?: 'MOVIE' | 'TV_SERIES' | 'TV_EPISODE' | 'CLIP' | 'CHANNEL';
  episodeNumber?: string;
  seasonNumber?: string;
  genre?: string;
  durationMillis?: number;
  lastPlaybackPositionMillis?: number;
  releaseDate?: string;
  weight?: number;
}

export interface ProgramInfo {
  id: number;
  title: string;
  internalProviderId?: string;
}

export interface WatchNextConfig {
  title: string;
  intentUri: string;
  description?: string;
  posterArtUri?: string;
  internalProviderId?: string;
  type?: 'MOVIE' | 'TV_SERIES' | 'TV_EPISODE' | 'CLIP';
  watchNextType?: 'CONTINUE' | 'NEXT' | 'NEW' | 'WATCHLIST';
  lastEngagementTimeMillis?: number;
  lastPlaybackPositionMillis?: number;
  durationMillis?: number;
  episodeNumber?: string;
  genre?: string;
}

export interface SyncResult {
  channelId: number;
  programIds: number[];
}

declare class TvChannelsModule {
  // Channel Management
  static createChannel(config: ChannelConfig): Promise<number>;
  static updateChannel(channelId: number, config: Partial<ChannelConfig>): Promise<boolean>;
  static deleteChannel(channelId: number): Promise<boolean>;
  static getChannels(): Promise<ChannelInfo[]>;
  static findChannelByName(name: string): Promise<ChannelInfo | null>;

  // Program Management
  static addProgram(channelId: number, data: ProgramConfig): Promise<number>;
  static addPrograms(channelId: number, programs: ProgramConfig[]): Promise<number[]>;
  static updateProgram(programId: number, data: ProgramConfig): Promise<boolean>;
  static removeProgram(programId: number): Promise<boolean>;
  static clearChannelPrograms(channelId: number): Promise<boolean>;
  static getPrograms(channelId: number): Promise<ProgramInfo[]>;
  static findProgram(channelId: number, internalProviderId: string): Promise<ProgramInfo | null>;

  // Watch Next
  static addToWatchNext(data: WatchNextConfig): Promise<number>;
  static removeFromWatchNext(programId: number): Promise<boolean>;
  static findWatchNextProgram(internalProviderId: string): Promise<ProgramInfo | null>;
  static clearWatchNext(): Promise<boolean>;

  // Utility
  static isAndroidTV(): Promise<boolean>;
  static requestChannelBrowsable(channelId: number): Promise<boolean>;

  // Convenience
  static syncChannel(channelConfig: ChannelConfig, programs: ProgramConfig[]): Promise<SyncResult>;
}

export default TvChannelsModule;
