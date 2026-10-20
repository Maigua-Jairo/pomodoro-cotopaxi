# Spec 004 — Recibir aviso al terminar el tiempo

Estado: implementada
HU de origen: docs/historias/HU-004.md

## Contexto y objetivo
Permitir que el estudiante reciba una señal clara cuando termina una fase de estudio o descanso, incluso si el celular está en silencio o la pantalla está bloqueada. El sistema debe avisar con una alarma perceptible cuando la aplicación está abierta, mantener el comportamiento de primer plano definido en HU-003 y, si la notificación del sistema no está disponible o no se permite, seguir funcionando sin bloquear el temporizador ni presentar un aviso falso como si hubiera sido programado correctamente.

## Usuarios
- Estudiante

## Historias de usuario
Como estudiante, quiero que la aplicación me avise cuando termine el tiempo de estudio o de descanso, incluso con el celular en silencio, para cambiar de actividad sin estar mirando la pantalla.

## Definiciones
- **Fase terminada:** el tiempo restante de la fase actual llega a cero.
- **Aplicación en primer plano:** la aplicación está visible y activa en pantalla.
- **Aplicación en segundo plano:** la aplicación no está visible, el celular está bloqueado, se cambió a otra aplicación o se cerró desde recientes.
- **Alarma activa:** señal sonora y/o vibratoria que informa que terminó la fase actual y ofrece un control para detenerla.
- **Aviso no disponible:** condición en la que el sistema operativo o los permisos del dispositivo impiden emitir la alarma o mostrar el aviso del sistema.

## Requisitos funcionales
- **RF-01:** CUANDO el temporizador llegue a cero mientras la aplicación está abierta y visible, EL SISTEMA reproducirá una alarma con sonido y vibración y mostrará un control «Detener» para que el estudiante pueda silenciarla. Origen: HU-004, escenario «Aviso con el celular en sonido»; decisiones.md, D-01 y D-05.
- **RF-02:** MIENTRAS la aplicación esté en primer plano, EL SISTEMA NO publicará una notificación del sistema adicional por la misma fase terminada, y mostrará únicamente la alarma interna de la aplicación. Origen: HU-003, decisiones.md, D-02.
- **RF-03:** CUANDO una fase termine mientras la aplicación está en segundo plano y el permiso de notificaciones está disponible, EL SISTEMA programará una notificación del sistema con el título «Estudio terminado» o «Descanso terminado» y un mensaje que indique que la siguiente fase está lista para iniciar. Origen: HU-004, escenario «Aviso con el celular en silencio»; decisiones.md, D-01 y D-06.
- **RF-04:** SI el sistema operativo o el permiso no permiten emitir sonido, vibrar o mostrar la alarma en la pantalla bloqueada, ENTONCES el temporizador continuará funcionando y EL SISTEMA informará que el aviso no está disponible con un mensaje discreto en la parte inferior de la pantalla principal. Origen: HU-004, escenario «Aviso con el celular en silencio»; decisiones.md, D-03 y D-08.
- **RF-05:** SI falla la programación del aviso aunque el permiso de notificaciones esté concedido, ENTONCES el temporizador continuará normalmente y EL SISTEMA mostrará un mensaje discreto en la parte inferior de la pantalla principal informando que no se pudo programar el aviso. Origen: HU-004, decisiones.md, D-04 y D-08.
- **RF-06:** CUANDO la alarma esté activa, SI el estudiante no interactúa con ella, EL SISTEMA la detendrá automáticamente a los 3 segundos. Origen: HU-004, decisiones.md, D-05; tasks.md, Verificación, V-01.
- **RF-07:** CUANDO el estudiante toque la notificación del sistema o el botón «Detener» de la alarma, EL SISTEMA silenciará la alarma y abrirá la aplicación mostrando la siguiente fase preparada y pausada. Origen: HU-004, escenarios «Detener el aviso» y «Aviso con el celular en silencio»; decisiones.md, D-07.
- **RF-08:** CUANDO el estudiante inicie su primera sesión, EL SISTEMA explicará brevemente para qué sirve el permiso de notificaciones y lo solicitará; SI el permiso se deniega, EL SISTEMA permitirá iniciar y usar el temporizador normalmente. Origen: HU-004, escenario «Permiso de notificaciones»; decisiones.md, D-06.

## Requisitos no funcionales
- **RNF-01:** La alarma de fin de fase debe ser perceptible aunque el estudiante esté usando la aplicación: debe sonar, vibrar y mostrar una acción de cierre explícita. Origen: HU-004, escenario «Aviso con el celular en sonido»; decisiones.md, D-01.
- **RNF-02:** La solicitud de permisos para notificaciones se mantiene consistente con HU-003: se hace al iniciar la primera sesión, pero el temporizador no queda bloqueado si se niega el permiso. Origen: HU-004, escenario «Permiso de notificaciones»; decisiones.md, D-06.
- **RNF-03:** El temporizador debe conservar la lógica de transición ya definida en HU-002 y HU-003: al cerrar la alarma o tocar la notificación, la aplicación abre con la siguiente fase preparada y pausada, sin iniciarla automáticamente. Origen: HU-004, decisiones.md, D-07; HU-002, HU-003.

## Casos límite
- Si la aplicación está visible cuando termina la fase, se activa la alarma interna y no se duplica con una notificación del sistema (RF-01, RF-02).
- Si el celular está en silencio o vibración, la alarma se oye como una señal perceptible y la aplicación la muestra en la pantalla bloqueada o la siguiente vista según el caso disponible (RF-01, RF-03, RF-04).
- Si el permiso de notificaciones está denegado o el sistema no lo permite, la sesión no se bloquea y la app sigue funcionando (RF-04, RF-05, RF-08).
- Si falla la programación del aviso, la aplicación informa claramente que no se pudo programar y el estudiante puede seguir usando el temporizador (RF-05).
- Si el estudiante no interactúa con la alarma, esta se apaga sola a los 3 segundos (RF-06).
- Si el estudiante toca la notificación o el botón de detener, la aplicación vuelve a la siguiente fase preparada y pausada (RF-07).
- Si el usuario inicia la primera sesión sin permiso, la app lo explica y solicita el permiso, pero la sesión sigue arrancando aunque se rechace (RF-08).

## Fuera de alcance
- Cambiar la lógica de transición entre estudio y descanso definida en HU-002.
- Iniciar automáticamente la siguiente fase después de que termine la actual.
- Añadir servicios backend, cuentas o notificaciones push externas.

## Criterios de finalización
- Los requisitos funcionales RF-01 a RF-08 y los requisitos no funcionales RNF-01 a RNF-03 pueden verificarse con los escenarios y condiciones descritos en esta especificación.
- Cada escenario de HU-004 está cubierto por al menos un requisito funcional.
- La ausencia de permiso de notificaciones no bloquea la sesión ni la transición al siguiente estado.

## Dudas abiertas
- Ninguna.
