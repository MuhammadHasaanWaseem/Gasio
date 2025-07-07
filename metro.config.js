const { getDefaultConfig } = require('expo/metro-config');
const { wrapWithReanimatedMetroConfig } = require('react-native-reanimated/metro-config');

// Get Expo's default Metro config
const config = getDefaultConfig(__dirname);

// Add additional configuration for better stability
const enhancedConfig = {
  ...config,
  resolver: {
    ...config.resolver,
    // Ensure proper module resolution
    alias: {
      ...config.resolver?.alias,
    },
    // Add file extensions to resolve
    sourceExts: [...(config.resolver?.sourceExts || []), 'cjs'],
  },
  transformer: {
    ...config.transformer,
    // Ensure proper asset handling
    assetPlugins: config.transformer?.assetPlugins || [],
  },
  // Add better error handling
  maxWorkers: 2, // Limit workers to prevent memory issues
  resetCache: false,
};

// Wrap it with Reanimated's config
module.exports = wrapWithReanimatedMetroConfig(enhancedConfig);
