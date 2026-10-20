# Decisiones de HU-004: Recibir aviso al terminar el tiempo

## D-01: Alarma cuando la aplicación está abierta

- **Pregunta:** ¿Debe sonar y vibrar la alarma cuando la fase termina con la aplicación abierta?
- **Respuesta:** Sí. La alarma suena y vibra, y la aplicación muestra un control «Detener».
- **Motivo:** El aviso de fin debe ser perceptible aunque el estudiante esté usando la aplicación.

## D-02: Notificación del sistema en primer plano

- **Pregunta:** ¿Se publica también una notificación del sistema cuando la aplicación está abierta?
- **Respuesta:** No. En primer plano se muestra la alarma dentro de la aplicación, sin duplicar el aviso con una notificación del sistema.
- **Motivo:** Evitar avisos duplicados y conservar el comportamiento de primer plano definido en HU-003.

## D-03: Alarma no disponible por permisos o restricciones del sistema

- **Pregunta:** ¿Qué ocurre si los permisos o el sistema operativo impiden que la alarma suene, vibre o se muestre en la pantalla bloqueada?
- **Respuesta:** El temporizador sigue funcionando y se informa claramente que el aviso no está disponible.
- **Motivo:** La limitación de notificaciones no debe impedir que el estudiante use el temporizador ni debe crear la impresión de que recibirá una alarma.

## D-04: Error al programar la alarma

- **Pregunta:** ¿Qué ocurre si falla la programación de la alarma aunque el permiso esté concedido?
- **Respuesta:** El temporizador inicia o continúa normalmente y se informa que no se pudo programar el aviso.
- **Motivo:** Un fallo del aviso no debe bloquear el estudio ni presentarse como una alarma programada correctamente.

## D-05: Alarma sin interacción

- **Pregunta:** ¿La alarma permanece activa hasta que el estudiante la detenga?
- **Respuesta:** No. Si el estudiante no interactúa, la alarma se detiene automáticamente. No se define una duración concreta.
- **Motivo:** Evitar que el sonido y la vibración continúen indefinidamente sin intervención.

## D-06: Solicitud del permiso de notificaciones

- **Pregunta:** ¿Cuándo se solicita el permiso y qué ocurre si se deniega?
- **Respuesta:** Se conserva lo definido en HU-003: al iniciar la primera sesión se explica brevemente la utilidad del permiso y se solicita; si se deniega, la sesión comienza de todos modos.
- **Motivo:** Mantener el comportamiento acordado para el temporizador y no bloquear su uso por la decisión sobre notificaciones.

## D-07: Estado al detener el aviso

- **Pregunta:** ¿Qué debe mostrar la aplicación cuando el estudiante detiene el aviso?
- **Respuesta:** Se conserva lo definido en HU-003: se abre la aplicación con la siguiente fase preparada y pausada.
- **Motivo:** Mantener las transiciones del ciclo de HU-002 y no iniciar la fase siguiente sin una acción explícita.

## D-08: Ubicación del aviso de notificaciones no disponibles

- **Pregunta:** ¿Dónde y cómo se muestra el aviso de que las notificaciones o la alarma no están disponibles?
- **Respuesta:** Se elimina el aviso rojo superior. El mensaje se muestra en la parte inferior de la pantalla principal, con un estilo discreto (texto pequeño y secundario).
- **Motivo:** Decisión del usuario: el aviso superior era demasiado llamativo para una situación que no impide usar el temporizador.
