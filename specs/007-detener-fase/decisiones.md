# Decisiones de HU-007: Detener una fase y pasar a la siguiente

## D-01: Contar un estudio detenido

- **Pregunta:** Al detener un estudio antes de que llegue a cero y aceptar, ¿cuenta como pomodoro completado?
- **Respuesta:** No. El contador del ciclo no avanza y el descanso que se inicia es siempre un descanso corto.
- **Motivo:** Respetar la regla de HU-002 (D-03): solo cuenta el estudio que llega a cero.

## D-02: Estudio al detener el descanso

- **Pregunta:** Al detener el descanso, ¿cómo queda el temporizador de estudio?
- **Respuesta:** Un estudio nuevo con la duración completa de los ajustes, pausado y listo para iniciar.
- **Motivo:** Es el mismo estado que deja un descanso terminado (HU-002) y evita retomar un estudio interrumpido.

## D-03: Confirmación al detener el descanso

- **Pregunta:** ¿El «Detener» del descanso también pide confirmación?
- **Respuesta:** Sí, con un diálogo del sistema que se puede cancelar, igual que en el estudio.
- **Motivo:** Detener es una acción que cambia de fase y no se puede deshacer.

## D-04: Cuándo se muestra «Detener»

- **Pregunta:** ¿Cuándo se muestra «Detener» y qué pasa con «Reiniciar»?
- **Respuesta:** Aparece desde que la fase se inicia, tanto corriendo como en pausa, junto a «Reiniciar», que se mantiene.
- **Motivo:** Detener y reiniciar son acciones distintas: una cambia de fase y la otra vuelve al inicio de la misma.

## D-05: Detener un descanso largo

- **Pregunta:** Si se detiene un descanso largo, ¿qué pasa con el ciclo?
- **Respuesta:** Se da por terminado: el ciclo empieza de nuevo («Pomodoros: 0/N») y se aplica la meta configurada, igual que si el descanso largo hubiera llegado a cero.
- **Motivo:** El ciclo ya se completó; detener el descanso no debe repetirlo.

## D-06: Alarma al detener

- **Pregunta:** Al aceptar «Detener», ¿suena la alarma de fin de fase?
- **Respuesta:** No. Se pasa directamente a la otra fase y se cancela el aviso pendiente de la fase detenida.
- **Motivo:** El estudiante ya decidió terminar la fase; la alarma solo tiene sentido cuando el tiempo se cumple.

## D-07: Fin de la fase con el diálogo de «Detener» abierto

- **Pregunta:** Si la fase llega a cero mientras el diálogo de «Detener» está abierto, ¿qué prevalece?
- **Respuesta:** El fin normal de la fase: suena la alarma y la fase siguiente queda preparada según HU-002 y HU-004. Confirmar «Detener» después ya no tiene efecto.
- **Motivo:** Respetar el comportamiento al llegar a cero que ya funciona y no aplicar una acción sobre una fase que ya terminó.

## D-08: Estado del descanso al detener el estudio

- **Pregunta:** Al confirmar «Detener» en el estudio, ¿el descanso corto empieza a correr solo?
- **Respuesta:** No. Se muestra el descanso corto preparado y en pausa; el estudiante lo inicia cuando quiera. Sustituye la parte de D-01 y de la HU que decía que se iniciaba automáticamente.
- **Motivo:** Decisión del usuario tras probar la función: mantener el mismo comportamiento que el resto de transiciones (HU-002), sin iniciar fases automáticamente.
