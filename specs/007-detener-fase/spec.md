# Spec 007 — Detener una fase y pasar a la siguiente

Estado: aprobada
HU de origen: docs/historias/HU-007.md

## Contexto y objetivo
Permitir que el estudiante termine antes de tiempo el estudio o el descanso que ya inició y pase a la otra fase sin esperar a que el tiempo llegue a cero. Detener un estudio deja preparado un descanso corto en pausa; detener un descanso deja listo un estudio nuevo. Como cambia de fase y no se puede deshacer, la acción siempre se confirma, y un estudio detenido no cuenta como pomodoro completado.

## Usuarios
- Estudiante

## Historias de usuario
Como estudiante, quiero detener el estudio o el descanso en curso cuando lo necesite, para pasar a la otra fase sin esperar a que termine el tiempo.

## Definiciones
- **Fase iniciada:** estudio o descanso que el estudiante ya inició, esté corriendo o en pausa (igual que en la spec 005).
- **Detener:** terminar una fase iniciada antes de que su tiempo llegue a cero, por decisión del estudiante y tras confirmarlo.

## Requisitos funcionales
- **RF-01:** MIENTRAS haya un estudio iniciado, EL SISTEMA mostrará el control «Detener» junto a «Reiniciar». Origen: HU-007, escenario «Detener el estudio»; decisiones.md, D-04.
- **RF-02:** CUANDO el estudiante presione «Detener» en un estudio iniciado, EL SISTEMA pedirá confirmación con el mensaje «El estudio no contará como pomodoro y pasarás a un descanso corto. ¿Quieres detenerlo?» y las opciones «Cancelar» y «Detener». Origen: HU-007, escenario «Detener el estudio»; decisiones.md, D-01 y D-03.
- **RF-03:** CUANDO el estudiante confirme detener el estudio, EL SISTEMA no sumará un pomodoro al ciclo, mostrará el temporizador de descanso corto con la duración de los ajustes vigentes, en pausa y listo para iniciar. Origen: HU-007, escenario «Detener el estudio»; decisiones.md, D-01 y D-08.
- **RF-04:** MIENTRAS haya un descanso iniciado, EL SISTEMA mostrará el control «Detener» junto a «Reiniciar descanso». Origen: HU-007, escenario «Detener el descanso»; decisiones.md, D-04.
- **RF-05:** CUANDO el estudiante presione «Detener» en un descanso iniciado, EL SISTEMA pedirá confirmación con el mensaje «Volverás al estudio, listo para iniciar. ¿Quieres detener el descanso?» y las opciones «Cancelar» y «Detener»; SI confirma, EL SISTEMA mostrará un estudio nuevo con la duración de los ajustes vigentes, en pausa. Origen: HU-007, escenario «Detener el descanso»; decisiones.md, D-02 y D-03.
- **RF-06:** CUANDO el estudiante confirme detener un descanso largo, EL SISTEMA dará el ciclo por terminado: el contador volverá a cero y se aplicará la meta configurada, igual que si el descanso largo hubiera llegado a cero. Origen: decisiones.md, D-05.
- **RF-07:** CUANDO el estudiante cancele la confirmación de «Detener», EL SISTEMA conservará la fase, su tiempo restante y su estado de ejecución o pausa tal como estaban. Origen: HU-007, escenario «Cambiar de opinión al detener».
- **RF-08:** CUANDO el estudiante confirme «Detener», EL SISTEMA no reproducirá la alarma de fin de fase y cancelará el aviso pendiente de la fase detenida. Origen: decisiones.md, D-06; HU-003 y HU-004.
- **RF-09:** SI la fase llega a cero mientras el diálogo de «Detener» está abierto, ENTONCES EL SISTEMA aplicará el fin normal de la fase (alarma y fase siguiente preparada, según HU-002 y HU-004) y confirmar «Detener» después no tendrá ningún efecto. Origen: decisiones.md, D-07.

## Requisitos no funcionales
- **RNF-01:** La fase que queda tras detener se guarda como cualquier otra y se recupera correctamente si el estudiante cierra la aplicación. Origen: constitución, principio 6; HU-003.
- **RNF-02:** Las confirmaciones usan el diálogo del sistema, en español, y se pueden cancelar. Origen: decisiones.md, D-03; skill rn-conventions.

## Casos límite
- Tanto si el estudio corría como si estaba en pausa, al confirmar «Detener» el descanso corto queda en pausa (RF-03).
- Si se llevan 3 de 4 pomodoros y se detiene el estudio, el descanso es corto y el contador sigue en 3/4 (RF-03).
- Si se detiene un descanso corto, el contador del ciclo no cambia (RF-05).
- Si se detiene un descanso largo, la pantalla de estudio muestra «Pomodoros: 0/N» con la meta configurada (RF-06).
- Si se cancela la confirmación con la fase corriendo, sigue corriendo sin perder tiempo; si estaba en pausa, sigue en pausa (RF-07).
- Una fase preparada que todavía no se inició no muestra «Detener» (RF-01, RF-04).
- Si el tiempo llega a cero con el diálogo abierto, suena la alarma y confirmar no hace nada (RF-09).
- Si se cierra la aplicación después de detener el estudio, al volver se muestra el descanso corto en pausa (RNF-01).

## Fuera de alcance
- Contar como pomodoro un estudio detenido.
- Elegir entre descanso corto o largo al detener un estudio.
- Detener una fase sin confirmación o detener una fase preparada que no se ha iniciado.
- Cambiar el comportamiento al llegar a cero definido en HU-002, HU-003 y HU-004.
- Iniciar automáticamente el descanso tras detener el estudio (decisiones.md, D-08).

## Criterios de finalización
- Los requisitos RF-01 a RF-09 y RNF-01 a RNF-02 pueden verificarse con los escenarios y casos límite descritos.
- Cada escenario de HU-007 está cubierto por al menos un requisito funcional.

## Dudas abiertas
- Ninguna.
