# Decisiones de HU-002: Alternar entre estudio y descanso

## D-01: Inicio del descanso al terminar el estudio

- **Pregunta:** ¿La aplicación debe iniciar automáticamente el descanso cuando termina el estudio?
- **Respuesta:** No. Deja el descanso preparado y espera a que el estudiante lo inicie.
- **Motivo:** El estudiante conserva el control de cuándo comienza cada descanso, como indican los criterios de aceptación.

## D-02: Pantalla al terminar el estudio

- **Pregunta:** ¿Se conserva la superposición de fin de estudio de HU-001 o se muestra directamente el descanso siguiente?
- **Respuesta:** Se cierra la superposición y se muestra el descanso que corresponde (corto o largo), con su duración configurada y pausado hasta que el estudiante toque «Iniciar».
- **Motivo:** La fase siguiente queda lista para iniciar, sin obligar al estudiante a elegir entre acciones redundantes.

## D-03: Pomodoros interrumpidos

- **Pregunta:** Si el estudiante reinicia o abandona un tiempo de estudio antes de que llegue a cero, ¿se cuenta como pomodoro completado?
- **Respuesta:** No. Solo se cuenta el estudio que llega a cero; pausar y reanudar no aumenta el contador.
- **Motivo:** El avance del ciclo representa tiempos de estudio completados, no intentos incompletos.

## D-04: Persistencia del progreso del ciclo

- **Pregunta:** ¿Se guarda localmente el contador de pomodoros para restaurarlo al volver a abrir la aplicación?
- **Respuesta:** Sí.
- **Motivo:** Evita perder el avance del ciclo al cerrar y reabrir la aplicación.

## D-05: Cambio de la meta de pomodoros durante un ciclo

- **Pregunta:** Si cambia la cantidad configurada de pomodoros por ciclo, ¿el cambio afecta el ciclo en curso?
- **Respuesta:** No. El ciclo actual conserva la meta con la que empezó y el nuevo valor se aplica al siguiente ciclo.
- **Motivo:** Evita que una configuración nueva altere inesperadamente un ciclo que ya está en marcha.

## D-06: Formato del contador visible

- **Pregunta:** ¿Cómo se muestra el avance y la meta del ciclo en la pantalla principal?
- **Respuesta:** Como «Pomodoros: 2/4», con completados/meta; empieza en 0/4 y vuelve a 0/4 al comenzar el descanso largo.
- **Motivo:** Muestra de forma directa el avance y cuántos pomodoros faltan para el descanso largo.

## D-07: Pantalla al terminar el descanso

- **Pregunta:** ¿Se conserva la superposición de fin de descanso de HU-001 o se muestra directamente el siguiente estudio?
- **Respuesta:** Se cierra la superposición y se muestra el estudio listo y pausado; el estudiante debe tocar «Iniciar».
- **Motivo:** Mantiene el mismo comportamiento de transición manual y evita comenzar el siguiente estudio sin una acción del estudiante.
