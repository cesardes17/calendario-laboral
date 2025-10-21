# Generador de Calendario Laboral por Ciclos

Aplicación web para modelar ciclos de trabajo/descanso personalizados, generar calendarios anuales y calcular el balance de horas laborales frente a las establecidas por convenio.

## Descripción

Esta herramienta permite a trabajadores con patrones laborales no convencionales (ciclos como 4-2, 6-3, turnos rotativos, etc.) generar un calendario anual completo que refleja con precisión sus días trabajados, descansos, vacaciones y festivos.

### Características principales

- **Dos modos de configuración**:

  - **Ciclo semanal**: máscara de 7 días (L-D) para patrones semanales
  - **Ciclo por partes**: bloques personalizados de trabajo/descanso (ej: 6-3, 6-3, 6-3, 6-2; 4-2; 6-2, etc)

- **Gestión de inicio de contrato**: soporte para contratos que comienzan en el año actual o que vienen de años anteriores (con offset de ciclo)

- **Cálculo de horas**: configuración personalizada de horas por tipo de día (L-V, sábado, domingo, festivo)

- **Horas de convenio**: configuración de horas anuales según convenio laboral, con calculadora auxiliar para conversión desde horas semanales

- **Excepciones**: gestión de vacaciones y festivos trabajados (próximamente)

- **Estadísticas completas**:
  - Días trabajados por tipo
  - Horas totales vs horas de convenio
  - Balance de horas (saldo a favor/en contra)

## Documentación

Para más detalles sobre los requisitos funcionales, casos de uso y especificaciones técnicas, consulta la [documentación completa de requerimientos](./context/requerimientos.md).

## Tecnologías

Este proyecto está construido con:

- **Framework**: [Next.js 15.5.6](https://nextjs.org) con App Router y Turbopack
- **Lenguaje**: TypeScript (modo estricto)
- **Estilos**: Tailwind CSS v4
- **Temas**: next-themes (soporte dark/light mode)
- **Iconos**: lucide-react
- **Arquitectura**: Clean Architecture adaptada para Next.js

## Arquitectura

El proyecto sigue **Clean Architecture** con capas bien definidas:

```
src/
├── core/                    # Capa de dominio
│   ├── domain/              # Entidades y value objects
│   └── usecases/            # Lógica de negocio
├── application/             # Capa de aplicación
│   ├── hooks/               # React hooks (UI ↔ Use Cases)
│   └── providers/           # Context providers
├── infrastructure/          # Capa de infraestructura
│   └── persistence/         # Adaptadores de almacenamiento
└── presentation/            # Capa de presentación
    ├── components/          # Componentes React
    └── pages/               # Páginas de la aplicación
```

**Principios aplicados:**
- Dependencias unidireccionales (presentation → application → core)
- Domain sin dependencias externas
- Separación de responsabilidades
- Testabilidad prioritaria

## Desarrollo

### Requisitos previos
- Node.js 18+
- npm/yarn/pnpm

### Instalación

```bash
# Clonar el repositorio
git clone <repo-url>
cd calendario-laboral

# Instalar dependencias
npm install
```

### Comandos disponibles

```bash
# Servidor de desarrollo (con Turbopack)
npm run dev

# Build de producción
npm run build

# Servidor de producción
npm start

# Linter
npm run lint
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación.

## Estado del proyecto

**Versión actual:** 1.0.0-alpha
**Estado:** En desarrollo activo

### Funcionalidades implementadas (HUs completadas)

#### ✅ Epic 1: Configuración Inicial
- **HU-001**: Seleccionar año de referencia
  - Selector de año con validación
  - Rango: año actual -2 a +5
  - Año actual seleccionado por defecto

- **HU-002**: Indicar situación laboral al inicio del año
  - Opciones: "Empecé este año" / "Ya trabajaba antes"
  - Fecha de inicio de contrato (si empezó este año)
  - Offset de ciclo (si ya trabajaba antes)
  - Validación contra ciclo configurado

#### ✅ Epic 2: Definición del Ciclo Laboral
- **HU-003**: Seleccionar tipo de ciclo laboral
  - Modo semanal: máscara L-D (7 días)
  - Modo por partes: bloques trabajo/descanso personalizados
  - Validación y feedback visual
  - Soporte para ciclos complejos (ej: 6-3, 6-3, 6-3, 6-2)

#### ✅ UX/UI Transversal
- **HU-032**: Tema claro/oscuro
  - Tres modos: claro, oscuro, sistema (por defecto)
  - Toggle accesible con iconos
  - Persistencia en localStorage
  - Paleta de colores neutra y accesible
  - Sin flash en carga (SSR compatible)

### Próximas funcionalidades

- Epic 4: Configuración de Jornada Laboral
- Epic 5: Gestión de Excepciones (festivos, vacaciones)
- Epic 7: Generación del Calendario
- Epic 8: Cálculo de Estadísticas
- Epic 9: Visualización del Calendario
- Epic 10: Visualización de Estadísticas

Ver [backlog completo en Jira](https://cesarjoseds.atlassian.net/jira/software/projects/SCRUM)
