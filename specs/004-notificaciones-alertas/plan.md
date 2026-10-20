# Plan: Recibir aviso al terminar el tiempo

**Spec:** [spec.md](./spec.md)  
**Decisiones:** [decisiones.md](./decisiones.md)  
**Estado de la spec:** Aprobada

## Resumen

Completar HU-004 sobre el flujo de HU-003 ya existente. El proveedor ya detecta el fin de una fase, pide el permiso en el primer inicio y prepara la transición; `src/app/_layout.tsx` ya muestra una alarma con vibración y la detiene automáticamente tras un tiempo fijo. Falta sonido en primer plano, información visible cuando una notificación no está disponible o falla, y hay que corregir la programación local: actualmente se omite si el temporizador se inicia mientras la app está visible, por lo que no habrá aviso si luego se bloquea el teléfono.

La implementación añadirá reproducción local con `expo-audio`, una señal de audio propia y original, vibración y limpieza al detener la alarma. La notificación local se programará también mientras la app está visible; el handler existente seguirá suprimiendo su presentación en primer plano, evitando duplicados. Los fallos de permiso, reproducción o programación se comunicarán claramente sin detener ni alterar el temporizador. La parada automática se fija en 3 segundos (tasks.md, V-01), en lugar de los 10 segundos aprobados durante la planificación.

## Contexto técnico

- **Lenguaje y plataforma:** TypeScript, Expo SDK 57, React Native 0.86, iOS y Android; Expo Router.
- **Dependencias existentes:** `expo-notifications` ya está instalada e integrada. `expo-audio` no está instalado; se añadirá con `npx expo install expo-audio` para respetar la versión compatible con SDK 57. La documentación de SDK 57 confirma que Audio está disponible en Expo Go para Android/iOS y permite reproducir sonidos locales.
- **Sonido y vibración:** el overlay del layout raíz ya usa `Vibration` y un temporizador fijo, pero no reproduce sonido. Se incorporará un tono local empaquetado y original mediante un módulo de alarma que centralice reproducción, vibración repetida y limpieza. La alarma interna solo se activa cuando la app está visible.
- **Notificaciones:** `src/notifications/pomodoro-notifications.ts` ya implementa permisos, handler, programación, cancelación y apertura desde el aviso. Hoy evita programar con la app en primer plano y el proveedor solo registra fallos en consola. Se programará para el vencimiento aunque la app esté visible; el handler mantendrá desactivada la presentación de sistema en primer plano. Los errores o la falta de permiso se expondrán al usuario.
- **Persistencia y dominio:** no se requiere modificar el dominio del temporizador ni agregar o cambiar datos locales. La transición de fase y el estado preparado/pausado se mantienen según HU-002 y HU-003.
- **Pruebas:** Jest y `jest-expo` existentes. Se ampliarán las pruebas del servicio de notificaciones y se añadirán pruebas al módulo de alarma con APIs nativas simuladas; los resultados dependientes del sistema se comprobarán manualmente en Expo Go.
- **Restricciones:** ninguna notificación push, backend o cuenta; no bloquear el temporizador por permisos o fallos; no iniciar automáticamente la fase siguiente; mantener el texto de interfaz en español. El plugin de audio se configurará sin grabación ni reproducción en segundo plano: no hace falta permiso de micrófono para este uso.

## Comprobación de la constitución

| Principio | Aplicación |
|---|---|
| Simplicidad primero | Se reutiliza `expo-notifications`, `Vibration`, el proveedor y el overlay existentes. `expo-audio` se agrega por la exigencia de sonido en RF-01; la dependencia y el tono local fueron aprobados durante la planificación. |
| La spec manda | Se cubren RF-01–RF-08 y RNF-01–RNF-03. No se modifica la transición de HU-002 ni se inicia la siguiente fase automáticamente. |
| Lógica separada de interfaz | La transición del temporizador permanece en el dominio. La reproducción y vibración se encapsulan fuera de las pantallas; el layout se limita a representar la alarma y coordinar la navegación. |
| Pruebas como puerta | Se prueban programación, supresión en primer plano, permiso, errores, reproducción y limpieza con Jest; se verifica manualmente la experiencia de plataforma. |
| Los datos del usuario son sagrados | No cambia AsyncStorage, sus claves ni el formato de los datos guardados. |
| Exactitud del tiempo | No se altera el cálculo temporal ni la reconciliación por marcas de tiempo de HU-003. |

## Decisiones técnicas

| Decisión | Aplicación | Alternativa descartada |
|---|---|---|
| D-01 y D-05 | Completar la alarma del overlay raíz con sonido local, vibración y el control «Detener». Apagado automático a los 3 segundos, definido por el usuario en la verificación (tasks.md, V-01). Detener la reproducción, la vibración y los temporizadores tanto al pulsar el control como al desmontar el efecto. | Mantener solo vibración o dejar la alarma sonando indefinidamente. |
| D-02 | Programar la notificación local en el inicio/reanudación de la fase incluso si la app está visible. Al vencer, el handler existente decide si la muestra: no la presenta cuando `AppState` está activo y deja que la alarma interna sea la única señal visible. | Omitir la programación mientras la app está visible; esa opción pierde el aviso si el estudiante bloquea el teléfono después de iniciar el temporizador. |
| D-03 y D-04 | Distinguir permiso denegado/no disponible, plataforma sin soporte y excepción de programación o reproducción; exponer un mensaje accesible y mantener activo el temporizador. No ocultar errores inesperados con valores de éxito. | Solo escribir el error en consola o presentar el aviso como programado cuando no se confirmó. |
| D-06 | Conservar la explicación y solicitud del permiso del primer inicio en `src/app/(tabs)/index.tsx`; un rechazo sigue permitiendo iniciar. Configurar Audio para reproducción sin permisos de grabación ni modo de reproducción en segundo plano. | Solicitar permiso de micrófono o activar servicios nativos de audio en segundo plano que esta historia no requiere. |
| D-07 | Al tocar el aviso, limpiar/detener cualquier alarma interna activa, esperar la sesión hidratada y abrir la fase siguiente preparada y pausada, reutilizando el listener y el proveedor existentes. | Navegar antes de hidratar o dejar que la alarma interna siga sonando al atender el aviso. |
| RF-03, RF-04 y RNF-01 | Verificar permisos disponibles y errores de APIs; mostrar el mensaje de indisponibilidad cuando la app pueda confirmar que el sistema no permitirá el aviso. La configuración de sonido y pantalla bloqueada también se comprobará manualmente en Android e iOS; no se afirmará que el sistema garantiza la entrega si sus ajustes la bloquean. | Suponer que un permiso concedido garantiza sonido o presentación en la pantalla bloqueada. |

## Archivos y responsabilidades

| Archivo | Cambio previsto | Responsabilidad |
|---|---|---|
| `package.json` | Modificar | Registrar la versión de `expo-audio` compatible con Expo SDK 57 mediante `npx expo install`. |
| `app.json` | Modificar | Añadir la configuración del plugin de Audio, desactivando micrófono, grabación y reproducción en segundo plano, que no forman parte de esta historia. |
| `assets/audio/pomodoro-alarm.wav` | Crear | Incluir un tono corto original, empaquetado localmente para reproducción en primer plano. |
| `src/notifications/pomodoro-alarm.ts` | Crear | Encapsular creación, reproducción y detención del sonido y vibración; exponer los errores de disponibilidad sin alterar el estado del temporizador. |
| `src/notifications/__tests__/pomodoro-alarm.test.ts` | Crear | Verificar inicio, detención, limpieza y propagación de errores del servicio con Expo Audio y `Vibration` simulados. |
| `src/notifications/pomodoro-notifications.ts` | Modificar | Permitir programar avisos aunque la app esté en primer plano; conservar la supresión visual del handler, el texto por fase, la lógica de permisos y las respuestas al tocar. |
| `src/notifications/__tests__/pomodoro-notifications.test.ts` | Modificar | Cubrir programación en primer plano y segundo plano, no duplicación visible, permiso ausente, excepción de programación y respuesta tocada. |
| `src/hooks/use-pomodoro-timer.ts` | Modificar | Propagar al estado compartido la disponibilidad o el fallo de programación, sin detener los temporizadores; permitir limpiar la alarma al tocar una notificación. |
| `src/app/_layout.tsx` | Modificar | Reproducir/detener el sonido y la vibración de la alarma visible, aplicar el apagado automático de 3 segundos y el botón «Detener», cerrar la alarma al abrir una notificación y mostrar los mensajes de indisponibilidad. |
| `src/app/(tabs)/index.tsx` | Revisar/modificar solo si se requiere | Conservar el permiso inicial y asegurar que su denegación o fallo siempre permita iniciar; mostrar el estado de aviso no disponible si el layout raíz no lo cubre en la pantalla de inicio. |
| `src/app/descanso.tsx` | Revisar/modificar solo si se requiere | Asegurar que el mismo mensaje de indisponibilidad también sea visible durante la fase de descanso. |

No se modifican `src/domain/timer.ts`, los almacenamientos, los formatos persistidos ni las transiciones de HU-002/HU-003.

## Lógica pura y persistencia

- No se añade lógica al dominio: se reutilizan las transiciones y las comprobaciones puras existentes `getPomodoroNotificationBehavior` e `isPomodoroCompletionResponse`.
- La clasificación del resultado de la operación de notificación debe permitir distinguir «programada», «suprimida en primer plano» y «no disponible»; una excepción de programación se propaga al proveedor para generar un aviso visible, no un falso éxito.
- No se añade persistencia. El ID de notificación y el estado de sesión siguen usando las estructuras ya existentes.

## Algoritmo

```text
al iniciar o reanudar una fase:
    iniciar el temporizador independientemente del permiso de notificaciones
    solicitar/programar el aviso local para el vencimiento, incluso en primer plano
    si el permiso no está concedido o la plataforma no ofrece avisos:
        exponer que el aviso del sistema no está disponible
    si la programación falla:
        exponer que no se pudo programar el aviso
    nunca pausar ni revertir el temporizador por esos resultados

al recibir una respuesta de notificación:
    validar que corresponde a una fase Pomodoro
    esperar a que la sesión esté hidratada
    detener una alarma interna activa y limpiar la respuesta pendiente
    navegar a la siguiente fase ya preparada y pausada

al terminar una fase con la app visible:
    el handler no muestra la notificación del sistema
    iniciar el tono local y la vibración
    mostrar el overlay y el botón «Detener»
    al tocar «Detener» o al cumplir 3 segundos:
        parar sonido y vibración, limpiar temporizadores y cerrar el overlay
        mostrar la siguiente fase preparada y pausada

si el tono o la vibración falla:
    detener cualquier efecto que sí se haya iniciado
    mostrar que la alarma no está disponible
    conservar intacto el estado del temporizador y la transición
```

## Interfaz

- El overlay muestra «Estudio terminado» o «Descanso terminado», una descripción, y «Detener», con la paleta institucional, `StyleSheet`, área táctil de al menos 44×44 puntos y etiqueta accesible.
- Los mensajes de permiso denegado, aviso no disponible, error de programación o alarma interna no disponible se muestran claramente en español y con `accessibilityLiveRegion="polite"`. La notificación no se presenta de nuevo como alarma del sistema mientras la app está visible.
- El aviso tocado abre la fase siguiente preparada y pausada, sin reproducir una alarma persistente.
- Aplicar la lista manual de `rn-conventions`: orientaciones vertical/horizontal, claridad del estado sin depender del color y accesibilidad. Verificar en un dispositivo Android y uno iOS, incluyendo modo silencio y ajustes de pantalla bloqueada.

## Estrategia de pruebas con Jest

1. **Servicio de alarma:** simular Expo Audio y `Vibration`; comprobar que inicia ambos efectos, que la detención elimina el reproductor y cancela la vibración, que la limpieza ocurre una sola vez y que los errores quedan disponibles para la interfaz (RF-01, RF-04, RF-06, RNF-01).
2. **Notificaciones locales:** comprobar títulos y mensaje por fase, programación mientras la app está visible, supresión de presentación en primer plano, programación en segundo plano, permiso denegado, API no soportada, excepción de programación y respuesta válida al tocar (RF-02–RF-05, RF-07, RF-08).
3. **Temporizador y transición:** ejecutar las pruebas existentes de dominio para confirmar que los avisos de indisponibilidad y la alarma no alteran el fin de fase ni dejan la siguiente fase en marcha (RNF-03).
4. **Validación automatizada:** ejecutar `npx jest`, `npx expo lint` y `npx tsc --noEmit`.
5. **Verificación manual:** en Expo Go, probar fin de estudio y descanso en primer plano; permiso concedido/denegado; transición después de detener o dejar vencer los 3 segundos; inicio en primer plano seguido de bloqueo; respuesta al tocar la notificación; fallo de programación/audio; y restricciones de silencio/pantalla bloqueada. Expo no se iniciará durante esta fase de planificación.

## Tareas

Ver [tasks.md](./tasks.md). Total: 10 tareas, en orden de dependencia.

## Cobertura de requisitos

| Requisito | Cobertura en el plan |
|---|---|
| RF-01 | Sonido, vibración, overlay y control «Detener» en el layout raíz y servicio de alarma. |
| RF-02 | Handler que suprime la notificación cuando la app está visible, aunque se programe la alarma local. |
| RF-03 | Programación local al vencer estudio o descanso, con contenido por fase y prueba manual en segundo plano. |
| RF-04 | Mensajes accesibles ante permisos/restricciones detectables y fallos de sonido, vibración o aviso. |
| RF-05 | Error de programación visible; el temporizador se conserva en curso. |
| RF-06 | Limpieza de alarma tras 3 segundos, al pulsar «Detener» o al desmontar el efecto. |
| RF-07 | Respuesta de notificación detiene la alarma y abre la fase siguiente preparada y pausada. |
| RF-08 | Explicación y permiso en el primer inicio; rechazo no bloquea el inicio. |
| RNF-01 | Pruebas de reproducción y vibración; verificación en el dispositivo con la app visible. |
| RNF-02 | Se conserva la explicación/permiso previo al inicio y el flujo de rechazo tolerante. |
| RNF-03 | Se reutiliza la transición existente sin auto-iniciar la fase siguiente. |

## Advertencias

- Los ajustes del sistema para silencio, vibración y presentación en pantalla bloqueada pueden impedir el aviso aunque la app tenga permiso. La implementación comprobará las capacidades que Expo exponga; la garantía efectiva debe validarse en cada plataforma y no se presentará como confirmada si el sistema no permite verificarla.
- `expo-audio` se usará solo para reproducción en primer plano. No se habilitarán permisos de micrófono ni reproducción de audio en segundo plano.
