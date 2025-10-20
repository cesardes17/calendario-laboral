# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Generador de Calendario Laboral por Ciclos** - A Next.js application that models custom work/rest cycles, generates annual calendars, and calculates work hours balance against contractual agreements. The application supports non-conventional work patterns (4-2 cycles, 6-3 cycles, rotating shifts, etc.).

## Development Commands

```bash
# Start development server with Turbopack
npm run dev

# Build for production with Turbopack
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

Development server runs at http://localhost:3000

## Architecture

The project follows **Clean Architecture** principles adapted for Next.js:

```
src/
├── app/                     # Next.js App Router (UI layer)
├── core/                    # Domain layer
│   ├── domain/              # Entities and value objects
│   ├── usecases/            # Business logic (use cases)
│   └── services/            # Domain interfaces
├── infrastructure/          # Technical implementations
│   ├── persistence/         # Local storage adapters
│   ├── adapters/            # External adapters
│   └── utils/               # Technical helpers
├── application/             # Application layer
│   ├── hooks/               # React hooks
│   ├── context/             # React context
│   └── providers/           # Context providers
├── presentation/            # Presentation layer
│   ├── components/          # UI components
│   ├── layouts/             # Layout components
│   └── pages/               # Page components
└── lib/                     # Technical configurations
```

**Key principles:**
- Unidirectional dependencies: presentation → application → domain → infrastructure
- Business logic isolated from framework
- Domain layer has no external dependencies
- Testability and maintainability prioritized

## Core Domain Concepts

### Work Cycle Modes

1. **Weekly Mode (`semanal`)**: 7-day mask (Mon-Sun) defining which days are worked
2. **Parts Mode (`partes`)**: Custom blocks of work/rest days (e.g., 6-3, 6-3, 6-3, 6-2)

### Contract Start Configuration

- **Started this year**: Requires contract start date; days before are "Not Contracted"
- **Started previously**: Requires cycle offset (current part, day within part) to continue pattern from Jan 1

### Day State Priority (highest to lowest)

1. Not Contracted
2. Vacation
3. Holiday / Worked Holiday
4. Rest (immutable by cycle)
5. Work

### Business Rules (See context/requerimientos.md for details)

- Cycle repeats indefinitely through the year
- Rest days from cycle cannot be converted to work days (except holidays worked)
- Hours calculated by day type: Mon-Fri, Saturday, Sunday, Holiday
- Balance calculated as: worked hours - contract hours

## Data Models (Core Types)

```typescript
Ciclo {
  modo: 'semanal' | 'partes';
  semanal?: { mascara: boolean[7] }; // Mon-Sun work/rest mask
  partes?: { partes: Array<{ trabaja: number; descansa: number }> };
}

Inicio {
  empezoEsteAnio: boolean;
  fechaInicioContrato?: Date;
  offset?: {
    parteActual?: number;
    indiceDiaDentroDeParte?: number;
    tipo?: 'Trabajo' | 'Descanso'
  };
}

// Day types: Trabajo, Descanso, Vacaciones, Festivo, Festivo trabajado, No contratado
```

## Code Conventions

**Naming:**
- Classes/Components: `PascalCase`
- Functions/Variables: `camelCase`
- Files: `kebab-case`
- Constants: `UPPER_SNAKE_CASE`

**Import order:**
1. External libraries
2. Internal aliases (`@/core`, `@/application`, etc.)
3. Relative imports (`./`, `../`)

**TypeScript:**
- Strict mode enabled
- Prefer `type` and `interface` over `any`
- Use TSDoc for complex functions
- Path alias: `@/*` maps to project root

**UI/UX:**
- Framework: Next.js 15+ (App Router)
- Styling: Tailwind CSS v4
- Design: Minimalist, functional, accessible
- Icons: Lucide (when needed)

## Agent Workflow

When making changes:

1. **Propose** - Explain intent, location, and reasoning clearly
2. **Wait for approval** - Never create/modify files without explicit confirmation
3. **Execute** - Follow Clean Architecture and SOLID principles
4. **Document** - Add TSDoc for complex logic; update docs/ if architecture changes

**Restrictions:**
- Cannot install new dependencies without authorization
- Cannot modify global configs (ESLint, Prettier, Tailwind) without approval
- Must maintain architecture boundaries (no domain dependencies on infrastructure)

## Documentation Structure

If created, `docs/` should contain:
- `architecture.md` - Architecture and layer descriptions
- `components.md` - UI component documentation
- `business-logic.md` - Use cases and domain functions
- `decisions.md` - Technical decisions (ADR format)
- `conventions.md` - Style rules and standards

Update relevant docs when making architectural or business logic changes.

## Key Reference Files

- `context/requerimientos.md` - Complete functional requirements, business rules, acceptance criteria
- `Agents.md` - Agent behavior guidelines, workflow, architecture details
- `README.md` - Project description, quick start, technologies

## Current State

Early development (Version 1). The app/ directory contains only the Next.js default starter template. Core architecture directories (core/, infrastructure/, application/, presentation/) are not yet created.
