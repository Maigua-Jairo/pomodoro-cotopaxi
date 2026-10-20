# Decisiones de HU-005: Ajustar los tiempos del pomodoro

## D-01: Rango de la fase de estudio

- **Pregunta:** ¿Qué rango de minutos se permite para la fase de estudio?
- **Respuesta:** De 1 a 120 minutos.
- **Motivo:** Coincide con la regla ya establecida para el temporizador y cubre desde sesiones muy breves hasta bloques largos de estudio.

## D-02: Rangos de los descansos

- **Pregunta:** ¿Qué rangos de minutos se permiten para los descansos?
- **Respuesta:** Descanso corto de 1 a 30 minutos; descanso largo de 1 a 60 minutos.
- **Motivo:** Rangos amplios pero acotados que incluyen los valores por defecto (5 y 15) y evitan descansos desproporcionados.

## D-03: Pomodoros por ciclo

- **Pregunta:** ¿Cuántos pomodoros por ciclo, antes del descanso largo, se permiten?
- **Respuesta:** De 4 a 8. El valor cuenta los pomodoros de cada ciclo: tras el descanso largo el contador vuelve a cero.
- **Motivo:** El valor por defecto (4) es el mínimo para merecer un descanso largo, y 8 limita la cantidad de estudios seguidos antes de él.

## D-04: Cambiar la duración de una fase que no está corriendo

- **Pregunta:** Si la fase no está corriendo (preparada o en pausa) y se cambia su duración, ¿qué pasa?
- **Respuesta:** Si la fase está preparada y aún no se ha iniciado, toma el nuevo valor de inmediato. Si está pausada después de haberse iniciado, conserva su duración original y el cambio se aplica desde la siguiente fase.
- **Motivo:** Una fase sin iniciar no tiene progreso que respetar; una fase iniciada sigue la misma regla que la HU define para el temporizador corriendo.

## D-05: Reducir los pomodoros por ciclo con un ciclo en curso

- **Pregunta:** Si se reducen los pomodoros por ciclo por debajo de los ya completados en el ciclo actual (por ejemplo, se llevan 6 y se cambia a 5), ¿qué pasa?
- **Respuesta:** Al terminar la fase de estudio en curso corresponde el descanso largo y el contador del ciclo vuelve a cero.
- **Motivo:** El estudiante ya alcanzó o superó la nueva meta del ciclo, así que se le da el descanso largo sin descartar su progreso.

## D-06: Datos no válidos al guardar

- **Pregunta:** Ante datos no válidos (vacío, cero, fuera de rango o decimales), ¿cómo se comporta la pantalla al guardar?
- **Respuesta:** Solo se aceptan números enteros. Si algún campo no es válido, no se guarda ningún cambio y cada campo inválido indica su rango permitido.
- **Motivo:** Evita guardar una configuración parcial e informa al estudiante exactamente qué corregir.

## D-07: Restablecer valores por defecto

- **Pregunta:** Al restablecer los valores por defecto y confirmar, ¿qué ocurre?
- **Respuesta:** Se guardan de inmediato 25 minutos de estudio, 5 de descanso corto, 15 de descanso largo y 4 pomodoros por ciclo. La fase en curso o pausada conserva su duración y los valores se aplican desde la siguiente fase, igual que un cambio manual.
- **Motivo:** Restablecer es un cambio de ajustes más; aplicar la misma regla evita comportamientos distintos para el mismo efecto.

## D-08: Salir de ajustes sin guardar

- **Pregunta:** Si se modifican campos y se sale de la pantalla de ajustes sin pulsar Guardar, ¿qué pasa?
- **Respuesta:** Se pide confirmación para descartar los cambios; el estudiante puede cancelar y seguir editando.
- **Motivo:** Evita perder cambios por accidente sin guardarlos de forma implícita.

## D-09: Reducir el ciclo fuera de un estudio en curso o a un valor igual

- **Pregunta:** Si se reduce el ciclo durante un descanso corto o con un estudio preparado sin iniciar, ¿qué pasa? ¿Y si el nuevo valor es igual a los pomodoros ya completados?
- **Respuesta:** Se aplica la misma regla que en D-05: el descanso largo corresponde al terminar el siguiente estudio y luego el contador vuelve a cero. Si el nuevo valor es igual a los pomodoros ya completados, se aplica la misma regla y además se muestra un mensaje que lo explica.
- **Motivo:** Mantener una única regla para reducir el ciclo, sea cual sea la fase, e informar al estudiante cuando su nueva meta ya está cumplida.

## D-10: Ajustes guardados que no se pueden leer

- **Pregunta:** Si al abrir la aplicación los ajustes guardados no se pueden leer, ¿qué pasa?
- **Respuesta:** Se usan los valores por defecto y se avisa al estudiante para que pueda volver a configurarlos manualmente.
- **Motivo:** El temporizador debe seguir funcionando, pero el estudiante tiene que saber que sus ajustes no se cargaron.

## D-11: Cambiar la meta del ciclo fuera del caso de D-05

- **Pregunta:** Si se cambian los pomodoros por ciclo con un ciclo en curso y el nuevo valor es mayor que los pomodoros ya completados (por ejemplo, se sube de 4 a 8, o se baja de 8 a 5 llevando 2), ¿cuándo se aplica la nueva meta?
- **Respuesta:** En el siguiente ciclo. Se conserva la regla de HU-002 (spec 002, RF-07); D-05 y D-09 son la única excepción.
- **Motivo:** Mantener estable la meta «Pomodoros: X/Y» del ciclo en curso y no contradecir el comportamiento ya aprobado en HU-002.

## D-12: Editor de duración en la pantalla de descanso

- **Pregunta:** ¿Qué pasa con el editor de duración (5–30 minutos) que ya existe en la pantalla de descanso?
- **Respuesta:** Se quita. Las duraciones solo se cambian en la pantalla de ajustes.
- **Motivo:** Una sola forma de cambiar los tiempos y un solo conjunto de rangos, evitando contradicciones con D-02.

## D-13: Fallo al guardar los ajustes

- **Pregunta:** ¿Qué ve el estudiante si los ajustes no se pueden guardar en el celular?
- **Respuesta:** No se aplica ningún cambio y se muestra «No se pudieron guardar los ajustes. Inténtalo de nuevo.».
- **Motivo:** Un ajuste que no quedó guardado no debe aplicarse, porque se perdería al cerrar la aplicación (RF-03).

## D-14: Aviso al cambiar la duración de la fase en curso

- **Pregunta:** ¿Qué ve el estudiante si guarda una nueva duración para la fase que ya está en curso?
- **Respuesta:** Al guardar se muestra un mensaje que indica que el nuevo tiempo se aplicará cuando termine la fase en curso o al presionar «Reiniciar». Reiniciar una fase (estudio o descanso) la deja con la duración de los ajustes vigentes.
- **Motivo:** Decisión del usuario tras la verificación manual: el estudiante debe entender por qué el reloj no cambió y cómo aplicar el cambio de inmediato.
