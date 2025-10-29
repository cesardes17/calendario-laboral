/**
 * EmploymentStatusSelector Component
 *
 * Displays two employment status selection cards:
 * - Started this year (requires contract date)
 * - Worked before (may require cycle offset)
 *
 * Features:
 * - Hover animations
 * - Visual selection feedback (ring and background)
 * - Icons and help text for each status
 */

"use client";

import { motion } from "framer-motion";
import { CalendarCheck, History } from "lucide-react";
import { EmploymentStatusType } from "@/src/core/domain/employmentStatus";
import { Card, CardHeader, CardTitle, CardDescription } from "../ui";

interface EmploymentStatusSelectorProps {
  selectedStatus: EmploymentStatusType | null;
  onStatusChange: (status: EmploymentStatusType) => void;
}

export function EmploymentStatusSelector({
  selectedStatus,
  onStatusChange,
}: EmploymentStatusSelectorProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold text-foreground">
        ¿Es tu primer año en este trabajo?
      </h3>

      <div className="flex flex-col gap-4">
        {/* Started This Year Card */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <Card
            className={`cursor-pointer transition-all ${
              selectedStatus === EmploymentStatusType.STARTED_THIS_YEAR
                ? "ring-2 ring-primary bg-primary/5"
                : "hover:border-primary/50"
            }`}
            onClick={() =>
              onStatusChange(EmploymentStatusType.STARTED_THIS_YEAR)
            }
          >
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <CalendarCheck className="h-6 w-6" />
                <CardTitle className="text-lg">Sí, empecé este año</CardTitle>
              </div>
              <CardDescription className="text-sm mt-2">
                Indica la fecha exacta en que comenzó tu contrato. Los días
                anteriores aparecerán como &apos;No contratado&apos;
              </CardDescription>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Worked Before Card */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <Card
            className={`cursor-pointer transition-all ${
              selectedStatus === EmploymentStatusType.WORKED_BEFORE
                ? "ring-2 ring-primary bg-primary/5"
                : "hover:border-primary/50"
            }`}
            onClick={() => onStatusChange(EmploymentStatusType.WORKED_BEFORE)}
          >
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <History className="h-6 w-6" />
                <CardTitle className="text-lg">
                  No, ya trabajaba antes
                </CardTitle>
              </div>
              <CardDescription className="text-sm mt-2">
                Indica en qué punto de tu ciclo laboral te encontrabas el 1 de
                enero para continuar correctamente
              </CardDescription>
            </CardHeader>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
