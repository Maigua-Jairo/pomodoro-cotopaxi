# Constitución del Pomodoro Academia Cotopaxi

Principios innegociables. Toda spec, plan y tarea debe cumplirlos.

1. **Simplicidad primero**: No se añaden librerías o dependencias nuevas (como para alarmas o notificaciones complejas) sin justificación y aprobación[cite: 43].
2. **La spec manda**: Nada se implementa si no está en la spec activa. Si falta una decisión, se detiene y se pregunta[cite: 43].
3. **Lógica separada de interfaz**: La lógica del temporizador y el cálculo de tiempo por marcas de tiempo (*timestamps*) vive separada de los componentes visuales de React Native[cite: 43].
4. **Pruebas como puerta**: La lógica de control del temporizador se verifica mediante pruebas[cite: 43].
5. **Los datos del usuario son sagrados**: Los ajustes de tiempo configurados localmente se conservan ante cambios de código[cite: 43].
6. **Exactitud del tiempo**: El temporizador debe basarse en el reloj del sistema (*timestamps*) para evitar desvíos cuando Android suspenda procesos en segundo plano (HU-003).