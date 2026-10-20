# MEMORY.md - Pomodoro Academia Cotopaxi

Estado del trabajo entre sesiones.

## Estado actual
- Specs 001–006 en estado «implementada». Spec 001 depurada: se eliminaron RF-07 a RF-11 (sustituidos por 002 y 004); spec 002 documenta la excepción de 005 en RF-07; 003 y 004 se dejan sin cambios por decisión del usuario.
- HU-004 cerrada: T1–T10 completadas y corroboradas manualmente por el usuario en Android e iOS; spec 004 en estado «implementada».
- Cambio aplicado tras la verificación: la alarma se apaga automáticamente a los 3 segundos (V-01 en la sección Verificación de tasks.md), confirmado por el usuario en dispositivo.
- HU-005 cerrada: T1–T10 completadas y verificadas por el usuario en Expo Go; spec 005 en estado «implementada» (104 pruebas, lint y TypeScript pasan).
- HU-006 cerrada: T1–T6 completadas y verificadas por el usuario en Expo Go; spec 006 en estado «implementada» (112 pruebas, lint y TypeScript pasan).
- HU-007: T1–T2 completadas; D-08 aplicado (al detener el estudio el descanso queda en pausa). T3–T4 implementadas, pendientes de verificación manual; T5 pendiente. 125 pruebas, lint y TypeScript pasan.
- Spec 004, D-08: el aviso de notificaciones no disponibles pasó del banner rojo superior a un texto discreto al pie de la pantalla principal.

## Próximos pasos
- Opcional (usuario): compilar con EAS (`npx eas-cli@latest build --profile preview`) para verificar en Android la copia de seguridad desactivada y los permisos bloqueados.
- HU-007, usuario: verificar en Expo Go T3 y T4 (botón «Detener» en inicio y descanso) y T5; después sdd-implement marca las casillas y pasa la spec a «implementada».
