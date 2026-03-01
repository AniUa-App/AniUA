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
  'react-native-fast-image': path.resolve(__dirname, 'src/shims/react-native-fast-image.js'),
  'expo-keep-awake': path.resolve(__dirname, 'src/shims/expo-keep-awake.js'),
  'react-native-orientation-locker': path.resolve(__dirname, 'src/shims/react-native-orientation-locker.js'),
  'reactotron-react-native': path.resolve(__dirname, 'src/shims/reactotron-react-native.js'),
  'reactotron-apisauce': path.resolve(__dirname, 'src/shims/reactotron-apisauce.js'),
  'reactotron-react-native-mmkv': path.resolve(__dirname, 'src/shims/reactotron-react-native-mmkv.js'),
  '@react-native-community/netinfo': path.resolve(__dirname, 'src/shims/netinfo.js'),
  'react-native-linear-gradient': path.resolve(__dirname, 'src/shims/react-native-linear-gradient.js'),
  'react-native-selectable-text-input': path.resolve(__dirname, 'src/shims/react-native-selectable-text-input.js'),
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
