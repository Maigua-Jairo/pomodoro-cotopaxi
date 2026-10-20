# Spec 002 — Alternar entre estudio y descanso

Estado: implementada
HU de origen: docs/historias/HU-002.md

## Contexto y objetivo
Permitir que la aplicación pase de una fase de estudio a la siguiente fase de descanso o de regreso al estudio, según el avance del ciclo de pomodoros, sin que el estudiante tenga que llevar la cuenta manualmente. La aplicación debe mantener el progreso del ciclo y dejar la fase siguiente lista para iniciarse de forma explícita.

## Usuarios
- Estudiante

## Historias de usuario
Como estudiante, quiero que la aplicación pase sola del tiempo de estudio al de descanso, para seguir la técnica Pomodoro sin tener que llevar la cuenta yo mismo.

## Definiciones
- **Pomodoro completado:** un bloque de estudio que llega a cero sin reinicio ni abandono previo.
- **Ciclo de pomodoros:** cantidad de bloques de estudio que deben completarse antes de un descanso largo. Por defecto, cuatro.
- **Descanso corto:** pausa breve que se prepara cuando aún no se alcanza la meta del ciclo.
- **Descanso largo:** pausa más larga que se prepara al completar el ciclo actual.
- **Tiempo restante:** duración que falta para completar la fase actual.
- **Fase siguiente lista:** una fase (descanso o estudio) queda preparada, con su duración configurada y en estado pausado, esperando que el estudiante la inicie.

## Requisitos funcionales
- **RF-01:** CUANDO el temporizador de estudio llegue a cero y todavía no se haya completado la cantidad necesaria de pomodoros para el descanso largo, EL SISTEMA dejará listo un descanso corto con la duración configurada y en estado pausado para que el estudiante lo inicie. Origen: HU-002, escenario «Terminar un pomodoro»; decisiones.md, D-01 y D-02.
- **RF-02:** CUANDO el temporizador de estudio llegue a cero y se haya completado la cantidad configurada de pomodoros para el descanso largo, EL SISTEMA dejará listo un descanso largo con la duración configurada y en estado pausado; además, EL SISTEMA devolverá el contador de pomodoros a cero. Origen: HU-002, escenario «Llegar al descanso largo»; decisiones.md, D-02 y D-06.
- **RF-03:** CUANDO termine un descanso corto o largo, Y el estudiante vuelva a la aplicación, EL SISTEMA dejará listo el siguiente tiempo de estudio con su duración configurada y en estado pausado, para que el estudiante lo inicie. Origen: HU-002, escenario «Terminar un descanso»; decisiones.md, D-07.
- **RF-04:** EN la pantalla principal, MIENTRAS la sesión esté activa, EL SISTEMA mostrará el estado actual de estudio o descanso y el avance del ciclo como «Pomodoros: X/Y», con el número de pomodoros completados y la meta del ciclo actual. Origen: HU-002, escenario «Ver mi avance»; decisiones.md, D-06.
- **RF-05:** CUANDO el estudiante reinicie o abandone un tiempo de estudio antes de llegar a cero, EL SISTEMA NO incrementará el contador de pomodoros ni considerará ese intento como un pomodoro completado. Origen: HU-002, escenario «Terminar un pomodoro»; decisiones.md, D-03.
- **RF-06:** CUANDO el estudiante cierre y vuelva a abrir la aplicación, EL SISTEMA restaurará el contador de pomodoros del ciclo actual desde su última sesión guardada localmente. Origen: HU-002, escenario «Ver mi avance»; decisiones.md, D-04.
- **RF-07:** SI durante un ciclo en curso el estudiante cambia la cantidad configurada de pomodoros por ciclo, EL SISTEMA conservará la meta que ya estaba activa para ese ciclo y aplicará la nueva meta solo al siguiente ciclo. Origen: HU-002, escenario «Ver mi avance»; decisiones.md, D-05.
- **RF-08:** CUANDO el estudiante inicia manualmente la fase siguiente preparada, EL SISTEMA comenzará la cuenta regresiva con la duración correspondiente y sin duplicar ni adelantar su tiempo inicial. Origen: HU-002, decisiones.md, D-01 y D-02.

## Requisitos no funcionales
- **RNF-01:** La pantalla principal debe mostrar de forma clara si la fase actual es estudio o descanso y el avance del ciclo mediante el formato recomendado «Pomodoros: X/Y». Origen: HU-002, escenario «Ver mi avance»; decisiones.md, D-06.
- **RNF-02:** El progreso del ciclo debe persistirse localmente para conservarse al cerrar y abrir la aplicación. Origen: decisiones.md, D-04.

## Casos límite
- Si el estudiante reinicia el tiempo de estudio antes de llegar a cero, no debe sumarse al contador del ciclo (RF-05).
- Si el estudiante pausa y reanuda un tiempo de estudio sin terminarlo, el contador no debe avanzar (RF-05).
- Si un ciclo llega a la meta configurada, la siguiente etapa preparada será un descanso largo y el contador volverá a cero (RF-02).
- Si la meta de pomodoros se cambia mientras un ciclo ya está en marcha, la meta actual no se altera (RF-07).
- Si el estudiante vuelve a la app después de terminar un descanso, la siguiente fase de estudio queda lista y pausada (RF-03).
- Si el estudiante reabre la app tras cerrar la sesión, el contador del ciclo se recupera desde el valor guardado (RF-06).
- Si la aplicación muestra el descanso siguiente, este debe quedar preparado y sin arrancar automáticamente hasta que el estudiante lo inicie (RF-01, RF-02, RF-03).

## Fuera de alcance
- La lógica de notificaciones push o alarmas del sistema fuera del flujo de estudio/descanso del Pomodoro.
- La configuración de tiempos de estudio y descanso detallada, que corresponde a HU-005.
- La automatización del inicio del descanso sin la confirmación del estudiante.

## Criterios de finalización
- Los requisitos funcionales RF-01 a RF-08 y los requisitos no funcionales RNF-01 y RNF-02 pueden verificarse con los escenarios descritos en esta especificación.
- Cada escenario de HU-002 está cubierto por al menos un requisito funcional.

## Dudas abiertas
- Ninguna.

## Requisitos modificados por specs posteriores
- **RF-07:** se conserva, con una excepción: si la nueva meta es menor o igual que los pomodoros ya completados, el descanso largo llega al terminar el siguiente estudio (spec 005, RF-06 y RF-12).
