'use client';

import { useEffect } from 'react';
import useSettingsStore from '@/store/settingsStore';

export default function SettingsFetcher() {
  const fetchSettings = useSettingsStore((s) => s.fetchSettings);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return null;
}
