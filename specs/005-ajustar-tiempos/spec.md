# Spec 005 — Ajustar los tiempos del pomodoro

Estado: implementada
HU de origen: docs/historias/HU-005.md

## Contexto y objetivo
Permitir que el estudiante adapte la técnica Pomodoro a su ritmo cambiando la duración del estudio, del descanso corto, del descanso largo y la cantidad de pomodoros por ciclo. Los cambios deben guardarse en el celular, respetar el progreso de la fase que ya empezó y no aceptar valores que rompan el ciclo. El estudiante debe poder volver en cualquier momento a los valores por defecto.

## Usuarios
- Estudiante

## Historias de usuario
Como estudiante, quiero cambiar la duración del estudio, de los descansos y la cantidad de pomodoros antes del descanso largo, para adaptar la técnica a mi ritmo.

## Definiciones
- **Ajustes:** el conjunto de cuatro valores configurables: minutos de estudio, minutos de descanso corto, minutos de descanso largo y pomodoros por ciclo.
- **Valores por defecto:** 25 minutos de estudio, 5 de descanso corto, 15 de descanso largo y 4 pomodoros por ciclo.
- **Rangos permitidos:** números enteros dentro de estos límites, ambos incluidos:

  | Ajuste | Mínimo | Máximo |
  |---|---|---|
  | Estudio (minutos) | 1 | 120 |
  | Descanso corto (minutos) | 1 | 30 |
  | Descanso largo (minutos) | 1 | 60 |
  | Pomodoros por ciclo | 4 | 8 |

- **Pomodoros por ciclo:** cantidad de fases de estudio completadas antes de un descanso largo. Tras cada descanso largo el contador vuelve a cero.
- **Fase preparada:** fase lista para comenzar que el estudiante todavía no ha iniciado.
- **Fase iniciada:** fase que el estudiante ya inició, esté corriendo o en pausa.
- **Cambios sin guardar:** valores editados en la pantalla de ajustes que difieren de los ajustes guardados.

## Requisitos funcionales
- **RF-01:** EL SISTEMA ofrecerá una pantalla de ajustes que muestre los cuatro ajustes con sus valores guardados actuales. Origen: HU-005, descripción y escenario «Cambiar un tiempo».
- **RF-02:** MIENTRAS el estudiante no haya guardado ajustes propios, EL SISTEMA usará los valores por defecto. Origen: HU-005, escenario «Volver a los valores por defecto».
- **RF-03:** CUANDO el estudiante guarde ajustes válidos, EL SISTEMA los guardará en el celular y los conservará aunque se cierre y vuelva a abrir la aplicación. Origen: HU-005, escenario «Cambiar un tiempo».
- **RF-04:** CUANDO se guarden ajustes MIENTRAS haya una fase iniciada, EL SISTEMA terminará esa fase con la duración con la que empezó y aplicará los nuevos valores desde la siguiente fase. Origen: HU-005, escenarios «Cambiar un tiempo» y «Cambiar un tiempo con una fase en curso»; decisiones.md, D-04.
- **RF-05:** CUANDO se guarden ajustes MIENTRAS haya una fase preparada, EL SISTEMA actualizará de inmediato su duración al nuevo valor correspondiente. Origen: decisiones.md, D-04.
- **RF-06:** CUANDO se guarde un número de pomodoros por ciclo menor o igual que los pomodoros ya completados en el ciclo actual, EL SISTEMA asignará el descanso largo al terminar la fase de estudio en curso o, si no hay un estudio en curso, al terminar el siguiente estudio, y luego volverá el contador del ciclo a cero. Origen: decisiones.md, D-05 y D-09.
- **RF-07:** SI al guardar algún campo está vacío, vale cero, es negativo, tiene decimales o está fuera de su rango permitido, ENTONCES EL SISTEMA no guardará ningún cambio y mostrará junto a cada campo inválido el rango de valores que puede usar. Origen: HU-005, escenario «Ingresar un valor no válido»; decisiones.md, D-01, D-02, D-03 y D-06.
- **RF-08:** CUANDO el estudiante elija restablecer, EL SISTEMA pedirá confirmación; SI confirma, guardará de inmediato los valores por defecto y los aplicará con las mismas reglas de RF-04 a RF-06; SI cancela, no cambiará nada. Origen: HU-005, escenario «Volver a los valores por defecto»; decisiones.md, D-07.
- **RF-09:** CUANDO el estudiante intente salir de la pantalla de ajustes con cambios sin guardar, EL SISTEMA pedirá confirmación para descartarlos; SI confirma, saldrá conservando los ajustes guardados; SI cancela, permanecerá en la pantalla con los valores editados. Origen: decisiones.md, D-08.
- **RF-10:** CUANDO se guarde un número de pomodoros por ciclo igual a los pomodoros ya completados en el ciclo actual, EL SISTEMA mostrará el mensaje «Ya completaste los N pomodoros de este ciclo. Tu próximo descanso será el descanso largo.», donde N es el valor guardado. Origen: decisiones.md, D-09.
- **RF-11:** SI al abrir la aplicación los ajustes guardados no se pueden leer, ENTONCES EL SISTEMA usará los valores por defecto y mostrará el mensaje «No se pudieron cargar tus ajustes. Se están usando los valores por defecto; puedes volver a configurarlos en Ajustes.». Origen: decisiones.md, D-10.
- **RF-12:** CUANDO se guarde un número de pomodoros por ciclo mayor que los pomodoros ya completados MIENTRAS haya un ciclo en curso, EL SISTEMA conservará la meta del ciclo en curso y aplicará la nueva meta desde el siguiente ciclo. Origen: decisiones.md, D-11; spec 002, RF-07.
- **RF-13:** EL SISTEMA permitirá cambiar las duraciones de estudio y descanso únicamente desde la pantalla de ajustes; la pantalla de descanso no ofrecerá un editor propio de duración. Origen: decisiones.md, D-12.
- **RF-14:** SI los ajustes no se pueden guardar en el celular, ENTONCES EL SISTEMA no aplicará ningún cambio y mostrará «No se pudieron guardar los ajustes. Inténtalo de nuevo.». Origen: decisiones.md, D-13.
- **RF-15:** CUANDO se guarde una duración distinta para la fase iniciada, EL SISTEMA mostrará el mensaje «El nuevo tiempo se aplicará cuando termine la fase en curso o al presionar «Reiniciar».»; CUANDO el estudiante reinicie una fase, EL SISTEMA la dejará preparada con la duración de los ajustes vigentes. Origen: decisiones.md, D-14.

## Requisitos no funcionales
- **RNF-01:** Los ajustes guardados por el estudiante se conservan ante cierres de la aplicación y actualizaciones de la misma. Origen: HU-005, escenario «Cambiar un tiempo»; constitución, principio 5.
- **RNF-02:** Guardar o restablecer ajustes no altera el tiempo restante de una fase iniciada ni la exactitud del temporizador. Origen: HU-005, escenario «Cambiar un tiempo con una fase en curso»; constitución, principio 6.
- **RNF-03:** Los mensajes de validación y las confirmaciones están en español e indican de forma explícita los valores permitidos. Origen: HU-005, escenario «Ingresar un valor no válido».

## Casos límite
- Los valores en los límites de cada rango (por ejemplo 1 y 120 para estudio, 4 y 8 para pomodoros por ciclo) son válidos (RF-07).
- Si varios campos son inválidos a la vez, cada uno muestra su propio rango y no se guarda ninguno, ni siquiera los campos válidos (RF-07).
- Si durante una fase de estudio iniciada se cambia la duración de un descanso, el descanso siguiente usa el nuevo valor (RF-04).
- Si se cambia la duración de la fase iniciada y luego se pausa, la fase conserva su duración original (RF-04).
- Si se llevan 6 pomodoros completados y se cambia el ciclo a 5, al terminar el estudio en curso corresponde el descanso largo y el contador vuelve a cero (RF-06).
- Si se llevan 5 pomodoros completados, se está en un descanso corto y se cambia el ciclo a 5, se muestra el mensaje de ciclo cumplido y el descanso largo llega al terminar el siguiente estudio (RF-06, RF-10).
- Si los ajustes guardados están dañados, el temporizador funciona con los valores por defecto y el estudiante es avisado (RF-11).
- Si se restablece con una fase iniciada, esa fase conserva su duración y los valores por defecto se aplican desde la siguiente (RF-08).
- Si se sale de ajustes sin haber editado nada, no se pide confirmación (RF-09).

## Fuera de alcance
- Cambiar los valores por defecto definidos en la HU.
- Ajustes del sonido, la vibración o la duración de la alarma (HU-004).
- Perfiles de ajustes, sincronización entre dispositivos o cuentas de usuario.
- Iniciar automáticamente la siguiente fase o modificar las transiciones de HU-002 más allá de lo indicado en RF-06.

## Criterios de finalización
- Los requisitos RF-01 a RF-15 y RNF-01 a RNF-03 pueden verificarse con los escenarios y casos límite descritos.
- Cada escenario de HU-005 está cubierto por al menos un requisito funcional.
- Ninguna combinación de valores no válidos queda guardada.
- Las dudas abiertas están resueltas antes de aprobar la spec.

## Dudas abiertas
- Ninguna.
