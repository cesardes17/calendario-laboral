# Generador de Calendario Laboral por Ciclos

Aplicación web para modelar ciclos de trabajo/descanso personalizados, generar calendarios anuales y calcular el balance de horas laborales frente a las establecidas por convenio.

## Descripción

Esta herramienta permite a trabajadores con patrones laborales no convencionales (ciclos como 4-2, 6-3, turnos rotativos, etc.) generar un calendario anual completo que refleja con precisión sus días trabajados, descansos, vacaciones y festivos.

### Características principales

- **Dos modos de configuración**:
  - **Ciclo semanal**: máscara de 7 días (L-D) para patrones semanales
  - **Ciclo por partes**: bloques personalizados de trabajo/descanso (ej: 6-3, 6-3, 6-3, 6-2)

- **Gestión de inicio de contrato**: soporte para contratos que comienzan en el año actual o que vienen de años anteriores (con offset de ciclo)

- **Cálculo de horas**: configuración personalizada de horas por tipo de día (L-V, sábado, domingo, festivo)

- **Excepciones**: gestión de vacaciones y festivos trabajados

- **Estadísticas completas**:
  - Días trabajados por tipo
  - Horas totales vs horas de convenio
  - Balance de horas (saldo a favor/en contra)

## Documentación

Para más detalles sobre los requisitos funcionales, casos de uso y especificaciones técnicas, consulta la [documentación completa de requerimientos](./context/requerimientos.md).

## Tecnologías

Este proyecto está construido con:

- [Next.js](https://nextjs.org) - Framework de React
- TypeScript
- TailwindCSS (por defecto en Next.js)

## Desarrollo

Ejecuta el servidor de desarrollo:

```bash
npm run dev
# o
yarn dev
# o
pnpm dev
# o
bun dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación.

## Estado del proyecto

En desarrollo - Versión 1
