# Requisitos del Proyecto: Generador de calendario laboral por ciclos

## 1. Objetivo

Construir una aplicación web que, a partir de un formulario de configuración, permita modelar **ciclos de trabajo/descanso arbitrarios**, generar un **calendario anual** (1 de enero – 31 de diciembre del año seleccionado), y calcular **estadísticas e impacto en horas** frente a las horas de convenio.

## 2. Alcance (versión 1)

- Capturar el ciclo laboral del usuario con **dos modos posibles**:

  1. **Ciclo semanal (7 días L–D)**: el usuario marca qué días trabaja y qué días descansa en una **máscara semanal**.
  2. **Ciclo por partes**: el usuario puede definir una o más **partes** con bloques _trabaja X días_ / _descansa Y días_ (p. ej., `6-3, 6-3, 6-3, 6-2`).

- Permitir indicar si **empezó a trabajar este año**. Si es así, se solicita la **fecha de inicio de contrato** y los días anteriores quedan como **No contratado**. Si no, se le solicita un **offset de ciclo** para que el patrón continúe correctamente sin reiniciarse el 1 de enero.
- Generar un **calendario anual** marcando cada día como: _Trabajo_, _Descanso_, _Vacaciones_, _Festivo_, _Festivo trabajado_, _No contratado_.
- Registrar **horas de jornada** configurables por tipo de día (L–V, sábado, domingo, festivo).
- Introducir **horas de convenio** anuales para comparar contra las **horas efectivamente trabajadas**.
- Calcular **estadísticas** (días trabajados, descansados, vacaciones, festivos trabajados, etc.) y mostrar el **saldo** de horas (empresa debe / empleado debe).

## 3. Definiciones clave

- **Modo semanal**: ciclo de 7 días (L–D) que se repite cada semana.
- **Modo por partes**: secuencia indefinida de bloques trabajo/descanso con 1..N partes.
- **Offset**: punto de continuación del ciclo si el usuario ya estaba contratado antes del año actual (p. ej., parte 3, día 4 de trabajo).
- **Descanso inamovible**: los días marcados como descanso por el ciclo **no se convierten** en trabajados.
- **Festivo**: día no laborable oficial; puede marcarse como _trabajado_.
- **Vacaciones**: rango de días que prevalece sobre el estado del ciclo.
- **No contratado**: días anteriores a la fecha de inicio (solo si empezó este año).

## 4. Casos de uso principales

1. **Configurar ciclo**: El usuario elige si su patrón es semanal o por partes y define los valores correspondientes.
2. **Definir inicio**: El usuario indica si empezó este año (fecha de contrato) o viene de años previos (offset del ciclo).
3. **Configurar horas**: Define las horas trabajadas según tipo de día (L–V, sábado, domingo, festivo) y las horas anuales de convenio.
4. **Gestionar excepciones**: Añadir vacaciones y festivos del año, con opción de marcar _festivo trabajado_.
5. **Generar calendario**: Visualiza el calendario anual con los estados diarios.
6. **Ver estadísticas**: Totales por día de la semana, descansos, vacaciones, festivos y saldo de horas.

## 5. Requisitos funcionales

### 5.1 Formulario de configuración

- RF1. Solicitar el **año de referencia** (por defecto, actual).
- RF2. Preguntar: **¿Empezaste a trabajar este año?**

  - Si sí → pedir **fecha de inicio de contrato**.
  - Si no → pedir **offset**: parte y día donde se encontraba el 1 de enero.

- RF3. **Modo de ciclo** (usuario elige):

  - **Semanal (7 días)**: array con los días L–D, marcando cuáles trabaja.
  - **Por partes**: añadir una o más partes con campos _Trabaja X días_ / _Descansa Y días_.

- RF4. **Alineación del inicio**: el inicio real del ciclo (fecha de contrato u offset) define desde qué punto se aplica el patrón.
- RF5. **Horas por tipo de día**: L–V, sábado, domingo, festivo.
- RF6. **Horas de convenio** (anuales).
- RF7. **Festivos**: gestión manual en V1.
- RF8. **Vacaciones**: selección de rangos de fechas.

### 5.2 Generación de calendario

- RF9. Crear calendario del 1/1 al 31/12 del año seleccionado.
- RF10. Días anteriores a la fecha de contrato → _No contratado_.
- RF11. Aplicar patrón según el modo elegido:

  - Semanal → repetir la máscara cada 7 días.
  - Por partes → recorrer secuencia de bloques repitiéndola indefinidamente.

- RF12. Aplicar prioridades:

  1. No contratado
  2. Vacaciones
  3. Festivo / Festivo trabajado
  4. Descanso inamovible
  5. Trabajo

- RF13. Calcular horas por tipo de día y mostrar detalles.

### 5.3 Estadísticas y saldo

- RF14. Mostrar:

  - Días trabajados por L–D y festivos.
  - Horas totales trabajadas y horas convenio.
  - Días de descanso, vacaciones y festivos.
  - Saldo = horas trabajadas – horas convenio → mensaje “La empresa te debe X horas” o “Debes X horas”.

## 6. Modelo de datos (resumen)

```ts
Ciclo {
  modo: 'semanal' | 'partes';
  semanal?: { mascara: [boolean, boolean, boolean, boolean, boolean, boolean, boolean] };
  partes?: { partes: Array<{ trabaja: number; descansa: number }> };
}

Inicio {
  empezoEsteAnio: boolean;
  fechaInicioContrato?: Date;
  offset?: { parteActual?: number; indiceDiaDentroDeParte?: number; tipo?: 'Trabajo' | 'Descanso' };
}
```

## 7. Reglas de negocio

- RB1. Si empezó este año, la fecha de inicio es el **día 1 del ciclo**.
- RB2. Si venía de años previos, se usa el **offset** (parte + día dentro del ciclo) para continuar correctamente.
- RB3. El ciclo se repite indefinidamente hasta el 31 de diciembre.
- RB4. Prioridad de estados: _No contratado > Vacaciones > Festivo/Festivo trabajado > Descanso > Trabajo_.
- RB5. Descanso inamovible no se reemplaza por trabajo salvo excepciones.
- RB6. Horas por tipo de día: L–V→`horasLV`, S→`horasSab`, D→`horasDom`, Festivo trabajado→`horasFest`.

## 8. Algoritmo (boceto)

1. Construir fechas del 1/1 al 31/12.
2. Si empezó este año → marcar previos como _No contratado_.
3. Determinar punto de inicio:

   - Si es semanal → aplicar máscara desde 1/1.
   - Si es por partes → aplicar offset o inicio desde fecha de contrato.

4. Iterar y asignar _Trabajo_ o _Descanso_.
5. Aplicar _Vacaciones_ y _Festivos_ según prioridad.
6. Calcular horas y estadísticas totales.

## 9. Validaciones

- V1. En modo semanal, la máscara debe tener al menos un día trabajado.
- V2. En modo por partes, debe haber al menos una parte con días de trabajo y descanso > 0.
- V3. Si empezó este año, la fecha debe pertenecer al año.
- V4. Si venía de años previos, el offset debe ser coherente con las partes.

## 10. Ejemplos de ciclos admitidos

- `4-2` indefinido.
- `6-3` indefinido.
- `6-2` indefinido.
- `6-3, 6-3, 6-3, 6-2` (4 partes que se repiten).
- **Semanal (maternidad)**: trabaja L–J y D, descansa V–S → máscara `1111001`.

## 11. Offset de ciclo

Permite continuar el patrón si el usuario venía trabajando antes del año actual. Se definen:

- `parteActual`: número de parte (1..N).
- `indiceDiaDentroDeParte`: día exacto dentro de esa parte.
- `tipo`: Trabajo | Descanso.

Ejemplo: _Parte 3, día 4 de trabajo_ → el 1/1 será día trabajado y continuará según el ciclo.

## 12. Informes y estadísticas

- Días trabajados, descansos, vacaciones, festivos.
- Horas trabajadas vs convenio.
- Saldo de horas.
- Distribución opcional por meses (en futuras versiones).

## 13. Roadmap futuro

- Importar festivos oficiales (nacional/autonómico/local).
- Cambios de ciclo dentro del año.
- Soporte de turnos con horarios y nocturnidad.
- Exportación ICS/CSV.
- Persistencia en la nube y usuarios múltiples.
- Ediciones manuales por día.

## 14. Criterios de aceptación

- CA1. Dado un ciclo `4-2` con inicio 06/06/2025 → 01/01–05/06 son _No contratados_.
- CA2. Con ciclo por partes y offset (parte 3, día 4 trabajo) → 01/01 es _Trabajo_ y continúa el patrón.
- CA3. Vacaciones sobrescriben cualquier otro estado.
- CA4. Festivo trabajado usa las horas de `horasFest`.
- CA5. El resumen muestra correctamente los totales y el saldo de horas.
