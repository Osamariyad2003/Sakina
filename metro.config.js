const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// `rive-react-native`'s `.riv` files are a binary asset format Metro doesn't
// know about by default — register it so `require('*.riv')` resolves as a
// static asset instead of failing bundling. See src/companion/CompanionAvatar.tsx.
config.resolver.assetExts.push('riv');

module.exports = config;
