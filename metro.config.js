const path = require('path');
const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer'),
  minifierConfig: {
    compress: {
      drop_console: true,
    },
  },
};

// Web shims: native-only modules replaced with no-op stubs when bundling for web
const WEB_SHIMS = {
  'react-native-mmkv': path.resolve(__dirname, 'src/shims/react-native-mmkv-stub.js'),
  'react-native-system-navigation-bar': path.resolve(__dirname, 'src/shims/system-navigation-bar.js'),
  'react-native-fs': path.resolve(__dirname, 'src/shims/react-native-fs.js'),
  'ffmpeg-kit-react-native': path.resolve(__dirname, 'src/shims/ffmpeg-kit-react-native.js'),
  '@notifee/react-native': path.resolve(__dirname, 'src/shims/notifee.js'),
  'expo-navigation-bar': path.resolve(__dirname, 'src/shims/expo-navigation-bar.js'),
};

config.resolver = {
  ...config.resolver,
  assetExts: config.resolver.assetExts.filter(ext => ext !== 'svg'),
  sourceExts: [...config.resolver.sourceExts, 'svg'],
  extraNodeModules: {
    ...config.resolver.extraNodeModules,
    'expensify-common': path.resolve(__dirname, 'node_modules/expensify-common'),
  },
  nodeModulesPaths: [
    path.resolve(__dirname, 'node_modules'),
    ...(config.resolver.nodeModulesPaths || []),
  ],
  resolveRequest: (context, moduleName, platform) => {
    if (platform === 'web' && WEB_SHIMS[moduleName]) {
      return { filePath: WEB_SHIMS[moduleName], type: 'sourceFile' };
    }
    return context.resolveRequest(context, moduleName, platform);
  },
};

module.exports = config;
