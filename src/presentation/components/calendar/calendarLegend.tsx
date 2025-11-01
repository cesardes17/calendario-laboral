/**
 * Calendar Legend Component
 *
 * Shows the color legend for different day states
 * Colors match HU specification with full dark mode support
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import type { EstadoDia } from '@/src/core/domain';
import {
  Briefcase,
  Coffee,
  Plane,
  PartyPopper,
  CalendarClock,
  Ban,
} from 'lucide-react';

interface LegendItem {
  estado: EstadoDia;
  label: string;
  color: string;
  description: string;
  icon: React.ReactNode;
}

const LEGEND_ITEMS: LegendItem[] = [
  {
    estado: 'Trabajo',
    label: 'Trabajo',
    color: 'bg-blue-500 dark:bg-blue-400',
    description: 'Día laborable (#3B82F6)',
    icon: <Briefcase className="w-3 h-3" />,
  },
  {
    estado: 'Descanso',
    label: 'Descanso',
    color: 'bg-green-500 dark:bg-green-400',
    description: 'Día de descanso según ciclo (#10B981)',
    icon: <Coffee className="w-3 h-3" />,
  },
  {
    estado: 'Vacaciones',
    label: 'Vacaciones',
    color: 'bg-amber-500 dark:bg-amber-400',
    description: 'Período de vacaciones (#F59E0B)',
    icon: <Plane className="w-3 h-3" />,
  },
  {
    estado: 'Festivo',
    label: 'Festivo',
    color: 'bg-orange-400 dark:bg-orange-300',
    description: 'Día festivo (#FB923C)',
    icon: <PartyPopper className="w-3 h-3" />,
  },
  {
    estado: 'FestivoTrabajado',
    label: 'Festivo Trabajado',
    color: 'bg-red-500 dark:bg-red-400',
    description: 'Festivo que se trabaja (#EF4444)',
    icon: <CalendarClock className="w-3 h-3" />,
  },
  {
    estado: 'NoContratado',
    label: 'No Contratado',
    color: 'bg-gray-200 dark:bg-gray-700',
    description: 'Día sin contrato (#E5E7EB)',
    icon: <Ban className="w-3 h-3" />,
  },
];

export function CalendarLegend() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Leyenda de colores</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {LEGEND_ITEMS.map((item) => (
            <div key={item.estado} className="flex items-center gap-2">
              <div
                className={`w-5 h-5 rounded ${item.color} flex-shrink-0 flex items-center justify-center text-white`}
              >
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
