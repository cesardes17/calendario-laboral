/**
 * Constants for Work Cycle Configuration
 *
 * Shared constants used across work cycle components:
 * - Day names (full and abbreviated)
 * - Predefined work cycle templates
 */

import type { CyclePart } from "@/src/core/domain/workCycle";

/**
 * Full day names in Spanish (Monday to Sunday)
 */
export const DAY_NAMES = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
] as const;

/**
 * Abbreviated day names (L, M, X, J, V, S, D)
 */
export const DAY_NAMES_SHORT = ["L", "M", "X", "J", "V", "S", "D"] as const;

/**
 * Predefined work cycle templates
 */
export interface CycleTemplate {
  name: string;
  parts: CyclePart[];
}

export const CYCLE_TEMPLATES = {
  custom: {
    name: "Personalizado",
    parts: [] as CyclePart[],
  },
  "4-2": {
    name: "4-2 (Trabaja 4, descansa 2)",
    parts: [{ workDays: 4, restDays: 2 }],
  },
  "6-3": {
    name: "6-3 (Trabaja 6, descansa 3)",
    parts: [{ workDays: 6, restDays: 3 }],
  },
  "6-2": {
    name: "6-2 (Trabaja 6, descansa 2)",
    parts: [{ workDays: 6, restDays: 2 }],
  },
  "6-3-6-3-6-3-6-2": {
    name: "6-3-6-3-6-3-6-2 (Ciclo de 4 partes)",
    parts: [
      { workDays: 6, restDays: 3 },
      { workDays: 6, restDays: 3 },
      { workDays: 6, restDays: 3 },
      { workDays: 6, restDays: 2 },
    ],
  },
} as const;

export type TemplateKey = keyof typeof CYCLE_TEMPLATES;
