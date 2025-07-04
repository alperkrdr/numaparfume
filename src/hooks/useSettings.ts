import { useState, useEffect, useCallback } from 'react';
import { SiteSettings } from '../types';
import { SettingsService, DEFAULT_SETTINGS } from '../services/settingsService';

// Global cache to prevent multiple Firebase requests
let settingsCache: { data: SiteSettings | null; timestamp: number } = { data: null, timestamp: 0 };
const CACHE_DURATION = 5 * 60 * 1000; // 5 dakika cache

export const useSettings = () => {
  const [settings, setSettings] = useState<SiteSettings>({
    ...DEFAULT_SETTINGS,
    id: 'site-settings' 
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      // Check cache first
      const now = Date.now();
      if (settingsCache.data && (now - settingsCache.timestamp) < CACHE_DURATION) {
        setSettings(settingsCache.data);
        setError(null);
        setLoading(false);
        return;
      }

      const { settings: fetchedSettings, fromCache } = await SettingsService.getSiteSettings();
      if (fetchedSettings) {
        // Gelen verinin geminiSettings içermesini garantile
        const finalSettings = {
          ...DEFAULT_SETTINGS,
          ...fetchedSettings,
          geminiSettings: {
            ...DEFAULT_SETTINGS.geminiSettings,
            ...(fetchedSettings.geminiSettings || {}),
          },
        };
        
        setSettings(finalSettings);
        
        // Update cache only if from server
        if (!fromCache) {
          settingsCache = { data: finalSettings, timestamp: now };
        }
      }
      
      if (fromCache) {
        setError('Firebase bağlantı hatası. Ayarlar kaydedilemez.');
      } else {
        setError(null);
      }
    } catch (e) {
      console.error("Error fetching settings:", e);
      setError("Ayarlar yüklenirken bir hata oluştu.");
      setSettings({ ...DEFAULT_SETTINGS, id: 'site-settings' });
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSettings = useCallback(async (newSettings: Partial<SiteSettings>) => {
    setLoading(true);
    try {
      await SettingsService.updateSiteSettings(newSettings);
      // Başarılı güncelleme sonrası ayarları yeniden çek
      await fetchSettings();
    } catch (e) {
      console.error("Error updating settings:", e);
      setError("Ayarlar güncellenirken hata oluştu.");
      throw e;
    } finally {
      setLoading(false);
    }
  }, [fetchSettings]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return { settings, loading, error, updateSettings, fetchSettings };
};