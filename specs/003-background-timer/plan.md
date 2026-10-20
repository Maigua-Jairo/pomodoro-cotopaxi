# Plan: Mantener el conteo con el celular bloqueado o la app cerrada

**Spec:** [spec.md](./spec.md)  
**Decisiones:** [decisiones.md](./decisiones.md)  
**Estado de la spec:** Aprobada

## Resumen

Extender el dominio, el almacenamiento y el proveedor de temporizadores existentes para restaurar la fase activa y su tiempo restante después de suspender o cerrar la aplicación. Se mantiene `performance.now()` como fuente de tiempo mientras el proceso está vivo; el estado persistido incluye una fecha de vencimiento basada en `Date.now()` para poder calcular el tiempo transcurrido tras reiniciar el proceso. La elección de usar hora civil al restaurar después de cerrar la app fue confirmada por el usuario durante la planificación; esto implica una excepción a HU-001, D-02, únicamente para restauraciones entre procesos.

Se programará una notificación local para la fecha de vencimiento cada vez que una fase se inicie o reanude. Al pausar o reiniciar se cancelará; al volver a primer plano el temporizador se reconciliará y la notificación no se presentará mientras la app esté visible. La transición de ciclo ya existente se reutilizará al detectar vencimientos durante la restauración.

La spec requiere una dependencia para notificaciones locales y un nuevo registro de sesión en AsyncStorage. Antes de instalarlos o crear ese nuevo formato de almacenamiento, se debe pedir aprobación explícita al usuario, según las instrucciones del proyecto. La planificación no instala dependencias ni cambia la spec o las decisiones.

## Contexto técnico

- **Lenguaje y plataforma:** TypeScript, Expo SDK 57, React Native 0.86 y Expo Router.
- **Dominio actual:** `src/domain/timer.ts` contiene las transiciones puras de estudio/descanso y usa una marca de tiempo inyectada. El hook actual usa `performance.now()` y `AppState` para reconciliar el temporizador mientras el proceso sigue activo.
- **Proveedor:** `src/hooks/use-pomodoro-timer.ts` conserva las fases y el ciclo en memoria; actualmente solo hidrata y persiste el progreso del ciclo, no el estado completo del temporizador.
- **Persistencia existente:** `src/storage/pomodoro-cycle-storage.ts` guarda el contador como texto en `pomodoro-cotopaxi:cycle-count` y la meta activa en una clave separada. Se conservarán ambas claves y formatos sin modificación.
- **Persistencia nueva propuesta:** una clave aditiva versionada contendrá la fase, temporizadores, tipo de descanso, ciclo, estado y vencimiento epoch de la fase activa. Se usará un solo snapshot para poder restaurar un ciclo coherente y distinguir pausado de corriendo. El nuevo formato requiere aprobación previa.
- **Notificaciones:** la documentación de [Expo SDK 57 Notifications](https://docs.expo.dev/versions/v57.0.0/sdk/notifications.md) confirma que `expo-notifications` admite notificaciones locales programadas y que estas están disponibles en Expo Go. Se usará `npx expo install expo-notifications`, solo tras obtener aprobación; no se usarán notificaciones push ni backend.
- **Permisos:** antes del primer inicio se presentará una explicación breve y se solicitará permiso. La denegación, la indisponibilidad de la API o la falta de permiso no bloquearán el temporizador.
- **Pruebas:** Jest y `jest-expo` ya están configurados. Las funciones de reloj, transiciones, persistencia y coordinación de notificaciones se probarán con reloj falso y módulos nativos simulados. El flujo de ciclo de vida y notificaciones se comprobará también manualmente en dispositivo con Expo Go.
- **Restricciones:** conservar las reglas y transiciones de HU-002; no iniciar automáticamente la fase siguiente; no añadir backend, cuentas ni dependencias distintas de la dependencia de notificaciones aprobada; no modificar el formato guardado existente del contador.

## Comprobación de la constitución

| Principio | Aplicación |
|---|---|
| Simplicidad primero | Reutilizar el dominio, AsyncStorage, Expo Router y el proveedor actual. La única dependencia nueva sería `expo-notifications`, justificada por RF-03 y aprobada antes de instalarla. |
| La spec manda | Cubrir únicamente RF-01–RF-10 y RNF-01–RNF-02; conservar las transiciones HU-002 y el inicio manual de la fase siguiente. |
| Lógica separada de interfaz | Las funciones de cálculo y restauración quedan en `src/domain/timer.ts`; las pantallas no calculan el tiempo ni manipulan AsyncStorage. |
| Pruebas como puerta | Añadir pruebas Jest de dominio, almacenamiento y servicio de notificaciones; completar las verificaciones manuales indicadas por `rn-conventions`. |
| Los datos del usuario son sagrados | Mantener las claves y valores existentes. El snapshot de sesión será aditivo y versionado; pedir aprobación antes de introducirlo. |
| Exactitud del tiempo | Usar reloj monotónico mientras vive el proceso. Para restaurar después de cerrarlo, usar el vencimiento epoch persistido y `Date.now()`, opción autorizada por el usuario aunque un cambio manual del reloj durante el cierre afecte el tiempo restaurado (HU-001, D-02). |

## Decisiones técnicas

| Decisión | Aplicación | Alternativa descartada |
|---|---|---|
| D-01, D-02 y D-06 | Programar una notificación local de una sola vez al iniciar o reanudar la fase, con título según estudio/descanso. Al tocarla, el sistema abre la app y la hidratación aplica la transición ya vencida antes de mostrar la fase siguiente preparada y pausada. | Depender de que JavaScript continúe ejecutándose en segundo plano para crear el aviso al llegar a cero. |
| D-03 y D-04 | Solicitar permiso con explicación solo al iniciar la primera sesión; la denegación no detiene el inicio. Al restaurar una fase vencida, ejecutar las transiciones puras de HU-002 una sola vez. | Bloquear el inicio hasta aceptar permisos o conservar una pantalla de fin distinta a la transición de HU-002. |
| D-05 | Cancelar el identificador de notificación de la fase anterior al pausar o reiniciar; al reanudar programar una notificación para el vencimiento nuevo. | Mantener avisos antiguos o cancelar todas las notificaciones de la aplicación sin distinguir la fase activa. |
| D-07 | Mantener instalado un handler que no presente avisos locales cuando la app está visible; la transición visible continúa dentro de la app. | Mostrar una notificación del sistema además de la transición visual. |
| D-08 | Si falla la lectura o validación del snapshot, exponer el error claramente, no hidratar como si la sesión fuera nueva y mantener pausado el estado recuperable. Permitir una acción explícita para iniciar una sesión nueva. | Ocultar el error, sobrescribir inmediatamente el registro o presentar valores predeterminados como si fueran una restauración correcta. |
| Elección del usuario durante esta planificación; HU-001, D-02 | Guardar un vencimiento epoch para restaurar sesiones tras terminar el proceso; mantener `performance.now()` para el cálculo mientras el proceso permanece vivo. Un ajuste manual del reloj durante el cierre puede cambiar el tiempo restante restaurado. | Construir un módulo nativo de reloj monotónico persistente, que no forma parte de la elección autorizada y requeriría más alcance/plataforma. |
| RNF-02 y protección de datos existentes | Usar una clave JSON nueva con versión de esquema para el snapshot completo; conservar intactas las claves existentes de ciclo y su compatibilidad. Pedir aprobación antes de escribir el nuevo formato. | Reemplazar el contenido textual existente del contador por un objeto serializado. |

## Archivos y responsabilidades

| Archivo | Cambio previsto | Responsabilidad |
|---|---|---|
| `src/domain/timer.ts` | Modificar | Añadir funciones puras para restaurar/reconciliar una fase corriendo desde su vencimiento epoch y detectar una transición vencida una sola vez. Conservar las funciones y reglas actuales. |
| `src/domain/__tests__/timer.test.ts` | Modificar | Probar restauración antes y después del vencimiento, fase pausada, duración cero, cambio de fase y transición idempotente con reloj determinista. |
| `src/storage/pomodoro-session-storage.ts` | Crear, tras aprobación del formato | Validar y leer/escribir el snapshot versionado de toda la sesión; propagar errores de almacenamiento y datos inválidos. |
| `src/storage/__tests__/pomodoro-session-storage.test.ts` | Crear | Probar round-trip, valores inválidos, versiones no soportadas y fallos de lectura/escritura con AsyncStorage simulado. |
| `src/notifications/pomodoro-notifications.ts` | Crear, tras aprobación e instalación de la dependencia | Encapsular solicitud/lectura de permisos, programación/cancelación de una notificación local identificable por fase, handler de primer plano y datos de fase. |
| `src/notifications/__tests__/pomodoro-notifications.test.ts` | Crear | Simular Expo Notifications y comprobar permisos concedidos/denegados, programación, cancelación y contenido según fase. |
| `src/hooks/use-pomodoro-timer.ts` | Modificar | Hidratar el snapshot antes de persistir, restaurar con hora civil, reconciliar fases en primer plano, serializar persistencia, orquestar notificaciones, cancelar al pausar/reiniciar y exponer errores/recuperación. |
| `src/app/_layout.tsx` | Modificar | Mantener el proveedor y conectar el manejo de interacciones de notificación con la apertura de la app y la restauración del estado. |
| `src/app/(tabs)/index.tsx` | Modificar | Explicar y solicitar permiso antes del primer inicio, permitir iniciar aunque se deniegue y presentar explícitamente errores de restauración/recuperación. |
| `src/app/descanso.tsx` | Modificar | Añadir controles de pausa, reanudación y reinicio para una fase en curso; conservar el editor y el inicio manual de HU-002. |
| `MEMORY.md` | Actualizar al concluir | Modificar únicamente «Estado actual» y «Próximos pasos». |

## Funciones puras y persistencia

Las funciones nuevas de `src/domain/timer.ts` recibirán como argumentos el estado de temporizadores/ciclo, el vencimiento persistido y la hora actual. No leerán `Date.now()`, React Native, AsyncStorage ni Expo Notifications. El proveedor convertirá relojes globales a argumentos al invocar el dominio.

El snapshot versionado propuesto incluirá:

- `schemaVersion`;
- `focusTimer` y `breakTimer`, conservando fase, estado, duración inicial y restante;
- `breakType` y estado del ciclo Pomodoro;
- `expiresAtEpochMs` para la fase corriendo, o `null` cuando esté pausada;
- identificador de la notificación pendiente, o `null`.

No se almacenará una nueva fase como corriendo sin un vencimiento válido. Al guardar una fase pausada, se conservará el restante y se pondrá `expiresAtEpochMs` en `null`. Este snapshot se guarda en una clave nueva; las claves actuales del ciclo permanecen intactas.

## Algoritmo de restauración y vencimiento

```text
al iniciar o reanudar una fase:
    comprobar si es la primera sesión; explicar y solicitar permiso si aplica
    iniciar la transición pura con performance.now()
    guardar el snapshot con expiresAtEpochMs = Date.now() + tiempo_restante
    si hay permiso:
        programar notificación local para expiresAtEpochMs y guardar su identificador

al pausar o reiniciar una fase:
    reconciliar el restante usando performance.now() mientras el proceso sigue vivo
    cancelar la notificación pendiente de esa fase
    guardar fase pausada, restante reconciliado, expiresAtEpochMs = null

al hidratar:
    leer y validar el snapshot antes de persistir cualquier estado inicial
    si no existe snapshot:
        hidratar la sesión inicial compatible y pausada
    si el snapshot está pausado:
        restaurar fase y restante sin programar aviso
    si está corriendo:
        restante = max(0, expiresAtEpochMs - Date.now())
        si restante > 0:
            restaurar corriendo con ese restante y continuar el aviso pendiente
        si restante == 0:
            marcar la fase terminada
            aplicar una sola vez la transición existente de HU-002
            guardar la fase siguiente preparada y pausada sin notificación
    si la lectura o validación falla:
        no fingir una restauración correcta
        dejar estado pausado, mostrar error y esperar una acción explícita de recuperación

al llegar a cero con la app visible:
    cancelar/consumir el aviso pendiente
    procesar la transición visual en el proveedor
    el handler de notificaciones no presenta avisos mientras la app está visible

al tocar un aviso:
    abrir o reactivar la app
    hidratar y reconciliar antes de mostrar el destino
    presentar la fase siguiente preparada y pausada
```

El cálculo en el proceso activo continúa usando el reloj monotónico existente. La fecha epoch se usa únicamente como referencia durable entre procesos. Se acepta que un ajuste manual del reloj del dispositivo durante el cierre afecta la restauración, conforme a la elección explícita del usuario durante esta planificación.

## Interfaz

- Antes de iniciar la primera sesión, mostrar en español una explicación breve sobre el aviso al terminar y solicitar permiso del sistema. Si se deniega o no está disponible, continuar el inicio normalmente.
- Home conserva sus controles y textos actuales; un error de restauración se presenta claramente y no se representa como sesión recuperada. Una acción explícita permite descartar el snapshot inválido e iniciar una sesión nueva pausada, tras lo cual el estudiante podrá iniciar manualmente.
- En descanso, mostrar controles accesibles para pausar/reanudar y reiniciar cuando corresponda. El reinicio deja la fase pausada; la duración sigue editable solo de acuerdo con el comportamiento actual de HU-002.
- El fin visible en primer plano continúa como transición visual existente. Tras una restauración vencida, la fase siguiente queda preparada y pausada; nunca se inicia automáticamente.
- Aplicar `rn-conventions`: textos en español, `StyleSheet`, `SafeAreaView`, objetivos táctiles de al menos 44×44 puntos, etiquetas accesibles y revisión en vertical y horizontal.

## Estrategia de pruebas

### Jest — dominio

- Restaurar fase corriendo con vencimiento futuro conserva el estado running y calcula el restante desde la fecha actual (RF-01, RF-02, RNF-01).
- Restaurar fase vencida produce una sola transición de estudio/descanso, deja preparada y pausada la fase siguiente y no duplica el progreso en una segunda reconciliación (RF-05, RF-06).
- Restaurar fase pausada conserva exactamente el restante y no la marca como terminada (RF-09).
- Límites de vencimiento exacto en cero y fecha actual posterior no producen tiempo negativo ni transición repetida (RF-01, RF-02, RF-05).

### Jest — almacenamiento y notificaciones

- El snapshot preserva fases, estado, restante, ciclo, tipo de descanso, vencimiento e identificador de aviso (RNF-02).
- Valores mal formados, versiones no soportadas y fallos de lectura/escritura se propagan; no se convierten silenciosamente en una sesión inicial (RF-10).
- Mantener intacta la compatibilidad de `pomodoro-cotopaxi:cycle-count` y la clave de meta activa.
- La capa de notificaciones solicita permiso, permite continuar cuando no se concede, programa el título/cuerpo correcto, cancela el aviso anterior al pausar/reiniciar y programa el nuevo vencimiento al reanudar (RF-03, RF-04, RF-08).
- El handler de primer plano suprime avisos visibles; la interacción de notificación conserva los datos necesarios para restaurar la fase siguiente (RF-06, RF-07).

### Comprobación manual en Expo Go

- Iniciar una fase, bloquear el dispositivo y volver antes del vencimiento: restante correcto y temporizador aún corriendo.
- Iniciar una fase, cerrar la app desde recientes y reabrir antes del vencimiento: fase recuperada y restante calculado desde el vencimiento guardado.
- Dejar vencer estudio y descanso en segundo plano: llega el texto correspondiente y al volver se muestra la fase siguiente pausada conforme a HU-002.
- Denegar permiso o usar notificaciones no disponibles: el inicio y la restauración siguen funcionando.
- Dejar vencer una fase con la app visible: se muestra únicamente la transición visual, sin aviso del sistema.
- Pausar o reiniciar antes del vencimiento, cerrar y reabrir: se conserva pausa/restante y no aparece aviso obsoleto; al reanudar, el aviso corresponde al nuevo vencimiento.
- Simular fallo de lectura/estado inválido: error explícito, estado pausado y recuperación solo tras acción manual.
- Verificar orientación vertical/horizontal, accesibilidad, permisos y navegación al tocar notificaciones según `rn-conventions`.

Ejecutar al finalizar `npx jest`, `npx expo lint` y `npx tsc --noEmit`. No iniciar Expo durante esta fase de planificación.

## Tareas

### T1. Aprobaciones y preparación de notificaciones

- **Requisitos:** RF-03, RF-04, RF-06, RF-07, RF-08.
- **Archivos:** `package.json`, `src/notifications/pomodoro-notifications.ts`; nuevo registro en `src/storage/pomodoro-session-storage.ts`.
- **Descripción:** antes de instalar `expo-notifications` o escribir el nuevo formato de sesión, obtener autorización explícita. Con autorización, instalar la versión compatible con Expo SDK 57 mediante `npx expo install expo-notifications` y confirmar la disponibilidad local de las API requeridas.

### T2. Restauración pura por fecha de vencimiento

- **Requisitos:** RF-01, RF-02, RF-05, RF-09; RNF-01.
- **Archivos:** `src/domain/timer.ts`, `src/domain/__tests__/timer.test.ts`.
- **Descripción:** escribir primero pruebas deterministas para restauración futura, vencida y pausada; añadir funciones puras para reconciliar el vencimiento epoch y aplicar una sola transición de fase.

### T3. Persistencia validada de la sesión completa

- **Requisitos:** RF-02, RF-05, RF-09, RF-10; RNF-02.
- **Archivos:** `src/storage/pomodoro-session-storage.ts`, `src/storage/__tests__/pomodoro-session-storage.test.ts`, `src/storage/pomodoro-cycle-storage.ts`.
- **Descripción:** escribir primero pruebas de round-trip, esquema/versiones, datos inválidos y fallos; implementar lectura/escritura del snapshot versionado en una clave nueva y conservar sin cambios el formato de las claves actuales del ciclo.

### T4. Servicio de notificaciones locales

- **Requisitos:** RF-03, RF-04, RF-06, RF-07, RF-08.
- **Archivos:** `src/notifications/pomodoro-notifications.ts`, `src/notifications/__tests__/pomodoro-notifications.test.ts`.
- **Descripción:** encapsular permisos y canal local requerido, solicitud tras explicación, programación de vencimiento con texto por fase, cancelación por identificador y política que suprima avisos cuando la app esté visible. Probar la capa con Expo Notifications simulado.

### T5. Hidratación y ciclo de vida del proveedor

- **Requisitos:** RF-01–RF-10; RNF-01, RNF-02.
- **Archivos:** `src/hooks/use-pomodoro-timer.ts`, `src/domain/timer.ts`, `src/storage/pomodoro-session-storage.ts`, `src/notifications/pomodoro-notifications.ts`.
- **Descripción:** integrar hidratación antes de persistencia, cálculo epoch al restaurar procesos, reloj monotónico durante la ejecución, persistencia coherente, transición única, permisos, programación/cancelación en inicio/pausa/reinicio/reanudación y estado explícito de error con recuperación manual.

### T6. Inicio, permiso y error de recuperación en home

- **Requisitos:** RF-04, RF-10.
- **Archivos:** `src/app/(tabs)/index.tsx`, `src/hooks/use-pomodoro-timer.ts`.
- **Descripción:** presentar explicación antes de solicitar permiso en la primera sesión, continuar aunque se deniegue y mostrar claramente el error de restauración sin afirmar que se recuperó la sesión; permitir la acción manual de nueva sesión.

### T7. Controles de pausa, reinicio y reanudación del descanso

- **Requisitos:** RF-08, RF-09.
- **Archivos:** `src/app/descanso.tsx`, `src/hooks/use-pomodoro-timer.ts`.
- **Descripción:** añadir controles accesibles para pausar/reanudar y reiniciar una fase de descanso en curso; cancelar avisos obsoletos y asegurar que reiniciar deja el temporizador pausado.

### T8. Apertura y transición desde notificaciones

- **Requisitos:** RF-03, RF-05, RF-06, RF-07.
- **Archivos:** `src/app/_layout.tsx`, `src/hooks/use-pomodoro-timer.ts`, `src/app/(tabs)/index.tsx`, `src/app/descanso.tsx`.
- **Descripción:** conectar interacciones de notificación con hidratación y reconciliación; verificar el destino tras abrir desde aviso y suprimir notificación duplicada cuando el vencimiento sucede con la app visible.

### T9. Validación automatizada

- **Requisitos:** RF-01–RF-10; RNF-01, RNF-02.
- **Archivos:** pruebas del dominio, almacenamiento y notificaciones.
- **Descripción:** ejecutar `npx jest`, `npx expo lint` y `npx tsc --noEmit`; resolver regresiones introducidas por HU-003 antes de continuar.

### T10. Verificación manual y cierre SDD

- **Requisitos:** RF-01–RF-10; RNF-01, RNF-02.
- **Archivos:** `src/app/(tabs)/index.tsx`, `src/app/descanso.tsx`, `src/app/_layout.tsx`, `MEMORY.md`.
- **Descripción:** verificar los escenarios de bloqueo, cierre forzado, vencimiento, permiso denegado, toque de notificación, pausa/reanudación, reinicio y error de restauración en Expo Go; actualizar únicamente «Estado actual» y «Próximos pasos» en `MEMORY.md`.

## Trazabilidad

| Requisito | Plan | Evidencia prevista |
|---|---|---|
| RF-01 | T2, T5, T9, T10 | El restante se calcula usando tiempo transcurrido tanto al volver de segundo plano como al restaurar una fase aún vigente. |
| RF-02 | T2, T3, T5, T9, T10 | El snapshot restaura una fase vigente como running y el tiempo correcto. |
| RF-03 | T1, T4, T5, T8, T9, T10 | Aviso local al vencer estudio o descanso fuera de la app, con texto que identifica la fase. |
| RF-04 | T1, T4, T6, T9, T10 | Explicación y permiso durante el primer inicio; denegación/disponibilidad no bloquea el temporizador. |
| RF-05 | T2, T5, T8, T9, T10 | Transición HU-002 al restaurar fase vencida, siguiente fase pausada y progreso aplicado una sola vez. |
| RF-06 | T4, T5, T8, T9, T10 | Al tocar el aviso se abre la app y la hidratación lleva a la fase siguiente preparada y pausada. |
| RF-07 | T4, T5, T8, T9, T10 | El vencimiento visible solo actualiza la interfaz; el handler evita mostrar un aviso del sistema. |
| RF-08 | T4, T5, T7, T9, T10 | Pausar/reiniciar cancela el aviso y reanudar programa otro para el nuevo vencimiento. |
| RF-09 | T2, T3, T5, T9, T10 | La restauración de sesión pausada conserva restante y no genera aviso. |
| RF-10 | T3, T5, T6, T9, T10 | Error de lectura/validación visible, temporizador pausado y nueva sesión solo tras acción manual. |
| RNF-01 | T2, T5, T9, T10 | Pruebas de fechas deterministas y verificación manual de bloqueo/suspensión/cierre. |
| RNF-02 | T3, T5, T9, T10 | Snapshot local versionado restaurable sin modificar el formato previo del ciclo. |

## Riesgos y límites

- La elección de `Date.now()` para restauraciones entre procesos fue confirmada por el usuario, pero difiere de HU-001, D-02 si el reloj civil se ajusta mientras la aplicación permanece cerrada. La lógica activa dentro del proceso sigue usando el reloj monotónico.
- El SDK confirma que las notificaciones locales están disponibles en Expo Go, pero la verificación de entrega y toque debe realizarse en un dispositivo o emulador compatible; Expo Go no sustituye la comprobación de permisos reales del sistema.
- La aprobación para añadir `expo-notifications` y para introducir un nuevo formato local de sesión sigue siendo necesaria antes de implementar T1/T3. No se cambian los datos existentes.
- Las escrituras asíncronas del snapshot y del progreso del ciclo deben serializarse o versionarse para evitar que una escritura antigua sobrescriba una transición más reciente.
