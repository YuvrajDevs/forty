// Bridge to the native Android lock module. Everything here is a no-op where the module is missing
// (Expo Go, web), so the rest of the app never needs to check.
import FortyLock from '../../modules/forty-lock';
import type { InstalledApp } from '../../modules/forty-lock';
import { LOCKABLE_APPS } from './apps';
import type { OnboardingState } from './onboarding';
import type { Today } from './today';

export const native = FortyLock;
export const lockAvailable = !!FortyLock;

/** Writes the settings the Android service reads. Call whenever anything it depends on changes. */
export function syncLock(s: OnboardingState, t: Today) {
  if (!native) return;
  try {
    native.setConfig(
      JSON.stringify({
        enabled: s.completed && s.lockedApps.length > 0,
        entitled: s.entitled,
        packages: s.lockedApps,
        lockDays: s.lockDays,
        startHour: s.lockStartHour,
        endHour: s.lockEndHour,
        date: t.date,
        pending: t.active ? Math.max(0, t.readings.length - t.doneCount) : 0,
        skipDate: t.skipped ? t.date : '',
        pausedFrom: s.pausedFrom ?? '',
        pausedUntil: s.pausedUntil ?? (s.pausedFrom ? '9999-12-31' : ''),
      }),
    );
  } catch {
    // The lock is optional; never crash the app over it.
  }
}

/** After a reading: open apps for the gap you chose, or for the rest of the day if you are done. */
export function unlockAfterReading(gapHours: number, allDone: boolean) {
  if (!native) return;
  const now = new Date();
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime();
  try {
    native.setUnlockedUntil(allDone ? midnight : now.getTime() + gapHours * 3_600_000);
  } catch {
    // ignore
  }
}

export function emergencyUnlock(minutes = 15) {
  if (!native) return;
  try {
    native.setUnlockedUntil(Date.now() + minutes * 60_000);
  } catch {
    // ignore
  }
}

export function openApp(packageName: string) {
  try {
    native?.launchApp(packageName);
  } catch {
    // ignore
  }
}

export function goHome() {
  try {
    native?.goHome();
  } catch {
    // ignore
  }
}

export type PickableApp = { id: string; name: string; icon?: string };

/** Installed apps on a real build; the common ones where the phone cannot be asked (Expo Go). */
export async function loadApps(): Promise<PickableApp[]> {
  if (!native) return LOCKABLE_APPS.map((a) => ({ id: a.id, name: a.name }));
  try {
    const apps: InstalledApp[] = await native.getInstalledApps();
    const popular = new Set<string>(LOCKABLE_APPS.map((a) => a.id));
    // Popular apps first, in our order, then everything else alphabetically.
    const first = LOCKABLE_APPS.map((a) => apps.find((x) => x.id === a.id)).filter((x): x is InstalledApp => !!x);
    return [...first, ...apps.filter((a) => !popular.has(a.id))].map((a) => ({ id: a.id, name: a.name, icon: a.icon || undefined }));
  } catch {
    return LOCKABLE_APPS.map((a) => ({ id: a.id, name: a.name }));
  }
}
