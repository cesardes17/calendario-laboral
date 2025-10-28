/**
 * WorkCycleWeeklyConfig Component
 *
 * Displays weekly mode configuration:
 * - 7-day grid (Mon-Sun) with toggle buttons
 * - Visual feedback for selected days
 * - Badge showing count of selected days
 *
 * Fixed spacing issues:
 * - Added pb-6 to CardContent for better bottom spacing
 * - Improved button sizing and grid spacing
 */

"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import type { WeeklyMask } from "@/src/core/domain/workCycle";
import { DAY_NAMES, DAY_NAMES_SHORT } from "./workCycleConstants";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Badge,
} from "../ui";

interface WorkCycleWeeklyConfigProps {
  weeklyMask: WeeklyMask;
  onDayToggle: (dayIndex: number) => void;
}

export function WorkCycleWeeklyConfig({
  weeklyMask,
  onDayToggle,
}: WorkCycleWeeklyConfigProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Selecciona los días que trabajas
        </CardTitle>
        <CardDescription className="text-xs">
          Marca los días de la semana en los que trabajas habitualmente
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pb-6">
        <div className="grid grid-cols-7 gap-2">
          {DAY_NAMES_SHORT.map((dayShort, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center gap-2"
            >
              <span className="text-xs font-medium text-muted-foreground">
                {dayShort}
              </span>
              <Button
                type="button"
                variant={weeklyMask[index] ? "default" : "outline"}
                size="icon"
                className="h-12 w-12 rounded-lg"
                onClick={() => onDayToggle(index)}
                title={DAY_NAMES[index]}
              >
                {weeklyMask[index] && <CheckCircle2 className="h-5 w-5" />}
              </Button>
            </motion.div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-2 pt-2">
          <Badge variant="secondary" className="text-xs">
            {weeklyMask.filter((d) => d).length} de 7 días seleccionados
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
