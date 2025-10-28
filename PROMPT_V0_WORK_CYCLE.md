# Prompt para v0.dev: Mejorar WorkCycleConfigurator

## Contexto del Proyecto
Aplicación de calendario laboral con tema **blanco/negro** (se invierte en dark mode). Usa **Tailwind CSS v4**, **shadcn/ui**, y **Next.js 15**.

## Paleta de Colores
- **Light mode**: Fondo blanco, texto negro, primario negro
- **Dark mode**: Fondo negro, texto blanco, primario blanco
- Estados: Verde (success), Naranja (warning), Rojo (destructive)

## Componente Actual
**Ubicación**: `src/presentation/components/work-cycle-configurator.tsx`

### Funcionalidad
El componente permite configurar el ciclo de trabajo del usuario con dos modos:

1. **Modo Semanal**: Grid de 7 días (L-D) con checkboxes para marcar días trabajados
2. **Modo Por Partes**: Define bloques de trabajo/descanso (ej: 4 trabajo, 2 descanso)

### Props
```typescript
interface WorkCycleConfiguratorProps {
  onConfigurationChange?: (isValid: boolean) => void;
  onCycleConfigured?: (cycle: WorkCycle) => void;
  className?: string;
}
```

### Hook usado
```typescript
const { state, configureWeekly, configureParts } = useWorkCycle();

// state contiene:
// - cycle: WorkCycle | null
// - mode: CycleMode | null
// - errors: string[]
// - isValid: boolean
```

## Estructura Actual

### 1. Selector de Modo (Radio buttons)
- ✅ "Semanal (7 días)" con descripción
- ✅ "Por partes (bloques)" con descripción

### 2. Modo Semanal
- Grid de 7 botones (L, M, X, J, V, S, D)
- Toggle visual: azul cuando seleccionado, gris cuando no
- Contador de días marcados

### 3. Modo Por Partes
- Selector de plantillas predefinidas:
  - 4-2, 6-3, 6-2, 6-3-6-3-6-3-6-2, Personalizado
- Lista de partes con inputs para días trabajo/descanso
- Botones para añadir/eliminar partes
- Info box con ejemplo

### 4. Feedback
- Errores en rojo si validación falla
- Success box verde cuando configuración válida
- Muestra el ciclo configurado con descripción

## Objetivo de Mejora Estética

Quiero que **mantengas toda la funcionalidad exacta** pero mejores visualmente:

### Diseño deseado:
1. **Más moderno y minimalista** (aprovechando el tema B/N)
2. **Mejor espaciado y jerarquía visual**
3. **Animaciones sutiles** (usa framer-motion si lo necesitas)
4. **Cards/secciones bien definidas** (usa shadcn Card)
5. **Iconos modernos** (usa lucide-react)
6. **Estados hover/active más claros**
7. **Responsive mejorado** (móvil primero)

### Componentes shadcn disponibles:
- `Button`, `Card`, `Badge`, `Progress`, `Separator`
- Importa desde: `@/src/presentation/components/ui/...`

### Mantener:
- ✅ Toda la lógica de negocio (handlers, validaciones)
- ✅ Todas las props y callbacks
- ✅ Hook `useWorkCycle()`
- ✅ Estados locales (weeklyMask, parts, selectedTemplate)
- ✅ Plantillas predefinidas
- ✅ Mensajes de error/éxito

### NO cambiar:
- ❌ Nombres de funciones/variables
- ❌ Estructura de estado
- ❌ Lógica de validación
- ❌ Props del componente

## Sugerencias de Mejora Visual

1. **Radio buttons**: Usar cards clicables en lugar de inputs radio básicos
2. **Grid de días**: Botones más grandes, con animaciones de escala al hacer clic
3. **Modo partes**: Cards con mejor contraste, iconos para trabajo/descanso
4. **Template selector**: Usar radio cards en lugar de select dropdown
5. **Botón añadir parte**: Usar componente Button de shadcn con icono Plus
6. **Success/Error**: Usar Alert component con iconos apropiados
7. **Transitions**: Fade in/out al cambiar de modo

## Código Actual Completo

```typescript
// [Aquí iría el código completo del componente]
// Ver archivo: src/presentation/components/work-cycle-configurator.tsx
```

## Entrega Esperada

Un componente React con:
- ✅ Misma interfaz (props, exports)
- ✅ Misma funcionalidad
- ✅ Diseño moderno y profesional B/N
- ✅ Usa componentes shadcn/ui
- ✅ Animaciones sutiles
- ✅ Totalmente responsive
- ✅ Accesible (ARIA labels, keyboard navigation)

## Notas Adicionales

- El componente se usa dentro de un wizard (WizardStepper)
- Debe verse bien tanto en light como dark mode
- Los usuarios son trabajadores configurando su calendario laboral
- La experiencia debe ser clara y sin confusión
