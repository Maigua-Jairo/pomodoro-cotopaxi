# Decisiones de HU-001: Iniciar y controlar una sesión de estudio

## D-01: Toque repetido en «Iniciar»

- **Pregunta:** Si el temporizador ya está corriendo, ¿qué ocurre al tocar «Iniciar» otra vez?
- **Respuesta:** La cuenta actual se mantiene sin cambios.
- **Motivo:** Evita reiniciar accidentalmente el tiempo o iniciar cuentas duplicadas.

## D-02: Cambio del reloj del teléfono

- **Pregunta:** Si se ajusta manualmente la hora del teléfono mientras corre el temporizador, ¿debe cambiar el tiempo restante?
- **Respuesta:** No. La cuenta conserva el tiempo transcurrido real y no salta por el ajuste del reloj.
- **Motivo:** Un cambio manual de la hora del teléfono no debe acortar ni alargar la sesión de estudio.

## D-03: Fin de la cuenta regresiva

- **Pregunta:** ¿Qué debe ocurrir cuando la cuenta regresiva llega a cero?
- **Respuesta:** La aplicación mostrará una pantalla sobrepuesta con dos botones: «Tomar un descanso» y «Regresar al home».
- **Motivo:** Presentar al estudiante opciones al terminar el tiempo de estudio.

## D-04: Cancelar el reinicio

- **Pregunta:** Al cancelar el reinicio, ¿el temporizador debe conservar también su estado de ejecución o pausa, además del tiempo restante?
- **Respuesta:** Sí. Se mantiene el estado de ejecución que tenía al solicitar el reinicio.
- **Motivo:** Cancelar no debe modificar el estado actual del temporizador.

## D-05: Seleccionar «Tomar un descanso»

- **Pregunta:** ¿Qué debe ocurrir al seleccionar «Tomar un descanso» al terminar la cuenta regresiva?
- **Respuesta:** La aplicación redirigirá al estudiante a una nueva pantalla con un temporizador de descanso cuya duración podrá modificar, hasta un máximo de 30 minutos.
- **Motivo:** Permitir que el estudiante configure la duración del descanso que desea tomar.

## D-06: Seleccionar «Regresar al home»

- **Pregunta:** ¿Qué debe ocurrir al seleccionar «Regresar al home» al terminar la cuenta regresiva?
- **Respuesta:** La aplicación redirigirá al estudiante al temporizador principal, desde donde podrá iniciar un nuevo tiempo de enfoque si así lo desea.
- **Motivo:** Permitir que el estudiante vuelva al temporizador principal y decida si inicia otra sesión de enfoque.

## D-07: Estado después de confirmar el reinicio

- **Pregunta:** ¿En qué estado debe quedar el temporizador después de confirmar el reinicio?
- **Respuesta:** Pausado, tanto si estaba corriendo como si ya estaba pausado al solicitar el reinicio.
- **Motivo:** El reinicio restablece el tiempo inicial sin iniciar automáticamente la cuenta regresiva.

## D-08: Configurar e iniciar el temporizador de descanso

- **Pregunta:** ¿Cómo se configura e inicia el temporizador de descanso después de seleccionar «Tomar un descanso»?
- **Respuesta:** La pantalla del temporizador de descanso mostrará inicialmente el valor 0. Al presionar el reloj, el estudiante podrá establecer una duración de descanso entre 5 y 30 minutos. Al confirmar la duración, comenzará la cuenta regresiva.
- **Motivo:** Permitir que el estudiante elija cuánto durará su descanso antes de iniciar el temporizador.

## D-09: Acciones al terminar el descanso

- **Pregunta:** ¿Qué debe ocurrir cuando termina la cuenta regresiva del temporizador de descanso?
- **Respuesta:** La aplicación mostrará una pantalla sobrepuesta con dos botones. «Iniciar concentración» redirigirá al estudiante al temporizador principal e iniciará la cuenta regresiva con la duración de concentración que tenía configurada, salvo que el estudiante la modifique después. «Regresar a home» redirigirá al temporizador principal y lo dejará pausado.
- **Motivo:** Permitir que el estudiante elija entre iniciar otra sesión de concentración o regresar al temporizador principal sin iniciarla.

## D-10: Tiempo mostrado al regresar a home después del descanso

- **Pregunta:** ¿Qué tiempo debe mostrar el temporizador principal al regresar a home después de terminar el descanso y dejarlo pausado?
- **Respuesta:** El tiempo inicial de concentración elegido por el estudiante (por ejemplo, 10, 30 o 60 minutos).
- **Motivo:** Volver al temporizador principal listo para una nueva sesión de concentración, sin iniciarla automáticamente.
