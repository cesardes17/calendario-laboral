/**
 * ConfigurationSummary Component
 *
 * Shows a complete summary of all configuration with validation status.
 * Allows navigation to each section for editing.
 *
 * Implements HU-016: Ver resumen de configuración
 */

"use client";

import React from "react";
import { Check, AlertTriangle, X, Edit2, ChevronRight } from "lucide-react";
import {
  type UseConfigurationValidationParams,
  useConfigurationValidation,
} from "@/src/application/hooks/useConfigurationValidation";
import { FieldStatus } from "@/src/core/usecases/validateConfiguration.usecase";

interface ConfigurationSummaryProps {
  config: UseConfigurationValidationParams;
  validation: ReturnType<typeof useConfigurationValidation>;
  onNavigateToSection?: (sectionId: string) => void;
  onGenerateCalendar?: () => void;
  className?: string;
}

export const ConfigurationSummary: React.FC<ConfigurationSummaryProps> = ({
  validation,
  onNavigateToSection,
  onGenerateCalendar,
  className = "",
}) => {
  const getStatusIcon = (status: FieldStatus) => {
    switch (status) {
      case FieldStatus.COMPLETE:
        return <Check className="w-5 h-5 text-green-600 dark:text-green-400" />;
      case FieldStatus.WARNING:
        return <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />;
      case FieldStatus.INCOMPLETE:
      case FieldStatus.ERROR:
        return <X className="w-5 h-5 text-red-600 dark:text-red-400" />;
    }
  };

  const getStatusColor = (status: FieldStatus) => {
    switch (status) {
      case FieldStatus.COMPLETE:
        return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800";
      case FieldStatus.WARNING:
        return "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800";
      case FieldStatus.INCOMPLETE:
      case FieldStatus.ERROR:
        return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
    }
  };

  return (
    <div className={className}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
          📋 Resumen de Configuración
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {validation.progressText}
        </p>

        {/* Progress bar */}
        <div className="mt-3 w-full">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                validation.progressPercentage === 100
                  ? "bg-green-500"
                  : validation.progressPercentage >= 70
                  ? "bg-blue-500"
                  : "bg-yellow-500"
              }`}
              style={{ width: `${validation.progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Configuration sections */}
      <div className="space-y-3">
        {validation.fields.map((field) => {
          const navigateTo = field.navigateTo || `${field.field}-section`;

          return (
            <div
              key={field.field}
              className={`p-4 border rounded-lg ${getStatusColor(field.status)}`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getStatusIcon(field.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    {field.message}
                  </p>
                </div>
                {onNavigateToSection && (
                  <button
                    onClick={() => onNavigateToSection(navigateTo)}
                    className="flex-shrink-0 p-1.5 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-gray-800 rounded transition-colors"
                    title="Editar"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Warnings */}
      {validation.warnings.length > 0 && (
        <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300 mb-2">
                Advertencias
              </p>
              <ul className="text-sm text-yellow-700 dark:text-yellow-400 space-y-1">
                {validation.warnings.map((warning, idx) => (
                  <li key={idx}>• {warning}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="mt-6 flex gap-3">
        {onGenerateCalendar && (
          <button
            onClick={onGenerateCalendar}
            disabled={!validation.canGenerate}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              validation.canGenerate
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed"
            }`}
          >
            Generar Calendario
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Error list if cannot generate */}
      {!validation.canGenerate && validation.missingFields.length > 0 && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-start gap-2">
            <X className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800 dark:text-red-300 mb-2">
                Faltan campos obligatorios
              </p>
              <ul className="text-sm text-red-700 dark:text-red-400 space-y-2">
                {validation.missingFields.map((field) => (
                  <li key={field.field} className="flex items-center justify-between">
                    <span>• {field.message}</span>
                    {onNavigateToSection && field.navigateTo && (
                      <button
                        onClick={() => onNavigateToSection(field.navigateTo!)}
                        className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-900/60 transition-colors"
                      >
                        Ir a configuración
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
