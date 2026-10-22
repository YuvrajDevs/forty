import { requireOptionalNativeModule } from 'expo';

export type InstalledApp = { id: string; name: string; icon: string };

/** Methods of the native Android module. It does not exist in Expo Go, so the module can be null. */
export interface FortyLockNative {
  isAccessibilityEnabled(): boolean;
  openAccessibilitySettings(): void;
  canDrawOverlays(): boolean;
  openOverlaySettings(): void;
  isBatteryUnrestricted(): boolean;
  openBatterySettings(): void;
  setConfig(json: string): void;
  setUnlockedUntil(epochMs: number): void;
  updateWidget(json: string): void;
  launchApp(packageName: string): void;
  goHome(): void;
  getInstalledApps(): Promise<InstalledApp[]>;
}

export default requireOptionalNativeModule<FortyLockNative>('FortyLock');
