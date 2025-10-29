# Prompt v0.dev - Year Selector Component (Paso 2 del Wizard)

## Contexto del Proyecto

Estás diseñando el **Paso 2** de un wizard multi-paso para configuración de calendario laboral. Este componente permite al usuario seleccionar el año de referencia para su calendario.

## Requisitos Funcionales (HU-001)

### Reglas de Negocio
- **Año por defecto**: Año actual seleccionado automáticamente
- **Rango válido**: Año actual - 2 hasta año actual + 5
  - Ejemplo en 2025: rango de 2023 a 2030 (8 años en total)
- **Validación**: El año debe estar dentro del rango permitido
- **Feedback visual**: Mostrar claramente qué año está seleccionado
- **Indicador especial**: Marcar visualmente el año actual

### Información Adicional
- El año seleccionado determina si es bisiesto (366 o 365 días)
- Esta selección afecta todo el calendario generado posteriormente

## Stack Tecnológico

- **Framework**: Next.js 15+ (App Router), React 18+, TypeScript
- **Estilos**: Tailwind CSS v4 con oklch color space
- **Componentes**: shadcn/ui (Card, Button, Badge, Alert, etc.)
- **Animaciones**: Framer Motion (sutiles, profesionales)
- **Iconos**: Lucide React
- **Modo**: Dark mode compatible

## Diseño Propuesto

### Opción Visual: Grid de Cards

En lugar de un simple dropdown, crea un diseño más visual e interactivo:

1. **Layout Principal**
   - Card contenedor principal con header descriptivo
   - Grid responsive de años (3 columnas en desktop, 2 en tablet, 1 en mobile)
   - Cada año es una card/botón seleccionable

2. **Año Card Individual**
   - Botón grande y clicable
   - Número del año prominente (texto grande, bold)
   - Badge "Actual" para el año corriente
   - Icono calendar/calendario
   - Estado visual claro:
     - **No seleccionado**: outline, bg-transparent
     - **Seleccionado**: bg-primary, ring-2, scale ligeramente mayor
     - **Hover**: border-primary/50, scale 1.02
   - Animación suave al cambiar de selección (framer-motion)

3. **Información Adicional**
   - Badge mostrando si es año bisiesto (366 días) o regular (365 días)
   - Texto auxiliar explicando el rango disponible

4. **Estados y Feedback**
   - Alert de éxito cuando hay selección válida (color verde suave)
   - Highlight visual en el año actual aunque no esté seleccionado
   - Transiciones suaves entre estados

## Estructura del Componente

```typescript
interface YearSelectorProps {
  initialYear?: number;        // Año inicial (por defecto: actual)
  onYearChange?: (year: number) => void;  // Callback al cambiar
  className?: string;
}
```

## Ejemplo Visual (Estructura HTML/JSX)

```jsx
<Card>
  <CardHeader>
    <CardTitle>
      <CalendarIcon /> Selecciona el Año de Referencia
    </CardTitle>
    <CardDescription>
      Este año determinará tu calendario laboral completo
    </CardDescription>
  </CardHeader>

  <CardContent className="space-y-6 pb-6">
    {/* Grid de años */}
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {yearOptions.map((year) => (
        <motion.div
          key={year}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            variant={selectedYear === year ? "default" : "outline"}
            className={/* estilos según estado */}
            onClick={() => selectYear(year)}
          >
            {/* Badge "Actual" si corresponde */}
            {year === currentYear && <Badge>Actual</Badge>}

            {/* Número del año (grande) */}
            <span className="text-2xl font-bold">{year}</span>

            {/* Info días (bisiesto o no) */}
            <span className="text-xs">
              {isLeapYear(year) ? "366 días" : "365 días"}
            </span>
          </Button>
        </motion.div>
      ))}
    </div>

    {/* Info adicional */}
    <div className="text-center text-sm text-muted-foreground">
      <p>Rango disponible: {minYear} - {maxYear}</p>
    </div>

    {/* Alert de éxito cuando hay selección */}
    {selectedYear && (
      <Alert className="border-green-500/50 bg-green-500/10">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertDescription>
          Año seleccionado: {selectedYear}
          {isLeapYear(selectedYear) && " (año bisiesto)"}
        </AlertDescription>
      </Alert>
    )}
  </CardContent>
</Card>
```

## Estilo y Espaciado

### Colores y Temas
- **Año seleccionado**: `bg-primary text-primary-foreground ring-2 ring-primary/20`
- **Año actual (badge)**: `badge-secondary` o color especial
- **Hover**: `hover:border-primary/50 hover:scale-102`
- **Bisiesto**: Badge con icono especial o color diferenciado

### Spacing Importante
- `space-y-6` en contenedor principal (mejor respiración)
- `pb-6` en CardContent (evitar corte en wizard)
- `gap-3` o `gap-4` en grid (separación entre cards)
- Padding generoso en cada year card (`p-4` o `p-6`)

### Animaciones (Framer Motion)
```jsx
// Animación de entrada
initial={{ opacity: 0, scale: 0.9 }}
animate={{ opacity: 1, scale: 1 }}
transition={{ duration: 0.2 }}

// Hover suave
whileHover={{ scale: 1.02 }}
whileTap={{ scale: 0.98 }}
```

## Iconografía Sugerida

- **Calendar**: para el header o cada year card
- **CheckCircle2**: para indicar selección/validación
- **Sparkles** o **Star**: para marcar el año actual
- **Info**: tooltip/ayuda sobre años bisiestos

## Comportamiento Interactivo

1. **Al cargar**: Año actual preseleccionado automáticamente
2. **Al hacer clic en un año**:
   - Deseleccionar año anterior (animación de salida)
   - Seleccionar nuevo año (animación de entrada)
   - Llamar `onYearChange` con el nuevo valor
3. **Keyboard navigation**: Soporte para flechas y Enter (accesibilidad)
4. **Mobile**: Grid adaptado a 1-2 columnas, botones con buen tamaño táctil

## Responsive Design

### Mobile (< 640px)
```jsx
grid-cols-2 gap-3
text-xl (tamaño año)
p-3 (padding cards)
```

### Tablet (640px - 1024px)
```jsx
md:grid-cols-3 md:gap-4
md:text-2xl
md:p-4
```

### Desktop (> 1024px)
```jsx
lg:grid-cols-4 lg:gap-4
lg:text-3xl
lg:p-6
```

## Ejemplo de Datos

```typescript
const currentYear = 2025;
const yearRange = {
  min: 2023,    // currentYear - 2
  max: 2030,    // currentYear + 5
};

const yearOptions = [2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030];

// Años bisiestos en el rango: 2024, 2028
```

## Referencias de Estilo (Componente Anterior)

Mantén consistencia con el WorkCycleConfigurator del Paso 1:
- Misma paleta de colores (primary, secondary, muted)
- Mismo estilo de Cards (border, shadow, radius)
- Mismas animaciones (duración, easing)
- Mismo tamaño y peso de fuentes para titles/descriptions
- Mismo spacing vertical (space-y-8 entre secciones principales)

## Accesibilidad

- `aria-pressed` en botones de año (true/false)
- `aria-label` descriptivos
- `role="radiogroup"` para el grupo de años
- `role="radio"` para cada botón de año
- Soporte completo de teclado (Tab, Enter, Space, Arrow keys)

## Notas Adicionales

- **NO uses un dropdown select nativo** - queremos algo más visual y moderno
- **Prioriza UX**: el año actual debe destacar visualmente aunque no esté seleccionado
- **Animaciones sutiles**: nada exagerado, mantener profesionalidad
- **Performance**: Usar `useMemo` para calcular años si es necesario
- **Consistencia**: Sigue exactamente el patrón de diseño del Paso 1 (WorkCycle)

---

## Output Esperado

Genera el código React/TypeScript completo para el componente `YearSelector` con:
1. Imports necesarios (shadcn/ui, framer-motion, lucide-react)
2. Interface de props
3. Componente funcional con estado y lógica
4. JSX con el diseño descrito
5. Estilos Tailwind inline
6. Comentarios explicativos breves

**Nota**: Este componente será usado dentro de un wizard (WizardStepper) que maneja navegación. Solo preocúpate del UI del selector en sí.
