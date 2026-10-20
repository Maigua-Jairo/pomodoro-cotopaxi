# Tareas: Mantener el conteo con el celular bloqueado o la app cerrada

Ejecutar en orden. Las tareas de dominio, almacenamiento y notificaciones comienzan con pruebas Jest. Antes de instalar `expo-notifications` o crear el nuevo formato de snapshot en AsyncStorage, se requiere autorización explícita. Las tareas de interfaz se verifican con la lista manual de `rn-conventions` en Expo Go. Total: 10 tareas.

- [x] **T1. Obtener autorización y preparar notificaciones locales.** RF-03, RF-04, RF-06, RF-07, RF-08
  - Hecho cuando: antes de instalar `expo-notifications` y de persistir el nuevo snapshot se obtiene autorización explícita; después, `npx expo install expo-notifications` añade una versión compatible con Expo SDK 57 y la app mantiene sus dependencias instalables.

- [x] **T2. Probar y añadir restauración pura por fecha de vencimiento.** RF-01, RF-02, RF-05, RF-09; RNF-01
  - Hecho cuando: `src/domain/__tests__/timer.test.ts` verifica restauración corriendo antes del vencimiento, fase vencida, fase pausada y transición única al llegar a cero; las funciones nuevas de `src/domain/timer.ts` reciben las marcas temporales por argumento y `npx jest --runInBand src/domain/__tests__/timer.test.ts` pasa.

- [x] **T3. Probar y encapsular la persistencia del snapshot.** RF-02, RF-05, RF-09, RF-10; RNF-02
  - Hecho cuando: `src/storage/__tests__/pomodoro-session-storage.test.ts` verifica round-trip, esquema inválido/no soportado y errores de lectura/escritura; `src/storage/pomodoro-session-storage.ts` usa una clave aditiva versionada y las pruebas existentes confirman que `pomodoro-cotopaxi:cycle-count` y la meta activa conservan sus claves y formatos.

- [x] **T4. Probar y encapsular permisos y notificaciones locales.** RF-03, RF-04, RF-06, RF-07, RF-08
  - Hecho cuando: `src/notifications/__tests__/pomodoro-notifications.test.ts` demuestra permisos concedidos/denegados, contenido correcto por fase, programación de vencimiento, cancelación y nueva programación; `src/notifications/pomodoro-notifications.ts` suprime presentación en primer plano y propaga errores inesperados.

- [x] **T5. Integrar hidratación, reconciliación y notificaciones en el proveedor.** RF-01–RF-10; RNF-01, RNF-02
  - Hecho cuando: `src/hooks/use-pomodoro-timer.ts` hidrata antes de persistir, usa `performance.now()` durante la sesión viva y la fecha epoch al restaurar, procesa cada fin una vez, cancela/programa avisos al cambiar estado y expone el error y la recuperación explícita; las pruebas de dominio y almacenamiento pasan.

- [x] **T6. Añadir permiso inicial y recuperación visible en home.** RF-04, RF-10
  - Hecho cuando: `src/app/(tabs)/index.tsx` explica el uso de avisos antes de pedir permiso al primer inicio, permite comenzar si se deniega/no está disponible y muestra el error de restauración con una acción manual; se comprueban textos, accesibilidad y áreas táctiles de `rn-conventions` en Expo Go.

- [x] **T7. Añadir controles de ciclo de vida al descanso.** RF-08, RF-09
  - Hecho cuando: `src/app/descanso.tsx` ofrece pausa/reanudación/reinicio durante un descanso en curso; pausar y reiniciar dejan el temporizador pausado y cancelan el aviso pendiente, mientras reanudar lo programa para el vencimiento actualizado. Verificar la lista manual de interfaz de `rn-conventions`.

- [x] **T8. Conectar apertura desde aviso y evitar duplicados en primer plano.** RF-03, RF-05, RF-06, RF-07
  - Hecho cuando: `src/app/_layout.tsx` y el proveedor llevan una apertura desde una notificación a la sesión hidratada y a la fase siguiente preparada; una fase que vence visible solo ejecuta la transición visual y no presenta el aviso del sistema.

- [x] **T9. Ejecutar validaciones automatizadas de HU-003.** RF-01–RF-10; RNF-01, RNF-02
  - Hecho cuando: pasan `npx jest`, `npx expo lint` y `npx tsc --noEmit`, sin errores nuevos relacionados con la sesión persistida o las notificaciones locales.

- [x] **T10. Verificar escenarios manuales y cerrar la fase SDD.** RF-01–RF-10; RNF-01, RNF-02
  - Hecho cuando: en Expo Go se verifican bloqueo, cierre y reapertura antes/después del vencimiento, permiso denegado, toque del aviso, vencimiento visible, pausa, reinicio, reanudación y error de restauración; luego se actualizan únicamente «Estado actual» y «Próximos pasos» en `MEMORY.md`.
