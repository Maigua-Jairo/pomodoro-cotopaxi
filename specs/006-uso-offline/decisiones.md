# Decisiones de HU-006: Usar la aplicación sin registro, sin internet y sin publicidad

## D-01: Primer inicio

- **Pregunta:** La HU pide llegar directo al temporizador la primera vez. ¿Se muestra algo adicional en ese primer inicio?
- **Respuesta:** No. La aplicación abre directamente en el temporizador, sin bienvenida, tutorial, registro ni inicio de sesión. El permiso de notificaciones se sigue pidiendo al iniciar la primera sesión, como define HU-004.
- **Motivo:** Que el estudiante empiece a estudiar sin trabas, tal como pide la historia.

## D-02: Uso de internet

- **Pregunta:** ¿La aplicación debe usar internet para algo, aunque sea opcional?
- **Respuesta:** Nunca. Todas las funciones son locales y la aplicación no realiza ninguna petición de red.
- **Motivo:** Garantizar que todo funcione igual sin datos móviles ni wifi y no consumir datos del estudiante.

## D-03: Indicador de conexión

- **Pregunta:** Cuando el celular no tiene conexión, ¿la aplicación muestra algún indicador?
- **Respuesta:** No. La aplicación se ve y funciona exactamente igual con o sin conexión.
- **Motivo:** Como nada depende de internet, un indicador solo generaría dudas innecesarias.

## D-04: Datos al reinstalar

- **Pregunta:** Si el estudiante desinstala y vuelve a instalar la aplicación, ¿qué pasa con sus ajustes y su progreso?
- **Respuesta:** Empieza de cero: se usan los valores por defecto y no se intenta recuperar nada.
- **Motivo:** Los datos viven solo en el celular; no hay cuentas ni servidores desde donde restaurarlos.

## D-05: Aviso de almacenamiento local

- **Pregunta:** ¿Se informa al estudiante en algún lugar que sus datos se guardan solo en el celular?
- **Respuesta:** Sí, con una nota fija en la pantalla de Ajustes: «Tus ajustes se guardan solo en este celular. Si desinstalas la aplicación, se borrarán.».
- **Motivo:** Que el estudiante sepa, antes de desinstalar, que perderá sus ajustes.

## D-06: Fallo al guardar el progreso

- **Pregunta:** Si falla el guardado local del progreso de la sesión (por ejemplo, almacenamiento lleno), ¿qué ve el estudiante?
- **Respuesta:** Un aviso visible: «No se pudo guardar tu progreso en el celular. El temporizador sigue funcionando.». El temporizador no se detiene.
- **Motivo:** El estudiante debe saber que su progreso podría no conservarse al cerrar la aplicación, sin que eso le impida seguir estudiando.

## D-07: Permisos y rastreo

- **Pregunta:** Además de no mostrar anuncios, ¿qué permisos puede pedir la aplicación?
- **Respuesta:** Solo el permiso de notificaciones. No se piden otros permisos (ubicación, micrófono, contactos ni rastreo publicitario) y no se incluyen herramientas de analítica ni de rastreo.
- **Motivo:** Coherente con no usar internet ni publicidad, y con pedir solo lo necesario para los avisos de HU-004.

## D-08: Borrar todos los datos

- **Pregunta:** ¿Debe existir una opción para borrar todos los datos guardados sin desinstalar la aplicación?
- **Respuesta:** No; queda fuera de alcance.
- **Motivo:** «Restablecer valores por defecto» (HU-005) y «Reiniciar» ya cubren lo necesario.

## D-09: Ubicación y cierre del aviso de fallo al guardar

- **Pregunta:** ¿Dónde se muestra el aviso de fallo al guardar el progreso y hasta cuándo?
- **Respuesta:** En la pantalla principal (temporizador de estudio), y desaparece cuando el estudiante lo cierra.
- **Motivo:** La pantalla principal es la que el estudiante ve con más frecuencia, y cerrarlo de forma explícita confirma que leyó el aviso.
