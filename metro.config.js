const { getDefaultConfig } = require('expo/metro-config');
const { wrapWithReanimatedMetroConfig } = require('react-native-reanimated/metro-config');
// const { withNativeWind } = require('nativewind/metro');

// Get default config from Expo
const defaultConfig = getDefaultConfig(__dirname);

// Wrap it with Reanimated's config
const config = wrapWithReanimatedMetroConfig(defaultConfig
    
);

module.exports = config;
