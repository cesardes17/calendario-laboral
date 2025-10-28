/**
 * WorkCycleTemplateSelector Component
 *
 * Displays predefined work cycle templates:
 * - Custom (personalized)
 * - Common patterns (4-2, 6-3, 6-2, 6-3-6-3-6-3-6-2)
 *
 * Features:
 * - Grid layout (responsive: 1 col on mobile, 2 on desktop)
 * - Hover animations
 * - Visual feedback for selected template
 */

"use client";

import { motion } from "framer-motion";
import { CYCLE_TEMPLATES } from "./workCycleConstants";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
} from "./ui";

interface WorkCycleTemplateSelectorProps {
  selectedTemplate: string;
  onTemplateChange: (templateKey: string) => void;
}

export function WorkCycleTemplateSelector({
  selectedTemplate,
  onTemplateChange,
}: WorkCycleTemplateSelectorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Plantillas predefinidas</CardTitle>
        <CardDescription className="text-xs">
          Selecciona un ciclo común o configura uno personalizado
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-6">
        <div className="grid gap-2 sm:grid-cols-2">
          {Object.entries(CYCLE_TEMPLATES).map(([key, template]) => (
            <motion.div
              key={key}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                type="button"
                variant={selectedTemplate === key ? "default" : "outline"}
                className="w-full justify-start text-left h-auto py-3"
                onClick={() => onTemplateChange(key)}
              >
                <span className="text-xs">{template.name}</span>
              </Button>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
