# Tareas: Iniciar y controlar una sesión de estudio

Cada tarea está estimada para 20–30 minutos. Ejecutar en orden; las pruebas de lógica se escriben antes de completar la implementación de esa lógica. Las tareas de interfaz se validan manualmente en Expo Go y no se marcan como hechas hasta confirmar esa revisión.

- [x] **T1. Configurar Jest para Expo.** RF-01–RF-11, RNF-01
  - Hecho cuando: se obtiene aprobación para añadir las dependencias de pruebas que falten, el proyecto tiene configuración compatible con Expo SDK 57 y `npx jest` ejecuta una prueba mínima.

- [x] **T2. Escribir pruebas y crear el dominio del temporizador de concentración.** RF-01–RF-06, RF-07, RNF-01
  - Hecho cuando: `src/domain/timer.ts` pasa `npx jest` para iniciar, pausa, reanudación, reinicio confirmado/cancelado, inicio repetido, finalización en cero y formato `MM:SS`; las funciones reciben el tiempo como argumento y no dependen de React Native.

- [x] **T3. Añadir pruebas y transiciones del temporizador de descanso.** RF-08, RF-10, RF-11, RNF-01
  - Hecho cuando: `src/domain/__tests__/timer.test.ts` verifica el valor inicial cero, rechaza duraciones fuera de 5–30 o no enteras, inicia al confirmar un valor válido y modela la finalización del descanso y ambas acciones posteriores; `npx jest` pasa.

- [x] **T4. Conectar el reloj monotónico y compartir el estado entre rutas.** RF-01, RF-02, RF-05, RF-08, RF-10, RNF-01
  - Hecho cuando: `src/hooks/use-pomodoro-timer.ts` actualiza la vista y reconcilia al reanudarse usando `performance.now()` y el dominio; el proveedor conserva las fases al navegar; una prueba de dominio con tiempo simulado demuestra que cambiar la hora civil no cambia el restante; `npx jest` pasa.

- [x] **T5. Configurar navegación a la pantalla de descanso.** RF-07–RF-11
  - Hecho cuando: `src/app/_layout.tsx` envuelve Expo Router con el proveedor y expone las rutas principal y descanso; TypeScript reconoce la navegación y el layout deja de depender de componentes de navegación ausentes.

- [x] **T6. Implementar los controles de concentración en home.** RF-01–RF-06, RNF-01
  - Hecho cuando: `src/app/(tabs)/index.tsx` presenta el restante `MM:SS` y controles de iniciar, pausar, reanudar y reiniciar; el diálogo nativo de reinicio permite cancelar sin alterar el estado y confirmar restaura el tiempo inicial pausado. Verificar lista manual de interfaz en Expo Go.

- [x] **T7. Mostrar opciones al terminar concentración.** RF-07, RF-09
  - Hecho cuando: `src/app/(tabs)/index.tsx` muestra al llegar a cero la superposición con «Tomar un descanso» y «Regresar al home»; el primer botón abre descanso y el segundo deja home sin iniciar otra cuenta. Verificar manualmente en Expo Go.

- [x] **T8. Crear pantalla para configurar e iniciar descanso.** RF-08, RNF-01
  - Hecho cuando: `src/app/descanso.tsx` muestra inicialmente `00:00`, ofrece entrada numérica de 5–30 minutos y solo empieza al confirmar un entero válido; la cuenta presenta `MM:SS`. Verificar teclado, áreas seguras y orientación en Expo Go.

- [x] **T9. Mostrar opciones al terminar descanso y ejecutar ambas acciones.** RF-10, RF-11
  - Hecho cuando: `src/app/descanso.tsx` presenta los dos botones al llegar a cero; «Iniciar concentración» vuelve a home e inicia con la duración de concentración disponible, mientras «Regresar a home» restaura esa duración pausada. Verificar ambos recorridos en Expo Go.

- [x] **T10. Validar el conjunto de requisitos.** RF-01–RF-11, RNF-01
  - Hecho cuando: pasan `npx jest`, `npx expo lint` y `npx tsc --noEmit`; se completa la lista manual de `rn-conventions` en Expo Go, incluyendo vertical/horizontal, acciones al finalizar ambas cuentas y cambio de hora; no se añaden tareas fuera de la spec.
