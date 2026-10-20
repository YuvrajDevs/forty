import { useEffect, useState } from 'react';
import { loadApps } from './lock';
import type { PickableApp } from './lock';

/** Apps the user can lock: their installed apps on a real build, a common list in Expo Go. */
export function useApps(): PickableApp[] {
  const [apps, setApps] = useState<PickableApp[]>([]);
  useEffect(() => {
    let live = true;
    loadApps().then((a) => live && setApps(a));
    return () => {
      live = false;
    };
  }, []);
  return apps;
}
