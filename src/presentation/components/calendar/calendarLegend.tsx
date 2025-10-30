/**
 * Calendar Legend Component
 *
 * Shows the color legend for different day states
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import type { EstadoDia } from '@/src/core/domain';

interface LegendItem {
  estado: EstadoDia;
  label: string;
  color: string;
  description: string;
}

const LEGEND_ITEMS: LegendItem[] = [
  {
    estado: 'Trabajo',
    label: 'Trabajo',
    color: 'bg-blue-500',
    description: 'Día laborable',
  },
  {
    estado: 'Descanso',
    label: 'Descanso',
    color: 'bg-green-500',
    description: 'Día de descanso según ciclo',
  },
  {
    estado: 'Vacaciones',
    label: 'Vacaciones',
    color: 'bg-yellow-500',
    description: 'Período de vacaciones',
  },
  {
    estado: 'Festivo',
    label: 'Festivo',
    color: 'bg-orange-500',
    description: 'Día festivo',
  },
  {
    estado: 'FestivoTrabajado',
    label: 'Festivo Trabajado',
    color: 'bg-red-500',
    description: 'Festivo que se trabaja',
  },
  {
    estado: 'NoContratado',
    label: 'No Contratado',
    color: 'bg-gray-300 dark:bg-gray-700',
    description: 'Día sin contrato',
  },
];

export function CalendarLegend() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Leyenda</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {LEGEND_ITEMS.map((item) => (
            <div key={item.estado} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded ${item.color} flex-shrink-0`} />
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
