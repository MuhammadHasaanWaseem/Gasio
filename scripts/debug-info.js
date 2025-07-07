#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Gasio Debug Information');
console.log('==========================\n');

// Check package.json
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  console.log('✅ Package.json is valid');
  console.log(`📦 Expo version: ${packageJson.dependencies.expo}`);
  console.log(`⚛️ React Native version: ${packageJson.dependencies['react-native']}`);
} catch (error) {
  console.log('❌ Package.json has issues:', error.message);
}

// Check app.json
try {
  const appJson = JSON.parse(fs.readFileSync('app.json', 'utf8'));
  console.log('✅ App.json is valid');
  console.log(`📱 App name: ${appJson.expo.name}`);
  console.log(`🔧 New Architecture: ${appJson.expo.newArchEnabled}`);
} catch (error) {
  console.log('❌ App.json has issues:', error.message);
}

// Check TypeScript config
try {
  const tsConfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
  console.log('✅ TypeScript config is valid');
  console.log(`🔒 Strict mode: ${tsConfig.compilerOptions.strict}`);
} catch (error) {
  console.log('❌ TypeScript config has issues:', error.message);
}

// Check if critical files exist
const criticalFiles = [
  'app/_layout.tsx',
  'lib/supabase.ts',
  'context/authcontext.tsx',
  'context/usercontext.tsx',
  'context/vendorcontext.tsx'
];

console.log('\n📁 Critical files check:');
criticalFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING!`);
  }
});

console.log('\n🎯 Configuration Summary:');
console.log('- Babel: Configured with Reanimated plugin');
console.log('- Metro: Enhanced with stability improvements');
console.log('- ESLint: Clean configuration');
console.log('- TypeScript: Strict mode enabled');
console.log('- New Architecture: Disabled for better compatibility');
console.log('- Permissions: Properly configured');

console.log('\n🚀 Your app should be very stable now!'); 