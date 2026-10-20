# Plan: Iniciar y controlar una sesión de estudio

**Spec:** [spec.md](./spec.md)  
**Decisiones:** [decisiones.md](./decisiones.md)  
**Estado de la spec:** Aprobada

## Resumen

Implementar el temporizador de concentración desde la pantalla principal, la pantalla de configuración e inicio del descanso y las opciones al terminar ambas cuentas. La lógica será pura y recibirá marcas de tiempo monotónicas; las pantallas Expo Router mostrarán su estado y recogerán las acciones del estudiante. No se añadirá persistencia ni dependencias de ejecución porque la spec no las requiere.

La spec contiene RF-01 a RF-11 y RNF-01. El alcance se limita a esos requisitos; no incluye la configuración general de concentración de HU-005 ni el comportamiento de la nueva cuenta de concentración después de que llegue a cero.

## Contexto técnico

- **Lenguaje/plataforma:** TypeScript, Expo SDK 57, React Native 0.86 y Expo Router.
- **Rutas actuales:** la pantalla principal corresponde a `src/app/(tabs)/index.tsx`; `src/app/_layout.tsx` es el punto de composición de rutas. Se añadirá `src/app/descanso.tsx`.
- **Lógica:** el repositorio aún no contiene módulos de dominio ni de almacenamiento. La cuenta y sus transiciones se implementarán en `src/domain/`, sin React ni almacenamiento.
- **Reloj:** React Native expone `performance.now()` como reloj monotónico con origen en el inicio del sistema. El dominio recibirá la hora como argumento para poder probar saltos del reloj civil sin depender del dispositivo. La pantalla reconciliará la cuenta al reanudarse y no dependerá de que cada `setInterval` ocurra puntualmente.
- **Estado entre rutas:** un proveedor en la raíz conserva el estado en memoria mientras el estudiante navega entre home y descanso; no se depende del montaje de una pantalla ni se persiste una sesión.
- **Interfaz:** usar Expo Router, componentes React Native, `StyleSheet`, áreas seguras y la paleta de Cotopaxi. Los textos serán en español; la duración del descanso usará entrada numérica.
- **Pruebas:** la lógica tendrá pruebas unitarias con Jest y reloj simulado. `package.json` no contiene Jest ni un script de pruebas; antes de añadir dependencias de pruebas se pedirá aprobación, conforme a la constitución. La verificación visual de interfaz se hará manualmente en Expo Go.
- **Persistencia:** no se persiste el progreso del temporizador. Se utiliza la duración de concentración disponible en la aplicación; hasta que exista el módulo de ajustes de HU-005, se usará el valor predeterminado de 25 minutos establecido en `.github/skills/pomodoro-rules/SKILL.md`.
- **Restricciones:** no añadir dependencias de ejecución ni cambiar el formato de datos guardados. No crear funciones de descanso adicionales a las que especifican RF-08, RF-10 y RF-11.

## Comprobación de la constitución

| Principio | Resultado y aplicación |
|---|---|
| Simplicidad primero | Cumple: no requiere librerías de temporizador, notificaciones ni persistencia adicional. |
| La spec manda | Cumple: la pantalla de descanso y los estados al finalizar se limitan a RF-08, RF-10 y RF-11. |
| Lógica separada de interfaz | Cumple: transiciones y cálculo en `src/domain/timer.ts`; React se limita a presentar y despachar eventos. |
| Pruebas como puerta | Cumple con condición: la lógica tendrá pruebas Jest; primero se necesita aprobación para configurar Jest, que aún no existe en el proyecto. |
| Los datos del usuario son sagrados | Cumple: este alcance no modifica ajustes almacenados ni el formato de persistencia. |
| Exactitud del tiempo | Cumple con verificación manual requerida: cuenta a partir de tiempo monotónico y recalcula al reanudarse, sin usar `Date.now()` como fuente de duración. |

## Decisiones de implementación

| Decisión | Aplicación | Alternativa descartada |
|---|---|---|
| D-01, D-06 | Un toque repetido en iniciar no reinicia el estado; volver a home no inicia una cuenta nueva. | Reiniciar automáticamente la cuenta activa o iniciar otra al volver. |
| D-02 | El núcleo recibe un tiempo monotónico inyectable y no calcula duración con la hora civil del teléfono. | Restar valores de `Date.now()`, que cambiarían si el estudiante ajusta la hora. |
| D-03, D-05, D-09 | Al completar cada cuenta se presenta la superposición y acciones definidas por la spec. | Transición automática sin elección del estudiante. |
| D-04, D-07 | Cancelar conserva tiempo y estado; confirmar reinicio restaura el tiempo inicial y deja el temporizador pausado. | Cambiar el estado durante la cancelación o reanudar automáticamente después del reinicio. |
| D-08 | El descanso comienza mostrando 0; solo un valor entero de 5 a 30 minutos confirmado inicia la cuenta. | Iniciar una duración predeterminada o aceptar valores vacíos/fuera del rango. |
| D-10 | «Regresar a home» tras el descanso restaura la duración inicial de concentración elegida y deja la cuenta pausada. | Mostrar el tiempo agotado del descanso o comenzar concentración automáticamente. |
| RNF-01 | El formato `MM:SS` se calcula en el dominio y se presenta igual en ambas pantallas. | Mantener formato de tiempo duplicado y potencialmente inconsistente en cada pantalla. |

## Pasos de implementación

### P1.1 — Preparar pruebas unitarias

- **Requisitos:** RF-01 a RF-11, RNF-01 (infraestructura de verificación).
- **Archivos:** `package.json` y configuración de Jest que se acuerde para Expo SDK 57.
- **Descripción:** comprobar y configurar el ejecutor compatible con Expo. La ejecución de Jest requiere aprobación explícita antes de instalar dependencias que hoy no están en el manifiesto.

### P1.2 — Crear modelo puro del temporizador

- **Requisitos:** RF-01 a RF-06, RF-08, RF-10, RF-11, RNF-01.
- **Archivos:** crear `src/domain/timer.ts` y `src/domain/__tests__/timer.test.ts`.
- **Descripción:** definir estados tipados para concentración y descanso; funciones puras para iniciar, pausar, reanudar, reiniciar, reconciliar con una marca temporal, validar duración y formatear `MM:SS`. El reinicio confirmado usa el tiempo inicial y estado pausado. La acción de iniciar durante ejecución no cambia el estado. El dominio no importa React Native ni lee el reloj global.

### P1.3 — Integrar reloj monotónico y actualización de pantalla

- **Requisitos:** RF-01, RF-02, RF-05, RF-08, RF-10, RNF-01.
- **Archivos:** crear `src/hooks/use-pomodoro-timer.ts`.
- **Descripción:** conectar el dominio a `performance.now()`, actualizar la presentación periódicamente y recalcular el estado al volver la app a primer plano. El hook/proveedor raíz conserva los temporizadores de concentración y descanso al navegar entre pantallas. Cada actualización calcula el restante desde las marcas guardadas, no decrementando un contador por tick. Verificar especialmente los cambios manuales de la hora y las pausas de ejecución de JavaScript en segundo plano.

### P1.4 — Habilitar rutas para temporizador y descanso

- **Requisitos:** RF-07 a RF-11.
- **Archivos:** modificar `src/app/_layout.tsx`.
- **Descripción:** envolver el navegador Expo Router con el proveedor del temporizador y configurar las rutas principal y `descanso`. El layout actual importa componentes de navegación que no están presentes en `src/components/`; reemplazar esa composición por rutas Expo Router funcionales en vez de añadir dependencias de navegación paralelas.

### P1.5 — Implementar controles de concentración

- **Requisitos:** RF-01 a RF-06, RNF-01.
- **Archivos:** modificar `src/app/(tabs)/index.tsx`.
- **Descripción:** reemplazar el contenido de plantilla por la pantalla principal con tiempo `MM:SS` y controles de iniciar, pausar, reanudar y reiniciar. El reinicio pedirá confirmación mediante diálogo nativo; cancelar preserva el estado y confirmar restaura el tiempo inicial pausado. Respetar áreas seguras, paleta institucional, accesibilidad y objetivos táctiles.

### P1.6 — Presentar acciones al terminar concentración

- **Requisitos:** RF-07, RF-09.
- **Archivos:** modificar `src/app/(tabs)/index.tsx`.
- **Descripción:** mostrar la pantalla sobrepuesta al llegar a cero. «Tomar un descanso» navega a la ruta de descanso; «Regresar al home» vuelve al temporizador principal sin iniciar otra cuenta.

### P1.7 — Configurar e iniciar el descanso

- **Requisitos:** RF-08, RNF-01.
- **Archivos:** crear `src/app/descanso.tsx`.
- **Descripción:** mostrar inicialmente `00:00`; al pulsar el reloj, permitir ingresar minutos enteros entre 5 y 30 con teclado numérico. Al confirmar un valor válido, iniciar la cuenta atrás y mostrar controles de tiempo con `MM:SS`. No añadir acciones que no estén en la spec.

### P1.8 — Presentar acciones al terminar descanso

- **Requisitos:** RF-10, RF-11.
- **Archivos:** modificar `src/app/descanso.tsx` y `src/app/(tabs)/index.tsx`.
- **Descripción:** al completar el descanso, mostrar la superposición con «Iniciar concentración» y «Regresar a home». La primera vuelve al temporizador principal y comienza con la duración de concentración disponible; la segunda vuelve al temporizador principal pausado y mostrando la duración inicial elegida.

### P1.9 — Validar cobertura de requisitos

- **Requisitos:** RF-01 a RF-11, RNF-01.
- **Archivos:** pruebas en `src/domain/__tests__/timer.test.ts`, pruebas del hook si se crean, y pantallas de concentración y descanso.
- **Descripción:** ejecutar Jest para lógica, lint y TypeScript; completar la comprobación manual en Expo Go en orientación vertical y horizontal, incluidos temporizadores, diálogos, navegación, teclado, contraste, textos y accesibilidad. No marcar validación visual como realizada hasta comprobarla en dispositivo/emulador.

## Algoritmo del temporizador

```text
crear fase(initialDurationMs, now):
    state = paused
    remainingMs = initialDurationMs

start(state, now):
    si state == running: devolver el mismo estado
    si no: startedAt = now; state = running

pause(state, now):
    si state != running: devolver el estado sin cambios
    remainingMs = max(0, remainingMs - (now - startedAt))
    state = paused

reconcile(state, now):
    si state != running: devolver el estado sin cambios
    remainingMs = max(0, remainingMs - (now - startedAt))
    startedAt = now
    si remainingMs == 0: state = finished

resetConfirmed(initialDurationMs):
    remainingMs = initialDurationMs
    state = paused

resetCancelled(state):
    devolver exactamente el estado y restante que había al abrir el diálogo

startBreak(minutes):
    rechazar si minutes no es entero o no está entre 5 y 30
    crear/iniciar fase de descanso con minutes * 60_000

format(remainingMs):
    totalSeconds = ceil(max(0, remainingMs) / 1000)
    devolver minutos y segundos con dos dígitos: MM:SS
```

`startedAt` y `now` son valores de reloj monotónico suministrados al dominio. Cada reconciliación reemplaza la marca de inicio y el restante para que una sesión larga no acumule error por ticks. Se cubren esos cálculos con reloj falso; la suspensión real y el cambio de hora se confirman también manualmente en Expo Go.

## Estructura prevista

```text
src/
  app/
    _layout.tsx                        # Navegación Expo Router
    (tabs)/
      index.tsx                        # Pantalla principal de concentración
    descanso.tsx                       # Configuración, cuenta y fin del descanso
  domain/
    timer.ts                           # Estado y transiciones puras de temporizador
    __tests__/
      timer.test.ts                    # Pruebas del dominio con reloj simulado
  hooks/
    use-pomodoro-timer.ts              # Proveedor compartido, reloj y ciclo de vida
```

`package.json` y la configuración de Jest solo se modificarán tras aprobación de cualquier dependencia de prueba necesaria. No se modificarán `src/storage/` ni formatos de datos persistidos.

## Estrategia de pruebas

### Jest

- Iniciar, pausar y reanudar conservando el restante (RF-01, RF-02).
- Reiniciar confirma el tiempo inicial pausado y cancelar conserva estado y restante tanto corriendo como pausado (RF-03, RF-04).
- Un segundo inicio no duplica ni reinicia una cuenta activa (RF-06).
- Reconciliar con un reloj monotónico simulado produce el mismo restante independientemente del reloj civil (RF-05).
- Cero termina la fase y no produce valores negativos; el formato genera `MM:SS` con redondeo al segundo visible (RF-01, RF-07, RNF-01).
- El descanso arranca solo después de confirmar valor entero entre 5 y 30; rechazar 0, 4, 31, fracciones y valores no numéricos (RF-08).
- Completar el descanso ofrece acciones separadas; las transiciones vuelven a concentración iniciada o pausada con su duración inicial (RF-10, RF-11).

### Comprobación manual en Expo Go

- En vertical y horizontal: pantalla de concentración, `MM:SS`, estados y botones táctiles de al menos 44x44 puntos.
- Pausar, reanudar, iniciar de nuevo, cancelar y confirmar reinicio en las dos condiciones especificadas.
- Durante la cuenta activa, cambiar manualmente la hora y luego reanudar la app; comprobar que no salta el restante y que no depende de que los ticks se hayan ejecutado en segundo plano.
- Al terminar concentración, verificar que aparecen ambos botones; comprobar sus dos destinos.
- Descanso: reloj inicialmente en `00:00`, teclado numérico, límites 5 y 30, comienzo solo al confirmar.
- Al terminar descanso, comprobar ambos botones, duración inicial de concentración y estado iniciado/pausado según la selección.
- Verificar textos en español, áreas seguras, paleta Cotopaxi, contraste y etiquetas de accesibilidad.

## Trazabilidad de requisitos

| Requisito | Pasos | Evidencia prevista |
|---|---|---|
| RF-01 | P1.2, P1.3, P1.5 | Dominio y pantalla principal muestran cuenta desde duración configurada. |
| RF-02 | P1.2, P1.3, P1.5 | Pruebas de conservar restante al pausar y reanudar. |
| RF-03 | P1.2, P1.5 | Confirmación reinicia a la duración inicial y deja pausado. |
| RF-04 | P1.2, P1.5 | Cancelación conserva restante y estado previo. |
| RF-05 | P1.2, P1.3 | Reloj monotónico inyectado y validación manual del ajuste de hora. |
| RF-06 | P1.2, P1.5 | Inicio repetido deja intacta la cuenta activa. |
| RF-07 | P1.2, P1.6 | Llegar a cero presenta las dos acciones. |
| RF-08 | P1.2, P1.7 | Ruta de descanso inicia en cero y valida 5–30 antes de contar. |
| RF-09 | P1.6 | Volver al temporizador principal sin iniciar concentración. |
| RF-10 | P1.2, P1.8 | Fin de descanso y acción para volver con concentración iniciada. |
| RF-11 | P1.2, P1.8 | Fin de descanso y vuelta pausada con duración inicial. |
| RNF-01 | P1.2, P1.3, P1.5, P1.7 | Formateador probado y formato `MM:SS` en ambas pantallas. |

## Riesgos y bloqueos conocidos

- **Jest no está instalado ni configurado.** La primera tarea requiere aprobación antes de añadir los paquetes de desarrollo compatibles con Expo SDK 57.
- **Ajuste de reloj y suspensión:** se requiere verificar en Expo Go que el reloj monotónico de React Native conserva el tiempo transcurrido al regresar de segundo plano. Si la plataforma no satisface RF-05, detenerse y pedir una decisión antes de introducir una dependencia nativa o cambiar el alcance.
- **Ajustes de concentración:** no hay actualmente un módulo de ajustes en `src/`. En este alcance se usa el predeterminado de 25 minutos documentado en las reglas Pomodoro; conectar la pantalla de ajustes queda para HU-005.
