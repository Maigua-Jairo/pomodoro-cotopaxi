name: pomodoro-rules
description: Úsala siempre que escribas, modifiques o revises código, lógica de temporizador o reglas de transición entre fases de estudio y descanso (Pomodoro).

# Reglas del Temporizador Pomodoro (Academia Cotopaxi)

## Reglas de las Fases y Duración por Defecto
- **Estudio:** 25 minutos por defecto (configurable en HU-005).
- **Descanso corto:** 5 minutos por defecto.
- **Descanso largo:** 15 minutos por defecto.
- **Ciclo de Pomodoros:** 4 Pomodoros de estudio antes de un descanso largo por defecto. Al completarlo, el contador de Pomodoros vuelve a cero (HU-002).

## Exactitud del Tiempo y Transiciones
- El temporizador se basa estrictamente en marcas de tiempo (*timestamps*) del sistema para garantizar la exactitud en segundo plano o con el teléfono bloqueado (HU-003).
- Al terminar una fase de estudio, si no se han completado los Pomodoros necesarios para el descanso largo, se prepara automáticamente un descanso corto.
- Si la fase actual está en curso y el usuario modifica los ajustes de tiempo, la fase actual termina con su duración original y el cambio se aplica a partir de la siguiente fase (HU-005).

## Validaciones de Ajustes (HU-005)
- No se permiten campos vacíos, valores en cero, números negativos ni valores fuera de los rangos permitidos (ej. estudio entre 1 y 120 minutos).
- Los ajustes deben guardarse localmente y persistir al cerrar y abrir la aplicación.
- Debe existir una opción explícita para restablecer los valores por defecto.

## Checklist de revisión para la lógica del Temporizador
- [ ] ¿Se calcula el tiempo restante usando timestamps (`Date.now()`) para evitar desfases en segundo plano?
- [ ] ¿La transición entre estudio, descanso corto y descanso largo respeta la cantidad configurada de Pomodoros?
- [ ] ¿Los campos de configuración validan correctamente ceros, vacíos y valores fuera de rango?
- [ ] ¿Los ajustes modificados se guardan localmente y se aplican en la siguiente fase?
- [ ] ¿El reinicio del temporizador pide confirmación y permite cancelar sin perder el progreso?

## Al terminar
Indica qué puntos del checklist has comprobado y cómo se verificaron mediante pruebas o revisión manual.