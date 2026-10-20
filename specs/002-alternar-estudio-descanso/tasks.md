# Tareas: Alternar entre estudio y descanso

Ejecutar en orden de dependencias. Las tareas de lógica comienzan con pruebas Jest; las tareas de interfaz requieren la comprobación manual indicada en `rn-conventions` antes de marcarlas como hechas.

- [x] **T1. Probar y preparar el descanso al completar estudio.** RF-01, RF-02, RF-05
  - Hecho cuando: `src/domain/__tests__/timer.test.ts` verifica que solo al llegar a cero se cuenta el estudio y se prepara en pausa el descanso corto o largo correcto; pausar o reiniciar antes de cero no incrementa el contador; `npx jest` pasa.

- [x] **T2. Probar el fin del descanso y el inicio de fases preparadas.** RF-03, RF-08
  - Hecho cuando: `src/domain/__tests__/timer.test.ts` verifica que terminar un descanso prepara estudio pausado y que iniciar descanso/estudio usa la fase preparada sin duplicar ni adelantar su tiempo; `npx jest` pasa.

- [x] **T3. Añadir soporte probado para la meta activa y la meta diferida.** RF-02, RF-04, RF-07
  - Hecho cuando: las pruebas de `src/domain/__tests__/timer.test.ts` demuestran que una nueva meta no cambia el ciclo en curso, se activa en el siguiente ciclo y el progreso/descanso se calcula con la meta activa; `npx jest` pasa.

- [x] **T4. Encapsular y probar la persistencia del ciclo.** RF-06, RF-07, RNF-02
  - Hecho cuando: `src/storage/pomodoro-cycle-storage.ts` mantiene la clave y el valor textual actual del contador y almacena la meta activa en una clave separada; `src/storage/__tests__/pomodoro-cycle-storage.test.ts` verifica restauración, compatibilidad, valores inválidos y errores con Jest.

- [x] **T5. Integrar restauración, transiciones y persistencia en el proveedor.** RF-01–RF-08, RNF-02
  - Hecho cuando: `src/hooks/use-pomodoro-timer.ts` hidrata antes de persistir, procesa cada fin una sola vez, usa las transiciones puras y expone fase/meta y acciones manuales; los errores de almacenamiento se reportan explícitamente y `npx jest` pasa.

- [x] **T6. Actualizar home con fase, avance y transición al descanso.** RF-01, RF-02, RF-04, RF-05, RF-06, RF-07; RNF-01, RNF-02
  - Hecho cuando: `src/app/(tabs)/index.tsx` muestra fase y «Pomodoros: X/Y» con la meta activa y, al completar estudio, presenta el descanso preparado sin la superposición de fin de HU-001. Verificar la lista manual de interfaz en Expo Go.

- [x] **T7. Actualizar descanso preparado y retorno al estudio pausado.** RF-01, RF-02, RF-03, RF-04, RF-08; RNF-01
  - Hecho cuando: `src/app/descanso.tsx` identifica descanso corto/largo, precarga la duración, conserva el editor 5–30 sin iniciar al confirmar cambios, inicia solo al tocar «Iniciar descanso» y vuelve a home con estudio pausado al terminar. Verificar la lista manual de interfaz en Expo Go.

- [x] **T8. Ejecutar validación automatizada de la implementación.** RF-01–RF-08; RNF-01, RNF-02
  - Hecho cuando: pasan `npx jest`, `npx expo lint` y `npx tsc --noEmit`, sin errores nuevos relacionados con los cambios.

- [x] **T9. Verificar manualmente los flujos y actualizar la memoria SDD.** RF-01–RF-08; RNF-01, RNF-02
  - Hecho cuando: en Expo Go se comprueban estudio corto/largo, reinicio, persistencia, inicio manual del descanso y retorno al estudio pausado usando la lista de `rn-conventions`; se actualizan únicamente «Estado actual» y «Próximos pasos» en `MEMORY.md`.
