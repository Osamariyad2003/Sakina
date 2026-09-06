import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';
import { ensureLayoutDirection, getPersistedLanguage } from './src/i18n/rtl';
import App from './App';

// Align native layout direction with the persisted language as early as
// possible (spec §9). On a real mismatch this flips I18nManager.forceRTL;
// the very first cold start after install applies on next launch/reload —
// see src/i18n/rtl.ts for the explicit reload path used when the user
// changes language at runtime.
ensureLayoutDirection(getPersistedLanguage());

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
