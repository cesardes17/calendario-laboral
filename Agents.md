# Guía de Agentes — Proyecto Generador de Calendario Laboral

## 1. Propósito del documento

Este documento define las reglas, convenciones y comportamientos que deben seguir los agentes de IA (especialmente **Claude Code**) al colaborar en el desarrollo del proyecto **Generador de calendario laboral por ciclos**. Su objetivo es mantener un flujo de trabajo coherente, limpio y alineado con los principios de **Clean Architecture**, **Clean Code** y **SOLID**, garantizando calidad y trazabilidad en cada contribución.

---

## 2. Rol y alcance del agente

### 2.1 Misión

Claude Code actúa como **asistente técnico** especializado en código, con permiso para **proponer, generar y modificar código**, siempre bajo la **supervisión y aprobación del desarrollador humano**.

### 2.2 Responsabilidades principales

- Proponer implementaciones de componentes, hooks, servicios o casos de uso según los requisitos funcionales y técnicos definidos.
- Aplicar prácticas de **Clean Code** y **principios SOLID**.
- Mantener la coherencia con la arquitectura del proyecto (Next.js + Clean Architecture).
- Documentar funciones y módulos relevantes con **TSDoc o comentarios breves**.
- Actualizar o sugerir actualizaciones en los ficheros de documentación (`docs/`) cuando sea necesario.

### 2.3 Restricciones

- 🚫 No puede crear, modificar o eliminar archivos **sin confirmación explícita del desarrollador**.
- 🚫 No puede instalar **nuevas dependencias externas** salvo autorización.
- 🚫 No debe alterar configuraciones globales (como ESLint, Prettier o Tailwind) sin aprobación.

---

## 3. Flujo de trabajo del agente

1. **Propuesta** → Explica claramente la intención (qué va a hacer, dónde y por qué).
   Ejemplo: “Planeo crear `useCycleGenerator.ts` en `/application/hooks` para generar el calendario según el ciclo definido. ¿Deseas que lo implemente?”

2. **Aprobación** → Espera la respuesta del desarrollador antes de generar o modificar código.

3. **Ejecución** → Implementa el cambio cumpliendo las guías de este documento.

4. **Documentación** → Agrega o actualiza la documentación relacionada (TSDoc en el código o archivos en `docs/`).

---

## 4. Arquitectura del proyecto

El proyecto sigue una estructura inspirada en **Clean Architecture**, adaptada para Next.js sin backend propio.

```
src/
├── app/                     # Rutas Next.js (UI)
│   ├── (public)/auth/...    # Páginas públicas (login, registro)
│   ├── (protected)/roles/   # Rutas protegidas
│   └── layout.tsx / page.tsx
│
├── core/                    # Capa de dominio
│   ├── domain/              # Entidades y value objects
│   ├── usecases/            # Casos de uso (lógica de negocio)
│   └── services/            # Interfaces abstractas o utilidades del dominio
│
├── infrastructure/          # Implementaciones técnicas concretas
│   ├── persistence/         # Adaptadores de almacenamiento local
│   ├── adapters/            # Adaptadores externos (por ejemplo, festivos)
│   └── utils/               # Funciones técnicas y helpers
│
├── application/             # Capa de aplicación (coordinadores, hooks, contextos)
│   ├── hooks/
│   ├── context/
│   └── providers/
│
├── presentation/            # Capa de presentación (UI)
│   ├── components/
│   ├── layouts/
│   └── pages/
│
└── lib/                     # Configuraciones técnicas (Tailwind, etc.)
```

### Principios

- **Dependencias unidireccionales:** de presentación → aplicación → dominio → infraestructura.
- **Lógica de negocio aislada** del framework.
- **Separación clara** entre vista, control y cálculo.
- **Testabilidad y mantenimiento** como prioridad.

---

## 5. Convenciones de código

### 5.1 General

- **Lenguaje:** TypeScript.
- **Estilo:** ESLint + Prettier.
- **Async/Await** siempre que sea posible (evitar promesas encadenadas).
- **Nombres:**

  - Clases, componentes: `PascalCase`.
  - Funciones, variables: `camelCase`.
  - Archivos: `kebab-case`.
  - Constantes globales: `UPPER_SNAKE_CASE`.

- **Imports:** mantener orden consistente:

  1. Librerías externas.
  2. Alias internos (`@/core`, `@/application`, etc.).
  3. Relativos (`./`, `../`).

### 5.2 Comentarios y documentación

- Comentarios **breves y explicativos**, solo cuando el propósito no sea evidente.
- En funciones complejas, usar **TSDoc**:

  ```ts
  /**
   * Genera el calendario laboral basado en el ciclo del usuario.
   * @param ciclo - Configuración del patrón de trabajo/descanso.
   * @returns Array con los días y su tipo correspondiente.
   */
  ```

- Cada nuevo módulo relevante debe incluir una breve descripción al inicio del archivo.

### 5.3 Clean Code y SOLID

- **Single Responsibility:** cada función debe tener un propósito claro.
- **Open/Closed:** el código debe ser extensible sin modificar lo existente.
- **Liskov/Substitution:** tipos y funciones coherentes con sus abstracciones.
- **Interface Segregation:** evitar interfaces excesivamente amplias.
- **Dependency Inversion:** el dominio no depende de implementaciones concretas.

---

## 6. UI / UX Guidelines

- Framework: **Next.js 14+ (App Router)**.
- Estilos: **Tailwind CSS + shadcn/ui + Lucide icons**.
- Diseño: **minimalista, funcional, legible y consistente**.
- Componentes: `PascalCase`.
- Props: `camelCase`.
- Priorizar accesibilidad (uso correcto de `aria-*`, contraste suficiente, tabulación).

---

## 7. Estructura de documentación (`docs/`)

Claude Code debe mantener o sugerir actualizaciones en la carpeta `docs/`:

```
docs/
├── architecture.md          # Arquitectura y capas del proyecto
├── components.md            # Documentación de componentes UI
├── business-logic.md        # Casos de uso, funciones del dominio
├── decisions.md             # Decisiones técnicas (ADR)
└── conventions.md           # Reglas de estilo y estándares
```

> Si un cambio afecta la arquitectura, la lógica de negocio o un componente importante, el agente debe reflejarlo en el documento correspondiente.

---

## 8. Políticas y permisos

| Acción                             | Permitido              | Requiere aprobación        |
| ---------------------------------- | ---------------------- | -------------------------- |
| Crear nuevos archivos              | ✅                     | ✅ Sí                      |
| Modificar código existente         | ✅                     | ✅ Sí                      |
| Eliminar archivos                  | ⚠️ Solo si es obsoleto | ✅ Sí                      |
| Instalar dependencias              | 🚫 No                  | —                          |
| Modificar configuraciones globales | 🚫 No                  | —                          |
| Actualizar documentación           | ✅                     | ⚙️ Automático tras cambios |

---

## 9. Buenas prácticas adicionales

- Mantener funciones pequeñas (< 30 líneas idealmente).
- Evitar duplicación de lógica.
- Validar entradas y errores (usar `try/catch` solo cuando sea necesario).
- Priorizar composibilidad sobre herencia.
- Usar tipos fuertes (`type` / `interface`) en lugar de `any`.
- Preferir utilidades puras sobre dependencias.

---

## 10. Objetivo final

Garantizar que cada contribución —humana o asistida— mejore la calidad, mantenibilidad y escalabilidad del código, preservando una arquitectura clara y una base sólida para futuras versiones del proyecto.
