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
  const selectedCount = weeklyMask.filter(Boolean).length;

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

      {/* Espacio extra abajo para que no “choque” con la nav del wizard */}
      <CardContent className="space-y-4 pb-6">
        {/* Rejilla responsive:
            - base: 2 columnas (móvil) → 2-2-2-1
            - md:   7 columnas (escritorio)
        */}
        <div className="grid grid-cols-2 md:grid-cols-7 gap-3 md:gap-2 justify-items-center">
          {DAY_NAMES_SHORT.map((dayShort, index) => {
            const active = weeklyMask[index];
            return (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex flex-col items-center gap-2"
              >
                {/* Etiqueta más compacta en móvil */}
                <span className="text-[10px] sm:text-xs font-medium text-muted-foreground">
                  {dayShort}
                </span>

                <Button
                  type="button"
                  variant={active ? "default" : "outline"}
                  size="icon"
                  // Botón más pequeño en móvil, normal en >= sm
                  className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg"
                  onClick={() => onDayToggle(index)}
                  title={DAY_NAMES[index]}
                  aria-pressed={active}
                >
                  {active && <CheckCircle2 className="h-5 w-5" />}
                </Button>
              </motion.div>
            );
          })}
        </div>

        <div className="flex items-center justify-center gap-2 pt-2">
          <Badge variant="secondary" className="text-xs">
            {selectedCount} de 7 días seleccionados
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
