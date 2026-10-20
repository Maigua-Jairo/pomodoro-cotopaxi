# Plan 007 — Detener una fase y pasar a la siguiente

Spec: specs/007-detener-fase/spec.md (aprobada) · Decisiones: D-01 a D-07

## Resumen

El temporizador ya tiene todo lo necesario para una transición de fase: el ciclo, los ajustes, la persistencia de la sesión, la reprogramación del aviso y la navegación automática entre inicio y descanso según `breakType`. Este plan añade dos transiciones puras («detener estudio» y «detener descanso»), dos acciones en el reducer que las usan sin activar la alarma, y un botón «Detener» con confirmación en las pantallas de inicio y de descanso.

No cambia el formato de los datos guardados. La sesión resultante de detener es la misma que ya se guarda cuando un descanso está corriendo o cuando un estudio está preparado.

## Archivos y responsabilidades

| Archivo | Acción | Responsabilidad | RF |
|---|---|---|---|
| `src/domain/timer.ts` | Modificar | Funciones puras `stopFocusPhase` y `stopBreakPhase`. | RF-03, RF-05, RF-06, RF-09 |
| `src/domain/__tests__/timer.test.ts` | Modificar | Pruebas de ambas transiciones. | Ídem |
| `src/hooks/use-pomodoro-timer.ts` | Modificar | Acciones `stop-focus` y `stop-break`; callbacks `stopFocus` y `stopBreak` en el contexto. | RF-03, RF-05, RF-06, RF-08, RF-09 |
| `src/hooks/__tests__/pomodoro-timer-reducer.test.ts` | Modificar | Pruebas de las acciones: sin alarma, aviso reprogramado, sin efecto si la fase ya terminó. | RF-08, RF-09 |
| `src/components/app-icon.tsx` | Modificar | Ícono `stop` (iOS `stop.fill`, Android `stop`, verificados en SDK 57). | RF-01, RF-04 |
| `src/app/(tabs)/index.tsx` | Modificar | Botón «Detener» y confirmación del estudio. | RF-01, RF-02, RF-07 |
| `src/app/descanso.tsx` | Modificar | Botón «Detener» y confirmación del descanso. | RF-04, RF-05, RF-07 |

## Funciones puras (`src/domain/timer.ts`)

```ts
stopFocusPhase(focusTimer, cycle, shortBreakMinutes, now)
  -> { focusTimer, breakTimer, breakType: 'short', cycle } | null
stopBreakPhase(cycle, breakType, focusDurationMs)
  -> { focusTimer, breakTimer, cycle }
```

- **Fase iniciada:** `status` es `running`, o `paused` con `remainingMs < initialDurationMs` (misma definición que la spec 005).
- `stopFocusPhase` devuelve `null` si el estudio no está iniciado o si, reconciliado con `now`, ya llegó a cero (RF-09). Si no:
  - El estudio queda `finished` con `remainingMs = 0`, como al terminar normalmente.
  - El ciclo no cambia: no suma pomodoro (D-01).
  - El descanso es corto, con la duración de los ajustes, y queda iniciado con `startTimer(…, now)` (RF-03).
- `stopBreakPhase`:
  - Crea un estudio nuevo y pausado con la duración de los ajustes (D-02).
  - Vacía el descanso (`createBreakTimer`).
  - Aplica `completePomodoroBreak(cycle, breakType)`. Para un descanso largo, esto reinicia el ciclo con la meta configurada (RF-06, D-05); para uno corto, no cambia nada.

## Algoritmo del reducer

```
'stop-focus' { now, nowEpochMs }:
    si no está hidratado, hay error de hidratación o breakType != null -> sin cambios
    resultado = stopFocusPhase(focusTimer, cycle, ajustes.shortBreakMinutes, now)
    si resultado es null -> sin cambios      (fase no iniciada o ya terminó: el tick aplica el fin normal, RF-09)
    devolver estado con resultado,
        expiresAtEpochMs = nowEpochMs + breakTimer.remainingMs
        notificationId   = null              (el efecto existente cancela el aviso viejo y programa el nuevo, RF-08)
        isAlarmActive / alarmPhase sin cambios (no suena la alarma, D-06)
        canPersistSession = true

'stop-break' { now }:
    si breakType == null o el descanso no está iniciado -> sin cambios
    si reconcileTimer(breakTimer, now) terminó -> sin cambios   (RF-09)
    resultado = stopBreakPhase(cycle, breakType, ajustes.focusMinutes)
    devolver estado con resultado, breakType = null,
        expiresAtEpochMs = null, notificationId = null, sin alarma
```

La navegación ya existe:
- La pantalla de inicio pasa a `/descanso` cuando hay `breakType` y no hay alarma.
- La de descanso vuelve a `/(tabs)` cuando `breakType` es `null`.

## Interfaz

- **Inicio:** con el estudio iniciado (corriendo o pausado a mitad), aparece «Detener» entre «Pausar/Reanudar» y «Reiniciar».
  - Variante secundaria (azul `#100048`), ícono de stop y etiqueta accesible «Detener estudio».
  - Abre un `Alert.alert` con el título «Detener estudio», el mensaje de RF-02, «Cancelar» (estilo `cancel`) y «Detener» (estilo `destructive`).
- **Descanso:** igual, con el descanso iniciado.
  - Título «Detener descanso», mensaje de RF-05 y etiqueta «Detener descanso».
- Cancelar no despacha nada, así que la fase sigue igual (RF-07).
- Botones con `ActionButton` de 68 de alto (supera los 44×44), textos en español y paleta de `cotopaxi-brand`.

## Decisiones técnicas

| Decisión | Elegida | Alternativa descartada |
|---|---|---|
| Dónde vive la regla | Funciones puras en el dominio, probadas con Jest (constitución, principios 3 y 4). | Calcular la transición dentro del reducer o de la pantalla. |
| Fin con el diálogo abierto (D-07) | La acción reconcilia con `now`; si la fase ya terminó, no hace nada y el tick aplica el fin normal. | Bloquear el tick mientras el diálogo está abierto: alteraría la exactitud del tiempo. |
| Sin alarma (D-06) | Las acciones no tocan `isAlarmActive`. | Reutilizar `completeFocusTransition`, que activa la alarma. |
| Aviso del sistema (RF-08) | Cambiar `expiresAtEpochMs` y vaciar `notificationId`; el efecto existente cancela el aviso anterior y programa el del descanso. | Llamar a la API de notificaciones desde la pantalla. |
| Estado del estudio detenido | `finished` con `remainingMs = 0`, igual que tras un fin normal. Así la sesión guardada sigue siendo válida sin cambiar el formato. | Un estado nuevo `stopped`: obliga a cambiar la validación y el formato de la sesión (principio 5). |

## Estrategia de pruebas con Jest

- **`timer.test.ts`:**
  - `stopFocusPhase`:
    - Con estudio corriendo y con estudio pausado a mitad, devuelve un descanso corto corriendo con la duración pedida, y el estudio queda `finished`.
    - Con 3 de 4 pomodoros, el ciclo sigue en 3.
    - Con estudio preparado devuelve `null`, y también si `now` ya pasó el vencimiento.
  - `stopBreakPhase`:
    - Tras un descanso corto, el ciclo no cambia y el estudio queda nuevo y pausado con la duración pedida.
    - Tras uno largo, el contador queda en 0, `hasStarted` en `false` y la meta activa pasa a ser la configurada.
- **`pomodoro-timer-reducer.test.ts`:**
  - `stop-focus`:
    - Deja `breakType: 'short'`, el descanso corriendo, `expiresAtEpochMs` calculado y `notificationId: null`.
    - No activa la alarma.
    - No tiene efecto con el estudio vencido.
  - `stop-break` deja `breakType: null` y el estudio preparado, sin alarma.
- **Interfaz:** verificación manual en Expo Go con la lista de `rn-conventions` y los casos límite de la spec, incluido cerrar la app tras detener (RNF-01).
- Al cerrar: `npx jest`, `npx expo lint` y `npx tsc --noEmit`.

## Cobertura de RF

| RF | Parte del plan |
|---|---|
| RF-01, RF-02 | Botón y confirmación en inicio |
| RF-03 | `stopFocusPhase`, acción `stop-focus` |
| RF-04, RF-05 | Botón y confirmación en descanso, `stopBreakPhase`, acción `stop-break` |
| RF-06 | `stopBreakPhase` con descanso largo |
| RF-07 | Cancelar no despacha acciones |
| RF-08 | Acciones sin alarma; reprogramación del aviso con el efecto existente |
| RF-09 | Reconciliación con `now` antes de detener |
| RNF-01 | Sesión guardada con el formato actual; restauración de HU-003 |
| RNF-02 | `Alert.alert` en español con opción de cancelar |
