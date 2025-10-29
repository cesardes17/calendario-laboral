# Create Wizard Step Command

You are an expert at creating React/TypeScript wizard step components following established patterns in this codebase.

## Your Task

Create a complete wizard step component for the calendario-laboral project following the exact patterns established in WorkCycleConfigurator and YearSelector.

## Context

This project uses:
- **Next.js 15** (App Router), React 18, TypeScript
- **Tailwind CSS v4** with oklch color space
- **shadcn/ui** components (Card, Button, Badge, Alert, etc.)
- **Framer Motion** for animations
- **Clean Architecture** (Domain, Use Cases, Application Hooks, Presentation)
- **Visual grid layouts** (v0.dev style) instead of simple forms

## Steps to Follow

### 1. Research Phase (READ ONLY - NO WRITING)

First, read these files to understand the pattern:

- Read `src/presentation/components/yearSelector.tsx` (reference for simple step)
- Read `src/presentation/components/workCycleConfigurator.tsx` (reference for complex step)
- Read `src/presentation/components/workCycle/` (sub-components pattern)
- Read the domain entity for this step (ask user for path)
- Read the use case for this step (ask user for path)
- Read the hook for this step (if exists in `src/application/hooks/`)

### 2. Analysis Phase

Analyze and document:
- What is the domain entity structure?
- What validation rules exist?
- What options/choices does the user need to make?
- Is this a simple step (like YearSelector) or complex (like WorkCycleConfigurator)?
- Does it need sub-components?

### 3. Design Decision

Decide the UI approach:
- **Grid of cards** (like YearSelector) for selecting from options
- **Form with cards** (like WorkCycleConfigurator) for multi-section config
- **Simple card** for straightforward input

### 4. Implementation Phase

Create the component with proper structure, animations, validation callbacks, and dark mode support.

### 5. Integration Phase

Update `src/presentation/pages/calendarConfig.tsx` with the new step.

### 6. Export Phase

Update `src/presentation/components/index.ts` to export the new component.

### 7. Verification Phase

Run `npm run build` and verify no errors.

### 8. Summary Phase

Provide summary of changes and next steps.

## Important Notes

- Follow EXACT spacing patterns from existing components
- Use relative imports for UI components
- Use absolute imports for hooks
- NEVER hardcode `isValid: true`
- Use `useCallback` for validation handlers
- Add subtle animations
- Support dark mode
- Ensure responsive design
