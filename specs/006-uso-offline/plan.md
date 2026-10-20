# Plan 006 — Usar la aplicación sin registro, sin internet y sin publicidad

Spec: specs/006-uso-offline/spec.md (aprobada) · Decisiones: D-01 a D-09

## Resumen

La aplicación ya cumple buena parte de HU-006:
- Abre en el temporizador (`src/app/(tabs)/index.tsx`).
- No tiene cuentas ni anuncios.
- Guarda todo con AsyncStorage.
- Solo pide el permiso de notificaciones, al iniciar la primera sesión.

Al revisar el código y la configuración (`npx expo config --type introspect`) aparecieron cuatro huecos:

1. **Copia de seguridad en Android (RF-06):** `android.allowBackup` vale `true` por defecto. La copia automática de Google puede restaurar AsyncStorage al reinstalar, lo que contradice D-04.
2. **Permisos de más en Android (RF-10, D-07):** el manifiesto generado declara `READ_EXTERNAL_STORAGE`, `WRITE_EXTERNAL_STORAGE` y `SYSTEM_ALERT_WINDOW`, que la app no necesita.
3. **Fallos de guardado silenciosos (RF-08):** los fallos al guardar la sesión y el ciclo solo se registran con `console.error`.
4. **Falta la nota de almacenamiento local (RF-07).**

No hay llamadas de red en `src/`, y las dependencias de la plantilla (por ejemplo `expo-web-browser` o `expo-linking`) no se usan. Para que siga siendo así, se añaden pruebas de guardia que protegen RF-04, RF-09 y RNF-02 ante cambios futuros.

## Archivos y responsabilidades

| Archivo | Acción | Responsabilidad | RF |
|---|---|---|---|
| `app.json` | Modificar | `android.allowBackup: false`; `android.blockedPermissions` con los tres permisos sobrantes. | RF-06, RF-10 |
| `src/__tests__/offline-config.test.ts` | Crear | Guardia de configuración: copia desactivada, permisos bloqueados, sin `updates.url` y sin claves de uso de iOS. | RF-04, RF-06, RF-10; RNF-01 |
| `src/__tests__/offline-guard.test.ts` | Crear | Guardia de código y dependencias: sin APIs de red en `src/` y sin paquetes de anuncios, analítica o rastreo. | RF-04, RF-09; RNF-01, RNF-02 |
| `src/hooks/use-pomodoro-timer.ts` | Modificar | Estado `storageMessage`, acciones `storage-save-failed` y `dismiss-storage-message`; exportar el reducer para probarlo. | RF-08 |
| `src/hooks/__tests__/pomodoro-timer-reducer.test.ts` | Crear | Pruebas del aviso de guardado. | RF-08 |
| `src/app/(tabs)/index.tsx` | Modificar | Tarjeta del aviso de RF-08 con botón «Cerrar». | RF-08 |
| `src/app/ajustes.tsx` | Modificar | Nota fija de almacenamiento local. | RF-07 |

Sin cambios: el primer inicio y la ausencia de cuentas (RF-01, RF-02), y el uso sin conexión y sin indicador de red (RF-03, RF-05), porque ya se cumplen. Se verifican manualmente en T6.

## Funciones puras y estado

```
pomodoroTimerReducer (exportado solo para pruebas)
  'storage-save-failed'      -> storageMessage = MENSAJE_RF08   (los temporizadores no cambian)
  'dismiss-storage-message'  -> storageMessage = null
```

## Persistencia

- No cambia el formato de ningún dato.
- `savePomodoroSession` y `savePomodoroCycle`, cuando fallan, despachan `storage-save-failed` además de `console.error`.
- Un fallo nunca detiene ni reinicia el temporizador (RF-08).
- Los datos siguen solo en el celular; con `allowBackup: false`, Android no los copia ni los restaura (RF-06, D-04).

## Algoritmo

```
al fallar savePomodoroSession o savePomodoroCycle:
    console.error(...)
    dispatch('storage-save-failed')       # el aviso aparece o sigue visible

al tocar «Cerrar» en el aviso:
    dispatch('dismiss-storage-message')   # desaparece hasta un nuevo fallo
```

## Interfaz

- **Pantalla principal:**
  - Tarjeta con borde Crimson `#e60023`, fondo blanco y texto `#100048`, con el mensaje de RF-08 y `accessibilityLiveRegion="polite"`.
  - Botón «Cerrar» de al menos 44×44 con etiqueta «Cerrar aviso de guardado».
  - Se muestra sobre el reloj, junto al aviso de ajustes de HU-005.
- **Ajustes:** debajo de la introducción, texto secundario `#6A5751` con «Tus ajustes se guardan solo en este celular. Si desinstalas la aplicación, se borrarán.» (RF-07).
- No se añade ningún indicador de red (RF-05). Todos los textos van en español.

## Decisiones técnicas

| Decisión | Elegida | Alternativa descartada |
|---|---|---|
| Restauración al reinstalar (D-04) | `android.allowBackup: false`. iOS no restaura los datos al reinstalar desde la tienda. | Mantener la copia automática: Android podría restaurar ajustes y progreso, en contra de D-04. |
| Permisos sobrantes (D-07) | `android.blockedPermissions` para `READ_EXTERNAL_STORAGE`, `WRITE_EXTERNAL_STORAGE` y `SYSTEM_ALERT_WINDOW`, según la guía de permisos de Expo. | Dejarlos: el sistema no los pide, pero la tienda los muestra como permisos de la app. |
| Permiso `INTERNET` | Se mantiene: es un permiso normal que el sistema nunca pide al usuario, y las compilaciones de desarrollo lo necesitan para cargar el código. RF-04 se garantiza con la guardia de código. | Bloquearlo: rompe las compilaciones de desarrollo y no cambia nada visible. |
| Garantizar «sin red ni anuncios» | Pruebas de guardia en Jest que inspeccionan `src/`, `package.json` y `app.json`. | Revisión manual: no evita regresiones futuras. |
| Dependencias de plantilla sin usar | No se eliminan en esta fase; no hacen peticiones si no se llaman, y algunas son dependencias de Expo Router. | Quitarlas: riesgo de romper la navegación sin beneficio visible. |
| Probar el aviso de RF-08 | Exportar el reducer y probar sus acciones. | Montar el proveedor con dependencias simuladas: más frágil y lento. |

## Estrategia de pruebas con Jest

- **`offline-config.test.ts`** lee `app.json` y comprueba:
  - `android.allowBackup === false`.
  - `blockedPermissions` contiene los tres permisos.
  - No hay `updates.url`.
  - No hay claves `*UsageDescription` en `ios.infoPlist`.
  - Debe fallar antes de cambiar `app.json`.
- **`offline-guard.test.ts`:**
  - Recorre los `.ts` y `.tsx` de `src/` (sin `__tests__`) y no encuentra `fetch(`, `XMLHttpRequest`, `WebSocket`, `EventSource`, `openBrowserAsync` ni `Linking.openURL`.
  - Las dependencias de `package.json` no incluyen paquetes de anuncios, analítica ni rastreo (admob, ads, analytics, firebase, sentry, amplitude, mixpanel, segment, appsflyer, facebook, tracking-transparency).
  - Es una prueba de regresión: pasa desde el inicio porque el código actual ya cumple.
- **`pomodoro-timer-reducer.test.ts`:**
  - `storage-save-failed` fija el mensaje sin tocar los temporizadores.
  - `dismiss-storage-message` lo limpia.
  - Un nuevo fallo lo vuelve a mostrar.
- **Interfaz:** verificación manual en Expo Go. `allowBackup` y `blockedPermissions` no se aplican en Expo Go, así que se verifican con `npx expo config --type introspect`.
- Al cerrar: `npx jest`, `npx expo lint` y `npx tsc --noEmit`.

## Cobertura de RF

| RF | Parte del plan |
|---|---|
| RF-01, RF-02 | Sin cambios; verificación manual (T6) |
| RF-03, RF-05 | Sin cambios; verificación manual en modo avión (T6) |
| RF-04 | Guardia de código y configuración |
| RF-06 | `allowBackup: false` |
| RF-07 | Nota en Ajustes |
| RF-08 | Reducer, aviso en la pantalla principal |
| RF-09 | Guardia de dependencias |
| RF-10 | `blockedPermissions`, sin claves de uso en iOS |
| RNF-01, RNF-02 | Guardias de código, dependencias y configuración |
| RNF-03 | Persistencia actual de HU-003 y HU-005; aviso RF-08 si falla |
