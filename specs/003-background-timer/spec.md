# Spec 003 — Mantener el conteo con el celular bloqueado o la app cerrada

Estado: implementada
HU de origen: docs/historias/HU-003.md

## Contexto y objetivo
Permitir que el estudiante continúe una sesión de estudio o descanso mientras el celular está bloqueado o la aplicación está cerrada. Al volver, la aplicación debe mostrar el tiempo restante correcto y aplicar las transiciones de fase ya definidas. Cuando una fase termine fuera de la aplicación, el estudiante debe poder recibir un aviso del sistema si las notificaciones están permitidas.

## Usuarios
- Estudiante

## Historias de usuario
Como estudiante, quiero que el temporizador siga contando aunque bloquee el celular o cierre la aplicación, para no perder el tiempo que llevo estudiando.

## Definiciones
- **Aplicación en segundo plano:** la aplicación no está visible, ya sea porque el celular está bloqueado, se cambió a otra aplicación o se cerró desde las aplicaciones recientes.
- **Fase terminada:** el tiempo restante de la fase llegó a cero.
- **Fase siguiente preparada:** la fase correspondiente al ciclo queda pausada, con su duración configurada, esperando a que el estudiante la inicie, de acuerdo con HU-002.

## Requisitos funcionales
- **RF-01:** MIENTRAS el temporizador esté corriendo y la aplicación esté en segundo plano, EL SISTEMA descontará el tiempo transcurrido y, cuando el estudiante vuelva a la aplicación antes de que termine la fase, mostrará el tiempo restante correcto y mantendrá la cuenta en curso. Origen: HU-003, escenario «Bloquear el celular»; docs/constitucion.md, principio 6.
- **RF-02:** CUANDO el estudiante vuelva a abrir la aplicación después de cerrarla con el temporizador corriendo, EL SISTEMA recuperará la sesión y mostrará el tiempo restante correcto; SI la fase aún no terminó, EL SISTEMA mantendrá el temporizador corriendo. Origen: HU-003, escenario «Cerrar la aplicación»; docs/constitucion.md, principio 6.
- **RF-03:** CUANDO una fase termine mientras la aplicación esté en segundo plano, EL SISTEMA programará un aviso del sistema que indique qué fase terminó («Estudio terminado» o «Descanso terminado»), si las notificaciones están permitidas. Origen: HU-003, escenario «El tiempo termina con la aplicación cerrada»; decisiones.md, D-01, D-02 y D-06.
- **RF-04:** CUANDO el estudiante inicie su primera sesión, EL SISTEMA explicará brevemente el uso de las notificaciones y solicitará permiso para enviarlas; SI el permiso se deniega o no está disponible, EL SISTEMA permitirá iniciar y usar el temporizador normalmente. Origen: decisiones.md, D-02 y D-03.
- **RF-05:** CUANDO el estudiante vuelva a la aplicación después de que una fase haya terminado en segundo plano, EL SISTEMA aplicará la transición definida en HU-002 y dejará preparada y pausada la fase siguiente, sin iniciarla automáticamente. Origen: HU-003, escenario «El tiempo termina con la aplicación cerrada»; decisiones.md, D-04.
- **RF-06:** CUANDO el estudiante toque el aviso del sistema de una fase terminada, EL SISTEMA abrirá la aplicación y mostrará la fase siguiente preparada y pausada. Origen: decisiones.md, D-06 y HU-002, decisiones.md, D-01, D-02 y D-07.
- **RF-07:** CUANDO el temporizador llegue a cero mientras la aplicación esté abierta y visible, EL SISTEMA mostrará únicamente la transición visual de la aplicación y NO mostrará un aviso del sistema. Origen: decisiones.md, D-07.
- **RF-08:** CUANDO el estudiante pause o reinicie una fase antes de su vencimiento, EL SISTEMA cancelará el aviso pendiente; CUANDO reanude la fase, EL SISTEMA programará el aviso para el nuevo vencimiento si las notificaciones están permitidas. Origen: HU-003, escenario «Pausar antes de cerrar»; decisiones.md, D-05.
- **RF-09:** CUANDO el estudiante cierre y vuelva a abrir la aplicación tras pausar el temporizador, EL SISTEMA restaurará la fase pausada con el mismo tiempo restante y NO mostrará un aviso de fin. Origen: HU-003, escenario «Pausar antes de cerrar».
- **RF-10:** SI EL SISTEMA no puede leer el estado guardado al restaurar la sesión, ENTONCES informará claramente del error, dejará el temporizador pausado y permitirá al estudiante reiniciarlo manualmente. Origen: decisiones.md, D-08.

## Requisitos no funcionales
- **RNF-01:** EL SISTEMA calculará el tiempo restante a partir del tiempo real transcurrido, de modo que bloquear el celular, cerrar la aplicación o una suspensión del proceso no adelante ni atrase la cuenta. Origen: docs/constitucion.md, principio 6; HU-003, escenarios «Bloquear el celular» y «Cerrar la aplicación».
- **RNF-02:** EL SISTEMA conservará localmente el estado necesario para restaurar la sesión al volver a abrir la aplicación. Origen: HU-003, escenarios «Cerrar la aplicación» y «Pausar antes de cerrar».

## Casos límite
- Si el estudiante vuelve a la aplicación antes del vencimiento, el temporizador sigue corriendo y muestra el tiempo restante calculado desde el tiempo transcurrido (RF-01, RF-02).
- Si la fase vence mientras la aplicación está en segundo plano y las notificaciones están permitidas, el estudiante recibe un aviso; al volver, ve la fase siguiente preparada y pausada (RF-03, RF-05).
- Si las notificaciones están denegadas o no están disponibles, el temporizador sigue funcionando y, al volver a la aplicación, se muestra la fase siguiente preparada y pausada, aunque no se haya recibido aviso (RF-04, RF-05).
- Si la fase vence con la aplicación visible, se muestra la transición visual sin duplicarla con una notificación del sistema (RF-07).
- Si el estudiante pausa antes de cerrar la aplicación, el mismo tiempo restante se conserva, no se envía un aviso de fin y al volver la fase sigue pausada (RF-08, RF-09).
- Si el estudiante pausa o reinicia una fase con un aviso pendiente, dicho aviso se cancela; al reanudar, el aviso corresponde al nuevo vencimiento (RF-08).
- Si no se puede restaurar el estado guardado, la aplicación informa el error y no presenta una sesión nueva como si fuera la sesión recuperada (RF-10).

## Fuera de alcance
- Cambiar las reglas de transición entre estudio y descanso definidas por HU-002.
- Iniciar automáticamente la fase siguiente después de que termine la fase actual.
- Enviar notificaciones si el permiso está denegado o el sistema no las permite.

## Criterios de finalización
- Los requisitos funcionales RF-01 a RF-10 y los requisitos no funcionales RNF-01 y RNF-02 pueden verificarse con los escenarios y condiciones descritos en esta especificación.
- Los cuatro escenarios de HU-003 están cubiertos por al menos un requisito funcional.
- La ausencia de permiso de notificaciones no impide usar el temporizador ni recuperar la fase terminada al volver a la aplicación.

## Dudas abiertas
- Ninguna.
