  name: rn-conventions
description: Úsala siempre que crees o modifiques pantallas, formularios, temporizadores o componentes de interfaz del Temporizador Pomodoro Academia Cotopaxi.
---

# Convenciones de interfaz en React Native

- **Estilos:** Utilizar exclusivamente `StyleSheet`. Sin librerías externas de componentes de interfaz adicionales.
- **Diseño institucional:** Aplicar estrictamente la paleta de colores de la skill `cotopaxi-brand` (Midnight Blue `#100048` y Orange `#F8A800`). Evitar diseños genéricos.
- **Campos numéricos (Ajustes):** Usar teclado numérico adecuado (`keyboardType="numeric"` o `decimal-pad`) para configurar la duración de los Pomodoros y descansos (HU-005).
- **Gestión del teclado:** Los formularios de configuración no deben quedar tapados por el teclado virtual. Usar contenedores desplazables (`ScrollView` o `KeyboardAvoidingView`) y permitir interactuar con los botones con el teclado abierto.
- **Áreas seguras:** Utilizar siempre `SafeAreaView` para respetar la muesca y las barras del sistema del dispositivo.
- **Objetivos táctiles:** Elementos interactivos (botones de iniciar, pausar, reiniciar) de al menos 44x44 puntos. Añadir etiquetas de accesibilidad en botones e iconos.
- **Confirmaciones críticas:** El reinicio del temporizador o el restablecimiento de valores por defecto deben solicitar confirmación mediante un diálogo del sistema (`Alert.alert`).
- **Idioma:** Todos los textos visibles en la interfaz deben estar en español.

## Lista manual de verificación en Expo Go
- [ ] Se ve bien tanto en orientación vertical como horizontal.
- [ ] El teclado virtual no cubre los campos de texto ni los botones de guardar ajustes.
- [ ] El temporizador muestra correctamente el formato MM:SS y actualiza las fases sin bloquearse.
- [ ] Cerrar la app por completo y volver a abrirla conserva los ajustes guardados localmente (HU-003, HU-005, HU-006).
- [ ] Los textos de estado ("Estudio", "Descanso corto", "Descanso largo") se leen claramente sin depender únicamente del color.