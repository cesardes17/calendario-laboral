"use client";

import { useState, useCallback, useEffect } from "react";
import {
  WizardData,
  WizardStep,
  WizardStepper,
} from "../components/wizzard/wizzardStepper";
import {
  WorkCycleConfigurator,
  YearSelector,
  ContractStartConfigurator,
  WorkingHoursConfigurator,
  AnnualContractHoursConfigurator,
  HolidayManagerConfigurator,
  VacationManagerConfigurator,
  ConfigurationReviewConfigurator,
} from "../components";
import { WorkCycle } from "@/src/core/domain/workCycle";
import { Holiday } from "@/src/core/domain/holiday";
import { VacationPeriod } from "@/src/core/domain/vacationPeriod";
import type { WorkingHoursConfig } from "@/src/core/domain/workingHours";
import type { ContractStartConfig } from "../components/contractStart/contractStartConfigurator";
import { motion } from "framer-motion";
import { CheckCircle2, Calendar, ArrowLeft, AlertCircle, Upload, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";

// Configuration Summary
function ConfigurationSummaryContent() {
  return (
    <div className="space-y-8">
      {/* Success Header */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-4"
      >
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 mb-4">
          <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-4xl font-bold text-balance">
          ¡Configuración Completada!
        </h1>
        <p className="text-lg text-muted-foreground text-balance max-w-2xl mx-auto">
          Tu calendario laboral ha sido configurado exitosamente. Ya puedes
          generar tu calendario anual.
        </p>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {[
          { icon: "📅", label: "Ciclo de Trabajo", value: "Configurado" },
          {
            icon: "🗓️",
            label: "Año Seleccionado",
            value: new Date().getFullYear(),
          },
          { icon: "📝", label: "Inicio de Contrato", value: "Configurado" },
          { icon: "⏰", label: "Horas de Trabajo", value: "Configuradas" },
          { icon: "📊", label: "Horas de Convenio", value: "Configuradas" },
          { icon: "🎉", label: "Festivos y Vacaciones", value: "Añadidos" },
        ].map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
          >
            <div className="p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors">
              <div className="text-2xl mb-2">{item.icon}</div>
              <h3 className="font-semibold text-sm text-foreground">
                {item.label}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">{item.value}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="flex flex-col sm:flex-row gap-4 justify-center"
      >
        <button className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 font-medium transition-colors">
          <Calendar className="h-5 w-5" />
          Ver Calendario
        </button>
        <button className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md border border-input bg-background hover:bg-muted font-medium transition-colors">
          <ArrowLeft className="h-5 w-5" />
          Editar Configuración
        </button>
      </motion.div>

      {/* Next Steps Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="max-w-2xl mx-auto"
      >
        <div className="p-6 rounded-lg border border-blue-500/30 bg-blue-500/5">
          <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
            <span className="text-blue-600 dark:text-blue-400">ℹ️</span>
            Próximos Pasos
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">1.</span>
              <span>
                Revisa tu calendario laboral completo con todos los días
                marcados
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">2.</span>
              <span>Descarga tu configuración para futuras referencias</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">3.</span>
              <span>
                Calcula tu balance de horas trabajadas vs. horas de convenio
              </span>
            </li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
}

export function CalendarWizard() {
  const [wizardData, setWizardData] = useState({});
  const [showSummary, setShowSummary] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [hasStoredConfig, setHasStoredConfig] = useState(false);

  // Store work cycle for dependent steps
  const [workCycle, setWorkCycle] = useState<WorkCycle | null>(null);

  // Store configuration data from each step
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [contractStartConfig, setContractStartConfig] = useState<ContractStartConfig | null>(null);
  const [workingHoursConfig, setWorkingHoursConfig] = useState<WorkingHoursConfig | null>(null);
  const [annualHours, setAnnualHours] = useState<number | null>(null);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [vacations, setVacations] = useState<VacationPeriod[]>([]);

  // Track validation state for each step
  const [stepsValidation, setStepsValidation] = useState({
    workCycle: false,
    year: true, // Year has default value, so it starts valid
    contractStart: false, // Contract start requires configuration
    workingHours: true, // Working hours has default values (8h all), starts valid
    annualHours: true, // Always valid, starts valid
    holidays: true, // Always valid, starts valid
    vacations: true, // Always valid, starts valid
    review: false, // Review requires user confirmation
  });

  // Stable callbacks for each step (won't change on re-render)
  const handleWorkCycleValidation = useCallback((isValid: boolean) => {
    setStepsValidation((prev) => ({ ...prev, workCycle: isValid }));
  }, []);

  const handleWorkCycleConfigured = useCallback((cycle: WorkCycle) => {
    setWorkCycle(cycle);
  }, []);

  const handleYearValidation = useCallback(() => {
    setStepsValidation((prev) => ({ ...prev, year: true }));
  }, []);

  const handleYearChange = useCallback((year: number) => {
    setSelectedYear(year);
  }, []);

  const handleContractStartChange = useCallback((config: ContractStartConfig) => {
    setContractStartConfig(config);
  }, []);

  const handleWorkingHoursChange = useCallback((config: WorkingHoursConfig) => {
    setWorkingHoursConfig(config);
  }, []);

  const handleAnnualHoursChange = useCallback((hours: number) => {
    setAnnualHours(hours);
  }, []);

  const handleHolidaysChange = useCallback((holidayList: Holiday[]) => {
    setHolidays(holidayList);
  }, []);

  const handleVacationsChange = useCallback((vacationList: VacationPeriod[]) => {
    setVacations(vacationList);
  }, []);

  const handleContractStartValidation = useCallback((isValid: boolean) => {
    setStepsValidation((prev) => ({ ...prev, contractStart: isValid }));
  }, []);

  const handleWorkingHoursValidation = useCallback((isValid: boolean) => {
    setStepsValidation((prev) => ({ ...prev, workingHours: isValid }));
  }, []);

  const handleAnnualHoursValidation = useCallback((isValid: boolean) => {
    setStepsValidation((prev) => ({ ...prev, annualHours: isValid }));
  }, []);

  const handleHolidaysValidation = useCallback((isValid: boolean) => {
    setStepsValidation((prev) => ({ ...prev, holidays: isValid }));
  }, []);

  const handleVacationsValidation = useCallback((isValid: boolean) => {
    setStepsValidation((prev) => ({ ...prev, vacations: isValid }));
  }, []);

  const handleReviewValidation = useCallback((isValid: boolean) => {
    setStepsValidation((prev) => ({ ...prev, review: isValid }));
  }, []);

  // Check for saved configuration on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('calendarWizardData');
    if (savedConfig) {
      setHasStoredConfig(true);
      setShowLoadDialog(true);
    }
  }, []);

  // Load configuration from localStorage
  const handleLoadConfiguration = useCallback(() => {
    try {
      const savedConfig = localStorage.getItem('calendarWizardData');
      if (!savedConfig) {
        setShowLoadDialog(false);
        return;
      }

      const data = JSON.parse(savedConfig);

      // Restore year
      if (data.selectedYear) {
        setSelectedYear(data.selectedYear);
      }

      // Restore work cycle
      if (data.workCycle) {
        if (data.workCycle.mode === 'WEEKLY' && data.workCycle.data.weeklyMask) {
          const cycleResult = WorkCycle.createWeekly(data.workCycle.data.weeklyMask);
          if (cycleResult.isSuccess()) {
            setWorkCycle(cycleResult.getValue());
            setStepsValidation((prev) => ({ ...prev, workCycle: true }));
          }
        } else if (data.workCycle.mode === 'PARTS' && data.workCycle.data.parts) {
          const cycleResult = WorkCycle.createParts(data.workCycle.data.parts);
          if (cycleResult.isSuccess()) {
            setWorkCycle(cycleResult.getValue());
            setStepsValidation((prev) => ({ ...prev, workCycle: true }));
          }
        }
      }

      // Restore contract start
      if (data.contractStart) {
        setContractStartConfig(data.contractStart);
        setStepsValidation((prev) => ({ ...prev, contractStart: true }));
      }

      // Restore working hours
      if (data.workingHours) {
        setWorkingHoursConfig(data.workingHours);
        setStepsValidation((prev) => ({ ...prev, workingHours: true }));
      }

      // Restore annual hours
      if (data.annualHours) {
        setAnnualHours(data.annualHours);
        setStepsValidation((prev) => ({ ...prev, annualHours: true }));
      }

      // Restore holidays
      if (data.holidays && Array.isArray(data.holidays)) {
        const restoredHolidays: Holiday[] = [];
        data.holidays.forEach((h: { date: string; name: string }) => {
          const holidayResult = Holiday.create({
            date: new Date(h.date),
            name: h.name,
          });
          if (holidayResult.isSuccess()) {
            restoredHolidays.push(holidayResult.getValue());
          }
        });
        setHolidays(restoredHolidays);
        setStepsValidation((prev) => ({ ...prev, holidays: true }));
      }

      // Restore vacations
      if (data.vacations && Array.isArray(data.vacations)) {
        const restoredVacations: VacationPeriod[] = [];
        data.vacations.forEach((v: { startDate: string; endDate: string; description: string }) => {
          const vacationResult = VacationPeriod.create({
            startDate: new Date(v.startDate),
            endDate: new Date(v.endDate),
            description: v.description,
          });
          if (vacationResult.isSuccess()) {
            restoredVacations.push(vacationResult.getValue());
          }
        });
        setVacations(restoredVacations);
        setStepsValidation((prev) => ({ ...prev, vacations: true }));
      }

      setShowLoadDialog(false);
      console.log('Configuration loaded from localStorage');
    } catch (error) {
      console.error('Error loading configuration:', error);
      setShowLoadDialog(false);
    }
  }, []);

  // Delete configuration and start fresh
  const handleDeleteConfiguration = useCallback(() => {
    try {
      localStorage.removeItem('calendarWizardData');
      setHasStoredConfig(false);
      setShowLoadDialog(false);
      console.log('Configuration deleted from localStorage');
    } catch (error) {
      console.error('Error deleting configuration:', error);
      setShowLoadDialog(false);
    }
  }, []);

  // Generate steps - only recreate when validation states actually change
  const steps: WizardStep[] = [
    {
      id: "workCycle",
      title: "Ciclo de Trabajo",
      description: "Define tu patrón de trabajo semanal",
      component: (
        <WorkCycleConfigurator
          onConfigurationChange={handleWorkCycleValidation}
          onCycleConfigured={handleWorkCycleConfigured}
        />
      ),
      isValid: stepsValidation.workCycle,
    },
    {
      id: "year",
      title: "Año de Referencia",
      description: "Selecciona el año para tu calendario",
      component: <YearSelector onYearChange={handleYearChange} />,
      isValid: stepsValidation.year,
    },
    {
      id: "contractStart",
      title: "Inicio de Contrato",
      description: "Indica cuándo comenzaste a trabajar",
      component: (
        <ContractStartConfigurator
          workCycle={workCycle}
          onConfigurationChange={handleContractStartValidation}
          onContractStartChange={handleContractStartChange}
        />
      ),
      isValid: stepsValidation.contractStart,
    },
    {
      id: "workingHours",
      title: "Horas de Trabajo",
      description: "Configura tu jornada laboral diaria",
      component: (
        <WorkingHoursConfigurator
          onConfigurationChange={handleWorkingHoursValidation}
          onChange={handleWorkingHoursChange}
        />
      ),
      isValid: stepsValidation.workingHours,
    },
    {
      id: "annualHours",
      title: "Horas de Convenio Anual",
      description: "Define las horas según tu convenio",
      component: (
        <AnnualContractHoursConfigurator
          onConfigurationChange={handleAnnualHoursValidation}
          onValidHours={handleAnnualHoursChange}
        />
      ),
      isValid: stepsValidation.annualHours,
    },
    {
      id: "holidays",
      title: "Festivos del Año",
      description: "Marca los días festivos aplicables",
      component: (
        <HolidayManagerConfigurator
          onConfigurationChange={handleHolidaysValidation}
          onHolidaysChange={handleHolidaysChange}
        />
      ),
      isValid: stepsValidation.holidays,
    },
    {
      id: "vacations",
      title: "Vacaciones del Año",
      description: "Planifica tus períodos de vacaciones",
      component: (
        <VacationManagerConfigurator
          onConfigurationChange={handleVacationsValidation}
          onVacationsChange={handleVacationsChange}
        />
      ),
      isValid: stepsValidation.vacations,
    },
    {
      id: "review",
      title: "Revisión Final",
      description: "Revisa y confirma tu configuración",
      component: (
        <ConfigurationReviewConfigurator
          stepsValidation={stepsValidation}
          onConfigurationChange={handleReviewValidation}
        />
      ),
      isValid: stepsValidation.review,
    },
  ];

  const handleComplete = (_data: WizardData) => {
    // Collect all configuration data
    const completeWizardData = {
      workCycle: workCycle ? {
        mode: workCycle.mode,
        data: workCycle.isWeekly()
          ? { weeklyMask: workCycle.getWeeklyMask() }
          : { parts: workCycle.getParts() }
      } : null,
      selectedYear,
      contractStart: contractStartConfig,
      workingHours: workingHoursConfig,
      annualHours,
      holidays: holidays.map(h => ({
        date: h.date.toISOString(),
        name: h.name,
      })),
      vacations: vacations.map(v => ({
        startDate: v.startDate.toISOString(),
        endDate: v.endDate.toISOString(),
        description: v.description,
      })),
    };

    console.log("Wizard completed with data:", completeWizardData);
    setWizardData(completeWizardData);

    // Save to localStorage
    try {
      localStorage.setItem('calendarWizardData', JSON.stringify(completeWizardData));
      console.log("Configuration saved to localStorage");
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }

    setShowSummary(true);
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {showSummary === false ? (
          <>
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-3 text-balance">
                Configuración de Calendario Laboral
              </h1>
              <p className="text-lg text-muted-foreground text-balance">
                Completa los siguientes pasos para personalizar tu calendario
              </p>
            </div>

            <WizardStepper steps={steps} onComplete={handleComplete} />
          </>
        ) : (
          <ConfigurationSummaryContent />
        )}
      </div>

      {/* Load Configuration Dialog */}
      {showLoadDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="max-w-lg w-full mx-4"
          >
            <Card className="border-2 shadow-2xl">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
                    <AlertCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Configuración Guardada Encontrada</CardTitle>
                  </div>
                </div>
                <CardDescription className="text-base">
                  Se ha detectado una configuración guardada anteriormente. ¿Qué deseas hacer?
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 pb-6">
                {/* Load Button */}
                <Button
                  onClick={handleLoadConfiguration}
                  className="w-full h-auto py-4 flex items-start gap-3 justify-start"
                  variant="default"
                >
                  <Upload className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <div className="text-left flex-1">
                    <div className="font-semibold text-base">Cargar Configuración</div>
                    <div className="text-sm font-normal text-primary-foreground/80 mt-1">
                      Continúa con los datos guardados de tu última sesión
                    </div>
                  </div>
                </Button>

                {/* Delete Button */}
                <Button
                  onClick={handleDeleteConfiguration}
                  className="w-full h-auto py-4 flex items-start gap-3 justify-start"
                  variant="outline"
                >
                  <Trash2 className="h-5 w-5 mt-0.5 flex-shrink-0 text-destructive" />
                  <div className="text-left flex-1">
                    <div className="font-semibold text-base">Empezar de Cero</div>
                    <div className="text-sm font-normal text-muted-foreground mt-1">
                      Borra la configuración guardada y comienza una nueva
                    </div>
                  </div>
                </Button>

                {/* Info */}
                <div className="text-xs text-muted-foreground text-center pt-2">
                  La configuración se guarda automáticamente al completar el asistente
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
}
