const { getDefaultConfig } = require('expo/metro-config');
const { wrapWithReanimatedMetroConfig } = require('react-native-reanimated/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Force Metro to use compiled lib/module output for reanimated and worklets.
// Their package.json `react-native` field points to TypeScript src/, but
// Metro's file map doesn't reliably index TypeScript files in deeply-nested
// node_modules subdirectories on WSL2. The compiled output is fully equivalent
// for a dev build.
const COMPILED_OVERRIDES = {
  'react-native-reanimated': path.join(
    __dirname,
    'node_modules/react-native-reanimated/lib/module/index.js',
  ),
  'react-native-worklets': path.join(
    __dirname,
    'node_modules/react-native-worklets/lib/module/index.js',
  ),
};

const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (COMPILED_OVERRIDES[moduleName]) {
    return {
      filePath: COMPILED_OVERRIDES[moduleName],
      type: 'sourceFile',
    };
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = wrapWithReanimatedMetroConfig(config);
