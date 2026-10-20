# Tareas: Detener una fase y pasar a la siguiente

Ejecutar en orden. En las tareas de lógica las pruebas se escriben primero y deben fallar antes de implementar. Las de interfaz se verifican manualmente en Expo Go con la lista de `rn-conventions`. Total: 5 tareas.

- [x] **T1. Transiciones puras de detener.** RF-03, RF-05, RF-06, RF-09
  - Archivos: `src/domain/timer.ts`, `src/domain/__tests__/timer.test.ts`.
  - Hecho cuando: `npx jest` demuestra que `stopFocusPhase` inicia un descanso corto sin sumar pomodoro (desde estudio corriendo o pausado), devuelve `null` con estudio preparado o vencido, y que `stopBreakPhase` deja un estudio nuevo pausado, sin cambiar el ciclo tras un descanso corto y reiniciándolo tras uno largo.

- [x] **T2. Acciones del reducer y del proveedor.** RF-03, RF-05, RF-06, RF-08, RF-09
  - Archivos: `src/hooks/use-pomodoro-timer.ts`, `src/hooks/__tests__/pomodoro-timer-reducer.test.ts`.
  - Hecho cuando: `npx jest` demuestra que `stop-focus` deja el descanso corto corriendo con su vencimiento, `notificationId: null` y sin alarma, que no hace nada con el estudio ya vencido, y que `stop-break` deja el estudio preparado sin alarma; el contexto expone `stopFocus` y `stopBreak`; pasa `npx tsc --noEmit`.

- [ ] **T3. Botón «Detener» en la pantalla de inicio.** RF-01, RF-02, RF-07
  - Archivos: `src/app/(tabs)/index.tsx`, `src/components/app-icon.tsx`.
  - Hecho cuando: en Expo Go «Detener» aparece solo con el estudio iniciado (corriendo o pausado), pide la confirmación de RF-02, «Cancelar» deja el estudio igual y «Detener» abre el descanso corto ya corriendo, sin alarma.

- [ ] **T4. Botón «Detener» en la pantalla de descanso.** RF-04, RF-05, RF-06, RF-07
  - Archivos: `src/app/descanso.tsx`.
  - Hecho cuando: en Expo Go «Detener» aparece solo con el descanso iniciado, pide la confirmación de RF-05, «Cancelar» deja el descanso igual y «Detener» vuelve al estudio nuevo y pausado; tras un descanso largo el inicio muestra «Pomodoros: 0/N».

- [ ] **T5. Verificación final.** RF-01–RF-09; RNF-01, RNF-02
  - Archivos: pruebas de `src/domain/` y `src/hooks/`.
  - Hecho cuando: pasan `npx jest`, `npx expo lint` y `npx tsc --noEmit`, y el usuario confirma en Expo Go:
    - Los casos límite de la spec.
    - Cerrar la app tras detener el estudio y volver: el descanso sigue corriendo con su tiempo.
    - El aviso del sistema llega al terminar el descanso automático.
    - Se ve bien en vertical y en horizontal.
