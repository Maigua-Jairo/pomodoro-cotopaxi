# Tareas: Usar la aplicación sin registro, sin internet y sin publicidad

Ejecutar en orden. Las pruebas se escriben primero; las de configuración y estado deben fallar antes de implementar. Las de interfaz se verifican manualmente en Expo Go con la lista de `rn-conventions`. Total: 6 tareas.

- [x] **T1. Desactivar la copia de seguridad y bloquear permisos sobrantes.** RF-04, RF-06, RF-10; RNF-01
  - Archivos: `src/__tests__/offline-config.test.ts`, `app.json`.
  - Hecho cuando: la prueba falla con el `app.json` actual y pasa tras fijar `android.allowBackup: false` y bloquear `READ_EXTERNAL_STORAGE`, `WRITE_EXTERNAL_STORAGE` y `SYSTEM_ALERT_WINDOW`; `npx expo config --type introspect` ya no lista esos permisos.

- [x] **T2. Guardia de red, anuncios y rastreo.** RF-04, RF-09; RNF-01, RNF-02
  - Archivos: `src/__tests__/offline-guard.test.ts`.
  - Hecho cuando: `npx jest` confirma que `src/` no usa APIs de red y que `package.json` no tiene paquetes de anuncios, analítica ni rastreo; para comprobar que la guardia funciona, se introduce temporalmente una llamada `fetch(` y la prueba falla.

- [x] **T3. Estado del aviso de fallo al guardar.** RF-08
  - Archivos: `src/hooks/use-pomodoro-timer.ts`, `src/hooks/__tests__/pomodoro-timer-reducer.test.ts`.
  - Hecho cuando: `npx jest` demuestra que `storage-save-failed` muestra el mensaje sin alterar los temporizadores, que `dismiss-storage-message` lo oculta y que un nuevo fallo lo vuelve a mostrar; los fallos de `savePomodoroSession` y `savePomodoroCycle` despachan la acción; pasa `npx tsc --noEmit`.

- [x] **T4. Aviso de fallo al guardar en la pantalla principal.** RF-08
  - Archivos: `src/app/(tabs)/index.tsx`.
  - Hecho cuando: en Expo Go, al forzar temporalmente un fallo de guardado, la pantalla principal muestra el aviso con «Cerrar» (al menos 44×44, con etiqueta accesible), el temporizador sigue corriendo y el aviso desaparece al cerrarlo.

- [x] **T5. Nota de almacenamiento local en Ajustes.** RF-07
  - Archivos: `src/app/ajustes.tsx`.
  - Hecho cuando: en Expo Go la pantalla de ajustes muestra la nota fija de RF-07, legible en vertical y horizontal y sin tapar los campos ni los botones con el teclado abierto.

- [x] **T6. Verificación final.** RF-01–RF-10; RNF-01–RNF-03
  - Archivos: pruebas de `src/`.
  - Hecho cuando: pasan `npx jest`, `npx expo lint` y `npx tsc --noEmit`, y el usuario confirma en Expo Go que:
    - Tras borrar los datos de Expo Go, el primer inicio muestra el temporizador sin registro.
    - Con la app cargada y el modo avión activado, el temporizador, los avisos y los ajustes funcionan igual y no aparece ningún indicador de red.
    - No aparece ningún anuncio.
    - Solo se pide el permiso de notificaciones.
