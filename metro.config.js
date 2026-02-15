const path = require('path');
const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer'),
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
};

module.exports = config;
