"use client";

import { useState } from "react";
import {
  WizardData,
  WizardStep,
  WizardStepper,
} from "../components/wizzard/wizzardStepper";
import { WorkCycleConfigurator } from "../components";

// Placeholder components for each step
function WorkCycleConfiguratorF() {
  return (
    <div className="space-y-4">
      <p className="text-muted-foreground">
        Configura tu ciclo de trabajo aquí
      </p>
      <WorkCycleConfigurator />
    </div>
  );
}

function YearSelector() {
  return (
    <div className="space-y-4">
      <p className="text-muted-foreground">Selecciona el año de referencia</p>
      {/* Component implementation will go here */}
    </div>
  );
}

function EmploymentStatusSelector() {
  return (
    <div className="space-y-4">
      <p className="text-muted-foreground">Define tu situación laboral</p>
      {/* Component implementation will go here */}
    </div>
  );
}

function WorkingHoursConfigurator() {
  return (
    <div className="space-y-4">
      <p className="text-muted-foreground">Configura tus horas de trabajo</p>
      {/* Component implementation will go here */}
    </div>
  );
}

function AnnualContractHoursConfigurator() {
  return (
    <div className="space-y-4">
      <p className="text-muted-foreground">
        Define las horas de convenio anual
      </p>
      {/* Component implementation will go here */}
    </div>
  );
}

function HolidayManager() {
  return (
    <div className="space-y-4">
      <p className="text-muted-foreground">Gestiona los festivos del año</p>
      {/* Component implementation will go here */}
    </div>
  );
}

function VacationManager() {
  return (
    <div className="space-y-4">
      <p className="text-muted-foreground">Gestiona tus vacaciones</p>
      {/* Component implementation will go here */}
    </div>
  );
}

function ConfigurationSummary() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold">¡Configuración Completada!</h3>
        <p className="text-muted-foreground">
          Revisa el resumen de tu calendario laboral
        </p>
      </div>
      {/* Summary details will go here */}
    </div>
  );
}

export function CalendarWizard() {
  const [wizardData, setWizardData] = useState({});
  const [showSummary, setShowSummary] = useState({});

  const steps: WizardStep[] = [
    {
      id: "workCycle",
      title: "Ciclo de Trabajo",
      description: "Define tu patrón de trabajo semanal",
      component: <WorkCycleConfiguratorF />,
      isValid: true, // Will be controlled by the actual component
    },
    {
      id: "year",
      title: "Año de Referencia",
      description: "Selecciona el año para tu calendario",
      component: <YearSelector />,
      isValid: true,
    },
    {
      id: "employmentStatus",
      title: "Situación Laboral",
      description: "Indica tu situación laboral actual",
      component: <EmploymentStatusSelector />,
      isValid: true,
    },
    {
      id: "workingHours",
      title: "Horas de Trabajo",
      description: "Configura tu jornada laboral diaria",
      component: <WorkingHoursConfigurator />,
      isValid: true,
    },
    {
      id: "annual-hours",
      title: "Horas de Convenio Anual",
      description: "Define las horas según tu convenio",
      component: <AnnualContractHoursConfigurator />,
      isValid: true,
    },
    {
      id: "holidays",
      title: "Festivos del Año",
      description: "Marca los días festivos aplicables",
      component: <HolidayManager />,
      isValid: true,
    },
    {
      id: "vacations",
      title: "Vacaciones del Año",
      description: "Planifica tus períodos de vacaciones",
      component: <VacationManager />,
      isValid: true,
    },
  ];

  const handleComplete = (data: WizardData) => {
    setWizardData(data);
    console.log("Wizard completed with data:", wizardData);
    // Here you would typically save the configuration or navigate to summary
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
          <ConfigurationSummary />
        )}
      </div>
    </div>
  );
}
