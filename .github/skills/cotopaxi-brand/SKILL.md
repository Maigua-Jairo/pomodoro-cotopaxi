name: cotopaxi-brand
description: Úsala siempre que crees o modifiques colores, estilos o pantallas de la aplicación Pomodoro Academia Cotopaxi.
---

# Paleta Cotopaxi del Temporizador Pomodoro

Fuente: Especificaciones de diseño del cliente (Academia Cotopaxi).

## Colores Institucionales y de Marca (Brand Colors)
- **Azul Institucional Principal (Midnight Blue):** `#100048` (Fondo de encabezados y pantallas principales).
- **Amarillo/Naranja Cotopaxi (Orange):** `#F8A800` (Acciones primarias, resaltados de fase y botones principales).
- **Blanco Humo (Whitesmoke):** `#F8F8F8` (Fondo general de tarjetas y contenedores).

## Roles (Fondo, Texto y Componentes)
- **Encabezado y Barra Superior:** Fondo `#100048`, texto `#FFFFFF`.
- **Botón Primario (Iniciar / Guardar):** Fondo `#F8A800`, texto `#100048` o `#FFFFFF` con alto contraste.
- **Acción Destructiva (Reiniciar / Cancelar) o Alerta:** Fondo `#e60023` (Crimson `--crimson-100`) o `#f24c44` (Tomato `--tomato-100`), texto `#FFFFFF`.
- **Fase de Estudio:** Fondo de tarjeta `#100048`, acento/borde `#F8A800`, texto `#FFFFFF`.
- **Fase de Descanso (Corto/Largo):** Fondo de tarjeta `#117a8d` (Teal `--teal-100`) o `#298460` (Seagreen `--seagreen-100`), texto `#FFFFFF`.
- **Fondo General de Pantalla:** `#F8F8F8` o `#100048` según el tema activo.
- **Tarjetas y Campos de Entrada:** Fondo `#FFFFFF`, texto `#1F2A2C` (Black `--black`).
- **Texto Secundario:** `#6A5751` (Dimgray) o `#718379` (Gray).
- **Bordes e Inactivos:** `#c5c5c5` (Silver `--silver-100`) o `#878787` (Gray `--gray-100`).

## Prohibido
- Usar texto amarillo/blanco sobre fondos claros que no cumplan con el ratio de contraste mínimo WCAG 4.5:1.
- Usar colores fuera de la paleta declarada en esta skill.

## Reglas
- La fase actual ("Estudio", "Descanso corto", "Descanso largo") se debe comunicar siempre con texto claro e identificable, complementado por el color del tema.
- Mantener consistencia visual utilizando únicamente las variables de color adaptadas de la marca.