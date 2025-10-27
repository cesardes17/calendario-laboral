import { useCallback, useEffect, useState } from 'react';
import {
  saveConfiguration,
  loadConfiguration,
  clearConfiguration,
  hasStoredConfiguration,
  getLastSavedDate,
  exportConfiguration,
  importConfiguration,
  type StoredConfiguration,
} from '@/src/infrastructure/persistence/local-storage.adapter';

/**
 * Custom hook for managing configuration persistence
 *
 * Handles saving, loading, and auto-saving of configuration to localStorage.
 * Implements HU-018: Guardar configuración como borrador
 *
 * @example
 * ```typescript
 * const {
 *   saveNow,
 *   loadSaved,
 *   clearSaved,
 *   hasStored,
 *   lastSaved,
 *   exportConfig,
 *   importConfig
 * } = usePersistence();
 * ```
 */
export function usePersistence() {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasStored, setHasStored] = useState(false);

  /**
   * Check for stored configuration on mount
   */
  useEffect(() => {
    setHasStored(hasStoredConfiguration());
    setLastSaved(getLastSavedDate());
  }, []);

  /**
   * Save configuration now
   */
  const saveNow = useCallback((data: StoredConfiguration['data']): boolean => {
    const success = saveConfiguration(data);
    if (success) {
      setLastSaved(new Date());
      setHasStored(true);
    }
    return success;
  }, []);

  /**
   * Load saved configuration
   */
  const loadSaved = useCallback((): StoredConfiguration | null => {
    return loadConfiguration();
  }, []);

  /**
   * Clear saved configuration
   */
  const clearSaved = useCallback((): void => {
    clearConfiguration();
    setHasStored(false);
    setLastSaved(null);
  }, []);

  /**
   * Export configuration as JSON file
   */
  const exportConfig = useCallback((data: StoredConfiguration['data']): void => {
    exportConfiguration(data);
  }, []);

  /**
   * Import configuration from JSON file
   */
  const importConfig = useCallback(
    async (file: File): Promise<StoredConfiguration> => {
      const config = await importConfiguration(file);
      // Save imported configuration
      saveNow(config.data);
      return config;
    },
    [saveNow]
  );

  return {
    saveNow,
    loadSaved,
    clearSaved,
    hasStored,
    lastSaved,
    exportConfig,
    importConfig,
  };
}
