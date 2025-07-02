const { getDefaultConfig } = require('expo/metro-config');
const { wrapWithReanimatedMetroConfig } = require('react-native-reanimated/metro-config');

// Get Expo's default Metro config
const config = getDefaultConfig(__dirname);

// Wrap it with Reanimated's config
module.exports = wrapWithReanimatedMetroConfig(config);
