# Componentes de la Aplicación

Documentación de los componentes React implementados en la aplicación.

## Índice

- [Providers](#providers)
- [Componentes de Presentación](#componentes-de-presentación)
- [Páginas](#páginas)

---

## Providers

### ThemeProvider

**Ubicación:** `src/application/providers/theme-provider.tsx`

Proveedor que envuelve la aplicación para habilitar soporte de temas claro/oscuro usando `next-themes`.

**Props:**
- `children`: React.ReactNode - Componentes hijos
- Todas las props de `next-themes`

**Configuración en uso:**
```tsx
<ThemeProvider
  attribute="class"
  defaultTheme="system"
  enableSystem
  disableTransitionOnChange
>
  {children}
</ThemeProvider>
```

**Características:**
- Soporte para temas: `light`, `dark`, `system`
- Persistencia en localStorage
- Sin flash en carga (SSR compatible)
- Usa estrategia de clase `.dark` en el HTML

---

## Componentes de Presentación

### YearSelector

**Ubicación:** `src/presentation/components/year-selector.tsx`
**Historia de Usuario:** HU-001

Selector de año con validación para configurar el año de referencia del calendario.

**Props:**
```typescript
interface YearSelectorProps {
  initialYear?: number;           // Año inicial (opcional)
  onYearChange?: (year: number) => void;  // Callback al cambiar año
  className?: string;              // Clases CSS adicionales
}
```

**Características:**
- Rango de años: actual -2 a actual +5
- Año actual seleccionado por defecto
- Validación automática
- Notifica al padre en mount y al cambiar
- Soporte dark mode

**Hook asociado:** `useYearSelection`

**Ejemplo de uso:**
```tsx
<YearSelector
  onYearChange={(year) => handleYearChange(year)}
  className="mb-4"
/>
```

---

### WorkCycleConfigurator

**Ubicación:** `src/presentation/components/work-cycle-configurator.tsx`
**Historia de Usuario:** HU-003

Configurador de ciclo laboral con dos modos: semanal y por partes.

**Props:**
```typescript
interface WorkCycleConfiguratorProps {
  onConfigurationChange?: (isValid: boolean) => void;  // Callback de validación
  onCycleConfigured?: (cycle: WorkCycle) => void;      // Callback con ciclo configurado
  className?: string;
}
```

**Modos soportados:**

1. **Modo Semanal**
   - Máscara de 7 días (Lunes a Domingo)
   - Botones visuales para cada día
   - Selección múltiple de días de trabajo

2. **Modo Por Partes**
   - Bloques personalizados trabajo/descanso
   - Soporte para múltiples partes
   - Ejemplos: 4-2, 6-3, 6-3-6-2, etc.
   - Gestión dinámica de partes (añadir/eliminar)

**Hook asociado:** `useWorkCycle`

**Características:**
- Validación en tiempo real
- Feedback visual de estado
- Descripción generada automáticamente
- Soporte dark mode
- Previene loops infinitos con useRef

**Ejemplo de uso:**
```tsx
<WorkCycleConfigurator
  onConfigurationChange={(isValid) => setValid(isValid)}
  onCycleConfigured={(cycle) => setCycle(cycle)}
/>
```

---

### EmploymentStatusSelector

**Ubicación:** `src/presentation/components/employment-status-selector.tsx`
**Historia de Usuario:** HU-002

Selector de situación laboral al inicio del año (empezó este año vs ya trabajaba antes).

**Props:**
```typescript
interface EmploymentStatusSelectorProps {
  year: Year;                      // Año de referencia (obligatorio)
  workCycle: WorkCycle;           // Ciclo configurado (obligatorio)
  onConfigurationChange?: (isValid: boolean) => void;
  className?: string;
}
```

**Opciones:**

1. **"Empecé este año"**
   - Input de fecha de inicio de contrato
   - Validación de rango (dentro del año seleccionado)

2. **"Ya trabajaba antes"**
   - Selector de parte del ciclo (solo modo partes)
   - Selector de día dentro de la parte
   - Validación contra ciclo configurado
   - Información contextual del ciclo

**Hook asociado:** `useEmploymentStatus`

**Características:**
- Validación contra ciclo configurado
- Información contextual según ciclo
- Feedback visual de errores
- Soporte dark mode
- Optimizado para evitar loops infinitos

**Ejemplo de uso:**
```tsx
<EmploymentStatusSelector
  year={yearObject}
  workCycle={workCycle}
  onConfigurationChange={(isValid) => setValid(isValid)}
/>
```

---

### ThemeToggle

**Ubicación:** `src/presentation/components/theme-toggle.tsx`
**Historia de Usuario:** HU-032

Toggle para cambiar entre tema claro y oscuro.

**Props:** Ninguna (componente autocontenido)

**Características:**
- Iconos: Sol (modo claro) / Luna (modo oscuro)
- Accesible por teclado
- Tooltip descriptivo
- Previene hydration mismatch
- Transiciones suaves
- Soporte screen readers

**Ejemplo de uso:**
```tsx
<ThemeToggle />
```

---

## Páginas

### CalendarConfigPage

**Ubicación:** `src/presentation/pages/calendar-config-page.tsx`

Página principal de configuración del calendario que orquesta todos los componentes.

**Flujo de configuración:**

1. **Ciclo de Trabajo** (WorkCycleConfigurator)
   - Usuario configura su patrón laboral

2. **Año de Referencia** (YearSelector)
   - Aparece solo si el ciclo es válido
   - Usuario selecciona el año

3. **Situación Laboral** (EmploymentStatusSelector)
   - Aparece solo si año y ciclo están configurados
   - Usuario indica si empezó este año o ya trabajaba

**Estado gestionado:**
```typescript
- workCycle: WorkCycle | null
- workCycleValid: boolean
- selectedYear: number | null
- yearObject: Year | null
- employmentStatusValid: boolean
```

**Características:**
- Flujo progresivo (cada paso desbloquea el siguiente)
- Validación en cascada
- Feedback visual por paso
- Callbacks memoizados con useCallback
- Soporte dark mode completo

---

## Convenciones de Componentes

### Estructura de archivos
```
component-name.tsx          # Componente principal
├── Props interface         # TypeScript interface para props
├── Component function      # Componente React FC
└── Export                  # Named export
```

### Nomenclatura
- **Archivos**: `kebab-case.tsx`
- **Componentes**: `PascalCase`
- **Props**: `ComponentNameProps`
- **Hooks**: `useFeatureName`

### Estilos
- **Framework**: Tailwind CSS v4
- **Dark mode**: Clases `dark:` en todos los componentes
- **Transiciones**: `transition-colors duration-200`
- **Paleta neutra**: Grises en lugar de blancos/negros puros

### Accesibilidad
- Labels para todos los inputs
- ARIA attributes apropiados
- Soporte de teclado
- Contraste WCAG AA mínimo

---

## Hooks de Aplicación

### useYearSelection

**Ubicación:** `src/application/hooks/use-year-selection.ts`

Hook para gestionar la selección y validación de año.

**Retorno:**
```typescript
{
  selectedYear: number;
  error: string | null;
  isValid: boolean;
  yearRange: YearRange;
  selectYear: (year: number) => void;
  resetToCurrentYear: () => void;
}
```

### useWorkCycle

**Ubicación:** `src/application/hooks/use-work-cycle.ts`

Hook para gestionar la configuración del ciclo laboral.

**Retorno:**
```typescript
{
  state: {
    cycle: WorkCycle | null;
    isValid: boolean;
    errors: string[];
  };
  configureWeekly: (mask: WeeklyMask) => void;
  configureParts: (parts: CyclePart[]) => void;
}
```

### useEmploymentStatus

**Ubicación:** `src/application/hooks/use-employment-status.ts`

Hook para gestionar la situación laboral y offset.

**Retorno:**
```typescript
{
  state: {
    status: EmploymentStatus | null;
    contractStartDate: ContractStartDate | null;
    cycleOffset: CycleOffset | null;
    errors: string[];
    isValid: boolean;
  };
  selectStatus: (type: EmploymentStatusType) => void;
  setContractStartDate: (date: Date) => void;
  setCycleOffset: (offset: CycleOffsetInput) => void;
  validateConfiguration: (year: Year) => ValidationResult;
  reset: () => void;
}
```

---

## Buenas Prácticas Implementadas

1. **Separación de responsabilidades**: Componentes visuales solo manejan UI
2. **Lógica en hooks**: Toda la lógica de negocio en hooks de aplicación
3. **Validación en tiempo real**: Feedback inmediato al usuario
4. **Callbacks memoizados**: Evita re-renders innecesarios
5. **Prevención de loops**: useRef para rastrear cambios previos
6. **Accesibilidad**: WCAG AA en todos los componentes
7. **Dark mode**: Soporte completo y consistente
8. **TypeScript estricto**: Tipos completos en todas las interfaces
