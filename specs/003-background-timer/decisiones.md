# Decisiones de HU-003: Mantener el conteo con el celular bloqueado o la app cerrada

## D-01: Aviso al terminar con la app cerrada

- **Pregunta:** Cuando el temporizador termine mientras la app está cerrada, ¿cómo se entera el estudiante?
- **Respuesta:** Mediante una notificación del sistema; al volver a abrir la app, se muestra el estado resultante de la fase.
- **Motivo:** El estudiante debe recibir el aviso de fin aunque no tenga la aplicación abierta.

## D-02: Uso sin permiso de notificaciones

- **Pregunta:** ¿Qué debe ocurrir si el sistema no permite mostrar notificaciones?
- **Respuesta:** El temporizador funciona normalmente y, al volver a abrir la app, muestra la fase terminada aunque no se haya recibido una notificación.
- **Motivo:** La falta de permiso no debe impedir estudiar ni perder el estado final de la fase.

## D-03: Momento para solicitar permiso

- **Pregunta:** ¿Cuándo se solicita permiso para enviar notificaciones?
- **Respuesta:** Al iniciar la primera sesión, con una explicación breve de que permite avisar al terminar con la app cerrada. Si se deniega, la sesión comienza de todos modos.
- **Motivo:** Solicitar el permiso cuando su utilidad es clara y mantener el uso del temporizador voluntario.

## D-04: Transición después de vencer una fase en segundo plano

- **Pregunta:** Al reabrir después de que una fase venció con la app cerrada, ¿se conserva una pantalla de fin o se aplica el flujo definido en HU-002?
- **Respuesta:** Se aplica la transición de HU-002: el estudio completado se cuenta y se deja preparada la fase siguiente pausada; si terminó el descanso, se prepara el estudio pausado.
- **Motivo:** Mantener consistentes las transiciones del ciclo sin iniciar la fase siguiente automáticamente.

## D-05: Aviso pendiente tras pausar o reiniciar

- **Pregunta:** ¿Qué ocurre con el aviso programado si el estudiante pausa o reinicia antes del vencimiento?
- **Respuesta:** Se cancela el aviso pendiente. Al reanudar, se programa un aviso para el nuevo vencimiento.
- **Motivo:** Evitar notificaciones obsoletas y avisar únicamente cuando la cuenta realmente termina.

## D-06: Contenido y acción de la notificación

- **Pregunta:** ¿Qué debe indicar la notificación y qué ocurre al tocarla?
- **Respuesta:** Indica qué fase terminó («Estudio terminado» o «Descanso terminado») y al tocarla abre la app mostrando la fase siguiente preparada y pausada.
- **Motivo:** Dar contexto al aviso y permitir volver directamente al estado actual del temporizador.

## D-07: Vencimiento con la app visible

- **Pregunta:** ¿Debe mostrarse una notificación del sistema si el temporizador termina mientras la app está abierta y visible?
- **Respuesta:** No; se muestra únicamente la transición visual dentro de la app.
- **Motivo:** Evitar duplicar el aviso cuando el estudiante ya ve el cambio de fase.

## D-08: Error al restaurar el estado guardado

- **Pregunta:** ¿Qué debe ocurrir si no se puede leer el estado guardado del temporizador?
- **Respuesta:** Se informa claramente del error, se deja el temporizador pausado y se permite al estudiante reiniciarlo manualmente.
- **Motivo:** No presentar una sesión nueva como si se hubiera recuperado correctamente y dejar al estudiante decidir cómo continuar.
