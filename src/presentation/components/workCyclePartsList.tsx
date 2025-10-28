/**
 * WorkCyclePartsList Component
 *
 * Manages the list of work/rest parts:
 * - Displays all parts with animations
 * - "Add part" button
 * - Example/info alert
 *
 * Layout improvements:
 * - Added pb-6 to CardContent for better spacing
 * - Better spacing between parts (space-y-4)
 * - Proper button positioning
 */

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Plus, AlertCircle } from "lucide-react";
import type { CyclePart } from "@/src/core/domain/workCycle";
import { WorkCyclePartItem } from "./workCyclePartItem";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Alert,
  AlertDescription,
} from "./ui";

interface WorkCyclePartsListProps {
  parts: CyclePart[];
  onPartChange: (
    index: number,
    field: "workDays" | "restDays",
    value: string
  ) => void;
  onAddPart: () => void;
  onRemovePart: (index: number) => void;
}

export function WorkCyclePartsList({
  parts,
  onPartChange,
  onAddPart,
  onRemovePart,
}: WorkCyclePartsListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Configuración de bloques</CardTitle>
        <CardDescription className="text-xs">
          Define tus bloques de trabajo/descanso (se repetirán indefinidamente)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pb-6">
        {/* Parts list */}
        <AnimatePresence>
          {parts.map((part, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <WorkCyclePartItem
                part={part}
                index={index}
                canRemove={parts.length > 1}
                onPartChange={onPartChange}
                onRemove={onRemovePart}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Add part button */}
        <Button
          type="button"
          variant="outline"
          className="w-full bg-transparent"
          onClick={onAddPart}
        >
          <Plus className="h-4 w-4 mr-2" />
          Añadir otra parte
        </Button>

        {/* Info alert */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            <strong>Ejemplo:</strong> Si defines 6-3, 6-2, trabajarás 6 días,
            descansarás 3, trabajarás 6, descansarás 2, y así sucesivamente.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
