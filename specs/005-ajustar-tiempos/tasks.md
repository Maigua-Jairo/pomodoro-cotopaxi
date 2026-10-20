# Tareas: Ajustar los tiempos del pomodoro

Ejecutar en orden. En las tareas de lógica las pruebas se escriben primero y deben fallar antes de implementar. Las de interfaz se verifican manualmente en Expo Go con la lista de `rn-conventions`. Total: 10 tareas.

- [x] **T1. Modelo de ajustes y validación del formulario.** RF-02, RF-07; RNF-03
  - Archivos: `src/domain/settings.ts`, `src/domain/__tests__/settings.test.ts`.
  - Hecho cuando: `npx jest` demuestra que `validateSettingsInput` acepta los límites de cada rango, rechaza vacío, cero, negativos, decimales y fuera de rango con «Ingresa un número entero entre {mín} y {máx}.» por campo, y no devuelve ajustes si hay algún error; `DEFAULT_SETTINGS` vale 25/5/15/4 e `isValidSettings` rechaza objetos incompletos.

- [x] **T2. Aplicar ajustes a la sesión en curso.** RF-04, RF-05, RF-06, RF-10, RF-12; RNF-02
  - Archivos: `src/domain/settings.ts`, `src/domain/__tests__/settings.test.ts`.
  - Hecho cuando: `npx jest` demuestra que `applySettingsToSession` cambia solo fases preparadas, conserva las iniciadas, aplica la meta de inmediato con el ciclo sin empezar, fuerza el descanso largo tras el siguiente estudio cuando la meta es menor o igual a lo completado, marca `cycleGoalReached` solo si es igual y conserva la meta activa cuando es mayor.

- [x] **T3. Retirar el rango 5–30 y usar la duración de estudio vigente.** RF-04, RF-13
  - Archivos: `src/domain/timer.ts`, `src/domain/__tests__/timer.test.ts`.
  - Hecho cuando: `prepareFocusAfterBreak` recibe la duración de estudio y tiene prueba; `isValidBreakDuration`, `setPreparedBreakDuration`, `startBreakTimer` y las constantes 5–30 ya no existen ni tienen pruebas; las pruebas de transición de HU-002 siguen pasando con `npx jest`.

- [x] **T4. Guardar y cargar los ajustes.** RF-02, RF-03, RF-11; RNF-01
  - Archivos: `src/storage/pomodoro-settings-storage.ts`, `src/storage/__tests__/pomodoro-settings-storage.test.ts`.
  - Hecho cuando: `npx jest` con AsyncStorage simulado demuestra que sin valor se obtienen los valores por defecto, que guardar y cargar conserva los ajustes, que JSON roto, versión distinta o valores fuera de rango lanzan error sin escribir ni borrar, y que guardar ajustes inválidos se rechaza.

- [x] **T5. Integrar los ajustes en el proveedor del temporizador.** RF-02 a RF-06, RF-08, RF-10, RF-11, RF-12, RF-14; RNF-02
  - Archivos: `src/hooks/use-pomodoro-timer.ts`.
  - Hecho cuando: el proveedor hidrata los ajustes antes de la sesión (con valores por defecto y `settingsMessage` si fallan), expone `settings`, `saveSettings`, `resetSettings` y `settingsMessage`, usa los ajustes en las transiciones y al reiniciar el estudio, y ya no expone `setBreakDuration` ni `setConfiguredCycleLength`; `npx jest` y `npx tsc --noEmit` pasan.

- [x] **T6. Pantalla de ajustes: formulario y guardado.** RF-01, RF-03, RF-07, RF-10; RNF-03
  - Archivos: `src/app/ajustes.tsx`.
  - Hecho cuando: en Expo Go la pantalla muestra los cuatro valores guardados con su rango, el teclado no tapa campos ni botones, los errores aparecen bajo cada campo inválido sin guardar nada, guardar cierra la pantalla, el mensaje de ciclo cumplido aparece cuando corresponde y los valores persisten al cerrar y abrir la app.

- [x] **T7. Restablecer y salir sin guardar.** RF-08, RF-09
  - Archivos: `src/app/ajustes.tsx`.
  - Hecho cuando: en Expo Go restablecer pide confirmación, cancelar no cambia nada y confirmar guarda 25/5/15/4; salir con cambios (botón atrás, gesto o encabezado) pide confirmación, «Seguir editando» conserva lo escrito y «Descartar» sale sin guardar; salir sin cambios no pregunta.

- [x] **T8. Acceso a ajustes, aviso de carga y pantalla de descanso.** RF-01, RF-11, RF-13
  - Archivos: `src/app/(tabs)/index.tsx`, `src/app/descanso.tsx`.
  - Hecho cuando: en Expo Go hay un botón «Ajustes» de al menos 44×44 con etiqueta accesible en inicio y en descanso; la pantalla de descanso ya no permite editar la duración; con ajustes dañados el inicio muestra el aviso de RF-11, que desaparece al guardar o restablecer; se ve bien en vertical y horizontal.

- [x] **T10. Aviso de cambio diferido, teclado y orientación.** RF-15; RNF-03
  - Archivos: `src/domain/settings.ts`, `src/domain/__tests__/settings.test.ts`, `src/hooks/use-pomodoro-timer.ts`, `src/app/ajustes.tsx`, `app.json`.
  - Hecho cuando: `npx jest` demuestra que `hasDeferredDurationChange` detecta solo cambios de la fase iniciada; en Expo Go el mensaje aparece al guardar, «Reiniciar» aplica el nuevo tiempo en estudio y descanso, el teclado no tapa «Guardar» ni «Restablecer» y la app gira con la rotación automática.

- [x] **T9. Verificación final.** RF-01–RF-15; RNF-01–RNF-03
  - Archivos: pruebas de `src/domain/` y `src/storage/`.
  - Hecho cuando: pasan `npx jest`, `npx expo lint` y `npx tsc --noEmit`, y el usuario confirma en Expo Go (Android e iOS) los escenarios de HU-005: cambiar un tiempo con y sin fase en curso, valor no válido, restablecer y persistencia al cerrar la app.
