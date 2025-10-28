/**
 * WorkCycleModeSelector Component
 *
 * Displays two mode selection cards:
 * - Weekly mode (7-day repeating pattern)
 * - Parts mode (work/rest blocks)
 *
 * Features:
 * - Hover animations
 * - Visual selection feedback (ring and background)
 * - Icons for each mode
 */

"use client";

import { motion } from "framer-motion";
import { Calendar, Clock } from "lucide-react";
import { CycleMode } from "@/src/core/domain/workCycle";
import { Card, CardHeader, CardTitle, CardDescription } from "./ui";

interface WorkCycleModeSelectorProps {
  selectedMode: CycleMode | null;
  onModeChange: (mode: CycleMode) => void;
}

export function WorkCycleModeSelector({
  selectedMode,
  onModeChange,
}: WorkCycleModeSelectorProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold text-foreground">
        ¿Cómo es tu patrón de trabajo?
      </h3>

      <div className="flex flex-col gap-4">
        {/* Weekly Mode Card */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <Card
            className={`cursor-pointer transition-all ${
              selectedMode === CycleMode.WEEKLY
                ? "ring-2 ring-primary bg-primary/5"
                : "hover:border-primary/50"
            }`}
            onClick={() => onModeChange(CycleMode.WEEKLY)}
          >
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-6 w-6" />
                <CardTitle className="text-lg">Semanal (7 días)</CardTitle>
              </div>
              <CardDescription className="text-sm mt-2">
                Repites el mismo patrón cada semana. Por ejemplo: L-V trabajas,
                S-D descansas.
              </CardDescription>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Parts Mode Card */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <Card
            className={`cursor-pointer transition-all ${
              selectedMode === CycleMode.PARTS
                ? "ring-2 ring-primary bg-primary/5"
                : "hover:border-primary/50"
            }`}
            onClick={() => onModeChange(CycleMode.PARTS)}
          >
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <Clock className="h-6 w-6" />
                <CardTitle className="text-lg">Por partes (bloques)</CardTitle>
              </div>
              <CardDescription className="text-sm mt-2">
                Defines bloques de trabajo/descanso que se repiten. Por ejemplo:
                4 días trabajo, 2 días descanso (4-2).
              </CardDescription>
            </CardHeader>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
