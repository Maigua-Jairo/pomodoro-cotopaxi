# Plan: Alternar entre estudio y descanso

**Spec:** [spec.md](./spec.md)  
**Decisiones:** [decisiones.md](./decisiones.md)  
**Estado de la spec:** Aprobada

## Resumen

Extender el dominio y proveedor de temporizadores existentes para contar únicamente los estudios que terminan, preparar descansos cortos o largos en pausa, y dejar preparado el estudio al terminar el descanso. Se conservará localmente el progreso del ciclo y la meta activa. Home mostrará la fase y el progreso; la ruta de descanso conservará el editor existente, precargado con la duración correspondiente, pero editarla no iniciará la cuenta. El estudiante iniciará manualmente la fase preparada.

La configuración de la cantidad de pomodoros y de las duraciones sigue fuera de alcance (HU-005). Por ahora se usan los valores por defecto existentes; el proveedor expondrá la integración necesaria para que HU-005 suministre una nueva meta sin alterar el ciclo en curso.

## Contexto técnico

- **Lenguaje y plataforma:** TypeScript, Expo SDK 57, React Native y Expo Router.
- **Dominio existente:** `src/domain/timer.ts` ya contiene temporizadores puros, duraciones predeterminadas, cálculo de ciclo, validación del descanso y formato `MM:SS`.
- **Estado existente:** `src/hooks/use-pomodoro-timer.ts` mantiene los temporizadores, el contador, el reloj monotónico y el ciclo de vida de la app. Actualmente persiste el contador directamente con AsyncStorage y usa la meta predeterminada fija.
- **Interfaz existente:** home está en `src/app/(tabs)/index.tsx`; la fase de descanso en `src/app/descanso.tsx`. Ambas usan `StyleSheet`, áreas seguras y textos en español.
- **Persistencia:** AsyncStorage ya es dependencia. El contador se almacena como texto en `pomodoro-cotopaxi:cycle-count`; se conservará esa clave y formato. La meta activa se guardará en una clave independiente y aditiva para no modificar datos existentes.
- **Pruebas:** Jest y `jest-expo` ya están configurados. Las transiciones y el acceso a almacenamiento se prueban con Jest; las rutas, los estados visibles y la restauración en dispositivo se verifican manualmente en Expo Go.
- **Restricciones:** no añadir dependencias, pantallas de configuración ni persistencia del tiempo restante de las fases; no modificar `spec.md` ni `decisiones.md`.

## Comprobación de la constitución

| Principio | Aplicación |
|---|---|
| Simplicidad primero | Se reutilizan dominio, hook, rutas y AsyncStorage existentes; no se añaden dependencias ni navegación paralela. |
| La spec manda | Las transiciones, etiquetas y el inicio manual se limitan a RF-01–RF-08. |
| Lógica separada de interfaz | Reglas de ciclo y transiciones permanecen en `src/domain/timer.ts`; las pantallas solo presentan y envían acciones. |
| Pruebas como puerta | Pruebas Jest preceden a los cambios de lógica y cubren transiciones, metas y persistencia. |
| Los datos del usuario son sagrados | Se mantiene intacto el formato actual del contador; la meta activa usa una clave independiente. |
| Exactitud del tiempo | Se conserva el reloj monotónico y la reconciliación existentes; los intervalos no serán la fuente de verdad del tiempo. |

## Decisiones técnicas

| Decisión de producto/técnica | Aplicación | Alternativa descartada |
|---|---|---|
| D-01 y D-02 | Al terminar estudio se prepara el descanso apropiado pausado y se presenta su pantalla. Se conserva el editor 5–30 de HU-001, precargado con la duración corta/larga aplicable; confirmar una edición solo actualiza la fase preparada. Un botón explícito «Iniciar descanso» inicia la cuenta. | Iniciar el descanso al completar estudio o al confirmar la duración, eliminando la acción manual requerida por RF-08. |
| D-03 | Solo la transición de estudio en ejecución a cero incrementa el progreso. Pausar, reanudar, reiniciar o abandonar antes de cero no lo incrementa. | Incrementar al iniciar un estudio o al abrir la pantalla de descanso. |
| D-04 | Mantener la clave y el valor textual del contador; persistir la meta activa en una clave separada. La hidratación debe completarse antes de guardar estado inicial para no sobrescribir el progreso guardado con cero. | Reemplazar el valor existente por un objeto serializado o escribir el valor inicial antes de leer el almacenamiento. |
| D-05 | Mantener una meta activa por ciclo y aceptar cambios de configuración como una meta pendiente. Aplicar el nuevo valor al comenzar el siguiente ciclo de estudio después del descanso largo; conservar la meta activa durante el ciclo actual y su descanso largo. El punto de integración recibe la futura configuración de HU-005; no se añade aquí su interfaz. | Cambiar la meta visible o el umbral del ciclo en curso inmediatamente. |
| D-06 | Home muestra la fase actual y «Pomodoros: X/Y» usando el contador y la meta activa. | Mostrar una meta fija o inferir la fase únicamente del temporizador de estudio. |
| D-07 | Al terminar el descanso se cierra el flujo de descanso y se presenta home con estudio pausado y duración inicial. No se presenta una elección que inicie automáticamente el estudio. | Mantener el diálogo de fin de HU-001 con opción de iniciar estudio directamente. |
| D-01, D-02 y RF-08 | Iniciar una fase preparada reutiliza su temporizador pausado y su tiempo restante; no crea otro temporizador ni reinicia su duración al tocar «Iniciar». | Crear un temporizador nuevo en cada toque o adelantar la cuenta al preparar la fase. |

## Plan de implementación

### P1.1 — Transiciones puras de ciclo

- **Requisitos:** RF-01, RF-02, RF-03, RF-05, RF-08.
- **Archivos:** modificar `src/domain/timer.ts`; ampliar `src/domain/__tests__/timer.test.ts`.
- **Descripción:** extraer o ampliar funciones puras para completar un estudio solo al llegar a cero, seleccionar descanso corto/largo y preparar cada fase pausada con su duración. Preparar el estudio pausado al concluir un descanso. Iniciar una fase preparada desde el mismo estado debe conservar su duración inicial. Hacer explícita la transición de terminado una sola vez para evitar contar de nuevo en reconciliaciones posteriores.

### P1.2 — Meta activa y cambio diferido

- **Requisitos:** RF-02, RF-04, RF-07.
- **Archivos:** modificar `src/domain/timer.ts`; ampliar `src/domain/__tests__/timer.test.ts`.
- **Descripción:** modelar por separado la meta del ciclo activo y la nueva meta configurada. Durante un ciclo en curso, conservar la primera y aplicar la nueva al empezar el ciclo de estudio siguiente. Validar metas enteras positivas conforme a la configuración existente, sin agregar controles de configuración. Asegurar que el progreso mostrado y el tipo de descanso se derivan de la meta activa.

### P2.1 — Persistencia del progreso del ciclo

- **Requisitos:** RF-06, RF-07, RNF-02.
- **Archivos:** crear `src/storage/pomodoro-cycle-storage.ts` y `src/storage/__tests__/pomodoro-cycle-storage.test.ts`.
- **Descripción:** encapsular la lectura y escritura del contador y la meta activa con AsyncStorage. Mantener `pomodoro-cotopaxi:cycle-count` como cadena numérica; usar una clave adicional para la meta activa. Tratar de forma explícita valores inválidos y errores de almacenamiento, sin ocultarlos.

### P2.2 — Orquestación del estado y restauración

- **Requisitos:** RF-01 a RF-08, RNF-02.
- **Archivos:** modificar `src/hooks/use-pomodoro-timer.ts`.
- **Descripción:** conectar las transiciones puras y el almacenamiento. Restaurar el progreso antes de persistir cambios; evitar efectos secundarios dentro de actualizadores de estado de React. Reconciliar al volver a primer plano, procesar una sola vez cada fin de fase, preparar el descanso correcto o el estudio siguiente y exponer el estado de fase/meta y las acciones de inicio manual. Proporcionar el punto de integración para recibir cambios futuros de configuración sin añadir la interfaz de HU-005. Registrar explícitamente errores de almacenamiento en el límite del proveedor.

### P3.1 — Estado de ciclo en home

- **Requisitos:** RF-01, RF-02, RF-04, RF-05, RF-06, RF-07; RNF-01, RNF-02.
- **Archivos:** modificar `src/app/(tabs)/index.tsx`.
- **Descripción:** mostrar la fase actual y «Pomodoros: X/Y» con la meta activa. Al completarse estudio, abandonar la superposición de fin de HU-001 y presentar el descanso corto/largo preparado conforme a D-02. Mantener el contador sin cambios si el estudio se reinicia antes de cero.

### P3.2 — Flujo manual de descanso y retorno al estudio

- **Requisitos:** RF-01, RF-02, RF-03, RF-04, RF-08; RNF-01.
- **Archivos:** modificar `src/app/descanso.tsx` y, si la navegación de fin de fase lo requiere, `src/app/(tabs)/index.tsx`.
- **Descripción:** identificar el descanso como corto o largo y mostrar su duración preparada en pausa. Conservar el editor 5–30 existente, precargado con el valor configurado; confirmar cambios mantiene la fase pausada y un control separado la inicia. Cuando el descanso termine, dejar preparado el estudio inicial pausado y volver a home sin ofrecer inicio automático. Mostrar progreso conforme a la meta activa cuando se presente en home.

### P4.1 — Verificación de la historia completa

- **Requisitos:** RF-01 a RF-08; RNF-01, RNF-02.
- **Archivos:** pruebas en `src/domain/__tests__/timer.test.ts` y `src/storage/__tests__/pomodoro-cycle-storage.test.ts`; validación manual de `src/app/(tabs)/index.tsx` y `src/app/descanso.tsx`.
- **Descripción:** ejecutar Jest, lint y TypeScript, y verificar manualmente transiciones, navegación, persistencia y presentación en Expo Go conforme a la lista de la sección de pruebas.

## Archivos y responsabilidades

| Archivo | Cambio | Responsabilidad |
|---|---|---|
| `src/domain/timer.ts` | Modificar | Reglas puras de conteo, meta del ciclo, elección de descanso y preparación/inicio de fases. |
| `src/domain/__tests__/timer.test.ts` | Modificar | Casos límite y transiciones deterministas del ciclo. |
| `src/storage/pomodoro-cycle-storage.ts` | Crear | Persistir/restaurar contador y meta activa con AsyncStorage, manteniendo intacto el formato del contador existente. |
| `src/storage/__tests__/pomodoro-cycle-storage.test.ts` | Crear | Verificar lectura, escritura, compatibilidad con datos guardados actuales y errores de almacenamiento. |
| `src/hooks/use-pomodoro-timer.ts` | Modificar | Hidratación, reconciliación, coordinación idempotente y API de contexto para el ciclo. |
| `src/app/(tabs)/index.tsx` | Modificar | Fase actual, avance del ciclo y transición visual al descanso preparado. |
| `src/app/descanso.tsx` | Modificar | Tipo/duración del descanso, edición sin inicio automático, inicio explícito y retorno al estudio pausado. |
| `MEMORY.md` | Actualizar al concluir | Actualizar únicamente «Estado actual» y «Próximos pasos», según el flujo SDD. |

## Lógica pura y algoritmo

Las funciones de `src/domain/timer.ts` recibirán temporizadores, metas y marcas temporales como argumentos; no leerán React, AsyncStorage ni el reloj global. Reutilizarán el estado y las utilidades existentes cuando sea posible.

```text
al reconciliar estudio:
    si la transición no es de running a finished: conservar contador y fase siguiente
    si el estudio llega a cero:
        incrementar completados usando la meta activa
        si se alcanza la meta activa:
            contador = 0
            preparar descanso largo pausado con duración larga configurada
        si no:
            guardar nuevo contador
            preparar descanso corto pausado con duración corta configurada

al editar duración de descanso:
    validar minutos enteros entre 5 y 30
    actualizar duración inicial y restante de la fase preparada
    conservar status = paused

al iniciar fase preparada:
    llamar la transición de inicio sobre esa misma fase, con now
    conservar remainingMs; no crear ni reiniciar el temporizador

al terminar descanso y volver a la app:
    preparar estudio pausado con su duración inicial configurada
    si se inicia un nuevo ciclo después del descanso largo:
        activar la meta configurada más reciente
    presentar home sin iniciar el estudio

al cambiar la meta configurada:
    si el ciclo actual tiene progreso: conservar su meta activa y registrar la nueva
    si empieza un ciclo nuevo: activar la meta configurada más reciente
```

La detección del fin se apoya en `reconcileTimer` y el reloj monotónico del hook existente. Pausar, reanudar o reiniciar no produce una transición de estudio completado.

## Interfaz

- Home presentará «Estudio» o el estado pertinente de fase y el avance «Pomodoros: X/Y», con texto legible además del color.
- Tras completar estudio, se mostrará la pantalla de descanso correspondiente ya pausada; se cerrará la superposición de fin de estudio de HU-001.
- Descanso corto/largo tendrá etiqueta y duración inicial configurada. El editor existente se mantiene y acepta el rango ya establecido de 5–30 minutos; editar/confirmar no inicia la cuenta. El botón «Iniciar descanso» será la acción explícita.
- Al finalizar el descanso, se presentará home con estudio pausado y la duración inicial disponible; no se mantendrá una opción de inicio automático desde el diálogo anterior.
- Aplicar las convenciones existentes: textos en español, `StyleSheet`, `SafeAreaView`, áreas táctiles de al menos 44×44 puntos, accesibilidad y visualización en orientación vertical y horizontal.

## Estrategia de pruebas

### Jest — dominio

- Completar estudio hasta cero prepara descanso corto antes de la meta y largo al alcanzarla; solo el largo reinicia el contador (RF-01, RF-02).
- Pausa, reanudación y reinicio antes de cero no alteran el contador; reconciliar repetidamente una fase terminada no lo incrementa otra vez (RF-05).
- Completar descanso prepara estudio pausado con duración inicial (RF-03).
- Actualizar una duración preparada mantiene la fase pausada; iniciar usa la duración restante/inicial preparada sin duplicarla ni adelantarla (RF-08).
- La meta activa no cambia durante un ciclo en curso y la nueva meta se activa al empezar el siguiente ciclo (RF-07).
- Formato visible de fase y ciclo usa contador y meta activa (RF-04, RNF-01).

### Jest — almacenamiento

- Guardar y restaurar el contador como cadena en la clave existente; restaurar la meta activa en su clave adicional (RF-06, RF-07, RNF-02).
- Mantener compatibilidad con contador guardado antes de este cambio.
- Rechazar o reportar valores inválidos y propagar/reportar errores de lectura y escritura; verificar que la hidratación no se sobrescribe con el valor inicial.

### Comprobación manual en Expo Go

- Completar un estudio antes de la meta: se presenta descanso corto pausado; en la meta, descanso largo y contador reiniciado.
- Reiniciar o pausar/reanudar estudio: no aumenta el progreso.
- Confirmar la duración sugerida o editarla: la cuenta permanece pausada hasta tocar «Iniciar descanso».
- Completar ambos tipos de descanso y volver a home: estudio pausado y listo, sin inicio automático.
- Cerrar y abrir la aplicación: contador recuperado; comprobar meta visible y siguiente transición.
- Revisar textos de fase, formato «Pomodoros: X/Y», accesibilidad, áreas seguras y orientación vertical/horizontal según `rn-conventions`.

## Trazabilidad

| Requisito | Plan | Evidencia prevista |
|---|---|---|
| RF-01 | P1.1, P2.2, P3.1, P3.2 | Transición de estudio a descanso corto preparado y presentación pausada. |
| RF-02 | P1.1, P1.2, P2.2, P3.1, P3.2 | Descanso largo al alcanzar la meta y contador reiniciado. |
| RF-03 | P1.1, P2.2, P3.2 | Fin del descanso prepara estudio con duración inicial y pausa. |
| RF-04 | P1.2, P2.2, P3.1, P3.2 | Fase actual y formato «Pomodoros: X/Y» usando la meta activa. |
| RF-05 | P1.1, P2.2, P3.1 | Pruebas de reinicio/pausa y transición de fin única. |
| RF-06 | P2.1, P2.2, P3.1 | Restauración local del contador al abrir la app. |
| RF-07 | P1.2, P2.1, P2.2, P3.1 | Meta activa estable durante el ciclo y nueva meta aplicada al siguiente. |
| RF-08 | P1.1, P2.2, P3.2 | Inicio manual de temporizador preparado sin reiniciar su duración. |
| RNF-01 | P3.1, P3.2, P4.1 | Etiqueta legible de fase y avance del ciclo. |
| RNF-02 | P2.1, P2.2, P4.1 | Contador guardado y recuperado localmente sin cambiar el formato existente. |

## Riesgos y límites

- HU-005 aún no existe; esta historia no incorpora una pantalla para cambiar metas o tiempos. Se conserva el valor por defecto y se prepara un punto de integración para la configuración futura.
- La restauración del contador y de la meta activa debe finalizar antes de guardar progreso; de lo contrario, el valor inicial podría reemplazar el dato local existente.
- Las transiciones de finalización ocurren dentro del proveedor compartido y deben ser idempotentes para evitar duplicar el contador durante ticks o al reanudar la app.
