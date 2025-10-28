/**
 * VacationManager Component
 *
 * Manages vacation periods for the selected year.
 * Allows adding, editing, and removing vacation periods with validation.
 *
 * Features:
 * - Add new vacation periods with start/end dates and description
 * - Edit existing vacation periods
 * - Delete vacation periods
 * - Automatic sorting by start date
 * - Shows total vacation days (accounting for overlaps)
 * - Overlap detection and warnings
 * - Option to unify overlapping periods
 *
 * Implements HU-014: Gestionar períodos de vacaciones
 */

"use client";

import React, { useState } from "react";
import { VacationPeriod } from "@/src/core/domain/vacationPeriod";
import { Year } from "@/src/core/domain/year";
import { useVacations } from "@/src/application/hooks/useVacations";
import { MAX_VACATION_DAYS } from "@/src/core/usecases/manageVacations.usecase";
import { X, Plus, Edit2, Trash2, Calendar, AlertTriangle } from "lucide-react";

interface VacationManagerProps {
  year: Year | null;
  className?: string;
}

export const VacationManager: React.FC<VacationManagerProps> = ({
  year,
  className = "",
}) => {
  const {
    vacations,
    addVacation,
    removeVacation,
    updateVacation,
    error,
    clearError,
    getCount,
    totalDays,
    checkOverlaps,
    applyUnification,
  } = useVacations(year);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    description: "",
  });
  const [overlapWarning, setOverlapWarning] = useState<string | null>(null);

  const resetForm = () => {
    setFormData({ startDate: "", endDate: "", description: "" });
    setEditingIndex(null);
    setOverlapWarning(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (period: VacationPeriod, index: number) => {
    const startStr = `${year?.value}-${String(
      period.startDate.getMonth() + 1
    ).padStart(2, "0")}-${String(period.startDate.getDate()).padStart(2, "0")}`;
    const endStr = `${year?.value}-${String(
      period.endDate.getMonth() + 1
    ).padStart(2, "0")}-${String(period.endDate.getDate()).padStart(2, "0")}`;

    setFormData({
      startDate: startStr,
      endDate: endStr,
      description: period.description,
    });
    setEditingIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
    clearError();
  };

  const calculateDaysPreview = (): number => {
    if (!formData.startDate || !formData.endDate) return 0;

    const [startYear, startMonth, startDay] = formData.startDate
      .split("-")
      .map(Number);
    const [endYear, endMonth, endDay] = formData.endDate.split("-").map(Number);
    const start = new Date(startYear, startMonth - 1, startDay);
    const end = new Date(endYear, endMonth - 1, endDay);

    if (end < start) return 0;

    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    const timeDiff = end.getTime() - start.getTime();
    return Math.floor(timeDiff / millisecondsPerDay) + 1;
  };

  const checkForOverlaps = () => {
    if (!formData.startDate || !formData.endDate) return;

    const [startYear, startMonth, startDay] = formData.startDate
      .split("-")
      .map(Number);
    const [endYear, endMonth, endDay] = formData.endDate.split("-").map(Number);
    const start = new Date(startYear, startMonth - 1, startDay);
    const end = new Date(endYear, endMonth - 1, endDay);

    const periodResult = VacationPeriod.create({
      startDate: start,
      endDate: end,
      description: formData.description,
    });

    if (periodResult.isFailure()) return;

    const period = periodResult.getValue();

    // When editing, exclude the current period from overlap check
    const periodsToCheck =
      editingIndex !== null
        ? vacations.filter((_, i) => i !== editingIndex)
        : vacations;

    const overlaps = checkOverlaps(period);
    const relevantOverlaps = overlaps.filter((overlap) =>
      periodsToCheck.some((p) => p === overlap.overlappingPeriod)
    );

    if (relevantOverlaps.length > 0) {
      const messages = relevantOverlaps.map((overlap) => {
        const overlapPeriod = overlap.overlappingPeriod;
        if (overlap.isFullyContained) {
          return `Este período ya está incluido en "${overlapPeriod.getFormattedDateRange()}"`;
        }
        return `Se solapa con "${overlapPeriod.getFormattedDateRange()}" (${overlap.overlapDays} días)`;
      });
      setOverlapWarning(messages.join(". "));
    } else {
      setOverlapWarning(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.startDate || !formData.endDate) {
      return;
    }

    const [startYear, startMonth, startDay] = formData.startDate
      .split("-")
      .map(Number);
    const [endYear, endMonth, endDay] = formData.endDate.split("-").map(Number);
    const start = new Date(startYear, startMonth - 1, startDay);
    const end = new Date(endYear, endMonth - 1, endDay);

    const periodResult = VacationPeriod.create({
      startDate: start,
      endDate: end,
      description: formData.description,
    });

    if (periodResult.isFailure()) {
      return;
    }

    const period = periodResult.getValue();
    let success: boolean;

    if (editingIndex !== null) {
      success = updateVacation(editingIndex, period);
    } else {
      success = addVacation(period);
    }

    if (success) {
      closeModal();
    }
  };

  const handleDelete = (index: number) => {
    if (confirm("¿Estás seguro de que quieres eliminar este período de vacaciones?")) {
      removeVacation(index);
    }
  };

  if (!year) {
    return (
      <div className={`text-gray-500 dark:text-gray-400 ${className}`}>
        Selecciona un año primero para gestionar vacaciones
      </div>
    );
  }

  const daysPreview = calculateDaysPreview();
  const remainingDays = MAX_VACATION_DAYS - totalDays;
  const usagePercentage = (totalDays / MAX_VACATION_DAYS) * 100;

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
            Vacaciones del año {year.value}
          </h3>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {totalDays} / {MAX_VACATION_DAYS} días utilizados
              {getCount() > 0 && (
                <span className="ml-1">
                  en {getCount()} {getCount() === 1 ? "período" : "períodos"}
                </span>
              )}
            </p>
            {remainingDays > 0 && (
              <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded">
                {remainingDays} {remainingDays === 1 ? "día" : "días"} disponibles
              </span>
            )}
            {remainingDays === 0 && (
              <span className="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded">
                Límite alcanzado
              </span>
            )}
          </div>
          {/* Progress bar */}
          <div className="mt-2 w-full max-w-md">
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  usagePercentage >= 100
                    ? "bg-red-500"
                    : usagePercentage >= 80
                    ? "bg-yellow-500"
                    : "bg-blue-500"
                }`}
                style={{ width: `${Math.min(usagePercentage, 100)}%` }}
              />
            </div>
          </div>
        </div>
        <button
          onClick={openAddModal}
          disabled={totalDays >= MAX_VACATION_DAYS}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            totalDays >= MAX_VACATION_DAYS
              ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          <Plus className="w-4 h-4" />
          Añadir vacaciones
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 rounded-lg flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
          </div>
          <button
            onClick={clearError}
            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Optimize button - shown when there are overlapping periods */}
      {vacations.length > 1 && (
        <div className="mb-4">
          <button
            onClick={() => {
              if (confirm("¿Deseas unificar períodos solapados o contiguos en períodos únicos? Esta acción no se puede deshacer.")) {
                applyUnification();
              }
            }}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Optimizar períodos
          </button>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Unifica automáticamente períodos solapados o contiguos
          </p>
        </div>
      )}

      {/* Vacation list */}
      {vacations.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
          <Calendar className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-3" />
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            No hay períodos de vacaciones añadidos
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Haz clic en &quot;Añadir vacaciones&quot; para empezar
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {vacations.map((period, index) => (
            <div
              key={index}
              className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">🏖️</span>
                    <p className="text-base font-medium text-gray-800 dark:text-gray-200">
                      {period.getFormattedDateRange()}
                    </p>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      ({period.getDayCount()}{" "}
                      {period.getDayCount() === 1 ? "día" : "días"})
                    </span>
                  </div>
                  {period.hasDescription() && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 ml-8">
                      {period.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => openEditModal(period, index)}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
                    title="Editar"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(index)}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for add/edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            {/* Modal header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                {editingIndex !== null
                  ? "Editar período de vacaciones"
                  : "Añadir período de vacaciones"}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal body */}
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {/* Start date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Fecha de inicio *
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => {
                    setFormData({ ...formData, startDate: e.target.value });
                    setTimeout(checkForOverlaps, 100);
                  }}
                  min={`${year.value}-01-01`}
                  max={`${year.value}-12-31`}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                />
              </div>

              {/* End date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Fecha de fin *
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => {
                    setFormData({ ...formData, endDate: e.target.value });
                    setTimeout(checkForOverlaps, 100);
                  }}
                  min={`${year.value}-01-01`}
                  max={`${year.value}-12-31`}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Descripción (opcional)
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Ej: Vacaciones de verano"
                  maxLength={100}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>

              {/* Days preview and limit warning */}
              {daysPreview > 0 && (
                <>
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      📊 Este período incluye {daysPreview}{" "}
                      {daysPreview === 1 ? "día" : "días"}
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                      Total tras añadir: {editingIndex !== null
                        ? totalDays - (vacations[editingIndex]?.getDayCount() || 0) + daysPreview
                        : totalDays + daysPreview} / {MAX_VACATION_DAYS} días
                    </p>
                  </div>
                  {/* Limit warning */}
                  {editingIndex !== null
                    ? totalDays - (vacations[editingIndex]?.getDayCount() || 0) + daysPreview > MAX_VACATION_DAYS
                    : totalDays + daysPreview > MAX_VACATION_DAYS && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-800 dark:text-red-300">
                        ⚠️ Este período supera el límite de {MAX_VACATION_DAYS} días anuales.
                        No podrás guardarlo hasta que ajustes las fechas.
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* Overlap warning */}
              {overlapWarning && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-800 dark:text-yellow-300">
                    {overlapWarning}. Los días solapados contarán una sola vez.
                  </p>
                </div>
              )}

              {/* Modal footer */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingIndex !== null ? "Guardar cambios" : "Añadir"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
