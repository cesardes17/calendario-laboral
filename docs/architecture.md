# Arquitectura del Proyecto

Documentación detallada de la arquitectura del Generador de Calendario Laboral por Ciclos.

## Índice

- [Visión General](#visión-general)
- [Clean Architecture](#clean-architecture)
- [Estructura de Directorios](#estructura-de-directorios)
- [Flujo de Datos](#flujo-de-datos)
- [Patrones Implementados](#patrones-implementados)
- [Decisiones Técnicas](#decisiones-técnicas)

---

## Visión General

El proyecto implementa **Clean Architecture** (Uncle Bob) adaptada para una aplicación Next.js con TypeScript. El objetivo es mantener la lógica de negocio independiente del framework y facilitar testing, mantenibilidad y escalabilidad.

### Principios Fundamentales

1. **Independencia del Framework**: La lógica de negocio no depende de Next.js/React
2. **Testeable**: La lógica puede testearse sin UI
3. **Independiente de UI**: La UI puede cambiar sin afectar la lógica
4. **Independiente de DB**: Fácil cambiar entre localStorage, API, etc.

---

## Clean Architecture

### Capas de la Arquitectura

```
┌─────────────────────────────────────────┐
│         Presentation Layer              │  ← UI Components (React)
│  (components, pages)                    │
├─────────────────────────────────────────┤
│         Application Layer               │  ← Hooks, Context
│  (hooks, providers)                     │
├─────────────────────────────────────────┤
│         Core Layer (Domain)             │  ← Business Logic
│  (domain, usecases)                     │
├─────────────────────────────────────────┤
│         Infrastructure Layer            │  ← External Adapters
│  (persistence, services)                │
└─────────────────────────────────────────┘
```

### Dirección de Dependencias

```
presentation → application → core ← infrastructure
```

**Regla de oro**: Las dependencias apuntan hacia adentro (hacia el core/domain)

---

## Estructura de Directorios

```
calendario-laboral/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Layout raíz con ThemeProvider
│   ├── page.tsx                 # Página principal
│   └── globals.css              # Estilos globales y Tailwind
│
├── src/
│   ├── core/                    # 🔵 CAPA DE DOMINIO
│   │   ├── domain/              # Entidades y Value Objects
│   │   │   ├── year.ts          # Value Object: Año
│   │   │   ├── work-cycle.ts    # Entity: Ciclo de trabajo
│   │   │   ├── employment-status.ts  # Entity: Situación laboral
│   │   │   └── contract-start-date.ts
│   │   │
│   │   └── usecases/            # Casos de Uso (lógica de negocio)
│   │       ├── select-year.usecase.ts
│   │       ├── configure-work-cycle.usecase.ts
│   │       └── configure-employment-status.usecase.ts
│   │
│   ├── application/             # 🟢 CAPA DE APLICACIÓN
│   │   ├── hooks/               # React Hooks (bridge UI ↔ Use Cases)
│   │   │   ├── use-year-selection.ts
│   │   │   ├── use-work-cycle.ts
│   │   │   └── use-employment-status.ts
│   │   │
│   │   └── providers/           # Context Providers
│   │       └── theme-provider.tsx
│   │
│   ├── presentation/            # 🟡 CAPA DE PRESENTACIÓN
│   │   ├── components/          # Componentes React
│   │   │   ├── year-selector.tsx
│   │   │   ├── work-cycle-configurator.tsx
│   │   │   ├── employment-status-selector.tsx
│   │   │   ├── theme-toggle.tsx
│   │   │   └── index.ts
│   │   │
│   │   └── pages/               # Páginas de aplicación
│   │       └── calendar-config-page.tsx
│   │
│   └── infrastructure/          # 🔴 CAPA DE INFRAESTRUCTURA
│       ├── persistence/         # Adaptadores de almacenamiento
│       │   └── local-storage.adapter.ts  # (futuro)
│       └── services/            # Servicios externos
│
├── docs/                        # Documentación
│   ├── architecture.md
│   ├── components.md
│   └── ...
│
├── context/                     # Contexto del proyecto
│   └── requerimientos.md        # Especificación funcional
│
└── CLAUDE.md                    # Guía para Claude Code
```

---

## Flujo de Datos

### Ejemplo: Selección de Año

```
┌──────────────────────────────────────────────────────────┐
│  1. USER INTERACTION                                      │
│  Usuario selecciona año en <YearSelector>                │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│  2. PRESENTATION LAYER                                    │
│  YearSelector.handleYearChange(2025)                     │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│  3. APPLICATION LAYER                                     │
│  useYearSelection.selectYear(2025)                       │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│  4. DOMAIN LAYER (Use Case)                              │
│  SelectYearUseCase.execute(2025)                         │
│    → Year.create(2025)  // Value Object                  │
│    → Valida rango, reglas de negocio                     │
│    → Retorna Result<Year>                                │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│  5. BACK TO APPLICATION                                   │
│  Hook actualiza estado con resultado                     │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│  6. UI UPDATE                                             │
│  React re-renderiza YearSelector                         │
│  Callback notifica al componente padre                   │
└──────────────────────────────────────────────────────────┘
```

---

## Patrones Implementados

### 1. Value Objects

Objetos inmutables que encapsulan validación y lógica de dominio.

**Ejemplo: Year**
```typescript
class Year {
  private constructor(public readonly value: number) {}

  static create(year: number): Result<Year> {
    if (year < MIN_YEAR || year > MAX_YEAR) {
      return Result.fail(`Año fuera de rango`);
    }
    return Result.ok(new Year(year));
  }

  isLeapYear(): boolean {
    // Lógica de negocio
  }
}
```

**Beneficios:**
- Validación en un solo lugar
- Imposible crear instancias inválidas
- Lógica de dominio encapsulada

### 2. Entities

Objetos con identidad que encapsulan comportamiento del dominio.

**Ejemplo: WorkCycle**
```typescript
class WorkCycle {
  private constructor(
    private mode: CycleMode,
    private config: WeeklyConfig | PartsConfig
  ) {}

  static createWeekly(mask: WeeklyMask): Result<WorkCycle> {
    // Validación y creación
  }

  getDisplayText(): string {
    // Lógica de presentación del dominio
  }
}
```

### 3. Use Cases

Encapsulan la lógica de negocio de una acción específica.

**Estructura típica:**
```typescript
class FeatureUseCase {
  execute(input: Input): Result<Output> {
    // 1. Validar input
    // 2. Ejecutar lógica de negocio
    // 3. Retornar resultado
  }
}
```

**Ejemplo: SelectYearUseCase**
```typescript
class SelectYearUseCase {
  execute(year: number): Result<Year> {
    const yearResult = Year.create(year);
    if (yearResult.isFailure()) {
      return Result.fail(yearResult.errorValue());
    }
    return Result.ok(yearResult.getValue());
  }

  getYearRange(): YearRange {
    const current = new Date().getFullYear();
    return { min: current - 2, max: current + 5, current };
  }
}
```

### 4. Result Pattern

Tipo de retorno para operaciones que pueden fallar.

```typescript
class Result<T> {
  private constructor(
    private success: boolean,
    private value?: T,
    private error?: string
  ) {}

  static ok<T>(value: T): Result<T>
  static fail<T>(error: string): Result<T>

  isSuccess(): boolean
  isFailure(): boolean
  getValue(): T
  errorValue(): string
}
```

**Beneficios:**
- No hay excepciones en el dominio
- Errores explícitos y manejables
- Type-safe error handling

### 5. Custom Hooks Pattern

Hooks de aplicación que conectan UI con Use Cases.

```typescript
export function useFeature() {
  const [state, setState] = useState(...)
  const useCase = useMemo(() => new FeatureUseCase(), [])

  const doSomething = useCallback((input) => {
    const result = useCase.execute(input)
    if (result.isSuccess()) {
      setState(result.getValue())
    }
  }, [useCase])

  return { state, doSomething }
}
```

**Responsabilidades:**
- Gestionar estado de React
- Llamar a Use Cases
- Traducir resultados a estado de UI
- NO contener lógica de negocio

---

## Decisiones Técnicas

### 1. Por qué Clean Architecture

**Problema**: Mezar lógica de negocio con React hooks hace el código:
- Difícil de testear
- Acoplado al framework
- Difícil de reutilizar

**Solución**: Separar en capas
- Lógica de negocio en `core/` (sin React)
- Hooks solo para estado y coordinación
- Componentes solo para UI

### 2. Result Pattern vs Exceptions

**Decisión**: Usar Result Pattern en el dominio

**Razones:**
- Errores son parte del flujo normal (no excepcionales)
- Type-safe: TypeScript fuerza a manejar errores
- No hay try/catch en el dominio
- Más funcional y predecible

### 3. Value Objects Inmutables

**Decisión**: Todos los Value Objects son inmutables

**Razones:**
- Previene bugs (no se pueden modificar accidentalmente)
- Facilita debugging (no cambian durante ejecución)
- Thread-safe por diseño
- Facilita memoización en React

### 4. Hooks Memoizados

**Decisión**: Usar `useCallback` y `useMemo` extensivamente

**Razones:**
- Previene re-renders innecesarios
- Evita loops infinitos en `useEffect`
- Mantiene referencias estables
- Mejor performance

**Ejemplo:**
```typescript
const handleChange = useCallback((value) => {
  setValue(value);
}, []); // Referencia estable

const useCase = useMemo(() => new UseCase(), []); // Una sola instancia
```

### 5. TypeScript Estricto

**Decisión**: `strict: true` en tsconfig

**Razones:**
- Catch de errores en compile-time
- Mejor IntelliSense
- Documentación automática
- Refactors seguros

### 6. Tailwind CSS v4

**Decisión**: Usar Tailwind v4 con `@variant dark`

**Razones:**
- Utility-first CSS
- Dark mode con clase `.dark`
- No necesita config file (CSS-first)
- Mejor DX con Next.js 15

---

## Reglas y Convenciones

### Dependencias entre Capas

❌ **PROHIBIDO**:
```typescript
// domain/ NO puede importar de application/
import { useYearSelection } from '@/application/hooks'

// domain/ NO puede importar de presentation/
import { YearSelector } from '@/presentation/components'
```

✅ **PERMITIDO**:
```typescript
// presentation/ PUEDE importar de application/
import { useYearSelection } from '@/application/hooks'

// application/ PUEDE importar de domain/
import { Year } from '@/core/domain/year'
```

### Nomenclatura

- **Archivos**: `kebab-case.ts`
- **Classes**: `PascalCase`
- **Functions**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Interfaces**: `PascalCase` (sin prefijo I)
- **Types**: `PascalCase`

### Orden de Imports

```typescript
// 1. External libraries
import React from 'react';
import { useState } from 'react';

// 2. Internal (con alias @/)
import { Year } from '@/core/domain/year';
import { useYearSelection } from '@/application/hooks';

// 3. Relative imports
import { helper } from './helper';
import type { Props } from './types';
```

---

## Testing Strategy (Futuro)

### Unit Tests

**Qué testear:**
- Value Objects (validación, métodos)
- Entities (comportamiento)
- Use Cases (lógica de negocio)

**NO testear:**
- Componentes React (por ahora)
- Hooks (son adaptadores simples)

**Stack sugerido:**
- Vitest (faster than Jest)
- @testing-library/react (cuando se necesite)

### Ejemplo de Test

```typescript
describe('Year', () => {
  it('should create valid year', () => {
    const result = Year.create(2025);
    expect(result.isSuccess()).toBe(true);
    expect(result.getValue().value).toBe(2025);
  });

  it('should fail for invalid year', () => {
    const result = Year.create(1899);
    expect(result.isFailure()).toBe(true);
  });
});
```

---

## Próximos Pasos de Arquitectura

1. **Persistence Layer**: Implementar localStorage adapter
2. **Repository Pattern**: Abstraer persistencia
3. **Domain Events**: Comunicación entre agregados
4. **Tests**: Setup de Vitest + tests de dominio
5. **Validation Layer**: Centralizar validaciones complejas

---

## Referencias

- [Clean Architecture (Uncle Bob)](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Result Pattern](https://khalilstemmler.com/articles/enterprise-typescript-nodejs/handling-errors-result-class/)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
