# Plan 005 — Ajustar los tiempos del pomodoro

Spec: specs/005-ajustar-tiempos/spec.md (aprobada) · Decisiones: D-01 a D-12

## Resumen

Hoy la duración del estudio es una constante (`DEFAULT_FOCUS_DURATION_MS`), los descansos usan 5 y 15 minutos por defecto y la pantalla de descanso permite editar el descanso preparado con un rango fijo de 5 a 30 minutos. La meta del ciclo ya distingue entre meta activa (`activeCycleLength`) y meta configurada (`configuredCycleLength`), que se aplica tras el descanso largo, como pide HU-002.

El plan añade un modelo de ajustes con validación pura en el dominio, una función pura que aplica los ajustes guardados a la sesión actual (fase preparada frente a iniciada y meta del ciclo), un almacenamiento propio para los ajustes, la integración en el proveedor del temporizador y una pantalla de ajustes nueva. Se elimina el editor de duración de la pantalla de descanso (D-12).

## Archivos y responsabilidades

| Archivo | Acción | Responsabilidad | RF |
|---|---|---|---|
| `src/domain/settings.ts` | Crear | Tipo `PomodoroSettings`, valores por defecto, rangos permitidos, validación del formulario y aplicación de ajustes a la sesión. Solo funciones puras. | RF-02, RF-04, RF-05, RF-06, RF-07, RF-10, RF-12 |
| `src/domain/__tests__/settings.test.ts` | Crear | Pruebas de validación y de aplicación de ajustes. | Ídem |
| `src/domain/timer.ts` | Modificar | `prepareFocusAfterBreak` recibe la duración de estudio vigente; se eliminan `MIN/MAX_BREAK_DURATION_MINUTES`, `isValidBreakDuration`, `setPreparedBreakDuration` y `startBreakTimer` (rango 5–30 sustituido por D-02). | RF-04, RF-13 |
| `src/domain/__tests__/timer.test.ts` | Modificar | Retirar las pruebas del rango 5–30 y del editor de descanso; adaptar la de estudio tras el descanso. | RF-04, RF-13 |
| `src/storage/pomodoro-settings-storage.ts` | Crear | Cargar y guardar los ajustes; distinguir «sin ajustes» (valores por defecto) de «ajustes ilegibles» (error). | RF-02, RF-03, RF-11; RNF-01 |
| `src/storage/__tests__/pomodoro-settings-storage.test.ts` | Crear | Pruebas con AsyncStorage simulado. | Ídem |
| `src/hooks/use-pomodoro-timer.ts` | Modificar | Hidratar los ajustes antes de la sesión, exponer `settings`, `saveSettings`, `resetSettings` y `settingsMessage`; usar los ajustes en las transiciones; quitar `setBreakDuration` y `setConfiguredCycleLength`. | RF-02 a RF-06, RF-08, RF-10 a RF-12; RNF-02 |
| `src/app/ajustes.tsx` | Crear | Pantalla de ajustes: cuatro campos, errores por campo, Guardar, Restablecer y confirmación al salir con cambios. | RF-01, RF-07 a RF-10; RNF-03 |
| `src/app/(tabs)/index.tsx` | Modificar | Botón «Ajustes» y aviso de ajustes no cargados. | RF-01, RF-11 |
| `src/app/descanso.tsx` | Modificar | Quitar el editor de duración; añadir el botón «Ajustes». | RF-01, RF-13 |

## Funciones puras (`src/domain/settings.ts`)

```ts
type SettingsField = 'focusMinutes' | 'shortBreakMinutes' | 'longBreakMinutes' | 'cycleLength';
type PomodoroSettings = Record<SettingsField, number>;

DEFAULT_SETTINGS = { focusMinutes: 25, shortBreakMinutes: 5, longBreakMinutes: 15, cycleLength: 4 }
SETTINGS_RANGES  = { focusMinutes: [1,120], shortBreakMinutes: [1,30], longBreakMinutes: [1,60], cycleLength: [4,8] }

isValidSettings(value: unknown): value is PomodoroSettings
validateSettingsInput(input: Record<SettingsField, string>)
  -> { success: true; settings } | { success: false; errors: Partial<Record<SettingsField, string>> }
applySettingsToSession({ focusTimer, breakTimer, breakType, cycle }, settings)
  -> { focusTimer, breakTimer, cycle, cycleGoalReached: boolean }
```

- **Validación (RF-07, D-06):** cada texto debe cumplir `/^\d+$/` (rechaza vacío, signo y decimales) y estar dentro de su rango; el mensaje por campo es «Ingresa un número entero entre {mín} y {máx}.». Si hay al menos un error no se devuelve ningún ajuste.
- **Fase preparada (D-04):** un temporizador `paused` con `remainingMs === initialDurationMs`. Solo una fase preparada adopta la nueva duración.

## Persistencia

- Clave nueva `pomodoro-cotopaxi:settings:v1`, valor JSON `{ version: 1, focusMinutes, shortBreakMinutes, longBreakMinutes, cycleLength }`.
- `loadPomodoroSettings()`:
  - Sin valor guardado → `DEFAULT_SETTINGS` (RF-02).
  - JSON inválido, versión desconocida o valores fuera de rango → lanza error (RF-11).
- `savePomodoroSettings(settings)` valida con `isValidSettings` antes de escribir.
- Un valor ilegible **no se borra ni se sobrescribe** al cargar; solo se reemplaza cuando el estudiante guarda o restablece (constitución, principio 5; RNF-01).
- La sesión (`pomodoro-session-storage`) y el ciclo (`pomodoro-cycle-storage`) no cambian de formato: la duración de cada fase ya va en su `TimerState` y `configuredCycleLength` en el ciclo.

## Algoritmo

```
applySettingsToSession(sesión, ajustes):
    focusTimer = si focusTimer está preparado
                    -> createFocusTimer(ajustes.focusMinutes * 60_000)
                 si no -> sin cambios                                   (RF-04, RF-05)
    breakTimer = si breakType != null y breakTimer está preparado
                    -> createPreparedBreakTimer(minutos del tipo de descanso)
                 si no -> sin cambios                                   (RF-04, RF-05)
    ciclo.configuredCycleLength = ajustes.cycleLength
    si el ciclo no ha empezado:
        ciclo.activeCycleLength = ajustes.cycleLength
    si no, si ajustes.cycleLength <= ciclo.pomodoroCount:                (RF-06, D-05, D-09)
        ciclo.activeCycleLength = ciclo.pomodoroCount + 1
        -> al completar el próximo estudio, completePomodoroCycle da «largo»
           y el contador vuelve a cero; tras el descanso largo la meta
           activa pasa a ser la configurada
    si no:                                                               (RF-12, D-11)
        se conserva activeCycleLength hasta el siguiente ciclo
    cycleGoalReached = ciclo empezado y ajustes.cycleLength == pomodoroCount   (RF-10)

saveSettings(ajustes) en el proveedor:
    await savePomodoroSettings(ajustes)                                  (RF-03)
    dispatch('apply-settings', ajustes)  -> applySettingsToSession + limpia settingsMessage
    devolver { cycleGoalReached }

hidratación:
    ajustes = loadPomodoroSettings(); si falla -> DEFAULT_SETTINGS
              y settingsMessage = mensaje de RF-11                        (RF-11)
    sesión  = flujo actual de HU-003
    aplicar applySettingsToSession a la sesión hidratada (idempotente)

transiciones:
    completeFocusPhase(..., ajustes.shortBreakMinutes, ajustes.longBreakMinutes)
    prepareFocusAfterBreak(focusTimer, ajustes.focusMinutes)              (RF-04)
    reset-focus -> la fase vuelve a ser preparada y usa ajustes.focusMinutes
```

## Interfaz

- **Ruta nueva `/ajustes`** (`src/app/ajustes.tsx`) en el Stack raíz, con título «Ajustes». Se abre con el botón de engranaje (48×48, etiqueta «Abrir ajustes») del encabezado de las pantallas de inicio y de descanso (RF-01).
- **Formulario:** `SafeAreaView` + `KeyboardAvoidingView` + `ScrollView` con `keyboardShouldPersistTaps="handled"`. Cuatro `TextInput` con `keyboardType="number-pad"`, etiqueta con el rango («Estudio (1–120 minutos)») y `accessibilityLabel`. Los errores aparecen debajo de cada campo en Crimson `#e60023` con `accessibilityLiveRegion="polite"` (RF-07, RNF-03).
- **Botones** de al menos 44×44:
  - «Guardar»: primario, fondo `#F8A800` y texto `#100048`.
  - «Restablecer valores por defecto»: destructivo, fondo `#e60023` y texto blanco, con `Alert.alert` de confirmación (RF-08).
- **Tras guardar:**
  - Si `cycleGoalReached`, se muestra un `Alert.alert` con el mensaje de RF-10 y la pantalla se cierra al aceptar.
  - Si no, la pantalla se cierra directamente.
- **Salir con cambios sin guardar (RF-09):** `usePreventRemove(hayCambios, …)` de `expo-router/react-navigation` (verificado en SDK 57). Abre un `Alert.alert` con «Seguir editando» y «Descartar»; esta última ejecuta `navigation.dispatch(data.action)`.
- **Aviso RF-11:** tarjeta con borde Crimson en la pantalla de inicio, con el mensaje y un botón «Ir a Ajustes». Desaparece al guardar o restablecer.
- **Pantalla de descanso:** se eliminan el reloj pulsable, el formulario y sus estados; el reloj queda como `accessibilityRole="timer"` (RF-13).
- Paleta de `cotopaxi-brand`; fondo de pantalla `#F8F8F8` y campos con fondo `#FFFFFF` y texto `#1F2A2C`. Todos los textos en español.

## Decisiones técnicas

| Decisión | Elegida | Alternativa descartada |
|---|---|---|
| Dónde vive la lógica de aplicar ajustes | Función pura `applySettingsToSession` en el dominio, probada con Jest (constitución, principios 3 y 4). | Lógica dentro del reducer del hook: no se puede probar sin montar el proveedor. |
| Reducir el ciclo bajo lo completado (D-05, D-09) | Fijar `activeCycleLength = pomodoroCount + 1`, reutilizando `completePomodoroCycle` y `completePomodoroBreak` sin cambiarlas. | Una bandera nueva «forzar descanso largo» en el ciclo: cambia el formato de la sesión guardada y duplica la regla. |
| Almacenamiento | Clave JSON versionada independiente para los ajustes. | Guardar los ajustes dentro de la sesión: un error de sesión borraría los ajustes y viceversa (principio 5). |
| Ajustes ilegibles (D-10) | Se usan valores por defecto en memoria sin sobrescribir lo guardado. | Borrar el valor dañado al cargar: destruye datos que el estudiante podría recuperar. |
| Reiniciar el estudio | La fase reiniciada queda preparada y toma la duración de los ajustes vigentes (coherente con D-04). | Volver a la duración original de la fase: dejaría una fase preparada con un valor distinto al guardado. |
| Fallo al escribir los ajustes | No se aplica nada y la pantalla muestra «No se pudieron guardar los ajustes. Inténtalo de nuevo.» | Aplicar en memoria aunque no se guarde: incumple RF-03. (D-13, RF-14). |
| Bloquear la salida con cambios | `usePreventRemove` (cubre el botón atrás, el gesto y el encabezado). | Interceptar solo el botón del encabezado: el gesto de Android/iOS saltaría la confirmación. |
| Editor del descanso (D-12) | Eliminarlo junto con las funciones del rango 5–30. | Mantenerlo con los nuevos rangos: dos formas de cambiar el mismo dato. |

## Cambio tras la verificación (D-14, RF-15)

- `hasDeferredDurationChange(sesión, ajustesPrevios, ajustesNuevos)` (pura, en `settings.ts`): verdadero si hay un estudio iniciado y cambió `focusMinutes`, o un descanso iniciado y cambió la duración de su tipo.
- `saveSettings` devuelve también `durationChangeDeferred`; la pantalla de ajustes muestra el mensaje de RF-15 (junto al de RF-10 si coincide) antes de cerrarse.
- `reset-break` deja el descanso preparado con la duración vigente de su tipo, igual que `reset-focus`.
- Interfaz: `app.json` pasa a `"orientation": "default"`; en Ajustes, `KeyboardAvoidingView` con `padding` y `keyboardVerticalOffset` (altura del encabezado + margen superior) en iOS, sin `behavior` en Android (guía de teclado de Expo), y margen inferior extra en el contenido.

## Estrategia de pruebas con Jest

- **`settings.test.ts` (dominio, sin simulaciones):**
  - Validación:
    - Acepta los límites 1/120, 1/30, 1/60 y 4/8.
    - Rechaza vacío, `0`, `-5`, `2.5`, `121`, `31`, `61`, `3` y `9` con el mensaje de rango de cada campo.
    - Si hay varios errores, no devuelve ajustes.
  - Aplicación:
    - Un estudio preparado cambia y uno corriendo o pausado a mitad no cambia (RF-04, RF-05).
    - Un descanso corto o largo preparado toma su duración según el tipo.
    - Con el ciclo sin empezar, la meta se aplica de inmediato.
    - Con 6 completados y meta 5, el siguiente estudio completado da descanso largo y el contador vuelve a 0 (RF-06).
    - Con 5 completados y meta 5, `cycleGoalReached = true` (RF-10).
    - Con 2 completados, cambiar de 8 a 5 conserva la meta activa 8 y la nueva aplica tras el descanso largo (RF-12).
- **`pomodoro-settings-storage.test.ts`:**
  - Sin valor guardado devuelve los valores por defecto.
  - Guardar y cargar devuelve el mismo objeto.
  - JSON roto, versión distinta o valores fuera de rango lanzan error sin llamar a `setItem` ni `removeItem`.
  - `save` rechaza ajustes inválidos.
- **`timer.test.ts`:**
  - Se retiran las pruebas del editor 5–30.
  - `prepareFocusAfterBreak` usa la duración recibida.
  - Siguen verdes las transiciones de HU-002.
- **Interfaz:** verificación manual en Expo Go con la lista de `rn-conventions` (teclado, orientación, persistencia al cerrar y textos de fase).
- Al cerrar: `npx jest`, `npx expo lint` y `npx tsc --noEmit`.

## Cobertura de RF

| RF | Parte del plan |
|---|---|
| RF-01 | Ruta `/ajustes`, botones de acceso |
| RF-02 | `DEFAULT_SETTINGS`, `loadPomodoroSettings` sin valor |
| RF-03 | `savePomodoroSettings`, `saveSettings` |
| RF-04, RF-05 | `applySettingsToSession` (preparada frente a iniciada), transiciones con ajustes |
| RF-06, RF-10 | `applySettingsToSession` (meta del ciclo, `cycleGoalReached`), alerta tras guardar |
| RF-07 | `validateSettingsInput`, errores por campo |
| RF-08 | `resetSettings` con confirmación |
| RF-09 | `usePreventRemove` y su diálogo |
| RF-11 | Hidratación con valores por defecto y aviso en inicio |
| RF-12 | Meta activa conservada en `applySettingsToSession` |
| RF-13 | Eliminación del editor y de las funciones 5–30 |
| RNF-01 | Clave propia sin sobrescritura de datos ilegibles |
| RNF-02 | Las fases iniciadas no se modifican; marcas de tiempo intactas |
| RNF-03 | Mensajes de rango en español |
