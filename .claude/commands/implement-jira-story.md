# Implement Jira Story Agent

You are a specialized agent for implementing user stories from Jira in the Calendario Laboral project.

## Your Task

Implement the Jira story: **{{STORY_KEY}}**

## Workflow

### Phase 1: Discovery and Planning (10 minutes)

1. **Fetch Story from Jira**
   - Use `mcp__atlassian__search` to find the story
   - Use `mcp__atlassian__fetch` to get full details
   - Extract: title, description, acceptance criteria, subtasks

2. **Analyze Requirements**
   - Read `context/requerimientos.md` for business rules
   - Identify which domain concepts are involved
   - Check existing implementation in codebase
   - Map to Clean Architecture layers

3. **Create Implementation Plan**
   - Use `TodoWrite` tool to create a detailed task list
   - Break down into:
     - Domain layer changes (entities, value objects, use cases)
     - Application layer changes (hooks, context)
     - Presentation layer changes (components)
     - Infrastructure layer changes (if needed)
     - Tests for each layer
     - Integration and manual testing

### Phase 2: Implementation (30-60 minutes)

For each task in your plan:

4. **Domain Layer First**
   - Create/update entities and value objects in `src/core/domain/`
   - Create use case in `src/core/usecases/`
   - Follow Result pattern for error handling
   - Add comprehensive TSDoc comments

5. **Create Tests**
   - Create test file in `src/core/usecases/__tests__/`
   - Cover happy paths, edge cases, and error scenarios
   - Run tests: `npm test -- <test-file-name>`
   - Ensure 100% pass rate before proceeding

6. **Application Layer**
   - Create/update hooks in `src/application/hooks/`
   - Update context providers if needed
   - Maintain separation of concerns

7. **Presentation Layer**
   - Create/update components in `src/presentation/components/`
   - Follow existing component patterns (see contractStart/ or workCycle/)
   - Use sub-components for complex UIs
   - Maintain consistent spacing (space-y-8 for sections)
   - Use motion/AnimatePresence for transitions

8. **Integration**
   - Update parent components to use new functionality
   - Test in browser (dev server should be running)
   - Verify localStorage integration if applicable

### Phase 3: Validation and Commit (10 minutes)

9. **Run Full Build**
   ```bash
   npm run build
   ```
   - Fix any TypeScript errors
   - Address ESLint warnings if critical

10. **Manual Testing**
    - Test all acceptance criteria from Jira story
    - Check edge cases
    - Verify error states and validation
    - Test on different screen sizes if UI changes

11. **Git Commit**
    - Stage relevant files only
    - Create descriptive commit message following pattern:
    ```
    feat(module): implement [Story Key] - [Story Title]

    [Detailed description of changes]

    Business Rules:
    - [Rule 1]
    - [Rule 2]

    Technical Implementation:
    - [Detail 1]
    - [Detail 2]

    Tests: X tests added, all passing ✓
    Build: Successful without errors ✓

    🤖 Generated with [Claude Code](https://claude.com/claude-code)

    Co-Authored-By: Claude <noreply@anthropic.com>
    ```

## Architecture Guidelines

### Clean Architecture Layers
```
src/
├── core/domain/         # Entities, Value Objects (no dependencies)
├── core/usecases/       # Business logic (depends on domain)
├── application/         # React hooks, context (depends on core)
├── presentation/        # UI components (depends on application)
└── infrastructure/      # Technical adapters (depends on core)
```

### Naming Conventions
- Classes/Components: `PascalCase`
- Functions/Variables: `camelCase`
- Files: `kebab-case`
- Constants: `UPPER_SNAKE_CASE`

### Component Organization
When creating new components, follow the pattern:
```
src/presentation/components/
└── [feature]/
    ├── [feature]Configurator.tsx    # Main component
    ├── [feature]Constants.ts         # Constants
    ├── [feature]Selector.tsx         # Sub-components
    └── [feature]StatusAlerts.tsx     # Status display
```

### Value Objects Pattern
Always use Result type for validation:
```typescript
export class MyValueObject {
  private constructor(private readonly _value: Type) {}

  public static create(value: Type): Result<MyValueObject> {
    // Validation
    if (invalid) {
      return Result.fail<MyValueObject>('Error message');
    }
    return Result.ok<MyValueObject>(new MyValueObject(value));
  }

  get value(): Type {
    return this._value;
  }
}
```

### Use Case Pattern
```typescript
export interface MyUseCaseInput {
  // inputs
}

export interface MyUseCaseOutput {
  // outputs with metrics
}

export class MyUseCase {
  public execute(input: MyUseCaseInput): Result<MyUseCaseOutput> {
    try {
      // Business logic
      return Result.ok<MyUseCaseOutput>({ ... });
    } catch (error) {
      return Result.fail<MyUseCaseOutput>(`Error: ${error.message}`);
    }
  }
}
```

## Key Principles

1. **Test-Driven**: Write tests immediately after creating use cases
2. **Domain-First**: Always start with domain layer, never skip it
3. **Incremental**: Mark todos as completed as you go
4. **Documentation**: Add TSDoc for complex logic
5. **Validation**: Use Result pattern, never throw raw errors
6. **Immutability**: Prefer readonly and const
7. **Type Safety**: No `any` types, use strict TypeScript

## Jira Integration

After successful implementation:
1. Add comment to Jira story with implementation summary
2. Transition story to "In Review" or "Done" (if you have permission)
3. Link the git commit SHA to the story

## Error Handling

If you encounter blockers:
1. Document the blocker clearly
2. Ask user for clarification/decision
3. Update todo list with blocked status
4. Continue with non-blocked tasks if possible

## Success Criteria

✅ All acceptance criteria from Jira story met
✅ All tests passing (minimum 80% coverage)
✅ Build successful without errors
✅ Manual testing completed
✅ Code follows Clean Architecture
✅ Git commit created with descriptive message
✅ No regression in existing functionality

---

**Now begin the implementation of story {{STORY_KEY}}**
