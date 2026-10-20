# Tareas: Recibir aviso al terminar el tiempo

Ejecutar en orden. Las pruebas de lógica y servicios se escriben primero; las verificaciones de interfaz se hacen manualmente en Expo Go. La instalación de `expo-audio` y el tono local fueron aprobados durante la planificación. Total: 10 tareas.

- [x] **T1. Preparar el módulo y el tono local de alarma.** RF-01, RNF-01
  - Archivos: `package.json`, `app.json`, `assets/audio/pomodoro-alarm.wav`.
  - Hecho cuando: `npx expo install expo-audio` agrega la versión compatible con SDK 57; el plugin de Audio queda configurado para reproducción sin grabación ni modo de fondo; el tono local original se puede importar y el proyecto no solicita permiso de micrófono.

- [x] **T2. Probar y encapsular sonido y vibración.** RF-01, RF-04, RF-06; RNF-01
  - Archivos: `src/notifications/pomodoro-alarm.ts`, `src/notifications/__tests__/pomodoro-alarm.test.ts`.
  - Hecho cuando: las pruebas Jest, con Audio y `Vibration` simulados, demuestran inicio y limpieza de ambos efectos, detención idempotente y propagación de fallos; el servicio permite que la interfaz informe si el sonido o la vibración no están disponibles.

- [x] **T3. Corregir programación y probar disponibilidad de notificaciones.** RF-02, RF-03, RF-04, RF-05, RF-08; RNF-02
  - Archivos: `src/notifications/pomodoro-notifications.ts`, `src/notifications/__tests__/pomodoro-notifications.test.ts`.
  - Hecho cuando: las pruebas verifican que se programa un aviso aunque la app esté visible, que el handler no lo presenta en primer plano, que el mensaje identifica estudio/descanso, que el permiso denegado permite continuar y que un error de programación no se devuelve como éxito; el test anterior que prohibía programar en primer plano queda sustituido.

- [x] **T4. Exponer errores de avisos sin interrumpir el temporizador.** RF-04, RF-05, RF-08; RNF-02
  - Archivos: `src/hooks/use-pomodoro-timer.ts`, `src/notifications/pomodoro-notifications.ts`.
  - Hecho cuando: el proveedor distingue aviso programado, no disponible y fallido; la falta de permiso o excepción se guarda como estado visible en español, el temporizador sigue corriendo y un nuevo intento exitoso limpia el mensaje previo.

- [x] **T5. Integrar la alarma en primer plano y el apagado automático.** RF-01, RF-02, RF-04, RF-06; RNF-01
  - Archivos: `src/app/_layout.tsx`, `src/notifications/pomodoro-alarm.ts`, `src/notifications/__tests__/pomodoro-alarm.test.ts`.
  - Hecho cuando: al finalizar una fase visible se reproduce el sonido y la vibración, se muestra el overlay accesible con «Detener», y la alarma se detiene al pulsar, a los 3 segundos o al desmontar; nunca aparece una notificación del sistema duplicada.

- [x] **T6. Cerrar la alarma al abrir una notificación.** RF-03, RF-07; RNF-03
  - Archivos: `src/hooks/use-pomodoro-timer.ts`, `src/app/_layout.tsx`.
  - Hecho cuando: tocar una notificación válida espera la hidratación, detiene y limpia cualquier alarma interna activa y abre la fase siguiente preparada y pausada; una respuesta ajena a Pomodoro no altera la navegación.

- [x] **T7. Mostrar el estado de disponibilidad en las pantallas.** RF-04, RF-05, RF-08; RNF-02
  - Archivos: `src/hooks/use-pomodoro-timer.ts`, `src/app/_layout.tsx`, `src/app/(tabs)/index.tsx`, `src/app/descanso.tsx`.
  - Hecho cuando: los mensajes de permiso denegado, falta de soporte o fallo de programación/alarma se anuncian claramente en español; denegar el permiso sigue permitiendo iniciar y un aviso posterior disponible elimina el estado de error.

- [x] **T8. Ejecutar pruebas, lint y comprobación de tipos.** RF-01–RF-08; RNF-01–RNF-03
  - Archivos: pruebas de `src/notifications/`, pruebas existentes de `src/domain/__tests__/timer.test.ts`.
  - Hecho cuando: pasan `npx jest`, `npx expo lint` y `npx tsc --noEmit`, incluidas las pruebas nuevas y las de transición ya existentes.

- [x] **T9. Verificar la experiencia en Android.** RF-01–RF-08; RNF-01–RNF-03
  - Archivos: `src/app/_layout.tsx`, `src/notifications/pomodoro-notifications.ts`.
  - Hecho cuando: en Expo Go se comprueban sonido/vibración con la app visible, permiso concedido y denegado, aviso tras iniciar visible y bloquear el teléfono, toque de notificación, detención manual/automática a los 3 segundos, orientación y restricciones de silencio/pantalla bloqueada; se registran los límites que impongan los ajustes del sistema.

- [x] **T10. Verificar la experiencia en iOS y cerrar la fase.** RF-01–RF-08; RNF-01–RNF-03
  - Archivos: `MEMORY.md`.
  - Hecho cuando: en Expo Go se comprueban sonido/vibración en primer plano, rechazo de permiso, fallo de programación, comienzo visible seguido de bloqueo, toque de notificación, detención manual/automática a los 3 segundos, orientación y restricciones de silencio/pantalla bloqueada; se informa qué escenarios dependieron de ajustes del sistema y se actualizan únicamente «Estado actual» y «Próximos pasos» en `MEMORY.md`.

## Verificación

El usuario corroboró manualmente en Expo Go todas las tareas (T1–T10) en Android e iOS.

- **V-01. Apagado automático de la alarma a los 3 segundos.** Decisión del usuario durante la verificación: la alarma sin interacción se detiene a los 3 segundos en lugar de los 10 segundos aprobados en la planificación. Concreta D-05 y actualiza RF-06. Cubierto por la prueba de `src/notifications/__tests__/pomodoro-alarm.test.ts`.
- **V-02. Restricciones del sistema observadas.** Los escenarios de silencio y pantalla bloqueada dependen de los ajustes de notificaciones, sonido y "No molestar" de cada dispositivo. No se reportaron restricciones adicionales durante la verificación.
- **V-03. Notificación sin sonido ni despliegue (corrección).** El manejador desactivaba el sonido también en segundo plano y no existía canal propio en Android. Se corrigió: sonido y despliegue en segundo plano, canal «Fin de fase del Pomodoro» con importancia máxima, sonido y vibración, creado antes de pedir el permiso y antes de programar; contenido con sonido, vibración y prioridad máxima. Cubierto por `src/notifications/__tests__/pomodoro-notifications.test.ts`.
- **V-04. La alarma en primer plano no dejaba de sonar (corrección).** Al detenerla solo se liberaba el reproductor, que tenía el bucle activo. Ahora se desactiva el bucle y se pausa antes de liberarlo, y el módulo de alarma se apaga por sí mismo a los 3 segundos aunque la pantalla no lo haga (RF-06). Cubierto por `src/notifications/__tests__/pomodoro-alarm.test.ts`.
