/**
 * LocalStorage Adapter
 *
 * Handles persistence of configuration data in browser's localStorage.
 * Implements HU-018: Guardar configuración como borrador
 */

const STORAGE_KEY = 'calendario-laboral-config';
const STORAGE_VERSION = '1.0';

/**
 * Serialized configuration data
 */
export interface StoredConfiguration {
  version: string;
  savedAt: string; // ISO date string
  data: {
    year: number | null;
    workCycle: unknown | null;
    employmentStatus: unknown | null;
    contractStartDate: string | null; // ISO date string
    cycleOffset: unknown | null;
    workingHours: unknown | null;
    annualContractHours: number | null;
    holidays: Array<{ date: string; name: string }>;
    vacations: Array<{ startDate: string; endDate: string; description: string }>;
    extraShifts: Array<{ date: string; hours: number; description: string }>;
  };
}

/**
 * Save configuration to localStorage
 */
export function saveConfiguration(data: StoredConfiguration['data']): boolean {
  try {
    const stored: StoredConfiguration = {
      version: STORAGE_VERSION,
      savedAt: new Date().toISOString(),
      data,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    return true;
  } catch (error) {
    console.error('Error saving configuration:', error);
    return false;
  }
}

/**
 * Load configuration from localStorage
 */
export function loadConfiguration(): StoredConfiguration | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return null;
    }

    const parsed: StoredConfiguration = JSON.parse(stored);

    // Check version compatibility
    if (parsed.version !== STORAGE_VERSION) {
      console.warn('Stored configuration version mismatch');
      // Could implement migration here if needed
    }

    return parsed;
  } catch (error) {
    console.error('Error loading configuration:', error);
    return null;
  }
}

/**
 * Clear stored configuration
 */
export function clearConfiguration(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing configuration:', error);
  }
}

/**
 * Check if there's a stored configuration
 */
export function hasStoredConfiguration(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}

/**
 * Get last saved date
 */
export function getLastSavedDate(): Date | null {
  const stored = loadConfiguration();
  return stored ? new Date(stored.savedAt) : null;
}

/**
 * Export configuration as JSON file
 */
export function exportConfiguration(data: StoredConfiguration['data']): void {
  const stored: StoredConfiguration = {
    version: STORAGE_VERSION,
    savedAt: new Date().toISOString(),
    data,
  };

  const blob = new Blob([JSON.stringify(stored, null, 2)], {
    type: 'application/json',
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `calendario-laboral-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Import configuration from JSON file
 */
export function importConfiguration(file: File): Promise<StoredConfiguration> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed: StoredConfiguration = JSON.parse(content);

        // Validate structure
        if (!parsed.version || !parsed.data) {
          reject(new Error('Formato de archivo inválido'));
          return;
        }

        resolve(parsed);
      } catch {
        reject(new Error('Error al leer el archivo'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Error al leer el archivo'));
    };

    reader.readAsText(file);
  });
}
