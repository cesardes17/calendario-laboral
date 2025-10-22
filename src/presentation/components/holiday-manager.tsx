/**
 * HolidayManager Component
 *
 * Manages holidays (festivos) for the selected year.
 * Allows adding, editing, and removing holidays with validation.
 *
 * Features:
 * - Add new holidays with optional name
 * - Mark holidays as worked/not worked
 * - Edit existing holidays
 * - Delete holidays
 * - Automatic sorting by date
 * - Validation for duplicates and year
 *
 * Implements HU-012: Añadir festivos manualmente
 */

"use client";

import React, { useState } from "react";
import { Holiday } from "@/src/core/domain/holiday";
import { Year } from "@/src/core/domain/year";
import { useHolidays } from "@/src/application/hooks/use-holidays";
import { X, Plus, Edit2, Trash2, Calendar } from "lucide-react";

interface HolidayManagerProps {
  year: Year | null;
  className?: string;
}

export const HolidayManager: React.FC<HolidayManagerProps> = ({
  year,
  className = "",
}) => {
  const {
    holidays,
    addHoliday,
    removeHoliday,
    updateHoliday,
    error,
    clearError,
    getCount,
  } = useHolidays(year);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDate, setEditingDate] = useState<Date | null>(null);
  const [formData, setFormData] = useState({
    date: "",
    name: "",
  });

  const resetForm = () => {
    setFormData({ date: "", name: "" });
    setEditingDate(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (holiday: Holiday) => {
    const dateStr = `${year?.value}-${String(holiday.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(holiday.getDayOfMonth()).padStart(2, "0")}`;
    setFormData({
      date: dateStr,
      name: holiday.name,
    });
    setEditingDate(holiday.date);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
    clearError();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.date) {
      return;
    }

    const [yearNum, month, day] = formData.date.split("-").map(Number);
    const dateObj = new Date(yearNum, month - 1, day);

    const holidayResult = Holiday.create({
      date: dateObj,
      name: formData.name,
    });

    if (holidayResult.isFailure()) {
      // Error handling
      return;
    }

    const holiday = holidayResult.getValue();
    let success: boolean;

    if (editingDate) {
      success = updateHoliday(editingDate, holiday);
    } else {
      success = addHoliday(holiday);
    }

    if (success) {
      closeModal();
    }
  };

  const handleDelete = (date: Date) => {
    if (confirm("¿Estás seguro de que quieres eliminar este festivo?")) {
      removeHoliday(date);
    }
  };

  if (!year) {
    return (
      <div className={`text-gray-500 dark:text-gray-400 ${className}`}>
        Selecciona un año primero para gestionar festivos
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
            Festivos del año {year.value}
          </h3>
          {getCount() > 0 && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total: {getCount()} festivos
            </p>
          )}
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Añadir festivo
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg flex items-start justify-between">
          <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
          <button
            onClick={clearError}
            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Holidays list */}
      {getCount() === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
          <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-600" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No hay festivos añadidos
          </p>
          <button
            onClick={openAddModal}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Añade el primer festivo
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {holidays.map((holiday, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📅</span>
                  <div>
                    <div className="font-medium text-gray-800 dark:text-gray-200">
                      {holiday.getFormattedDate()}
                      {holiday.hasName() && (
                        <span className="ml-2 text-gray-600 dark:text-gray-400">
                          - {holiday.name}
                        </span>
                      )}
                    </div>
                    <div className="text-sm mt-1 text-gray-500 dark:text-gray-400">
                      Festivo oficial
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(holiday)}
                  className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                  title="Editar"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(holiday.date)}
                  className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0  flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                {editingDate ? "Editar festivo" : "Añadir festivo"}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Date input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fecha *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  min={`${year.value}-01-01`}
                  max={`${year.value}-12-31`}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>

              {/* Name input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre (opcional)
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Ej: Día de la Constitución"
                  maxLength={100}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {formData.name.length}/100 caracteres
                </p>
              </div>

              {/* Info message */}
              <div className="p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  ℹ️ Si este festivo coincide con un día de trabajo según tu
                  ciclo, se aplicarán las horas de festivo configuradas.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
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
                  {editingDate ? "Actualizar" : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
