# Contexto Completo del Proyecto CV-CREATOR-APP


================================================
ðŸ“„ ARCHIVO: .agents\skills\grilling\agents\SKILL.md
================================================

---
name: grilling
description: Grill the user relentlessly about a plan, decision, or idea. Use when the user wants to stress-test their thinking, or uses any 'grill' trigger phrases.
---

Interview the user relentlessly until you reach a shared understanding. Map this as a **design tree**: every decision branches into the decisions that hang off it.

Work the tree in **rounds**. The **frontier** is every decision whose prerequisites are already settled: the questions you can ask _now_ without guessing at answers you haven't heard yet. Ask the whole frontier in one round: number each question and give your recommended answer. Then wait for the user's answers before the next round.

Format a round like so:

```
❓ **Q1** - **<question title>**: <question body, might be multiple paragraphs, including multiple choices>

➡️ <your recommended answer>

---

❓ **Q2** - **<question title>**: <question body, might be multiple paragraphs, including multiple choices>

➡️ <your recommended answer>
```

Word each question so "yes" accepts your recommended answer.

Each round the user answers reshapes the tree: settled decisions push the frontier outward and unblock questions that depended on them. Recompute the frontier and ask the next round. A question whose answer depends on another question still open in this round belongs to a _later_ round, not this one.

Finding _facts_ is your job, never the user's. When a frontier question needs a fact from the environment (filesystem, tools, etc.), dispatch a sub-agent to find it; don't ask the user for anything you could look up yourself. Don't block on it: a running exploration is an unsettled prerequisite, so only the questions downstream of it wait for the sub-agent to report; ask the rest of the frontier now. The _decisions_ are the user's: put each to them and wait.

The session is done when the frontier is empty: every branch of the design tree visited, nothing left silently assumed. Do not act on it until the user confirms you have reached a shared understanding.


================================================
ðŸ“„ ARCHIVO: .claude\settings.json
================================================

{
  "enabledPlugins": {
    "expo@claude-plugins-official": true
  }
}


================================================
ðŸ“„ ARCHIVO: .github\agents\sdd-implement.agent.md
================================================

name: sdd-implement
description: SDD - Implementa una tarea de tasks.md con las pruebas primero y comprueba los escenarios de la HU

Eres el agente de implementación del Temporizador Pomodoro de la Academia Cotopaxi.

Antes de empezar lee `MEMORY.md`, `docs/constitution.md`, `.github/skills/sdd/SKILL.md`, y de la carpeta `specs/NNN-nombre/` lee `spec.md`, `plan.md` y `tasks.md`. Si no te digo qué tarea, usa la primera pendiente de `tasks.md` y dime cuál es antes de empezar.

## Qué haces, por cada tarea
1. En la lógica, escribes primero las pruebas y compruebas que fallan.
2. Escribes el código hasta que pasen, siguiendo `plan.md` y las skills `pomodoro-rules`, `rn-conventions` y `cotopaxi-brand` cuando correspondan.
3. Ejecutas `npx jest` y me muestras el resultado.
4. Si la tarea toca la interfaz, no ejecutas la app: me entregas los puntos de la lista manual de `rn-conventions` que debo probar en Expo Go y esperas mi confirmación.
5. Con las pruebas en verde (y mi confirmación si hubo interfaz), marcas la tarea en `tasks.md` e indicas qué RF cubre.
6. Listas qué escenarios de la HU quedan cubiertos por pruebas y cuáles no. Informas, no declaras que algo está correcto.
7. Actualizas en `MEMORY.md` solo "Estado actual" y "Próximos pasos".

Después PÁRATE. No empieces la siguiente tarea.

## Varias tareas seguidas
Solo si te nombro las tareas explícitamente (por ejemplo T2 a T4): las haces en ese orden, con las pruebas primero, y paras y me avisas si una prueba falla o si una tarea toca la interfaz.

## Qué no haces
- No tocas `spec.md`, `plan.md` ni `decisiones.md`. Si algo no cuadra, para y dímelo.
- No instalas dependencias ni ejecutas `npx expo start` sin que te lo pida.
- No haces commit.

================================================
ðŸ“„ ARCHIVO: .github\agents\sdd-plan.agent.md
================================================

name: sdd-plan
description: SDD - Genera plan.md y tasks.md de una spec aprobada
handoffs:
- label: Implementar una tarea
  agent: sdd-implement
  prompt: Implementa la primera tarea pendiente de la spec que acabamos de planificar y dime cuál es.
  send: false

Eres el agente de planificación del Temporizador Pomodoro de la Academia Cotopaxi. Solo escribes `specs/NNN-nombre/plan.md` y `specs/NNN-nombre/tasks.md`. NO escribas código.

Antes de empezar lee `MEMORY.md`, `docs/constitution.md`, `.github/skills/sdd/SKILL.md`, `specs/NNN-nombre/spec.md` y `specs/NNN-nombre/decisiones.md`. Si no te digo qué carpeta, pregúntamelo.

Si `spec.md` no tiene "Estado: aprobada" o aún tiene `[NECESITA ACLARACIÓN]`, PARA y avísame; no generes nada.

## Qué haces
1. `plan.md`, con: archivos que se crean o modifican y la responsabilidad de cada uno, funciones puras de lógica, persistencia, algoritmo en pseudocódigo, cómo se pinta en la interfaz, decisiones técnicas justificadas (con su alternativa descartada) y estrategia de pruebas con Jest. Marca qué RF cubre cada parte.
2. `tasks.md`, con el formato de la skill sdd: tareas de 20-30 minutos como máximo, en orden de dependencia, cada una con sus RF y una línea "Hecho cuando:" verificable. Las de lógica se verifican con `npx jest`; las de interfaz, con puntos de la lista manual de `rn-conventions`. Si salen más de 10 tareas, propón dividir la spec.
3. Todo debe respetar la constitución y cubrir todos los RF.
4. Al terminar, dime cuántas tareas hay y actualiza en `MEMORY.md` solo "Estado actual" y "Próximos pasos".

## Qué no haces
- No modificas `spec.md` ni `decisiones.md`. Solo paras y me avisas si una decisión cambia lo que el usuario ve y la spec no lo recoge.
- No inventas decisiones. Las decisiones técnicas de `decisiones.md` (representación de datos, almacenamiento) van en `plan.md`, citando su número.
- No escribes código ni pruebas.

================================================
ðŸ“„ ARCHIVO: .github\agents\sdd-spec.agent.md
================================================

name: sdd-spec
description: SDD - Redacta o ajusta la spec de una historia a partir de la HU y de decisiones.md
handoffs:
- label: Pasar al plan
  agent: sdd-plan
  prompt: Planifica la spec que acabamos de aprobar.
  send: false

Eres el agente de especificación del Temporizador Pomodoro de la Academia Cotopaxi. Solo escribes `specs/NNN-nombre/spec.md`. NO escribas código en ningún momento.

Antes de empezar lee `MEMORY.md`, `docs/constitution.md` y `.github/skills/sdd/SKILL.md`. Luego lee `docs/historias/HU-00N.md` y `specs/NNN-nombre/decisiones.md`. Si no te digo qué historia o qué carpeta, pregúntamelo antes de hacer nada.

## Qué haces
1. Generas `spec.md` con la plantilla de la skill sdd, con los requisitos en EARS y "Estado: borrador".
2. Cada escenario de la HU queda cubierto por al menos un RF.
3. Cada RF termina con "Origen:" y el escenario o la decisión de la que sale.
4. Lo que `decisiones.md` no resuelva lo marcas `[NECESITA ACLARACIÓN]`. No inventes ni añadas decisiones.
5. No me haces preguntas mientras redactas: las decisiones ya están escritas.
6. Cuando termines, haces la "Revisión final de la spec" de la skill sdd (máximo 10 puntos, sin proponer soluciones).
7. Actualizas en `MEMORY.md` solo "Estado actual" y "Próximos pasos".

## Qué no haces
- No modificas `decisiones.md`. Única excepción: si te dicto cómo resolver una duda abierta, añades esa decisión al final, numerada, y la aplicas en `spec.md`.
- Ignoras las decisiones que `decisiones.md` marque como revocadas.
- No escribes stack, arquitectura, formatos de almacenamiento ni nombres de archivos: solo el QUÉ y el POR QUÉ.
- No tocas `plan.md`, `tasks.md` ni el código.

================================================
ðŸ“„ ARCHIVO: .github\copilot-instructions.md
================================================

# Pomodoro Academia Cotopaxi - Instrucciones del Proyecto

App móvil para el Departamento de Bienestar Estudiantil de la Academia Cotopaxi: temporizador Pomodoro para estudiantes, con gestión de fases de estudio y descanso, persistencia local, sin publicidad, sin registro y funcionando sin conexión. Proyecto didáctico construido con Spec-Driven Development (SDD).

## Stack y estructura
- Expo (plantilla por defecto de create-expo-app), TypeScript y Expo Router.
- Persistencia local con @react-native-async-storage/async-storage. Sin backend ni cuentas.
- `src/domain/`: lógica pura (sin React ni AsyncStorage), `src/storage/`: persistencia, `app/`: pantallas. Pruebas junto a cada módulo, en `__tests__/`.

## Comandos
- Pruebas: `npx jest`
- Tipos: `npx tsc --noEmit`
- Ejecutar la app: `npx expo start` (solo cuando yo lo pida)

## Dónde está cada cosa
- `docs/constitution.md`: principios del proyecto.
- `docs/historias/`: historias de usuario en formato Gherkin (la entrada de todo).
- `specs/NNN-nombre/`: `decisiones.md`, `spec.md`, `plan.md` y `tasks.md` de cada historia.
- `MEMORY.md`: estado actual del trabajo.
- `.github/skills/`: método SDD, paleta institucional y convenciones de React Native.

## Cómo trabajar
1. Al empezar, lee `MEMORY.md` y `docs/constitution.md`.
2. Código y nombres en inglés; textos de interfaz, comentarios y documentos en español.
3. No tomes decisiones de producto o de diseño que la historia o `decisiones.md` no definan. Márcalas como `[NECESITA ACLARACIÓN]` y avísame.
4. Haz solo la fase o la tarea que te pido. No avances a la siguiente.
5. En la lógica, escribe primero las pruebas.
6. Pregunta antes de instalar dependencias, crear archivos fuera del plan o cambiar el formato de los datos guardados.
7. No reemplaces archivos existentes si la tarea no lo pide. No guardes datos sensibles. No hagas commit.

## MEMORY.md
Solo tiene "Estado actual" y "Próximos pasos". Al terminar una fase o tarea actualiza únicamente esas dos secciones. No copies decisiones ni contenido de la spec. Mantenlo en unas 50 líneas.

================================================
ðŸ“„ ARCHIVO: .github\skills\cotopaxi-brand\SKILL.md
================================================

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

================================================
ðŸ“„ ARCHIVO: .github\skills\grill-me\SKILL.md
================================================

---
name: grill-me
description: A relentless interview to sharpen a plan or design.
disable-model-invocation: true
---

Call the Skill tool with "grilling".


================================================
ðŸ“„ ARCHIVO: .github\skills\pomodoro-rules\SKILL.md
================================================

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

================================================
ðŸ“„ ARCHIVO: .github\skills\rn-conventions\SKILL.md
================================================

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

================================================
ðŸ“„ ARCHIVO: .github\skills\sdd\SKILL.md
================================================

---
name: sdd
description: Úsala siempre que trabajes con Spec-Driven Development en este proyecto (docs/constitution.md, docs/historias/ o cualquier archivo de specs/): redactar, 
revisar o cambiar specs, planes y tareas, o implementar
y validar tareas de una spec.
---

# Spec-Driven Development (SDD)

## Flujo y quién escribe qué
Constitución → grill-me → Spec → Plan y tareas → Implementación → Cambio.

| Fase | Quién | Escribe solo |
|---|---|---|
| Decisiones | skill grill-me | specs/NNN/decisiones.md |
| Spec | agente sdd-spec | specs/NNN/spec.md |
| Plan y tareas | agente sdd-plan | specs/NNN/plan.md y tasks.md |
| Implementación | agente sdd-implement | código, pruebas y la casilla de la tarea |

- Nunca pases a la siguiente fase sin la aprobación explícita del usuario.
- La spec manda: si algo no está en la spec, no se implementa.
- Si falta una decisión: al redactar la spec, márcala [NECESITA ACLARACIÓN];
  al planificar o implementar, para y pregunta.
- Un cambio de requisitos se hace primero en la spec, luego en el plan y las
  tareas, y por último en el código.
- Cada spec vive en specs/NNN-nombre/. decisiones.md lo genera grill-me; solo
  se le añade al final, numerada, una decisión que dicte el usuario para
  resolver una duda abierta.
- Al terminar una fase o tarea, actualiza en MEMORY.md solo "Estado actual" y
  "Próximos pasos" (indicando el siguiente agente). No copies decisiones ni
  contenido de la spec.

## Plantilla de spec (spec.md)
```
# Spec NNN — <Nombre>

Estado: borrador | aprobada | implementada
HU de origen: docs/historias/HU-00N.md

## Contexto y objetivo
## Usuarios
## Historias de usuario
## Definiciones (solo si hay términos que puedan interpretarse de varias formas)
## Requisitos funcionales
## Requisitos no funcionales
## Casos límite
## Fuera de alcance
## Criterios de finalización
## Dudas abiertas
- [NECESITA ACLARACIÓN] <duda>
```
La spec describe el QUÉ y el POR QUÉ. Nada de stack, arquitectura, formatos de
almacenamiento ni nombres de archivos. Un RF por comportamiento visible.

## Requisitos en EARS (en español)
- RF-x: CUANDO <evento>, EL SISTEMA <respuesta>.
- RF-x: SI <condición no deseada>, ENTONCES EL SISTEMA <respuesta>.
- RF-x: MIENTRAS <estado>, EL SISTEMA <respuesta>.
- RF-x: EL SISTEMA <comportamiento permanente>.

Cada RF debe ser verificable y terminar con "Origen:", indicando el escenario
de la HU o la decisión de decisiones.md de la que sale. Cada escenario de la
HU debe quedar cubierto por al menos un RF.

## Revisión final de la spec
Al terminar spec.md, lista sin proponer soluciones: contradicciones entre RF,
escenarios de la HU sin RF y conflictos con docs/constitution.md. Máximo 10
puntos.

## Plan (plan.md)
Archivos y responsabilidades · Funciones puras · Persistencia ·
Algoritmo en pseudocódigo · Interfaz · Decisiones justificadas con su
alternativa descartada · Estrategia de pruebas con Jest. Indica qué RF cubre
cada parte.

## Tareas (tasks.md)
```
- [ ] **Tn. <Descripción>.** RF-x, RF-y
  - Hecho cuando: <comprobación verificable>.
```
Máximo 20-30 min por tarea, en orden de dependencia. Si salen más de 10,
propón dividir la spec.

## Implementación
Una sola tarea cada vez: pruebas primero (en rojo), después el código, npx jest
en verde, marcar la tarea y parar. Si la tarea toca la interfaz, entrega la
lista manual de verificación y espera a que el usuario confirme que la probó
en Expo Go antes de marcarla como hecha.

Al cerrar la tarea, lista qué escenarios de la HU quedan cubiertos por pruebas
y cuáles no. Informa; no declares que algo "está correcto".

================================================
ðŸ“„ ARCHIVO: .gitignore
================================================

# Learn more https://docs.github.com/en/get-started/getting-started-with-git/ignoring-files

# dependencies
node_modules/

# Expo
.expo/
dist/
web-build/
expo-env.d.ts

# Native
.kotlin/
*.orig.*
*.jks
*.p8
*.p12
*.key
*.mobileprovision

# Metro
.metro-health-check*

# debug
npm-debug.*
yarn-debug.*
yarn-error.*

# macOS
.DS_Store
*.pem

# local env files
.env*.local

# typescript
*.tsbuildinfo

example

# generated native folders
/ios
/android


================================================
ðŸ“„ ARCHIVO: AGENTS.md
================================================

This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md


================================================
ðŸ“„ ARCHIVO: app.json
================================================

{
  "expo": {
    "name": "pomodoro-cotopaxi",
    "slug": "pomodoro-cotopaxi",
    "version": "1.0.0",
    "orientation": "default",
    "icon": "./assets/images/icon.png",
    "scheme": "pomodorocotopaxi",
    "userInterfaceStyle": "automatic",
    "ios": {
      "icon": "./assets/expo.icon"
    },
    "android": {
      "adaptiveIcon": {
        "backgroundColor": "#E6F4FE",
        "foregroundImage": "./assets/images/android-icon-foreground.png",
        "backgroundImage": "./assets/images/android-icon-background.png",
        "monochromeImage": "./assets/images/android-icon-monochrome.png"
      },
      "predictiveBackGestureEnabled": false,
      "allowBackup": false,
      "blockedPermissions": [
        "android.permission.READ_EXTERNAL_STORAGE",
        "android.permission.WRITE_EXTERNAL_STORAGE",
        "android.permission.SYSTEM_ALERT_WINDOW"
      ],
      "permissions": [
        "android.permission.MODIFY_AUDIO_SETTINGS"
      ],
      "package": "com.jairo_maigua.pomodorocotopaxi"
    },
    "web": {
      "output": "static",
      "favicon": "./assets/images/favicon.png"
    },
    "plugins": [
      "expo-router",
      [
        "expo-splash-screen",
        {
          "backgroundColor": "#208AEF",
          "image": "./assets/images/splash-icon.png",
          "imageWidth": 76
        }
      ],
      [
        "expo-audio",
        {
          "microphonePermission": false,
          "recordAudioAndroid": false,
          "enableBackgroundRecording": false,
          "enableBackgroundPlayback": false
        }
      ]
    ],
    "experiments": {
      "typedRoutes": true,
      "reactCompiler": true
    },
    "extra": {
      "router": {},
      "eas": {
        "projectId": "f32b73c6-2ce2-4d17-882f-3951c2cb732e"
      }
    }
  }
}


================================================
ðŸ“„ ARCHIVO: contexto.js
================================================

const fs = require('fs');
const path = require('path');

// Nombre del archivo final que contendrÃ¡ todo tu cÃ³digo
const OUTPUT_FILE = 'contexto_proyecto.md';
const ROOT_DIR = __dirname;

// Carpetas que ignoramos porque son pesadas o no contienen cÃ³digo fuente Ãºtil
const IGNORE_DIRS = ['node_modules', '.expo', '.vscode', '.opencode', '.git', 'assets', '__tests__', '.tamagui'];

// Archivos especÃ­ficos que no queremos incluir
const IGNORE_FILES = ['package-lock.json', 'yarn.lock', OUTPUT_FILE, 'export_context.js'];

// Extensiones permitidas
const ALLOWED_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.json', '.md'];

function buildContext(currentPath) {
    const items = fs.readdirSync(currentPath);

    for (const item of items) {
        const itemPath = path.join(currentPath, item);
        const stat = fs.statSync(itemPath);

        if (stat.isDirectory()) {
            if (!IGNORE_DIRS.includes(item)) {
                buildContext(itemPath);
            }
        } else {
            const ext = path.extname(item);
            const isAllowedExtension = ALLOWED_EXTENSIONS.includes(ext);
            
            // Permitimos archivos de configuraciÃ³n que empiezan con punto (ej. .gitignore, eslint.config.js)
            const isConfigFile = item.startsWith('.') || item.includes('config'); 

            if (!IGNORE_FILES.includes(item) && (isAllowedExtension || isConfigFile)) {
                try {
                    const content = fs.readFileSync(itemPath, 'utf8');
                    const relativePath = path.relative(ROOT_DIR, itemPath);
                    
                    // Separador visual claro para que la IA distinga entre archivos
                    const separator = `\n\n================================================\n`;
                    const fileHeader = `ðŸ“„ ARCHIVO: ${relativePath}\n================================================\n\n`;
                    
                    fs.appendFileSync(path.join(ROOT_DIR, OUTPUT_FILE), separator + fileHeader + content);
                } catch (error) {
                    console.error(`Error leyendo ${itemPath}:`, error.message);
                }
            }
        }
    }
}

// 1. Inicializar/Limpiar el archivo de salida
fs.writeFileSync(path.join(ROOT_DIR, OUTPUT_FILE), '# Contexto Completo del Proyecto CV-CREATOR-APP\n');
console.log('â³ Recopilando cÃ³digo...');

// 2. Ejecutar la lectura
buildContext(ROOT_DIR);

console.log(`âœ… Â¡Listo! Todo tu cÃ³digo se ha consolidado en el archivo: ${OUTPUT_FILE}`);

================================================
ðŸ“„ ARCHIVO: docs\constitucion.md
================================================

# Constitución del Pomodoro Academia Cotopaxi

Principios innegociables. Toda spec, plan y tarea debe cumplirlos.

1. **Simplicidad primero**: No se añaden librerías o dependencias nuevas (como para alarmas o notificaciones complejas) sin justificación y aprobación[cite: 43].
2. **La spec manda**: Nada se implementa si no está en la spec activa. Si falta una decisión, se detiene y se pregunta[cite: 43].
3. **Lógica separada de interfaz**: La lógica del temporizador y el cálculo de tiempo por marcas de tiempo (*timestamps*) vive separada de los componentes visuales de React Native[cite: 43].
4. **Pruebas como puerta**: La lógica de control del temporizador se verifica mediante pruebas[cite: 43].
5. **Los datos del usuario son sagrados**: Los ajustes de tiempo configurados localmente se conservan ante cambios de código[cite: 43].
6. **Exactitud del tiempo**: El temporizador debe basarse en el reloj del sistema (*timestamps*) para evitar desvíos cuando Android suspenda procesos en segundo plano (HU-003).

================================================
ðŸ“„ ARCHIVO: docs\historias\HU-001.md
================================================

# HU-001: Iniciar y controlar una sesión de estudio

**Usuario:** Estudiante  
**Prioridad para el negocio:** Alta  
**Riesgo para desarrollo:** Bajo  

**Descripción:** Como estudiante, quiero iniciar, pausar y reiniciar un temporizador de estudio, para concentrarme durante un tiempo definido.

## Criterios de aceptación
### Escenario: Iniciar el temporizador
Dado que estoy en la pantalla principal  
Cuando presiono iniciar  
Entonces empieza la cuenta regresiva con el tiempo de estudio que tengo configurado y veo los minutos y segundos que faltan  

### Escenario: Pausar y continuar
Dado que tengo el temporizador corriendo  
Cuando lo pauso y luego lo reanudo  
Entonces la cuenta sigue desde el tiempo en que la pausé  

### Escenario: Reiniciar el temporizador
Dado que tengo el temporizador corriendo o pausado  
Когда decido reiniciarlo y lo confirmo  
Entonces el temporizador vuelve al tiempo inicial de la fase en la que estoy  

### Escenario: Cambiar de opinión al reiniciar
Dado que tengo el temporizador corriendo o pausado  
Cuando decido reiniciarlo y cancelo  
Entonces el temporizador conserva el tiempo que llevaba

================================================
ðŸ“„ ARCHIVO: docs\historias\HU-002.md
================================================

# HU-002: Alternar entre estudio y descanso

**Identificador / ID:** HU-002  
**Usuario:** Estudiante  
**Nombre de la Historia:** Alternar entre estudio y descanso  
**Prioridad para el negocio:** Media  
**Riesgo para desarrollo:** Bajo  

**Descripción:** Como estudiante, quiero que la aplicación pase sola del tiempo de estudio al de descanso, para seguir la técnica Pomodoro sin tener que llevar la cuenta yo mismo.

## Criterios de aceptación
### Escenario: Terminar un pomodoro
Dado que termina un tiempo de estudio  
Cuando todavía no completo los pomodoros necesarios para el descanso largo  
Entonces la aplicación deja listo un descanso corto para que yo lo inicie  

### Escenario: Llegar al descanso largo
Dado que completé la cantidad de pomodoros configurada (cuatro por defecto)  
Cuando termina el último tiempo de estudio  
Entonces la aplicación deja listo un descanso largo y el contador de pomodoros vuelve a cero  

### Escenario: Terminar un descanso
Dado que termina un descanso corto o largo  
Cuando vuelvo a la aplicación  
Entonces la aplicación deja listo el siguiente tiempo de estudio  

### Escenario: Ver mi avance
Dado que estoy en una sesión  
Cuando miro la pantalla principal  
Entonces veo si estoy en estudio o en descanso y cuántos pomodoros llevo en el ciclo actual

================================================
ðŸ“„ ARCHIVO: docs\historias\HU-003.md
================================================

# HU-003: Mantener el conteo con el celular bloqueado o la app cerrada

**Identificador / ID:** HU-003  
**Usuario:** Estudiante  
**Nombre de la Historia:** Mantener el conteo con el celular bloqueado o la app cerrada  
**Prioridad para el negocio:** Alta  
**Riesgo para desarrollo:** Alto  

**Descripción:** Como estudiante, quiero que el temporizador siga contando aunque bloquee el celular o cierre la aplicación, para no perder el tiempo que llevo estudiando.

## Criterios de aceptación
### Escenario: Bloquear el celular
Dado que tengo el temporizador corriendo  
Cuando bloqueo el celular y lo desbloqueo unos minutos después  
Entonces la aplicación muestra el tiempo restante correcto, descontando lo que pasó mientras estaba bloqueado  

### Escenario: Cerrar la aplicación
Dado que tengo el temporizador corriendo  
Когда cierro la aplicación desde las apps recientes y la vuelvo a abrir  
Entonces la aplicación recupera la sesión y muestra el tiempo restante correcto  

### Escenario: El tiempo termina con la aplicación cerrada
Dado que cerré la aplicación con el temporizador corriendo  
Cuando el tiempo se cumple antes de que vuelva a abrirla  
Entonces igual recibo el aviso de fin y, al abrir la aplicación, la fase aparece como terminada  

### Escenario: Pausar antes de cerrar
Dado que pausé el temporizador  
Cuando cierro la aplicación y la vuelvo a abrir  
Entonces el temporizador sigue pausado con el mismo tiempo restante y no recibo ningún aviso

================================================
ðŸ“„ ARCHIVO: docs\historias\HU-004.md
================================================

# HU-004: Recibir aviso al terminar el tiempo

**Identificador / ID:** HU-004  
**Usuario:** Estudiante  
**Nombre de la Historia:** Recibir aviso al terminar el tiempo  
**Prioridad para el negocio:** Alta  
**Riesgo para desarrollo:** Alto  

**Descripción:** Como estudiante, quiero que la aplicación me avise cuando termine el tiempo de estudio o de descanso, incluso con el celular en silencio, para cambiar de actividad sin estar mirando la pantalla.

## Criterios de aceptación
### Escenario: Aviso con el celular en sonido
Dado que el temporizador llega a cero  
Cuando el celular tiene el sonido activado  
Entonces recibo una notificación con sonido y vibración que me dice qué fase terminó  

### Escenario: Aviso con el celular en silencio
Dado que el temporizador llega a cero  
Cuando el celular está en modo silencio o vibración  
Entonces la aplicación suena como alarma, vibra y muestra el aviso en la pantalla de bloqueo  

### Escenario: Detener el aviso
Dado que la alarma está sonando  
Cuando toco la notificación o el botón de detener  
Entonces la alarma se calla y la aplicación se abre mostrando la siguiente fase  

### Escenario: Permiso de notificaciones
Dado que no he dado permiso de notificaciones a la aplicación  
Cuando inicio un temporizador por primera vez  
Entonces la aplicación me explica para qué necesita el permiso y me lo solicita

================================================
ðŸ“„ ARCHIVO: docs\historias\HU-005.md
================================================

# HU-005: Ajustar los tiempos del pomodoro

**Identificador / ID:** HU-005  
**Usuario:** Estudiante  
**Nombre de la Historia:** Ajustar los tiempos del pomodoro  
**Prioridad para el negocio:** Media  
**Riesgo para desarrollo:** Bajo  

**Descripción:** Como estudiante, quiero cambiar la duración del estudio, de los descansos y la cantidad de pomodoros antes del descanso largo, para adaptar la técnica a mi ritmo.

## Criterios de aceptación
### Escenario: Cambiar un tiempo
Dado que estoy en la pantalla de ajustes  
Cuando cambio un tiempo y guardo  
Entonces el nuevo valor se usa desde la próxima fase y se mantiene aunque cierre la aplicación  

### Escenario: Ingresar un valor no válido
Dado que estoy en la pantalla de ajustes  
Cuando dejo un campo vacío, pongo cero o un valor fuera del rango permitido  
Entonces la aplicación no guarda el cambio y me indica qué valores puedo usar  

### Escenario: Volver a los valores por defecto
Dado que modifiqué los tiempos  
Cuando elijo restablecer y lo confirmo  
Entonces los tiempos vuelven a 25 minutos de estudio, 5 de descanso corto, 15 de descanso largo y 4 pomodoros por ciclo  

### Escenario: Cambiar un tiempo con una fase en curso
Dado que tengo el temporizador corriendo  
Cuando cambio la duración de esa misma fase  
Entonces la fase actual termina con el tiempo con el que empezó y el cambio se aplica a la siguiente

================================================
ðŸ“„ ARCHIVO: docs\historias\HU-006.md
================================================

# HU-006: Usar la aplicación sin registro, sin internet y sin publicidad

**Identificador / ID:** HU-006  
**Usuario:** Estudiante  
**Nombre de la Historia:** Usar la aplicación sin registro, sin internet y sin publicidad  
**Prioridad para el negocio:** Alta  
**Riesgo para desarrollo:** Bajo  

**Descripción:** Como estudiante, quiero usar la aplicación apenas la instalo, sin crear una cuenta, sin datos móviles y sin anuncios, para empezar a estudiar sin trabas.

## Criterios de aceptación
### Escenario: Abrir la aplicación por primera vez
Dado que acabo de instalar la aplicación  
Cuando la abro por primera vez  
Entonces llego directo al temporizador, sin pantallas de registro ni de inicio de sesión  

### Escenario: Usarla sin conexión
Dado que no tengo datos móviles ni wifi  
Cuando uso el temporizador, los avisos y los ajustes  
Entonces todo funciona igual y mis ajustes quedan guardados en el celular  

### Escenario: Usarla sin publicidad
Dado que estoy usando la aplicación  
Cuando paso por cualquiera de sus pantallas  
Entonces no aparece ningún anuncio

================================================
ðŸ“„ ARCHIVO: eas.json
================================================

{
  "cli": {
    "version": ">= 25.2.0",
    "appVersionSource": "remote"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {}
  }
}


================================================
ðŸ“„ ARCHIVO: eslint.config.js
================================================

// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  }
]);


================================================
ðŸ“„ ARCHIVO: expo-env.d.ts
================================================

/// <reference types="expo/types" />

// NOTE: This file should not be edited and should be in your git ignore

================================================
ðŸ“„ ARCHIVO: MEMORY.md
================================================

# MEMORY.md - Pomodoro Academia Cotopaxi

Estado del trabajo entre sesiones.

## Estado actual
- Specs 001–006 en estado «implementada». Spec 001 depurada: se eliminaron RF-07 a RF-11 (sustituidos por 002 y 004); spec 002 documenta la excepción de 005 en RF-07; 003 y 004 se dejan sin cambios por decisión del usuario.
- HU-004 cerrada: T1–T10 completadas y corroboradas manualmente por el usuario en Android e iOS; spec 004 en estado «implementada».
- Cambio aplicado tras la verificación: la alarma se apaga automáticamente a los 3 segundos (V-01 en la sección Verificación de tasks.md), confirmado por el usuario en dispositivo.
- HU-005 cerrada: T1–T10 completadas y verificadas por el usuario en Expo Go; spec 005 en estado «implementada» (104 pruebas, lint y TypeScript pasan).
- HU-006 cerrada: T1–T6 completadas y verificadas por el usuario en Expo Go; spec 006 en estado «implementada» (112 pruebas, lint y TypeScript pasan).

## Próximos pasos
- Opcional (usuario): compilar con EAS (`npx eas-cli@latest build --profile preview`) para verificar en Android la copia de seguridad desactivada y los permisos bloqueados.
- Siguiente historia o mejora: a definir por el usuario.


================================================
ðŸ“„ ARCHIVO: package.json
================================================

{
  "name": "pomodoro-cotopaxi",
  "main": "expo-router/entry",
  "version": "1.0.0",
  "dependencies": {
    "@expo/ui": "~57.0.25",
    "@react-native-async-storage/async-storage": "2.2.0",
    "expo": "~57.0.30",
    "expo-audio": "~57.0.5",
    "expo-constants": "~57.0.22",
    "expo-device": "~57.0.2",
    "expo-font": "~57.0.4",
    "expo-glass-effect": "~57.0.4",
    "expo-image": "~57.0.5",
    "expo-linking": "~57.0.13",
    "expo-notifications": "~57.0.23",
    "expo-router": "~57.0.28",
    "expo-splash-screen": "~57.0.10",
    "expo-status-bar": "~57.0.1",
    "expo-symbols": "~57.0.3",
    "expo-system-ui": "~57.0.4",
    "expo-web-browser": "~57.0.3",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "react-native": "0.86.3",
    "react-native-gesture-handler": "~2.32.0",
    "react-native-reanimated": "4.5.1",
    "react-native-safe-area-context": "~5.7.0",
    "react-native-screens": "~4.26.0",
    "react-native-web": "~0.21.0",
    "react-native-worklets": "0.10.1"
  },
  "devDependencies": {
    "@types/jest": "^29.5.14",
    "@types/react": "~19.2.2",
    "eslint": "^9.0.0",
    "eslint-config-expo": "~57.0.2",
    "jest": "~29.7.0",
    "jest-expo": "~57.0.6",
    "typescript": "~6.0.3"
  },
  "scripts": {
    "start": "expo start",
    "reset-project": "node ./scripts/reset-project.js",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "lint": "expo lint",
    "test": "jest"
  },
  "jest": {
    "preset": "jest-expo"
  },
  "private": true
}


================================================
ðŸ“„ ARCHIVO: README.md
================================================

# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.


================================================
ðŸ“„ ARCHIVO: scripts\reset-project.js
================================================

#!/usr/bin/env node

/**
 * This script is used to reset the project to a blank state.
 * It deletes or moves the /src and /scripts directories to /example based on user input and creates a new /src/app directory with an index.tsx and _layout.tsx file.
 * You can remove the `reset-project` script from package.json and safely delete this file after running it.
 */

const fs = require("fs");
const path = require("path");
const readline = require("readline");

const root = process.cwd();
const oldDirs = ["src", "scripts"];
const exampleDir = "example";
const newAppDir = "src/app";
const exampleDirPath = path.join(root, exampleDir);

const indexContent = `import { Text, View, StyleSheet } from "react-native";

export default function Index() {
  return (
    <View style={styles.container}>
      <Text>Edit src/app/index.tsx to edit this screen.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
`;

const layoutContent = `import { Stack } from "expo-router";

export default function RootLayout() {
  return <Stack />;
}
`;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const moveDirectories = async (userInput) => {
  try {
    if (userInput === "y") {
      // Create the app-example directory
      await fs.promises.mkdir(exampleDirPath, { recursive: true });
      console.log(`📁 /${exampleDir} directory created.`);
    }

    // Move old directories to new app-example directory or delete them
    for (const dir of oldDirs) {
      const oldDirPath = path.join(root, dir);
      if (fs.existsSync(oldDirPath)) {
        if (userInput === "y") {
          const newDirPath = path.join(root, exampleDir, dir);
          await fs.promises.rename(oldDirPath, newDirPath);
          console.log(`➡️ /${dir} moved to /${exampleDir}/${dir}.`);
        } else {
          await fs.promises.rm(oldDirPath, { recursive: true, force: true });
          console.log(`❌ /${dir} deleted.`);
        }
      } else {
        console.log(`➡️ /${dir} does not exist, skipping.`);
      }
    }

    // Create new /src/app directory
    const newAppDirPath = path.join(root, newAppDir);
    await fs.promises.mkdir(newAppDirPath, { recursive: true });
    console.log("\n📁 New /src/app directory created.");

    // Create index.tsx
    const indexPath = path.join(newAppDirPath, "index.tsx");
    await fs.promises.writeFile(indexPath, indexContent);
    console.log("📄 src/app/index.tsx created.");

    // Create _layout.tsx
    const layoutPath = path.join(newAppDirPath, "_layout.tsx");
    await fs.promises.writeFile(layoutPath, layoutContent);
    console.log("📄 src/app/_layout.tsx created.");

    console.log("\n✅ Project reset complete. Next steps:");
    console.log(
      `1. Run \`npx expo start\` to start a development server.\n2. Edit src/app/index.tsx to edit the main screen.\n3. Put all your application code in /src, only screens and layout files should be in /src/app.${
        userInput === "y"
          ? `\n4. Delete the /${exampleDir} directory when you're done referencing it.`
          : ""
      }`
    );
  } catch (error) {
    console.error(`❌ Error during script execution: ${error.message}`);
  }
};

rl.question(
  "Do you want to move existing files to /example instead of deleting them? (Y/n): ",
  (answer) => {
    const userInput = answer.trim().toLowerCase() || "y";
    if (userInput === "y" || userInput === "n") {
      moveDirectories(userInput).finally(() => rl.close());
    } else {
      console.log("❌ Invalid input. Please enter 'Y' or 'N'.");
      rl.close();
    }
  }
);


================================================
ðŸ“„ ARCHIVO: skills-lock.json
================================================

{
  "version": 1,
  "skills": {
    "grill-me": {
      "source": "mattpocock/skills",
      "sourceType": "github",
      "skillPath": "skills/productivity/grill-me/SKILL.md",
      "computedHash": "5e0c683385eafd83f106ac6c9d67dfbbfe5aa4b3fe65aad114eb1055a99c818f"
    },
    "grilling": {
      "source": "mattpocock/skills",
      "sourceType": "github",
      "skillPath": "skills/productivity/grilling/SKILL.md",
      "computedHash": "c3b3e67f18495984385413bc6be7e2acbf2139c6cf52ef42abdda7242a791822"
    }
  }
}


================================================
ðŸ“„ ARCHIVO: specs\001-iniciar-temporizador\decisiones.md
================================================

# Decisiones de HU-001: Iniciar y controlar una sesión de estudio

## D-01: Toque repetido en «Iniciar»

- **Pregunta:** Si el temporizador ya está corriendo, ¿qué ocurre al tocar «Iniciar» otra vez?
- **Respuesta:** La cuenta actual se mantiene sin cambios.
- **Motivo:** Evita reiniciar accidentalmente el tiempo o iniciar cuentas duplicadas.

## D-02: Cambio del reloj del teléfono

- **Pregunta:** Si se ajusta manualmente la hora del teléfono mientras corre el temporizador, ¿debe cambiar el tiempo restante?
- **Respuesta:** No. La cuenta conserva el tiempo transcurrido real y no salta por el ajuste del reloj.
- **Motivo:** Un cambio manual de la hora del teléfono no debe acortar ni alargar la sesión de estudio.

## D-03: Fin de la cuenta regresiva

- **Pregunta:** ¿Qué debe ocurrir cuando la cuenta regresiva llega a cero?
- **Respuesta:** La aplicación mostrará una pantalla sobrepuesta con dos botones: «Tomar un descanso» y «Regresar al home».
- **Motivo:** Presentar al estudiante opciones al terminar el tiempo de estudio.

## D-04: Cancelar el reinicio

- **Pregunta:** Al cancelar el reinicio, ¿el temporizador debe conservar también su estado de ejecución o pausa, además del tiempo restante?
- **Respuesta:** Sí. Se mantiene el estado de ejecución que tenía al solicitar el reinicio.
- **Motivo:** Cancelar no debe modificar el estado actual del temporizador.

## D-05: Seleccionar «Tomar un descanso»

- **Pregunta:** ¿Qué debe ocurrir al seleccionar «Tomar un descanso» al terminar la cuenta regresiva?
- **Respuesta:** La aplicación redirigirá al estudiante a una nueva pantalla con un temporizador de descanso cuya duración podrá modificar, hasta un máximo de 30 minutos.
- **Motivo:** Permitir que el estudiante configure la duración del descanso que desea tomar.

## D-06: Seleccionar «Regresar al home»

- **Pregunta:** ¿Qué debe ocurrir al seleccionar «Regresar al home» al terminar la cuenta regresiva?
- **Respuesta:** La aplicación redirigirá al estudiante al temporizador principal, desde donde podrá iniciar un nuevo tiempo de enfoque si así lo desea.
- **Motivo:** Permitir que el estudiante vuelva al temporizador principal y decida si inicia otra sesión de enfoque.

## D-07: Estado después de confirmar el reinicio

- **Pregunta:** ¿En qué estado debe quedar el temporizador después de confirmar el reinicio?
- **Respuesta:** Pausado, tanto si estaba corriendo como si ya estaba pausado al solicitar el reinicio.
- **Motivo:** El reinicio restablece el tiempo inicial sin iniciar automáticamente la cuenta regresiva.

## D-08: Configurar e iniciar el temporizador de descanso

- **Pregunta:** ¿Cómo se configura e inicia el temporizador de descanso después de seleccionar «Tomar un descanso»?
- **Respuesta:** La pantalla del temporizador de descanso mostrará inicialmente el valor 0. Al presionar el reloj, el estudiante podrá establecer una duración de descanso entre 5 y 30 minutos. Al confirmar la duración, comenzará la cuenta regresiva.
- **Motivo:** Permitir que el estudiante elija cuánto durará su descanso antes de iniciar el temporizador.

## D-09: Acciones al terminar el descanso

- **Pregunta:** ¿Qué debe ocurrir cuando termina la cuenta regresiva del temporizador de descanso?
- **Respuesta:** La aplicación mostrará una pantalla sobrepuesta con dos botones. «Iniciar concentración» redirigirá al estudiante al temporizador principal e iniciará la cuenta regresiva con la duración de concentración que tenía configurada, salvo que el estudiante la modifique después. «Regresar a home» redirigirá al temporizador principal y lo dejará pausado.
- **Motivo:** Permitir que el estudiante elija entre iniciar otra sesión de concentración o regresar al temporizador principal sin iniciarla.

## D-10: Tiempo mostrado al regresar a home después del descanso

- **Pregunta:** ¿Qué tiempo debe mostrar el temporizador principal al regresar a home después de terminar el descanso y dejarlo pausado?
- **Respuesta:** El tiempo inicial de concentración elegido por el estudiante (por ejemplo, 10, 30 o 60 minutos).
- **Motivo:** Volver al temporizador principal listo para una nueva sesión de concentración, sin iniciarla automáticamente.


================================================
ðŸ“„ ARCHIVO: specs\001-iniciar-temporizador\plan.md
================================================

# Plan: Iniciar y controlar una sesión de estudio

**Spec:** [spec.md](./spec.md)  
**Decisiones:** [decisiones.md](./decisiones.md)  
**Estado de la spec:** Aprobada

## Resumen

Implementar el temporizador de concentración desde la pantalla principal, la pantalla de configuración e inicio del descanso y las opciones al terminar ambas cuentas. La lógica será pura y recibirá marcas de tiempo monotónicas; las pantallas Expo Router mostrarán su estado y recogerán las acciones del estudiante. No se añadirá persistencia ni dependencias de ejecución porque la spec no las requiere.

La spec contiene RF-01 a RF-11 y RNF-01. El alcance se limita a esos requisitos; no incluye la configuración general de concentración de HU-005 ni el comportamiento de la nueva cuenta de concentración después de que llegue a cero.

## Contexto técnico

- **Lenguaje/plataforma:** TypeScript, Expo SDK 57, React Native 0.86 y Expo Router.
- **Rutas actuales:** la pantalla principal corresponde a `src/app/(tabs)/index.tsx`; `src/app/_layout.tsx` es el punto de composición de rutas. Se añadirá `src/app/descanso.tsx`.
- **Lógica:** el repositorio aún no contiene módulos de dominio ni de almacenamiento. La cuenta y sus transiciones se implementarán en `src/domain/`, sin React ni almacenamiento.
- **Reloj:** React Native expone `performance.now()` como reloj monotónico con origen en el inicio del sistema. El dominio recibirá la hora como argumento para poder probar saltos del reloj civil sin depender del dispositivo. La pantalla reconciliará la cuenta al reanudarse y no dependerá de que cada `setInterval` ocurra puntualmente.
- **Estado entre rutas:** un proveedor en la raíz conserva el estado en memoria mientras el estudiante navega entre home y descanso; no se depende del montaje de una pantalla ni se persiste una sesión.
- **Interfaz:** usar Expo Router, componentes React Native, `StyleSheet`, áreas seguras y la paleta de Cotopaxi. Los textos serán en español; la duración del descanso usará entrada numérica.
- **Pruebas:** la lógica tendrá pruebas unitarias con Jest y reloj simulado. `package.json` no contiene Jest ni un script de pruebas; antes de añadir dependencias de pruebas se pedirá aprobación, conforme a la constitución. La verificación visual de interfaz se hará manualmente en Expo Go.
- **Persistencia:** no se persiste el progreso del temporizador. Se utiliza la duración de concentración disponible en la aplicación; hasta que exista el módulo de ajustes de HU-005, se usará el valor predeterminado de 25 minutos establecido en `.github/skills/pomodoro-rules/SKILL.md`.
- **Restricciones:** no añadir dependencias de ejecución ni cambiar el formato de datos guardados. No crear funciones de descanso adicionales a las que especifican RF-08, RF-10 y RF-11.

## Comprobación de la constitución

| Principio | Resultado y aplicación |
|---|---|
| Simplicidad primero | Cumple: no requiere librerías de temporizador, notificaciones ni persistencia adicional. |
| La spec manda | Cumple: la pantalla de descanso y los estados al finalizar se limitan a RF-08, RF-10 y RF-11. |
| Lógica separada de interfaz | Cumple: transiciones y cálculo en `src/domain/timer.ts`; React se limita a presentar y despachar eventos. |
| Pruebas como puerta | Cumple con condición: la lógica tendrá pruebas Jest; primero se necesita aprobación para configurar Jest, que aún no existe en el proyecto. |
| Los datos del usuario son sagrados | Cumple: este alcance no modifica ajustes almacenados ni el formato de persistencia. |
| Exactitud del tiempo | Cumple con verificación manual requerida: cuenta a partir de tiempo monotónico y recalcula al reanudarse, sin usar `Date.now()` como fuente de duración. |

## Decisiones de implementación

| Decisión | Aplicación | Alternativa descartada |
|---|---|---|
| D-01, D-06 | Un toque repetido en iniciar no reinicia el estado; volver a home no inicia una cuenta nueva. | Reiniciar automáticamente la cuenta activa o iniciar otra al volver. |
| D-02 | El núcleo recibe un tiempo monotónico inyectable y no calcula duración con la hora civil del teléfono. | Restar valores de `Date.now()`, que cambiarían si el estudiante ajusta la hora. |
| D-03, D-05, D-09 | Al completar cada cuenta se presenta la superposición y acciones definidas por la spec. | Transición automática sin elección del estudiante. |
| D-04, D-07 | Cancelar conserva tiempo y estado; confirmar reinicio restaura el tiempo inicial y deja el temporizador pausado. | Cambiar el estado durante la cancelación o reanudar automáticamente después del reinicio. |
| D-08 | El descanso comienza mostrando 0; solo un valor entero de 5 a 30 minutos confirmado inicia la cuenta. | Iniciar una duración predeterminada o aceptar valores vacíos/fuera del rango. |
| D-10 | «Regresar a home» tras el descanso restaura la duración inicial de concentración elegida y deja la cuenta pausada. | Mostrar el tiempo agotado del descanso o comenzar concentración automáticamente. |
| RNF-01 | El formato `MM:SS` se calcula en el dominio y se presenta igual en ambas pantallas. | Mantener formato de tiempo duplicado y potencialmente inconsistente en cada pantalla. |

## Pasos de implementación

### P1.1 — Preparar pruebas unitarias

- **Requisitos:** RF-01 a RF-11, RNF-01 (infraestructura de verificación).
- **Archivos:** `package.json` y configuración de Jest que se acuerde para Expo SDK 57.
- **Descripción:** comprobar y configurar el ejecutor compatible con Expo. La ejecución de Jest requiere aprobación explícita antes de instalar dependencias que hoy no están en el manifiesto.

### P1.2 — Crear modelo puro del temporizador

- **Requisitos:** RF-01 a RF-06, RF-08, RF-10, RF-11, RNF-01.
- **Archivos:** crear `src/domain/timer.ts` y `src/domain/__tests__/timer.test.ts`.
- **Descripción:** definir estados tipados para concentración y descanso; funciones puras para iniciar, pausar, reanudar, reiniciar, reconciliar con una marca temporal, validar duración y formatear `MM:SS`. El reinicio confirmado usa el tiempo inicial y estado pausado. La acción de iniciar durante ejecución no cambia el estado. El dominio no importa React Native ni lee el reloj global.

### P1.3 — Integrar reloj monotónico y actualización de pantalla

- **Requisitos:** RF-01, RF-02, RF-05, RF-08, RF-10, RNF-01.
- **Archivos:** crear `src/hooks/use-pomodoro-timer.ts`.
- **Descripción:** conectar el dominio a `performance.now()`, actualizar la presentación periódicamente y recalcular el estado al volver la app a primer plano. El hook/proveedor raíz conserva los temporizadores de concentración y descanso al navegar entre pantallas. Cada actualización calcula el restante desde las marcas guardadas, no decrementando un contador por tick. Verificar especialmente los cambios manuales de la hora y las pausas de ejecución de JavaScript en segundo plano.

### P1.4 — Habilitar rutas para temporizador y descanso

- **Requisitos:** RF-07 a RF-11.
- **Archivos:** modificar `src/app/_layout.tsx`.
- **Descripción:** envolver el navegador Expo Router con el proveedor del temporizador y configurar las rutas principal y `descanso`. El layout actual importa componentes de navegación que no están presentes en `src/components/`; reemplazar esa composición por rutas Expo Router funcionales en vez de añadir dependencias de navegación paralelas.

### P1.5 — Implementar controles de concentración

- **Requisitos:** RF-01 a RF-06, RNF-01.
- **Archivos:** modificar `src/app/(tabs)/index.tsx`.
- **Descripción:** reemplazar el contenido de plantilla por la pantalla principal con tiempo `MM:SS` y controles de iniciar, pausar, reanudar y reiniciar. El reinicio pedirá confirmación mediante diálogo nativo; cancelar preserva el estado y confirmar restaura el tiempo inicial pausado. Respetar áreas seguras, paleta institucional, accesibilidad y objetivos táctiles.

### P1.6 — Presentar acciones al terminar concentración

- **Requisitos:** RF-07, RF-09.
- **Archivos:** modificar `src/app/(tabs)/index.tsx`.
- **Descripción:** mostrar la pantalla sobrepuesta al llegar a cero. «Tomar un descanso» navega a la ruta de descanso; «Regresar al home» vuelve al temporizador principal sin iniciar otra cuenta.

### P1.7 — Configurar e iniciar el descanso

- **Requisitos:** RF-08, RNF-01.
- **Archivos:** crear `src/app/descanso.tsx`.
- **Descripción:** mostrar inicialmente `00:00`; al pulsar el reloj, permitir ingresar minutos enteros entre 5 y 30 con teclado numérico. Al confirmar un valor válido, iniciar la cuenta atrás y mostrar controles de tiempo con `MM:SS`. No añadir acciones que no estén en la spec.

### P1.8 — Presentar acciones al terminar descanso

- **Requisitos:** RF-10, RF-11.
- **Archivos:** modificar `src/app/descanso.tsx` y `src/app/(tabs)/index.tsx`.
- **Descripción:** al completar el descanso, mostrar la superposición con «Iniciar concentración» y «Regresar a home». La primera vuelve al temporizador principal y comienza con la duración de concentración disponible; la segunda vuelve al temporizador principal pausado y mostrando la duración inicial elegida.

### P1.9 — Validar cobertura de requisitos

- **Requisitos:** RF-01 a RF-11, RNF-01.
- **Archivos:** pruebas en `src/domain/__tests__/timer.test.ts`, pruebas del hook si se crean, y pantallas de concentración y descanso.
- **Descripción:** ejecutar Jest para lógica, lint y TypeScript; completar la comprobación manual en Expo Go en orientación vertical y horizontal, incluidos temporizadores, diálogos, navegación, teclado, contraste, textos y accesibilidad. No marcar validación visual como realizada hasta comprobarla en dispositivo/emulador.

## Algoritmo del temporizador

```text
crear fase(initialDurationMs, now):
    state = paused
    remainingMs = initialDurationMs

start(state, now):
    si state == running: devolver el mismo estado
    si no: startedAt = now; state = running

pause(state, now):
    si state != running: devolver el estado sin cambios
    remainingMs = max(0, remainingMs - (now - startedAt))
    state = paused

reconcile(state, now):
    si state != running: devolver el estado sin cambios
    remainingMs = max(0, remainingMs - (now - startedAt))
    startedAt = now
    si remainingMs == 0: state = finished

resetConfirmed(initialDurationMs):
    remainingMs = initialDurationMs
    state = paused

resetCancelled(state):
    devolver exactamente el estado y restante que había al abrir el diálogo

startBreak(minutes):
    rechazar si minutes no es entero o no está entre 5 y 30
    crear/iniciar fase de descanso con minutes * 60_000

format(remainingMs):
    totalSeconds = ceil(max(0, remainingMs) / 1000)
    devolver minutos y segundos con dos dígitos: MM:SS
```

`startedAt` y `now` son valores de reloj monotónico suministrados al dominio. Cada reconciliación reemplaza la marca de inicio y el restante para que una sesión larga no acumule error por ticks. Se cubren esos cálculos con reloj falso; la suspensión real y el cambio de hora se confirman también manualmente en Expo Go.

## Estructura prevista

```text
src/
  app/
    _layout.tsx                        # Navegación Expo Router
    (tabs)/
      index.tsx                        # Pantalla principal de concentración
    descanso.tsx                       # Configuración, cuenta y fin del descanso
  domain/
    timer.ts                           # Estado y transiciones puras de temporizador
    __tests__/
      timer.test.ts                    # Pruebas del dominio con reloj simulado
  hooks/
    use-pomodoro-timer.ts              # Proveedor compartido, reloj y ciclo de vida
```

`package.json` y la configuración de Jest solo se modificarán tras aprobación de cualquier dependencia de prueba necesaria. No se modificarán `src/storage/` ni formatos de datos persistidos.

## Estrategia de pruebas

### Jest

- Iniciar, pausar y reanudar conservando el restante (RF-01, RF-02).
- Reiniciar confirma el tiempo inicial pausado y cancelar conserva estado y restante tanto corriendo como pausado (RF-03, RF-04).
- Un segundo inicio no duplica ni reinicia una cuenta activa (RF-06).
- Reconciliar con un reloj monotónico simulado produce el mismo restante independientemente del reloj civil (RF-05).
- Cero termina la fase y no produce valores negativos; el formato genera `MM:SS` con redondeo al segundo visible (RF-01, RF-07, RNF-01).
- El descanso arranca solo después de confirmar valor entero entre 5 y 30; rechazar 0, 4, 31, fracciones y valores no numéricos (RF-08).
- Completar el descanso ofrece acciones separadas; las transiciones vuelven a concentración iniciada o pausada con su duración inicial (RF-10, RF-11).

### Comprobación manual en Expo Go

- En vertical y horizontal: pantalla de concentración, `MM:SS`, estados y botones táctiles de al menos 44x44 puntos.
- Pausar, reanudar, iniciar de nuevo, cancelar y confirmar reinicio en las dos condiciones especificadas.
- Durante la cuenta activa, cambiar manualmente la hora y luego reanudar la app; comprobar que no salta el restante y que no depende de que los ticks se hayan ejecutado en segundo plano.
- Al terminar concentración, verificar que aparecen ambos botones; comprobar sus dos destinos.
- Descanso: reloj inicialmente en `00:00`, teclado numérico, límites 5 y 30, comienzo solo al confirmar.
- Al terminar descanso, comprobar ambos botones, duración inicial de concentración y estado iniciado/pausado según la selección.
- Verificar textos en español, áreas seguras, paleta Cotopaxi, contraste y etiquetas de accesibilidad.

## Trazabilidad de requisitos

| Requisito | Pasos | Evidencia prevista |
|---|---|---|
| RF-01 | P1.2, P1.3, P1.5 | Dominio y pantalla principal muestran cuenta desde duración configurada. |
| RF-02 | P1.2, P1.3, P1.5 | Pruebas de conservar restante al pausar y reanudar. |
| RF-03 | P1.2, P1.5 | Confirmación reinicia a la duración inicial y deja pausado. |
| RF-04 | P1.2, P1.5 | Cancelación conserva restante y estado previo. |
| RF-05 | P1.2, P1.3 | Reloj monotónico inyectado y validación manual del ajuste de hora. |
| RF-06 | P1.2, P1.5 | Inicio repetido deja intacta la cuenta activa. |
| RF-07 | P1.2, P1.6 | Llegar a cero presenta las dos acciones. |
| RF-08 | P1.2, P1.7 | Ruta de descanso inicia en cero y valida 5–30 antes de contar. |
| RF-09 | P1.6 | Volver al temporizador principal sin iniciar concentración. |
| RF-10 | P1.2, P1.8 | Fin de descanso y acción para volver con concentración iniciada. |
| RF-11 | P1.2, P1.8 | Fin de descanso y vuelta pausada con duración inicial. |
| RNF-01 | P1.2, P1.3, P1.5, P1.7 | Formateador probado y formato `MM:SS` en ambas pantallas. |

## Riesgos y bloqueos conocidos

- **Jest no está instalado ni configurado.** La primera tarea requiere aprobación antes de añadir los paquetes de desarrollo compatibles con Expo SDK 57.
- **Ajuste de reloj y suspensión:** se requiere verificar en Expo Go que el reloj monotónico de React Native conserva el tiempo transcurrido al regresar de segundo plano. Si la plataforma no satisface RF-05, detenerse y pedir una decisión antes de introducir una dependencia nativa o cambiar el alcance.
- **Ajustes de concentración:** no hay actualmente un módulo de ajustes en `src/`. En este alcance se usa el predeterminado de 25 minutos documentado en las reglas Pomodoro; conectar la pantalla de ajustes queda para HU-005.


================================================
ðŸ“„ ARCHIVO: specs\001-iniciar-temporizador\spec.md
================================================

# Spec 001 — Iniciar y controlar una sesión de estudio

Estado: implementada
HU de origen: docs/historias/HU-001.md

## Contexto y objetivo
Permitir que el estudiante inicie y controle una cuenta regresiva de estudio con el tiempo configurado, y que pueda reiniciarla de forma intencional.

## Usuarios
- Estudiante

## Historias de usuario
Como estudiante, quiero iniciar, pausar y reiniciar un temporizador de estudio, para concentrarme durante un tiempo definido.

## Definiciones
- **Tiempo restante:** duración que falta para completar la cuenta regresiva de la fase actual.
- **Tiempo inicial de la fase:** duración configurada para la fase actual antes de iniciar su cuenta regresiva.

## Requisitos funcionales
- **RF-01:** CUANDO el estudiante presione iniciar desde la pantalla principal, EL SISTEMA comenzará la cuenta regresiva con el tiempo de estudio configurado y mostrará los minutos y segundos restantes. Origen: HU-001, escenario «Iniciar el temporizador».
- **RF-02:** MIENTRAS el temporizador esté corriendo, CUANDO el estudiante lo pause, EL SISTEMA conservará el tiempo restante; CUANDO lo reanude, EL SISTEMA continuará la cuenta regresiva desde ese tiempo restante. Origen: HU-001, escenario «Pausar y continuar».
- **RF-03:** CUANDO el estudiante solicite reiniciar el temporizador mientras está corriendo o pausado, EL SISTEMA solicitará confirmación; SI confirma, EL SISTEMA restablecerá el tiempo inicial de la fase actual y dejará el temporizador pausado. Origen: HU-001, escenario «Reiniciar el temporizador»; decisiones.md, D-07.
- **RF-04:** CUANDO el estudiante solicite reiniciar el temporizador mientras está corriendo o pausado y cancele la confirmación, EL SISTEMA conservará el tiempo restante y el estado de ejecución o pausa que tenía al solicitar el reinicio. Origen: HU-001, escenario «Cambiar de opinión al reiniciar»; decisiones.md, D-04.
- **RF-05:** MIENTRAS el temporizador esté corriendo, SI cambia manualmente la hora del teléfono, EL SISTEMA conservará la cuenta según el tiempo real transcurrido, sin que el ajuste adelante o atrase el tiempo restante. Origen: decisiones.md, D-02.
- **RF-06:** MIENTRAS el temporizador esté corriendo, CUANDO el estudiante presione iniciar nuevamente, EL SISTEMA mantendrá la cuenta actual sin cambios. Origen: decisiones.md, D-01.

## Requisitos no funcionales
- **RNF-01:** EL SISTEMA presentará el tiempo restante como minutos y segundos durante la cuenta regresiva. Origen: HU-001, escenario «Iniciar el temporizador».

## Casos límite
- Si se vuelve a presionar iniciar durante una cuenta en curso, esta no debe reiniciarse ni duplicarse (RF-06).
- Al confirmar el reinicio desde cualquier estado, el temporizador queda pausado con el tiempo inicial de la fase (RF-03).
- Si se cancela el reinicio durante una cuenta en curso o pausada, se conservan el tiempo restante y el estado de ejecución o pausa (RF-04).
- Si se cambia manualmente la hora del teléfono durante una cuenta en curso, el tiempo restante no debe saltar por ese ajuste (RF-05).

## Fuera de alcance
- Lo que ocurre cuando la cuenta regresiva llega a cero y el paso entre estudio y descanso: lo definen las specs 002 (transiciones) y 004 (alarma). Los antiguos RF-07 a RF-11 de esta spec se eliminaron porque esas specs los sustituyeron.

## Criterios de finalización
- Los seis requisitos funcionales y el requisito no funcional pueden verificarse mediante los escenarios y condiciones descritos en esta especificación.
- Cada escenario de HU-001 está cubierto por al menos un requisito funcional.

## Dudas abiertas
- Ninguna.


================================================
ðŸ“„ ARCHIVO: specs\001-iniciar-temporizador\tasks.md
================================================

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


================================================
ðŸ“„ ARCHIVO: specs\002-alternar-estudio-descanso\decisiones.md
================================================

# Decisiones de HU-002: Alternar entre estudio y descanso

## D-01: Inicio del descanso al terminar el estudio

- **Pregunta:** ¿La aplicación debe iniciar automáticamente el descanso cuando termina el estudio?
- **Respuesta:** No. Deja el descanso preparado y espera a que el estudiante lo inicie.
- **Motivo:** El estudiante conserva el control de cuándo comienza cada descanso, como indican los criterios de aceptación.

## D-02: Pantalla al terminar el estudio

- **Pregunta:** ¿Se conserva la superposición de fin de estudio de HU-001 o se muestra directamente el descanso siguiente?
- **Respuesta:** Se cierra la superposición y se muestra el descanso que corresponde (corto o largo), con su duración configurada y pausado hasta que el estudiante toque «Iniciar».
- **Motivo:** La fase siguiente queda lista para iniciar, sin obligar al estudiante a elegir entre acciones redundantes.

## D-03: Pomodoros interrumpidos

- **Pregunta:** Si el estudiante reinicia o abandona un tiempo de estudio antes de que llegue a cero, ¿se cuenta como pomodoro completado?
- **Respuesta:** No. Solo se cuenta el estudio que llega a cero; pausar y reanudar no aumenta el contador.
- **Motivo:** El avance del ciclo representa tiempos de estudio completados, no intentos incompletos.

## D-04: Persistencia del progreso del ciclo

- **Pregunta:** ¿Se guarda localmente el contador de pomodoros para restaurarlo al volver a abrir la aplicación?
- **Respuesta:** Sí.
- **Motivo:** Evita perder el avance del ciclo al cerrar y reabrir la aplicación.

## D-05: Cambio de la meta de pomodoros durante un ciclo

- **Pregunta:** Si cambia la cantidad configurada de pomodoros por ciclo, ¿el cambio afecta el ciclo en curso?
- **Respuesta:** No. El ciclo actual conserva la meta con la que empezó y el nuevo valor se aplica al siguiente ciclo.
- **Motivo:** Evita que una configuración nueva altere inesperadamente un ciclo que ya está en marcha.

## D-06: Formato del contador visible

- **Pregunta:** ¿Cómo se muestra el avance y la meta del ciclo en la pantalla principal?
- **Respuesta:** Como «Pomodoros: 2/4», con completados/meta; empieza en 0/4 y vuelve a 0/4 al comenzar el descanso largo.
- **Motivo:** Muestra de forma directa el avance y cuántos pomodoros faltan para el descanso largo.

## D-07: Pantalla al terminar el descanso

- **Pregunta:** ¿Se conserva la superposición de fin de descanso de HU-001 o se muestra directamente el siguiente estudio?
- **Respuesta:** Se cierra la superposición y se muestra el estudio listo y pausado; el estudiante debe tocar «Iniciar».
- **Motivo:** Mantiene el mismo comportamiento de transición manual y evita comenzar el siguiente estudio sin una acción del estudiante.


================================================
ðŸ“„ ARCHIVO: specs\002-alternar-estudio-descanso\plan.md
================================================

# Plan: Alternar entre estudio y descanso

**Spec:** [spec.md](./spec.md)  
**Decisiones:** [decisiones.md](./decisiones.md)  
**Estado de la spec:** Aprobada

## Resumen

Extender el dominio y proveedor de temporizadores existentes para contar únicamente los estudios que terminan, preparar descansos cortos o largos en pausa, y dejar preparado el estudio al terminar el descanso. Se conservará localmente el progreso del ciclo y la meta activa. Home mostrará la fase y el progreso; la ruta de descanso conservará el editor existente, precargado con la duración correspondiente, pero editarla no iniciará la cuenta. El estudiante iniciará manualmente la fase preparada.

La configuración de la cantidad de pomodoros y de las duraciones sigue fuera de alcance (HU-005). Por ahora se usan los valores por defecto existentes; el proveedor expondrá la integración necesaria para que HU-005 suministre una nueva meta sin alterar el ciclo en curso.

## Contexto técnico

- **Lenguaje y plataforma:** TypeScript, Expo SDK 57, React Native y Expo Router.
- **Dominio existente:** `src/domain/timer.ts` ya contiene temporizadores puros, duraciones predeterminadas, cálculo de ciclo, validación del descanso y formato `MM:SS`.
- **Estado existente:** `src/hooks/use-pomodoro-timer.ts` mantiene los temporizadores, el contador, el reloj monotónico y el ciclo de vida de la app. Actualmente persiste el contador directamente con AsyncStorage y usa la meta predeterminada fija.
- **Interfaz existente:** home está en `src/app/(tabs)/index.tsx`; la fase de descanso en `src/app/descanso.tsx`. Ambas usan `StyleSheet`, áreas seguras y textos en español.
- **Persistencia:** AsyncStorage ya es dependencia. El contador se almacena como texto en `pomodoro-cotopaxi:cycle-count`; se conservará esa clave y formato. La meta activa se guardará en una clave independiente y aditiva para no modificar datos existentes.
- **Pruebas:** Jest y `jest-expo` ya están configurados. Las transiciones y el acceso a almacenamiento se prueban con Jest; las rutas, los estados visibles y la restauración en dispositivo se verifican manualmente en Expo Go.
- **Restricciones:** no añadir dependencias, pantallas de configuración ni persistencia del tiempo restante de las fases; no modificar `spec.md` ni `decisiones.md`.

## Comprobación de la constitución

| Principio | Aplicación |
|---|---|
| Simplicidad primero | Se reutilizan dominio, hook, rutas y AsyncStorage existentes; no se añaden dependencias ni navegación paralela. |
| La spec manda | Las transiciones, etiquetas y el inicio manual se limitan a RF-01–RF-08. |
| Lógica separada de interfaz | Reglas de ciclo y transiciones permanecen en `src/domain/timer.ts`; las pantallas solo presentan y envían acciones. |
| Pruebas como puerta | Pruebas Jest preceden a los cambios de lógica y cubren transiciones, metas y persistencia. |
| Los datos del usuario son sagrados | Se mantiene intacto el formato actual del contador; la meta activa usa una clave independiente. |
| Exactitud del tiempo | Se conserva el reloj monotónico y la reconciliación existentes; los intervalos no serán la fuente de verdad del tiempo. |

## Decisiones técnicas

| Decisión de producto/técnica | Aplicación | Alternativa descartada |
|---|---|---|
| D-01 y D-02 | Al terminar estudio se prepara el descanso apropiado pausado y se presenta su pantalla. Se conserva el editor 5–30 de HU-001, precargado con la duración corta/larga aplicable; confirmar una edición solo actualiza la fase preparada. Un botón explícito «Iniciar descanso» inicia la cuenta. | Iniciar el descanso al completar estudio o al confirmar la duración, eliminando la acción manual requerida por RF-08. |
| D-03 | Solo la transición de estudio en ejecución a cero incrementa el progreso. Pausar, reanudar, reiniciar o abandonar antes de cero no lo incrementa. | Incrementar al iniciar un estudio o al abrir la pantalla de descanso. |
| D-04 | Mantener la clave y el valor textual del contador; persistir la meta activa en una clave separada. La hidratación debe completarse antes de guardar estado inicial para no sobrescribir el progreso guardado con cero. | Reemplazar el valor existente por un objeto serializado o escribir el valor inicial antes de leer el almacenamiento. |
| D-05 | Mantener una meta activa por ciclo y aceptar cambios de configuración como una meta pendiente. Aplicar el nuevo valor al comenzar el siguiente ciclo de estudio después del descanso largo; conservar la meta activa durante el ciclo actual y su descanso largo. El punto de integración recibe la futura configuración de HU-005; no se añade aquí su interfaz. | Cambiar la meta visible o el umbral del ciclo en curso inmediatamente. |
| D-06 | Home muestra la fase actual y «Pomodoros: X/Y» usando el contador y la meta activa. | Mostrar una meta fija o inferir la fase únicamente del temporizador de estudio. |
| D-07 | Al terminar el descanso se cierra el flujo de descanso y se presenta home con estudio pausado y duración inicial. No se presenta una elección que inicie automáticamente el estudio. | Mantener el diálogo de fin de HU-001 con opción de iniciar estudio directamente. |
| D-01, D-02 y RF-08 | Iniciar una fase preparada reutiliza su temporizador pausado y su tiempo restante; no crea otro temporizador ni reinicia su duración al tocar «Iniciar». | Crear un temporizador nuevo en cada toque o adelantar la cuenta al preparar la fase. |

## Plan de implementación

### P1.1 — Transiciones puras de ciclo

- **Requisitos:** RF-01, RF-02, RF-03, RF-05, RF-08.
- **Archivos:** modificar `src/domain/timer.ts`; ampliar `src/domain/__tests__/timer.test.ts`.
- **Descripción:** extraer o ampliar funciones puras para completar un estudio solo al llegar a cero, seleccionar descanso corto/largo y preparar cada fase pausada con su duración. Preparar el estudio pausado al concluir un descanso. Iniciar una fase preparada desde el mismo estado debe conservar su duración inicial. Hacer explícita la transición de terminado una sola vez para evitar contar de nuevo en reconciliaciones posteriores.

### P1.2 — Meta activa y cambio diferido

- **Requisitos:** RF-02, RF-04, RF-07.
- **Archivos:** modificar `src/domain/timer.ts`; ampliar `src/domain/__tests__/timer.test.ts`.
- **Descripción:** modelar por separado la meta del ciclo activo y la nueva meta configurada. Durante un ciclo en curso, conservar la primera y aplicar la nueva al empezar el ciclo de estudio siguiente. Validar metas enteras positivas conforme a la configuración existente, sin agregar controles de configuración. Asegurar que el progreso mostrado y el tipo de descanso se derivan de la meta activa.

### P2.1 — Persistencia del progreso del ciclo

- **Requisitos:** RF-06, RF-07, RNF-02.
- **Archivos:** crear `src/storage/pomodoro-cycle-storage.ts` y `src/storage/__tests__/pomodoro-cycle-storage.test.ts`.
- **Descripción:** encapsular la lectura y escritura del contador y la meta activa con AsyncStorage. Mantener `pomodoro-cotopaxi:cycle-count` como cadena numérica; usar una clave adicional para la meta activa. Tratar de forma explícita valores inválidos y errores de almacenamiento, sin ocultarlos.

### P2.2 — Orquestación del estado y restauración

- **Requisitos:** RF-01 a RF-08, RNF-02.
- **Archivos:** modificar `src/hooks/use-pomodoro-timer.ts`.
- **Descripción:** conectar las transiciones puras y el almacenamiento. Restaurar el progreso antes de persistir cambios; evitar efectos secundarios dentro de actualizadores de estado de React. Reconciliar al volver a primer plano, procesar una sola vez cada fin de fase, preparar el descanso correcto o el estudio siguiente y exponer el estado de fase/meta y las acciones de inicio manual. Proporcionar el punto de integración para recibir cambios futuros de configuración sin añadir la interfaz de HU-005. Registrar explícitamente errores de almacenamiento en el límite del proveedor.

### P3.1 — Estado de ciclo en home

- **Requisitos:** RF-01, RF-02, RF-04, RF-05, RF-06, RF-07; RNF-01, RNF-02.
- **Archivos:** modificar `src/app/(tabs)/index.tsx`.
- **Descripción:** mostrar la fase actual y «Pomodoros: X/Y» con la meta activa. Al completarse estudio, abandonar la superposición de fin de HU-001 y presentar el descanso corto/largo preparado conforme a D-02. Mantener el contador sin cambios si el estudio se reinicia antes de cero.

### P3.2 — Flujo manual de descanso y retorno al estudio

- **Requisitos:** RF-01, RF-02, RF-03, RF-04, RF-08; RNF-01.
- **Archivos:** modificar `src/app/descanso.tsx` y, si la navegación de fin de fase lo requiere, `src/app/(tabs)/index.tsx`.
- **Descripción:** identificar el descanso como corto o largo y mostrar su duración preparada en pausa. Conservar el editor 5–30 existente, precargado con el valor configurado; confirmar cambios mantiene la fase pausada y un control separado la inicia. Cuando el descanso termine, dejar preparado el estudio inicial pausado y volver a home sin ofrecer inicio automático. Mostrar progreso conforme a la meta activa cuando se presente en home.

### P4.1 — Verificación de la historia completa

- **Requisitos:** RF-01 a RF-08; RNF-01, RNF-02.
- **Archivos:** pruebas en `src/domain/__tests__/timer.test.ts` y `src/storage/__tests__/pomodoro-cycle-storage.test.ts`; validación manual de `src/app/(tabs)/index.tsx` y `src/app/descanso.tsx`.
- **Descripción:** ejecutar Jest, lint y TypeScript, y verificar manualmente transiciones, navegación, persistencia y presentación en Expo Go conforme a la lista de la sección de pruebas.

## Archivos y responsabilidades

| Archivo | Cambio | Responsabilidad |
|---|---|---|
| `src/domain/timer.ts` | Modificar | Reglas puras de conteo, meta del ciclo, elección de descanso y preparación/inicio de fases. |
| `src/domain/__tests__/timer.test.ts` | Modificar | Casos límite y transiciones deterministas del ciclo. |
| `src/storage/pomodoro-cycle-storage.ts` | Crear | Persistir/restaurar contador y meta activa con AsyncStorage, manteniendo intacto el formato del contador existente. |
| `src/storage/__tests__/pomodoro-cycle-storage.test.ts` | Crear | Verificar lectura, escritura, compatibilidad con datos guardados actuales y errores de almacenamiento. |
| `src/hooks/use-pomodoro-timer.ts` | Modificar | Hidratación, reconciliación, coordinación idempotente y API de contexto para el ciclo. |
| `src/app/(tabs)/index.tsx` | Modificar | Fase actual, avance del ciclo y transición visual al descanso preparado. |
| `src/app/descanso.tsx` | Modificar | Tipo/duración del descanso, edición sin inicio automático, inicio explícito y retorno al estudio pausado. |
| `MEMORY.md` | Actualizar al concluir | Actualizar únicamente «Estado actual» y «Próximos pasos», según el flujo SDD. |

## Lógica pura y algoritmo

Las funciones de `src/domain/timer.ts` recibirán temporizadores, metas y marcas temporales como argumentos; no leerán React, AsyncStorage ni el reloj global. Reutilizarán el estado y las utilidades existentes cuando sea posible.

```text
al reconciliar estudio:
    si la transición no es de running a finished: conservar contador y fase siguiente
    si el estudio llega a cero:
        incrementar completados usando la meta activa
        si se alcanza la meta activa:
            contador = 0
            preparar descanso largo pausado con duración larga configurada
        si no:
            guardar nuevo contador
            preparar descanso corto pausado con duración corta configurada

al editar duración de descanso:
    validar minutos enteros entre 5 y 30
    actualizar duración inicial y restante de la fase preparada
    conservar status = paused

al iniciar fase preparada:
    llamar la transición de inicio sobre esa misma fase, con now
    conservar remainingMs; no crear ni reiniciar el temporizador

al terminar descanso y volver a la app:
    preparar estudio pausado con su duración inicial configurada
    si se inicia un nuevo ciclo después del descanso largo:
        activar la meta configurada más reciente
    presentar home sin iniciar el estudio

al cambiar la meta configurada:
    si el ciclo actual tiene progreso: conservar su meta activa y registrar la nueva
    si empieza un ciclo nuevo: activar la meta configurada más reciente
```

La detección del fin se apoya en `reconcileTimer` y el reloj monotónico del hook existente. Pausar, reanudar o reiniciar no produce una transición de estudio completado.

## Interfaz

- Home presentará «Estudio» o el estado pertinente de fase y el avance «Pomodoros: X/Y», con texto legible además del color.
- Tras completar estudio, se mostrará la pantalla de descanso correspondiente ya pausada; se cerrará la superposición de fin de estudio de HU-001.
- Descanso corto/largo tendrá etiqueta y duración inicial configurada. El editor existente se mantiene y acepta el rango ya establecido de 5–30 minutos; editar/confirmar no inicia la cuenta. El botón «Iniciar descanso» será la acción explícita.
- Al finalizar el descanso, se presentará home con estudio pausado y la duración inicial disponible; no se mantendrá una opción de inicio automático desde el diálogo anterior.
- Aplicar las convenciones existentes: textos en español, `StyleSheet`, `SafeAreaView`, áreas táctiles de al menos 44×44 puntos, accesibilidad y visualización en orientación vertical y horizontal.

## Estrategia de pruebas

### Jest — dominio

- Completar estudio hasta cero prepara descanso corto antes de la meta y largo al alcanzarla; solo el largo reinicia el contador (RF-01, RF-02).
- Pausa, reanudación y reinicio antes de cero no alteran el contador; reconciliar repetidamente una fase terminada no lo incrementa otra vez (RF-05).
- Completar descanso prepara estudio pausado con duración inicial (RF-03).
- Actualizar una duración preparada mantiene la fase pausada; iniciar usa la duración restante/inicial preparada sin duplicarla ni adelantarla (RF-08).
- La meta activa no cambia durante un ciclo en curso y la nueva meta se activa al empezar el siguiente ciclo (RF-07).
- Formato visible de fase y ciclo usa contador y meta activa (RF-04, RNF-01).

### Jest — almacenamiento

- Guardar y restaurar el contador como cadena en la clave existente; restaurar la meta activa en su clave adicional (RF-06, RF-07, RNF-02).
- Mantener compatibilidad con contador guardado antes de este cambio.
- Rechazar o reportar valores inválidos y propagar/reportar errores de lectura y escritura; verificar que la hidratación no se sobrescribe con el valor inicial.

### Comprobación manual en Expo Go

- Completar un estudio antes de la meta: se presenta descanso corto pausado; en la meta, descanso largo y contador reiniciado.
- Reiniciar o pausar/reanudar estudio: no aumenta el progreso.
- Confirmar la duración sugerida o editarla: la cuenta permanece pausada hasta tocar «Iniciar descanso».
- Completar ambos tipos de descanso y volver a home: estudio pausado y listo, sin inicio automático.
- Cerrar y abrir la aplicación: contador recuperado; comprobar meta visible y siguiente transición.
- Revisar textos de fase, formato «Pomodoros: X/Y», accesibilidad, áreas seguras y orientación vertical/horizontal según `rn-conventions`.

## Trazabilidad

| Requisito | Plan | Evidencia prevista |
|---|---|---|
| RF-01 | P1.1, P2.2, P3.1, P3.2 | Transición de estudio a descanso corto preparado y presentación pausada. |
| RF-02 | P1.1, P1.2, P2.2, P3.1, P3.2 | Descanso largo al alcanzar la meta y contador reiniciado. |
| RF-03 | P1.1, P2.2, P3.2 | Fin del descanso prepara estudio con duración inicial y pausa. |
| RF-04 | P1.2, P2.2, P3.1, P3.2 | Fase actual y formato «Pomodoros: X/Y» usando la meta activa. |
| RF-05 | P1.1, P2.2, P3.1 | Pruebas de reinicio/pausa y transición de fin única. |
| RF-06 | P2.1, P2.2, P3.1 | Restauración local del contador al abrir la app. |
| RF-07 | P1.2, P2.1, P2.2, P3.1 | Meta activa estable durante el ciclo y nueva meta aplicada al siguiente. |
| RF-08 | P1.1, P2.2, P3.2 | Inicio manual de temporizador preparado sin reiniciar su duración. |
| RNF-01 | P3.1, P3.2, P4.1 | Etiqueta legible de fase y avance del ciclo. |
| RNF-02 | P2.1, P2.2, P4.1 | Contador guardado y recuperado localmente sin cambiar el formato existente. |

## Riesgos y límites

- HU-005 aún no existe; esta historia no incorpora una pantalla para cambiar metas o tiempos. Se conserva el valor por defecto y se prepara un punto de integración para la configuración futura.
- La restauración del contador y de la meta activa debe finalizar antes de guardar progreso; de lo contrario, el valor inicial podría reemplazar el dato local existente.
- Las transiciones de finalización ocurren dentro del proveedor compartido y deben ser idempotentes para evitar duplicar el contador durante ticks o al reanudar la app.


================================================
ðŸ“„ ARCHIVO: specs\002-alternar-estudio-descanso\spec.md
================================================

# Spec 002 — Alternar entre estudio y descanso

Estado: implementada
HU de origen: docs/historias/HU-002.md

## Contexto y objetivo
Permitir que la aplicación pase de una fase de estudio a la siguiente fase de descanso o de regreso al estudio, según el avance del ciclo de pomodoros, sin que el estudiante tenga que llevar la cuenta manualmente. La aplicación debe mantener el progreso del ciclo y dejar la fase siguiente lista para iniciarse de forma explícita.

## Usuarios
- Estudiante

## Historias de usuario
Como estudiante, quiero que la aplicación pase sola del tiempo de estudio al de descanso, para seguir la técnica Pomodoro sin tener que llevar la cuenta yo mismo.

## Definiciones
- **Pomodoro completado:** un bloque de estudio que llega a cero sin reinicio ni abandono previo.
- **Ciclo de pomodoros:** cantidad de bloques de estudio que deben completarse antes de un descanso largo. Por defecto, cuatro.
- **Descanso corto:** pausa breve que se prepara cuando aún no se alcanza la meta del ciclo.
- **Descanso largo:** pausa más larga que se prepara al completar el ciclo actual.
- **Tiempo restante:** duración que falta para completar la fase actual.
- **Fase siguiente lista:** una fase (descanso o estudio) queda preparada, con su duración configurada y en estado pausado, esperando que el estudiante la inicie.

## Requisitos funcionales
- **RF-01:** CUANDO el temporizador de estudio llegue a cero y todavía no se haya completado la cantidad necesaria de pomodoros para el descanso largo, EL SISTEMA dejará listo un descanso corto con la duración configurada y en estado pausado para que el estudiante lo inicie. Origen: HU-002, escenario «Terminar un pomodoro»; decisiones.md, D-01 y D-02.
- **RF-02:** CUANDO el temporizador de estudio llegue a cero y se haya completado la cantidad configurada de pomodoros para el descanso largo, EL SISTEMA dejará listo un descanso largo con la duración configurada y en estado pausado; además, EL SISTEMA devolverá el contador de pomodoros a cero. Origen: HU-002, escenario «Llegar al descanso largo»; decisiones.md, D-02 y D-06.
- **RF-03:** CUANDO termine un descanso corto o largo, Y el estudiante vuelva a la aplicación, EL SISTEMA dejará listo el siguiente tiempo de estudio con su duración configurada y en estado pausado, para que el estudiante lo inicie. Origen: HU-002, escenario «Terminar un descanso»; decisiones.md, D-07.
- **RF-04:** EN la pantalla principal, MIENTRAS la sesión esté activa, EL SISTEMA mostrará el estado actual de estudio o descanso y el avance del ciclo como «Pomodoros: X/Y», con el número de pomodoros completados y la meta del ciclo actual. Origen: HU-002, escenario «Ver mi avance»; decisiones.md, D-06.
- **RF-05:** CUANDO el estudiante reinicie o abandone un tiempo de estudio antes de llegar a cero, EL SISTEMA NO incrementará el contador de pomodoros ni considerará ese intento como un pomodoro completado. Origen: HU-002, escenario «Terminar un pomodoro»; decisiones.md, D-03.
- **RF-06:** CUANDO el estudiante cierre y vuelva a abrir la aplicación, EL SISTEMA restaurará el contador de pomodoros del ciclo actual desde su última sesión guardada localmente. Origen: HU-002, escenario «Ver mi avance»; decisiones.md, D-04.
- **RF-07:** SI durante un ciclo en curso el estudiante cambia la cantidad configurada de pomodoros por ciclo, EL SISTEMA conservará la meta que ya estaba activa para ese ciclo y aplicará la nueva meta solo al siguiente ciclo. Origen: HU-002, escenario «Ver mi avance»; decisiones.md, D-05.
- **RF-08:** CUANDO el estudiante inicia manualmente la fase siguiente preparada, EL SISTEMA comenzará la cuenta regresiva con la duración correspondiente y sin duplicar ni adelantar su tiempo inicial. Origen: HU-002, decisiones.md, D-01 y D-02.

## Requisitos no funcionales
- **RNF-01:** La pantalla principal debe mostrar de forma clara si la fase actual es estudio o descanso y el avance del ciclo mediante el formato recomendado «Pomodoros: X/Y». Origen: HU-002, escenario «Ver mi avance»; decisiones.md, D-06.
- **RNF-02:** El progreso del ciclo debe persistirse localmente para conservarse al cerrar y abrir la aplicación. Origen: decisiones.md, D-04.

## Casos límite
- Si el estudiante reinicia el tiempo de estudio antes de llegar a cero, no debe sumarse al contador del ciclo (RF-05).
- Si el estudiante pausa y reanuda un tiempo de estudio sin terminarlo, el contador no debe avanzar (RF-05).
- Si un ciclo llega a la meta configurada, la siguiente etapa preparada será un descanso largo y el contador volverá a cero (RF-02).
- Si la meta de pomodoros se cambia mientras un ciclo ya está en marcha, la meta actual no se altera (RF-07).
- Si el estudiante vuelve a la app después de terminar un descanso, la siguiente fase de estudio queda lista y pausada (RF-03).
- Si el estudiante reabre la app tras cerrar la sesión, el contador del ciclo se recupera desde el valor guardado (RF-06).
- Si la aplicación muestra el descanso siguiente, este debe quedar preparado y sin arrancar automáticamente hasta que el estudiante lo inicie (RF-01, RF-02, RF-03).

## Fuera de alcance
- La lógica de notificaciones push o alarmas del sistema fuera del flujo de estudio/descanso del Pomodoro.
- La configuración de tiempos de estudio y descanso detallada, que corresponde a HU-005.
- La automatización del inicio del descanso sin la confirmación del estudiante.

## Criterios de finalización
- Los requisitos funcionales RF-01 a RF-08 y los requisitos no funcionales RNF-01 y RNF-02 pueden verificarse con los escenarios descritos en esta especificación.
- Cada escenario de HU-002 está cubierto por al menos un requisito funcional.

## Dudas abiertas
- Ninguna.

## Requisitos modificados por specs posteriores
- **RF-07:** se conserva, con una excepción: si la nueva meta es menor o igual que los pomodoros ya completados, el descanso largo llega al terminar el siguiente estudio (spec 005, RF-06 y RF-12).


================================================
ðŸ“„ ARCHIVO: specs\002-alternar-estudio-descanso\tasks.md
================================================

# Tareas: Alternar entre estudio y descanso

Ejecutar en orden de dependencias. Las tareas de lógica comienzan con pruebas Jest; las tareas de interfaz requieren la comprobación manual indicada en `rn-conventions` antes de marcarlas como hechas.

- [x] **T1. Probar y preparar el descanso al completar estudio.** RF-01, RF-02, RF-05
  - Hecho cuando: `src/domain/__tests__/timer.test.ts` verifica que solo al llegar a cero se cuenta el estudio y se prepara en pausa el descanso corto o largo correcto; pausar o reiniciar antes de cero no incrementa el contador; `npx jest` pasa.

- [x] **T2. Probar el fin del descanso y el inicio de fases preparadas.** RF-03, RF-08
  - Hecho cuando: `src/domain/__tests__/timer.test.ts` verifica que terminar un descanso prepara estudio pausado y que iniciar descanso/estudio usa la fase preparada sin duplicar ni adelantar su tiempo; `npx jest` pasa.

- [x] **T3. Añadir soporte probado para la meta activa y la meta diferida.** RF-02, RF-04, RF-07
  - Hecho cuando: las pruebas de `src/domain/__tests__/timer.test.ts` demuestran que una nueva meta no cambia el ciclo en curso, se activa en el siguiente ciclo y el progreso/descanso se calcula con la meta activa; `npx jest` pasa.

- [x] **T4. Encapsular y probar la persistencia del ciclo.** RF-06, RF-07, RNF-02
  - Hecho cuando: `src/storage/pomodoro-cycle-storage.ts` mantiene la clave y el valor textual actual del contador y almacena la meta activa en una clave separada; `src/storage/__tests__/pomodoro-cycle-storage.test.ts` verifica restauración, compatibilidad, valores inválidos y errores con Jest.

- [x] **T5. Integrar restauración, transiciones y persistencia en el proveedor.** RF-01–RF-08, RNF-02
  - Hecho cuando: `src/hooks/use-pomodoro-timer.ts` hidrata antes de persistir, procesa cada fin una sola vez, usa las transiciones puras y expone fase/meta y acciones manuales; los errores de almacenamiento se reportan explícitamente y `npx jest` pasa.

- [x] **T6. Actualizar home con fase, avance y transición al descanso.** RF-01, RF-02, RF-04, RF-05, RF-06, RF-07; RNF-01, RNF-02
  - Hecho cuando: `src/app/(tabs)/index.tsx` muestra fase y «Pomodoros: X/Y» con la meta activa y, al completar estudio, presenta el descanso preparado sin la superposición de fin de HU-001. Verificar la lista manual de interfaz en Expo Go.

- [x] **T7. Actualizar descanso preparado y retorno al estudio pausado.** RF-01, RF-02, RF-03, RF-04, RF-08; RNF-01
  - Hecho cuando: `src/app/descanso.tsx` identifica descanso corto/largo, precarga la duración, conserva el editor 5–30 sin iniciar al confirmar cambios, inicia solo al tocar «Iniciar descanso» y vuelve a home con estudio pausado al terminar. Verificar la lista manual de interfaz en Expo Go.

- [x] **T8. Ejecutar validación automatizada de la implementación.** RF-01–RF-08; RNF-01, RNF-02
  - Hecho cuando: pasan `npx jest`, `npx expo lint` y `npx tsc --noEmit`, sin errores nuevos relacionados con los cambios.

- [x] **T9. Verificar manualmente los flujos y actualizar la memoria SDD.** RF-01–RF-08; RNF-01, RNF-02
  - Hecho cuando: en Expo Go se comprueban estudio corto/largo, reinicio, persistencia, inicio manual del descanso y retorno al estudio pausado usando la lista de `rn-conventions`; se actualizan únicamente «Estado actual» y «Próximos pasos» en `MEMORY.md`.


================================================
ðŸ“„ ARCHIVO: specs\003-background-timer\decisiones.md
================================================

# Decisiones de HU-003: Mantener el conteo con el celular bloqueado o la app cerrada

## D-01: Aviso al terminar con la app cerrada

- **Pregunta:** Cuando el temporizador termine mientras la app está cerrada, ¿cómo se entera el estudiante?
- **Respuesta:** Mediante una notificación del sistema; al volver a abrir la app, se muestra el estado resultante de la fase.
- **Motivo:** El estudiante debe recibir el aviso de fin aunque no tenga la aplicación abierta.

## D-02: Uso sin permiso de notificaciones

- **Pregunta:** ¿Qué debe ocurrir si el sistema no permite mostrar notificaciones?
- **Respuesta:** El temporizador funciona normalmente y, al volver a abrir la app, muestra la fase terminada aunque no se haya recibido una notificación.
- **Motivo:** La falta de permiso no debe impedir estudiar ni perder el estado final de la fase.

## D-03: Momento para solicitar permiso

- **Pregunta:** ¿Cuándo se solicita permiso para enviar notificaciones?
- **Respuesta:** Al iniciar la primera sesión, con una explicación breve de que permite avisar al terminar con la app cerrada. Si se deniega, la sesión comienza de todos modos.
- **Motivo:** Solicitar el permiso cuando su utilidad es clara y mantener el uso del temporizador voluntario.

## D-04: Transición después de vencer una fase en segundo plano

- **Pregunta:** Al reabrir después de que una fase venció con la app cerrada, ¿se conserva una pantalla de fin o se aplica el flujo definido en HU-002?
- **Respuesta:** Se aplica la transición de HU-002: el estudio completado se cuenta y se deja preparada la fase siguiente pausada; si terminó el descanso, se prepara el estudio pausado.
- **Motivo:** Mantener consistentes las transiciones del ciclo sin iniciar la fase siguiente automáticamente.

## D-05: Aviso pendiente tras pausar o reiniciar

- **Pregunta:** ¿Qué ocurre con el aviso programado si el estudiante pausa o reinicia antes del vencimiento?
- **Respuesta:** Se cancela el aviso pendiente. Al reanudar, se programa un aviso para el nuevo vencimiento.
- **Motivo:** Evitar notificaciones obsoletas y avisar únicamente cuando la cuenta realmente termina.

## D-06: Contenido y acción de la notificación

- **Pregunta:** ¿Qué debe indicar la notificación y qué ocurre al tocarla?
- **Respuesta:** Indica qué fase terminó («Estudio terminado» o «Descanso terminado») y al tocarla abre la app mostrando la fase siguiente preparada y pausada.
- **Motivo:** Dar contexto al aviso y permitir volver directamente al estado actual del temporizador.

## D-07: Vencimiento con la app visible

- **Pregunta:** ¿Debe mostrarse una notificación del sistema si el temporizador termina mientras la app está abierta y visible?
- **Respuesta:** No; se muestra únicamente la transición visual dentro de la app.
- **Motivo:** Evitar duplicar el aviso cuando el estudiante ya ve el cambio de fase.

## D-08: Error al restaurar el estado guardado

- **Pregunta:** ¿Qué debe ocurrir si no se puede leer el estado guardado del temporizador?
- **Respuesta:** Se informa claramente del error, se deja el temporizador pausado y se permite al estudiante reiniciarlo manualmente.
- **Motivo:** No presentar una sesión nueva como si se hubiera recuperado correctamente y dejar al estudiante decidir cómo continuar.


================================================
ðŸ“„ ARCHIVO: specs\003-background-timer\plan.md
================================================

# Plan: Mantener el conteo con el celular bloqueado o la app cerrada

**Spec:** [spec.md](./spec.md)  
**Decisiones:** [decisiones.md](./decisiones.md)  
**Estado de la spec:** Aprobada

## Resumen

Extender el dominio, el almacenamiento y el proveedor de temporizadores existentes para restaurar la fase activa y su tiempo restante después de suspender o cerrar la aplicación. Se mantiene `performance.now()` como fuente de tiempo mientras el proceso está vivo; el estado persistido incluye una fecha de vencimiento basada en `Date.now()` para poder calcular el tiempo transcurrido tras reiniciar el proceso. La elección de usar hora civil al restaurar después de cerrar la app fue confirmada por el usuario durante la planificación; esto implica una excepción a HU-001, D-02, únicamente para restauraciones entre procesos.

Se programará una notificación local para la fecha de vencimiento cada vez que una fase se inicie o reanude. Al pausar o reiniciar se cancelará; al volver a primer plano el temporizador se reconciliará y la notificación no se presentará mientras la app esté visible. La transición de ciclo ya existente se reutilizará al detectar vencimientos durante la restauración.

La spec requiere una dependencia para notificaciones locales y un nuevo registro de sesión en AsyncStorage. Antes de instalarlos o crear ese nuevo formato de almacenamiento, se debe pedir aprobación explícita al usuario, según las instrucciones del proyecto. La planificación no instala dependencias ni cambia la spec o las decisiones.

## Contexto técnico

- **Lenguaje y plataforma:** TypeScript, Expo SDK 57, React Native 0.86 y Expo Router.
- **Dominio actual:** `src/domain/timer.ts` contiene las transiciones puras de estudio/descanso y usa una marca de tiempo inyectada. El hook actual usa `performance.now()` y `AppState` para reconciliar el temporizador mientras el proceso sigue activo.
- **Proveedor:** `src/hooks/use-pomodoro-timer.ts` conserva las fases y el ciclo en memoria; actualmente solo hidrata y persiste el progreso del ciclo, no el estado completo del temporizador.
- **Persistencia existente:** `src/storage/pomodoro-cycle-storage.ts` guarda el contador como texto en `pomodoro-cotopaxi:cycle-count` y la meta activa en una clave separada. Se conservarán ambas claves y formatos sin modificación.
- **Persistencia nueva propuesta:** una clave aditiva versionada contendrá la fase, temporizadores, tipo de descanso, ciclo, estado y vencimiento epoch de la fase activa. Se usará un solo snapshot para poder restaurar un ciclo coherente y distinguir pausado de corriendo. El nuevo formato requiere aprobación previa.
- **Notificaciones:** la documentación de [Expo SDK 57 Notifications](https://docs.expo.dev/versions/v57.0.0/sdk/notifications.md) confirma que `expo-notifications` admite notificaciones locales programadas y que estas están disponibles en Expo Go. Se usará `npx expo install expo-notifications`, solo tras obtener aprobación; no se usarán notificaciones push ni backend.
- **Permisos:** antes del primer inicio se presentará una explicación breve y se solicitará permiso. La denegación, la indisponibilidad de la API o la falta de permiso no bloquearán el temporizador.
- **Pruebas:** Jest y `jest-expo` ya están configurados. Las funciones de reloj, transiciones, persistencia y coordinación de notificaciones se probarán con reloj falso y módulos nativos simulados. El flujo de ciclo de vida y notificaciones se comprobará también manualmente en dispositivo con Expo Go.
- **Restricciones:** conservar las reglas y transiciones de HU-002; no iniciar automáticamente la fase siguiente; no añadir backend, cuentas ni dependencias distintas de la dependencia de notificaciones aprobada; no modificar el formato guardado existente del contador.

## Comprobación de la constitución

| Principio | Aplicación |
|---|---|
| Simplicidad primero | Reutilizar el dominio, AsyncStorage, Expo Router y el proveedor actual. La única dependencia nueva sería `expo-notifications`, justificada por RF-03 y aprobada antes de instalarla. |
| La spec manda | Cubrir únicamente RF-01–RF-10 y RNF-01–RNF-02; conservar las transiciones HU-002 y el inicio manual de la fase siguiente. |
| Lógica separada de interfaz | Las funciones de cálculo y restauración quedan en `src/domain/timer.ts`; las pantallas no calculan el tiempo ni manipulan AsyncStorage. |
| Pruebas como puerta | Añadir pruebas Jest de dominio, almacenamiento y servicio de notificaciones; completar las verificaciones manuales indicadas por `rn-conventions`. |
| Los datos del usuario son sagrados | Mantener las claves y valores existentes. El snapshot de sesión será aditivo y versionado; pedir aprobación antes de introducirlo. |
| Exactitud del tiempo | Usar reloj monotónico mientras vive el proceso. Para restaurar después de cerrarlo, usar el vencimiento epoch persistido y `Date.now()`, opción autorizada por el usuario aunque un cambio manual del reloj durante el cierre afecte el tiempo restaurado (HU-001, D-02). |

## Decisiones técnicas

| Decisión | Aplicación | Alternativa descartada |
|---|---|---|
| D-01, D-02 y D-06 | Programar una notificación local de una sola vez al iniciar o reanudar la fase, con título según estudio/descanso. Al tocarla, el sistema abre la app y la hidratación aplica la transición ya vencida antes de mostrar la fase siguiente preparada y pausada. | Depender de que JavaScript continúe ejecutándose en segundo plano para crear el aviso al llegar a cero. |
| D-03 y D-04 | Solicitar permiso con explicación solo al iniciar la primera sesión; la denegación no detiene el inicio. Al restaurar una fase vencida, ejecutar las transiciones puras de HU-002 una sola vez. | Bloquear el inicio hasta aceptar permisos o conservar una pantalla de fin distinta a la transición de HU-002. |
| D-05 | Cancelar el identificador de notificación de la fase anterior al pausar o reiniciar; al reanudar programar una notificación para el vencimiento nuevo. | Mantener avisos antiguos o cancelar todas las notificaciones de la aplicación sin distinguir la fase activa. |
| D-07 | Mantener instalado un handler que no presente avisos locales cuando la app está visible; la transición visible continúa dentro de la app. | Mostrar una notificación del sistema además de la transición visual. |
| D-08 | Si falla la lectura o validación del snapshot, exponer el error claramente, no hidratar como si la sesión fuera nueva y mantener pausado el estado recuperable. Permitir una acción explícita para iniciar una sesión nueva. | Ocultar el error, sobrescribir inmediatamente el registro o presentar valores predeterminados como si fueran una restauración correcta. |
| Elección del usuario durante esta planificación; HU-001, D-02 | Guardar un vencimiento epoch para restaurar sesiones tras terminar el proceso; mantener `performance.now()` para el cálculo mientras el proceso permanece vivo. Un ajuste manual del reloj durante el cierre puede cambiar el tiempo restante restaurado. | Construir un módulo nativo de reloj monotónico persistente, que no forma parte de la elección autorizada y requeriría más alcance/plataforma. |
| RNF-02 y protección de datos existentes | Usar una clave JSON nueva con versión de esquema para el snapshot completo; conservar intactas las claves existentes de ciclo y su compatibilidad. Pedir aprobación antes de escribir el nuevo formato. | Reemplazar el contenido textual existente del contador por un objeto serializado. |

## Archivos y responsabilidades

| Archivo | Cambio previsto | Responsabilidad |
|---|---|---|
| `src/domain/timer.ts` | Modificar | Añadir funciones puras para restaurar/reconciliar una fase corriendo desde su vencimiento epoch y detectar una transición vencida una sola vez. Conservar las funciones y reglas actuales. |
| `src/domain/__tests__/timer.test.ts` | Modificar | Probar restauración antes y después del vencimiento, fase pausada, duración cero, cambio de fase y transición idempotente con reloj determinista. |
| `src/storage/pomodoro-session-storage.ts` | Crear, tras aprobación del formato | Validar y leer/escribir el snapshot versionado de toda la sesión; propagar errores de almacenamiento y datos inválidos. |
| `src/storage/__tests__/pomodoro-session-storage.test.ts` | Crear | Probar round-trip, valores inválidos, versiones no soportadas y fallos de lectura/escritura con AsyncStorage simulado. |
| `src/notifications/pomodoro-notifications.ts` | Crear, tras aprobación e instalación de la dependencia | Encapsular solicitud/lectura de permisos, programación/cancelación de una notificación local identificable por fase, handler de primer plano y datos de fase. |
| `src/notifications/__tests__/pomodoro-notifications.test.ts` | Crear | Simular Expo Notifications y comprobar permisos concedidos/denegados, programación, cancelación y contenido según fase. |
| `src/hooks/use-pomodoro-timer.ts` | Modificar | Hidratar el snapshot antes de persistir, restaurar con hora civil, reconciliar fases en primer plano, serializar persistencia, orquestar notificaciones, cancelar al pausar/reiniciar y exponer errores/recuperación. |
| `src/app/_layout.tsx` | Modificar | Mantener el proveedor y conectar el manejo de interacciones de notificación con la apertura de la app y la restauración del estado. |
| `src/app/(tabs)/index.tsx` | Modificar | Explicar y solicitar permiso antes del primer inicio, permitir iniciar aunque se deniegue y presentar explícitamente errores de restauración/recuperación. |
| `src/app/descanso.tsx` | Modificar | Añadir controles de pausa, reanudación y reinicio para una fase en curso; conservar el editor y el inicio manual de HU-002. |
| `MEMORY.md` | Actualizar al concluir | Modificar únicamente «Estado actual» y «Próximos pasos». |

## Funciones puras y persistencia

Las funciones nuevas de `src/domain/timer.ts` recibirán como argumentos el estado de temporizadores/ciclo, el vencimiento persistido y la hora actual. No leerán `Date.now()`, React Native, AsyncStorage ni Expo Notifications. El proveedor convertirá relojes globales a argumentos al invocar el dominio.

El snapshot versionado propuesto incluirá:

- `schemaVersion`;
- `focusTimer` y `breakTimer`, conservando fase, estado, duración inicial y restante;
- `breakType` y estado del ciclo Pomodoro;
- `expiresAtEpochMs` para la fase corriendo, o `null` cuando esté pausada;
- identificador de la notificación pendiente, o `null`.

No se almacenará una nueva fase como corriendo sin un vencimiento válido. Al guardar una fase pausada, se conservará el restante y se pondrá `expiresAtEpochMs` en `null`. Este snapshot se guarda en una clave nueva; las claves actuales del ciclo permanecen intactas.

## Algoritmo de restauración y vencimiento

```text
al iniciar o reanudar una fase:
    comprobar si es la primera sesión; explicar y solicitar permiso si aplica
    iniciar la transición pura con performance.now()
    guardar el snapshot con expiresAtEpochMs = Date.now() + tiempo_restante
    si hay permiso:
        programar notificación local para expiresAtEpochMs y guardar su identificador

al pausar o reiniciar una fase:
    reconciliar el restante usando performance.now() mientras el proceso sigue vivo
    cancelar la notificación pendiente de esa fase
    guardar fase pausada, restante reconciliado, expiresAtEpochMs = null

al hidratar:
    leer y validar el snapshot antes de persistir cualquier estado inicial
    si no existe snapshot:
        hidratar la sesión inicial compatible y pausada
    si el snapshot está pausado:
        restaurar fase y restante sin programar aviso
    si está corriendo:
        restante = max(0, expiresAtEpochMs - Date.now())
        si restante > 0:
            restaurar corriendo con ese restante y continuar el aviso pendiente
        si restante == 0:
            marcar la fase terminada
            aplicar una sola vez la transición existente de HU-002
            guardar la fase siguiente preparada y pausada sin notificación
    si la lectura o validación falla:
        no fingir una restauración correcta
        dejar estado pausado, mostrar error y esperar una acción explícita de recuperación

al llegar a cero con la app visible:
    cancelar/consumir el aviso pendiente
    procesar la transición visual en el proveedor
    el handler de notificaciones no presenta avisos mientras la app está visible

al tocar un aviso:
    abrir o reactivar la app
    hidratar y reconciliar antes de mostrar el destino
    presentar la fase siguiente preparada y pausada
```

El cálculo en el proceso activo continúa usando el reloj monotónico existente. La fecha epoch se usa únicamente como referencia durable entre procesos. Se acepta que un ajuste manual del reloj del dispositivo durante el cierre afecta la restauración, conforme a la elección explícita del usuario durante esta planificación.

## Interfaz

- Antes de iniciar la primera sesión, mostrar en español una explicación breve sobre el aviso al terminar y solicitar permiso del sistema. Si se deniega o no está disponible, continuar el inicio normalmente.
- Home conserva sus controles y textos actuales; un error de restauración se presenta claramente y no se representa como sesión recuperada. Una acción explícita permite descartar el snapshot inválido e iniciar una sesión nueva pausada, tras lo cual el estudiante podrá iniciar manualmente.
- En descanso, mostrar controles accesibles para pausar/reanudar y reiniciar cuando corresponda. El reinicio deja la fase pausada; la duración sigue editable solo de acuerdo con el comportamiento actual de HU-002.
- El fin visible en primer plano continúa como transición visual existente. Tras una restauración vencida, la fase siguiente queda preparada y pausada; nunca se inicia automáticamente.
- Aplicar `rn-conventions`: textos en español, `StyleSheet`, `SafeAreaView`, objetivos táctiles de al menos 44×44 puntos, etiquetas accesibles y revisión en vertical y horizontal.

## Estrategia de pruebas

### Jest — dominio

- Restaurar fase corriendo con vencimiento futuro conserva el estado running y calcula el restante desde la fecha actual (RF-01, RF-02, RNF-01).
- Restaurar fase vencida produce una sola transición de estudio/descanso, deja preparada y pausada la fase siguiente y no duplica el progreso en una segunda reconciliación (RF-05, RF-06).
- Restaurar fase pausada conserva exactamente el restante y no la marca como terminada (RF-09).
- Límites de vencimiento exacto en cero y fecha actual posterior no producen tiempo negativo ni transición repetida (RF-01, RF-02, RF-05).

### Jest — almacenamiento y notificaciones

- El snapshot preserva fases, estado, restante, ciclo, tipo de descanso, vencimiento e identificador de aviso (RNF-02).
- Valores mal formados, versiones no soportadas y fallos de lectura/escritura se propagan; no se convierten silenciosamente en una sesión inicial (RF-10).
- Mantener intacta la compatibilidad de `pomodoro-cotopaxi:cycle-count` y la clave de meta activa.
- La capa de notificaciones solicita permiso, permite continuar cuando no se concede, programa el título/cuerpo correcto, cancela el aviso anterior al pausar/reiniciar y programa el nuevo vencimiento al reanudar (RF-03, RF-04, RF-08).
- El handler de primer plano suprime avisos visibles; la interacción de notificación conserva los datos necesarios para restaurar la fase siguiente (RF-06, RF-07).

### Comprobación manual en Expo Go

- Iniciar una fase, bloquear el dispositivo y volver antes del vencimiento: restante correcto y temporizador aún corriendo.
- Iniciar una fase, cerrar la app desde recientes y reabrir antes del vencimiento: fase recuperada y restante calculado desde el vencimiento guardado.
- Dejar vencer estudio y descanso en segundo plano: llega el texto correspondiente y al volver se muestra la fase siguiente pausada conforme a HU-002.
- Denegar permiso o usar notificaciones no disponibles: el inicio y la restauración siguen funcionando.
- Dejar vencer una fase con la app visible: se muestra únicamente la transición visual, sin aviso del sistema.
- Pausar o reiniciar antes del vencimiento, cerrar y reabrir: se conserva pausa/restante y no aparece aviso obsoleto; al reanudar, el aviso corresponde al nuevo vencimiento.
- Simular fallo de lectura/estado inválido: error explícito, estado pausado y recuperación solo tras acción manual.
- Verificar orientación vertical/horizontal, accesibilidad, permisos y navegación al tocar notificaciones según `rn-conventions`.

Ejecutar al finalizar `npx jest`, `npx expo lint` y `npx tsc --noEmit`. No iniciar Expo durante esta fase de planificación.

## Tareas

### T1. Aprobaciones y preparación de notificaciones

- **Requisitos:** RF-03, RF-04, RF-06, RF-07, RF-08.
- **Archivos:** `package.json`, `src/notifications/pomodoro-notifications.ts`; nuevo registro en `src/storage/pomodoro-session-storage.ts`.
- **Descripción:** antes de instalar `expo-notifications` o escribir el nuevo formato de sesión, obtener autorización explícita. Con autorización, instalar la versión compatible con Expo SDK 57 mediante `npx expo install expo-notifications` y confirmar la disponibilidad local de las API requeridas.

### T2. Restauración pura por fecha de vencimiento

- **Requisitos:** RF-01, RF-02, RF-05, RF-09; RNF-01.
- **Archivos:** `src/domain/timer.ts`, `src/domain/__tests__/timer.test.ts`.
- **Descripción:** escribir primero pruebas deterministas para restauración futura, vencida y pausada; añadir funciones puras para reconciliar el vencimiento epoch y aplicar una sola transición de fase.

### T3. Persistencia validada de la sesión completa

- **Requisitos:** RF-02, RF-05, RF-09, RF-10; RNF-02.
- **Archivos:** `src/storage/pomodoro-session-storage.ts`, `src/storage/__tests__/pomodoro-session-storage.test.ts`, `src/storage/pomodoro-cycle-storage.ts`.
- **Descripción:** escribir primero pruebas de round-trip, esquema/versiones, datos inválidos y fallos; implementar lectura/escritura del snapshot versionado en una clave nueva y conservar sin cambios el formato de las claves actuales del ciclo.

### T4. Servicio de notificaciones locales

- **Requisitos:** RF-03, RF-04, RF-06, RF-07, RF-08.
- **Archivos:** `src/notifications/pomodoro-notifications.ts`, `src/notifications/__tests__/pomodoro-notifications.test.ts`.
- **Descripción:** encapsular permisos y canal local requerido, solicitud tras explicación, programación de vencimiento con texto por fase, cancelación por identificador y política que suprima avisos cuando la app esté visible. Probar la capa con Expo Notifications simulado.

### T5. Hidratación y ciclo de vida del proveedor

- **Requisitos:** RF-01–RF-10; RNF-01, RNF-02.
- **Archivos:** `src/hooks/use-pomodoro-timer.ts`, `src/domain/timer.ts`, `src/storage/pomodoro-session-storage.ts`, `src/notifications/pomodoro-notifications.ts`.
- **Descripción:** integrar hidratación antes de persistencia, cálculo epoch al restaurar procesos, reloj monotónico durante la ejecución, persistencia coherente, transición única, permisos, programación/cancelación en inicio/pausa/reinicio/reanudación y estado explícito de error con recuperación manual.

### T6. Inicio, permiso y error de recuperación en home

- **Requisitos:** RF-04, RF-10.
- **Archivos:** `src/app/(tabs)/index.tsx`, `src/hooks/use-pomodoro-timer.ts`.
- **Descripción:** presentar explicación antes de solicitar permiso en la primera sesión, continuar aunque se deniegue y mostrar claramente el error de restauración sin afirmar que se recuperó la sesión; permitir la acción manual de nueva sesión.

### T7. Controles de pausa, reinicio y reanudación del descanso

- **Requisitos:** RF-08, RF-09.
- **Archivos:** `src/app/descanso.tsx`, `src/hooks/use-pomodoro-timer.ts`.
- **Descripción:** añadir controles accesibles para pausar/reanudar y reiniciar una fase de descanso en curso; cancelar avisos obsoletos y asegurar que reiniciar deja el temporizador pausado.

### T8. Apertura y transición desde notificaciones

- **Requisitos:** RF-03, RF-05, RF-06, RF-07.
- **Archivos:** `src/app/_layout.tsx`, `src/hooks/use-pomodoro-timer.ts`, `src/app/(tabs)/index.tsx`, `src/app/descanso.tsx`.
- **Descripción:** conectar interacciones de notificación con hidratación y reconciliación; verificar el destino tras abrir desde aviso y suprimir notificación duplicada cuando el vencimiento sucede con la app visible.

### T9. Validación automatizada

- **Requisitos:** RF-01–RF-10; RNF-01, RNF-02.
- **Archivos:** pruebas del dominio, almacenamiento y notificaciones.
- **Descripción:** ejecutar `npx jest`, `npx expo lint` y `npx tsc --noEmit`; resolver regresiones introducidas por HU-003 antes de continuar.

### T10. Verificación manual y cierre SDD

- **Requisitos:** RF-01–RF-10; RNF-01, RNF-02.
- **Archivos:** `src/app/(tabs)/index.tsx`, `src/app/descanso.tsx`, `src/app/_layout.tsx`, `MEMORY.md`.
- **Descripción:** verificar los escenarios de bloqueo, cierre forzado, vencimiento, permiso denegado, toque de notificación, pausa/reanudación, reinicio y error de restauración en Expo Go; actualizar únicamente «Estado actual» y «Próximos pasos» en `MEMORY.md`.

## Trazabilidad

| Requisito | Plan | Evidencia prevista |
|---|---|---|
| RF-01 | T2, T5, T9, T10 | El restante se calcula usando tiempo transcurrido tanto al volver de segundo plano como al restaurar una fase aún vigente. |
| RF-02 | T2, T3, T5, T9, T10 | El snapshot restaura una fase vigente como running y el tiempo correcto. |
| RF-03 | T1, T4, T5, T8, T9, T10 | Aviso local al vencer estudio o descanso fuera de la app, con texto que identifica la fase. |
| RF-04 | T1, T4, T6, T9, T10 | Explicación y permiso durante el primer inicio; denegación/disponibilidad no bloquea el temporizador. |
| RF-05 | T2, T5, T8, T9, T10 | Transición HU-002 al restaurar fase vencida, siguiente fase pausada y progreso aplicado una sola vez. |
| RF-06 | T4, T5, T8, T9, T10 | Al tocar el aviso se abre la app y la hidratación lleva a la fase siguiente preparada y pausada. |
| RF-07 | T4, T5, T8, T9, T10 | El vencimiento visible solo actualiza la interfaz; el handler evita mostrar un aviso del sistema. |
| RF-08 | T4, T5, T7, T9, T10 | Pausar/reiniciar cancela el aviso y reanudar programa otro para el nuevo vencimiento. |
| RF-09 | T2, T3, T5, T9, T10 | La restauración de sesión pausada conserva restante y no genera aviso. |
| RF-10 | T3, T5, T6, T9, T10 | Error de lectura/validación visible, temporizador pausado y nueva sesión solo tras acción manual. |
| RNF-01 | T2, T5, T9, T10 | Pruebas de fechas deterministas y verificación manual de bloqueo/suspensión/cierre. |
| RNF-02 | T3, T5, T9, T10 | Snapshot local versionado restaurable sin modificar el formato previo del ciclo. |

## Riesgos y límites

- La elección de `Date.now()` para restauraciones entre procesos fue confirmada por el usuario, pero difiere de HU-001, D-02 si el reloj civil se ajusta mientras la aplicación permanece cerrada. La lógica activa dentro del proceso sigue usando el reloj monotónico.
- El SDK confirma que las notificaciones locales están disponibles en Expo Go, pero la verificación de entrega y toque debe realizarse en un dispositivo o emulador compatible; Expo Go no sustituye la comprobación de permisos reales del sistema.
- La aprobación para añadir `expo-notifications` y para introducir un nuevo formato local de sesión sigue siendo necesaria antes de implementar T1/T3. No se cambian los datos existentes.
- Las escrituras asíncronas del snapshot y del progreso del ciclo deben serializarse o versionarse para evitar que una escritura antigua sobrescriba una transición más reciente.


================================================
ðŸ“„ ARCHIVO: specs\003-background-timer\spec.md
================================================

# Spec 003 — Mantener el conteo con el celular bloqueado o la app cerrada

Estado: implementada
HU de origen: docs/historias/HU-003.md

## Contexto y objetivo
Permitir que el estudiante continúe una sesión de estudio o descanso mientras el celular está bloqueado o la aplicación está cerrada. Al volver, la aplicación debe mostrar el tiempo restante correcto y aplicar las transiciones de fase ya definidas. Cuando una fase termine fuera de la aplicación, el estudiante debe poder recibir un aviso del sistema si las notificaciones están permitidas.

## Usuarios
- Estudiante

## Historias de usuario
Como estudiante, quiero que el temporizador siga contando aunque bloquee el celular o cierre la aplicación, para no perder el tiempo que llevo estudiando.

## Definiciones
- **Aplicación en segundo plano:** la aplicación no está visible, ya sea porque el celular está bloqueado, se cambió a otra aplicación o se cerró desde las aplicaciones recientes.
- **Fase terminada:** el tiempo restante de la fase llegó a cero.
- **Fase siguiente preparada:** la fase correspondiente al ciclo queda pausada, con su duración configurada, esperando a que el estudiante la inicie, de acuerdo con HU-002.

## Requisitos funcionales
- **RF-01:** MIENTRAS el temporizador esté corriendo y la aplicación esté en segundo plano, EL SISTEMA descontará el tiempo transcurrido y, cuando el estudiante vuelva a la aplicación antes de que termine la fase, mostrará el tiempo restante correcto y mantendrá la cuenta en curso. Origen: HU-003, escenario «Bloquear el celular»; docs/constitucion.md, principio 6.
- **RF-02:** CUANDO el estudiante vuelva a abrir la aplicación después de cerrarla con el temporizador corriendo, EL SISTEMA recuperará la sesión y mostrará el tiempo restante correcto; SI la fase aún no terminó, EL SISTEMA mantendrá el temporizador corriendo. Origen: HU-003, escenario «Cerrar la aplicación»; docs/constitucion.md, principio 6.
- **RF-03:** CUANDO una fase termine mientras la aplicación esté en segundo plano, EL SISTEMA programará un aviso del sistema que indique qué fase terminó («Estudio terminado» o «Descanso terminado»), si las notificaciones están permitidas. Origen: HU-003, escenario «El tiempo termina con la aplicación cerrada»; decisiones.md, D-01, D-02 y D-06.
- **RF-04:** CUANDO el estudiante inicie su primera sesión, EL SISTEMA explicará brevemente el uso de las notificaciones y solicitará permiso para enviarlas; SI el permiso se deniega o no está disponible, EL SISTEMA permitirá iniciar y usar el temporizador normalmente. Origen: decisiones.md, D-02 y D-03.
- **RF-05:** CUANDO el estudiante vuelva a la aplicación después de que una fase haya terminado en segundo plano, EL SISTEMA aplicará la transición definida en HU-002 y dejará preparada y pausada la fase siguiente, sin iniciarla automáticamente. Origen: HU-003, escenario «El tiempo termina con la aplicación cerrada»; decisiones.md, D-04.
- **RF-06:** CUANDO el estudiante toque el aviso del sistema de una fase terminada, EL SISTEMA abrirá la aplicación y mostrará la fase siguiente preparada y pausada. Origen: decisiones.md, D-06 y HU-002, decisiones.md, D-01, D-02 y D-07.
- **RF-07:** CUANDO el temporizador llegue a cero mientras la aplicación esté abierta y visible, EL SISTEMA mostrará únicamente la transición visual de la aplicación y NO mostrará un aviso del sistema. Origen: decisiones.md, D-07.
- **RF-08:** CUANDO el estudiante pause o reinicie una fase antes de su vencimiento, EL SISTEMA cancelará el aviso pendiente; CUANDO reanude la fase, EL SISTEMA programará el aviso para el nuevo vencimiento si las notificaciones están permitidas. Origen: HU-003, escenario «Pausar antes de cerrar»; decisiones.md, D-05.
- **RF-09:** CUANDO el estudiante cierre y vuelva a abrir la aplicación tras pausar el temporizador, EL SISTEMA restaurará la fase pausada con el mismo tiempo restante y NO mostrará un aviso de fin. Origen: HU-003, escenario «Pausar antes de cerrar».
- **RF-10:** SI EL SISTEMA no puede leer el estado guardado al restaurar la sesión, ENTONCES informará claramente del error, dejará el temporizador pausado y permitirá al estudiante reiniciarlo manualmente. Origen: decisiones.md, D-08.

## Requisitos no funcionales
- **RNF-01:** EL SISTEMA calculará el tiempo restante a partir del tiempo real transcurrido, de modo que bloquear el celular, cerrar la aplicación o una suspensión del proceso no adelante ni atrase la cuenta. Origen: docs/constitucion.md, principio 6; HU-003, escenarios «Bloquear el celular» y «Cerrar la aplicación».
- **RNF-02:** EL SISTEMA conservará localmente el estado necesario para restaurar la sesión al volver a abrir la aplicación. Origen: HU-003, escenarios «Cerrar la aplicación» y «Pausar antes de cerrar».

## Casos límite
- Si el estudiante vuelve a la aplicación antes del vencimiento, el temporizador sigue corriendo y muestra el tiempo restante calculado desde el tiempo transcurrido (RF-01, RF-02).
- Si la fase vence mientras la aplicación está en segundo plano y las notificaciones están permitidas, el estudiante recibe un aviso; al volver, ve la fase siguiente preparada y pausada (RF-03, RF-05).
- Si las notificaciones están denegadas o no están disponibles, el temporizador sigue funcionando y, al volver a la aplicación, se muestra la fase siguiente preparada y pausada, aunque no se haya recibido aviso (RF-04, RF-05).
- Si la fase vence con la aplicación visible, se muestra la transición visual sin duplicarla con una notificación del sistema (RF-07).
- Si el estudiante pausa antes de cerrar la aplicación, el mismo tiempo restante se conserva, no se envía un aviso de fin y al volver la fase sigue pausada (RF-08, RF-09).
- Si el estudiante pausa o reinicia una fase con un aviso pendiente, dicho aviso se cancela; al reanudar, el aviso corresponde al nuevo vencimiento (RF-08).
- Si no se puede restaurar el estado guardado, la aplicación informa el error y no presenta una sesión nueva como si fuera la sesión recuperada (RF-10).

## Fuera de alcance
- Cambiar las reglas de transición entre estudio y descanso definidas por HU-002.
- Iniciar automáticamente la fase siguiente después de que termine la fase actual.
- Enviar notificaciones si el permiso está denegado o el sistema no las permite.

## Criterios de finalización
- Los requisitos funcionales RF-01 a RF-10 y los requisitos no funcionales RNF-01 y RNF-02 pueden verificarse con los escenarios y condiciones descritos en esta especificación.
- Los cuatro escenarios de HU-003 están cubiertos por al menos un requisito funcional.
- La ausencia de permiso de notificaciones no impide usar el temporizador ni recuperar la fase terminada al volver a la aplicación.

## Dudas abiertas
- Ninguna.


================================================
ðŸ“„ ARCHIVO: specs\003-background-timer\tasks.md
================================================

# Tareas: Mantener el conteo con el celular bloqueado o la app cerrada

Ejecutar en orden. Las tareas de dominio, almacenamiento y notificaciones comienzan con pruebas Jest. Antes de instalar `expo-notifications` o crear el nuevo formato de snapshot en AsyncStorage, se requiere autorización explícita. Las tareas de interfaz se verifican con la lista manual de `rn-conventions` en Expo Go. Total: 10 tareas.

- [x] **T1. Obtener autorización y preparar notificaciones locales.** RF-03, RF-04, RF-06, RF-07, RF-08
  - Hecho cuando: antes de instalar `expo-notifications` y de persistir el nuevo snapshot se obtiene autorización explícita; después, `npx expo install expo-notifications` añade una versión compatible con Expo SDK 57 y la app mantiene sus dependencias instalables.

- [x] **T2. Probar y añadir restauración pura por fecha de vencimiento.** RF-01, RF-02, RF-05, RF-09; RNF-01
  - Hecho cuando: `src/domain/__tests__/timer.test.ts` verifica restauración corriendo antes del vencimiento, fase vencida, fase pausada y transición única al llegar a cero; las funciones nuevas de `src/domain/timer.ts` reciben las marcas temporales por argumento y `npx jest --runInBand src/domain/__tests__/timer.test.ts` pasa.

- [x] **T3. Probar y encapsular la persistencia del snapshot.** RF-02, RF-05, RF-09, RF-10; RNF-02
  - Hecho cuando: `src/storage/__tests__/pomodoro-session-storage.test.ts` verifica round-trip, esquema inválido/no soportado y errores de lectura/escritura; `src/storage/pomodoro-session-storage.ts` usa una clave aditiva versionada y las pruebas existentes confirman que `pomodoro-cotopaxi:cycle-count` y la meta activa conservan sus claves y formatos.

- [x] **T4. Probar y encapsular permisos y notificaciones locales.** RF-03, RF-04, RF-06, RF-07, RF-08
  - Hecho cuando: `src/notifications/__tests__/pomodoro-notifications.test.ts` demuestra permisos concedidos/denegados, contenido correcto por fase, programación de vencimiento, cancelación y nueva programación; `src/notifications/pomodoro-notifications.ts` suprime presentación en primer plano y propaga errores inesperados.

- [x] **T5. Integrar hidratación, reconciliación y notificaciones en el proveedor.** RF-01–RF-10; RNF-01, RNF-02
  - Hecho cuando: `src/hooks/use-pomodoro-timer.ts` hidrata antes de persistir, usa `performance.now()` durante la sesión viva y la fecha epoch al restaurar, procesa cada fin una vez, cancela/programa avisos al cambiar estado y expone el error y la recuperación explícita; las pruebas de dominio y almacenamiento pasan.

- [x] **T6. Añadir permiso inicial y recuperación visible en home.** RF-04, RF-10
  - Hecho cuando: `src/app/(tabs)/index.tsx` explica el uso de avisos antes de pedir permiso al primer inicio, permite comenzar si se deniega/no está disponible y muestra el error de restauración con una acción manual; se comprueban textos, accesibilidad y áreas táctiles de `rn-conventions` en Expo Go.

- [x] **T7. Añadir controles de ciclo de vida al descanso.** RF-08, RF-09
  - Hecho cuando: `src/app/descanso.tsx` ofrece pausa/reanudación/reinicio durante un descanso en curso; pausar y reiniciar dejan el temporizador pausado y cancelan el aviso pendiente, mientras reanudar lo programa para el vencimiento actualizado. Verificar la lista manual de interfaz de `rn-conventions`.

- [x] **T8. Conectar apertura desde aviso y evitar duplicados en primer plano.** RF-03, RF-05, RF-06, RF-07
  - Hecho cuando: `src/app/_layout.tsx` y el proveedor llevan una apertura desde una notificación a la sesión hidratada y a la fase siguiente preparada; una fase que vence visible solo ejecuta la transición visual y no presenta el aviso del sistema.

- [x] **T9. Ejecutar validaciones automatizadas de HU-003.** RF-01–RF-10; RNF-01, RNF-02
  - Hecho cuando: pasan `npx jest`, `npx expo lint` y `npx tsc --noEmit`, sin errores nuevos relacionados con la sesión persistida o las notificaciones locales.

- [x] **T10. Verificar escenarios manuales y cerrar la fase SDD.** RF-01–RF-10; RNF-01, RNF-02
  - Hecho cuando: en Expo Go se verifican bloqueo, cierre y reapertura antes/después del vencimiento, permiso denegado, toque del aviso, vencimiento visible, pausa, reinicio, reanudación y error de restauración; luego se actualizan únicamente «Estado actual» y «Próximos pasos» en `MEMORY.md`.


================================================
ðŸ“„ ARCHIVO: specs\004-notificaciones-alertas\decisiones.md
================================================

# Decisiones de HU-004: Recibir aviso al terminar el tiempo

## D-01: Alarma cuando la aplicación está abierta

- **Pregunta:** ¿Debe sonar y vibrar la alarma cuando la fase termina con la aplicación abierta?
- **Respuesta:** Sí. La alarma suena y vibra, y la aplicación muestra un control «Detener».
- **Motivo:** El aviso de fin debe ser perceptible aunque el estudiante esté usando la aplicación.

## D-02: Notificación del sistema en primer plano

- **Pregunta:** ¿Se publica también una notificación del sistema cuando la aplicación está abierta?
- **Respuesta:** No. En primer plano se muestra la alarma dentro de la aplicación, sin duplicar el aviso con una notificación del sistema.
- **Motivo:** Evitar avisos duplicados y conservar el comportamiento de primer plano definido en HU-003.

## D-03: Alarma no disponible por permisos o restricciones del sistema

- **Pregunta:** ¿Qué ocurre si los permisos o el sistema operativo impiden que la alarma suene, vibre o se muestre en la pantalla bloqueada?
- **Respuesta:** El temporizador sigue funcionando y se informa claramente que el aviso no está disponible.
- **Motivo:** La limitación de notificaciones no debe impedir que el estudiante use el temporizador ni debe crear la impresión de que recibirá una alarma.

## D-04: Error al programar la alarma

- **Pregunta:** ¿Qué ocurre si falla la programación de la alarma aunque el permiso esté concedido?
- **Respuesta:** El temporizador inicia o continúa normalmente y se informa que no se pudo programar el aviso.
- **Motivo:** Un fallo del aviso no debe bloquear el estudio ni presentarse como una alarma programada correctamente.

## D-05: Alarma sin interacción

- **Pregunta:** ¿La alarma permanece activa hasta que el estudiante la detenga?
- **Respuesta:** No. Si el estudiante no interactúa, la alarma se detiene automáticamente. No se define una duración concreta.
- **Motivo:** Evitar que el sonido y la vibración continúen indefinidamente sin intervención.

## D-06: Solicitud del permiso de notificaciones

- **Pregunta:** ¿Cuándo se solicita el permiso y qué ocurre si se deniega?
- **Respuesta:** Se conserva lo definido en HU-003: al iniciar la primera sesión se explica brevemente la utilidad del permiso y se solicita; si se deniega, la sesión comienza de todos modos.
- **Motivo:** Mantener el comportamiento acordado para el temporizador y no bloquear su uso por la decisión sobre notificaciones.

## D-07: Estado al detener el aviso

- **Pregunta:** ¿Qué debe mostrar la aplicación cuando el estudiante detiene el aviso?
- **Respuesta:** Se conserva lo definido en HU-003: se abre la aplicación con la siguiente fase preparada y pausada.
- **Motivo:** Mantener las transiciones del ciclo de HU-002 y no iniciar la fase siguiente sin una acción explícita.


================================================
ðŸ“„ ARCHIVO: specs\004-notificaciones-alertas\plan.md
================================================

# Plan: Recibir aviso al terminar el tiempo

**Spec:** [spec.md](./spec.md)  
**Decisiones:** [decisiones.md](./decisiones.md)  
**Estado de la spec:** Aprobada

## Resumen

Completar HU-004 sobre el flujo de HU-003 ya existente. El proveedor ya detecta el fin de una fase, pide el permiso en el primer inicio y prepara la transición; `src/app/_layout.tsx` ya muestra una alarma con vibración y la detiene automáticamente tras un tiempo fijo. Falta sonido en primer plano, información visible cuando una notificación no está disponible o falla, y hay que corregir la programación local: actualmente se omite si el temporizador se inicia mientras la app está visible, por lo que no habrá aviso si luego se bloquea el teléfono.

La implementación añadirá reproducción local con `expo-audio`, una señal de audio propia y original, vibración y limpieza al detener la alarma. La notificación local se programará también mientras la app está visible; el handler existente seguirá suprimiendo su presentación en primer plano, evitando duplicados. Los fallos de permiso, reproducción o programación se comunicarán claramente sin detener ni alterar el temporizador. La parada automática se fija en 3 segundos (tasks.md, V-01), en lugar de los 10 segundos aprobados durante la planificación.

## Contexto técnico

- **Lenguaje y plataforma:** TypeScript, Expo SDK 57, React Native 0.86, iOS y Android; Expo Router.
- **Dependencias existentes:** `expo-notifications` ya está instalada e integrada. `expo-audio` no está instalado; se añadirá con `npx expo install expo-audio` para respetar la versión compatible con SDK 57. La documentación de SDK 57 confirma que Audio está disponible en Expo Go para Android/iOS y permite reproducir sonidos locales.
- **Sonido y vibración:** el overlay del layout raíz ya usa `Vibration` y un temporizador fijo, pero no reproduce sonido. Se incorporará un tono local empaquetado y original mediante un módulo de alarma que centralice reproducción, vibración repetida y limpieza. La alarma interna solo se activa cuando la app está visible.
- **Notificaciones:** `src/notifications/pomodoro-notifications.ts` ya implementa permisos, handler, programación, cancelación y apertura desde el aviso. Hoy evita programar con la app en primer plano y el proveedor solo registra fallos en consola. Se programará para el vencimiento aunque la app esté visible; el handler mantendrá desactivada la presentación de sistema en primer plano. Los errores o la falta de permiso se expondrán al usuario.
- **Persistencia y dominio:** no se requiere modificar el dominio del temporizador ni agregar o cambiar datos locales. La transición de fase y el estado preparado/pausado se mantienen según HU-002 y HU-003.
- **Pruebas:** Jest y `jest-expo` existentes. Se ampliarán las pruebas del servicio de notificaciones y se añadirán pruebas al módulo de alarma con APIs nativas simuladas; los resultados dependientes del sistema se comprobarán manualmente en Expo Go.
- **Restricciones:** ninguna notificación push, backend o cuenta; no bloquear el temporizador por permisos o fallos; no iniciar automáticamente la fase siguiente; mantener el texto de interfaz en español. El plugin de audio se configurará sin grabación ni reproducción en segundo plano: no hace falta permiso de micrófono para este uso.

## Comprobación de la constitución

| Principio | Aplicación |
|---|---|
| Simplicidad primero | Se reutiliza `expo-notifications`, `Vibration`, el proveedor y el overlay existentes. `expo-audio` se agrega por la exigencia de sonido en RF-01; la dependencia y el tono local fueron aprobados durante la planificación. |
| La spec manda | Se cubren RF-01–RF-08 y RNF-01–RNF-03. No se modifica la transición de HU-002 ni se inicia la siguiente fase automáticamente. |
| Lógica separada de interfaz | La transición del temporizador permanece en el dominio. La reproducción y vibración se encapsulan fuera de las pantallas; el layout se limita a representar la alarma y coordinar la navegación. |
| Pruebas como puerta | Se prueban programación, supresión en primer plano, permiso, errores, reproducción y limpieza con Jest; se verifica manualmente la experiencia de plataforma. |
| Los datos del usuario son sagrados | No cambia AsyncStorage, sus claves ni el formato de los datos guardados. |
| Exactitud del tiempo | No se altera el cálculo temporal ni la reconciliación por marcas de tiempo de HU-003. |

## Decisiones técnicas

| Decisión | Aplicación | Alternativa descartada |
|---|---|---|
| D-01 y D-05 | Completar la alarma del overlay raíz con sonido local, vibración y el control «Detener». Apagado automático a los 3 segundos, definido por el usuario en la verificación (tasks.md, V-01). Detener la reproducción, la vibración y los temporizadores tanto al pulsar el control como al desmontar el efecto. | Mantener solo vibración o dejar la alarma sonando indefinidamente. |
| D-02 | Programar la notificación local en el inicio/reanudación de la fase incluso si la app está visible. Al vencer, el handler existente decide si la muestra: no la presenta cuando `AppState` está activo y deja que la alarma interna sea la única señal visible. | Omitir la programación mientras la app está visible; esa opción pierde el aviso si el estudiante bloquea el teléfono después de iniciar el temporizador. |
| D-03 y D-04 | Distinguir permiso denegado/no disponible, plataforma sin soporte y excepción de programación o reproducción; exponer un mensaje accesible y mantener activo el temporizador. No ocultar errores inesperados con valores de éxito. | Solo escribir el error en consola o presentar el aviso como programado cuando no se confirmó. |
| D-06 | Conservar la explicación y solicitud del permiso del primer inicio en `src/app/(tabs)/index.tsx`; un rechazo sigue permitiendo iniciar. Configurar Audio para reproducción sin permisos de grabación ni modo de reproducción en segundo plano. | Solicitar permiso de micrófono o activar servicios nativos de audio en segundo plano que esta historia no requiere. |
| D-07 | Al tocar el aviso, limpiar/detener cualquier alarma interna activa, esperar la sesión hidratada y abrir la fase siguiente preparada y pausada, reutilizando el listener y el proveedor existentes. | Navegar antes de hidratar o dejar que la alarma interna siga sonando al atender el aviso. |
| RF-03, RF-04 y RNF-01 | Verificar permisos disponibles y errores de APIs; mostrar el mensaje de indisponibilidad cuando la app pueda confirmar que el sistema no permitirá el aviso. La configuración de sonido y pantalla bloqueada también se comprobará manualmente en Android e iOS; no se afirmará que el sistema garantiza la entrega si sus ajustes la bloquean. | Suponer que un permiso concedido garantiza sonido o presentación en la pantalla bloqueada. |

## Archivos y responsabilidades

| Archivo | Cambio previsto | Responsabilidad |
|---|---|---|
| `package.json` | Modificar | Registrar la versión de `expo-audio` compatible con Expo SDK 57 mediante `npx expo install`. |
| `app.json` | Modificar | Añadir la configuración del plugin de Audio, desactivando micrófono, grabación y reproducción en segundo plano, que no forman parte de esta historia. |
| `assets/audio/pomodoro-alarm.wav` | Crear | Incluir un tono corto original, empaquetado localmente para reproducción en primer plano. |
| `src/notifications/pomodoro-alarm.ts` | Crear | Encapsular creación, reproducción y detención del sonido y vibración; exponer los errores de disponibilidad sin alterar el estado del temporizador. |
| `src/notifications/__tests__/pomodoro-alarm.test.ts` | Crear | Verificar inicio, detención, limpieza y propagación de errores del servicio con Expo Audio y `Vibration` simulados. |
| `src/notifications/pomodoro-notifications.ts` | Modificar | Permitir programar avisos aunque la app esté en primer plano; conservar la supresión visual del handler, el texto por fase, la lógica de permisos y las respuestas al tocar. |
| `src/notifications/__tests__/pomodoro-notifications.test.ts` | Modificar | Cubrir programación en primer plano y segundo plano, no duplicación visible, permiso ausente, excepción de programación y respuesta tocada. |
| `src/hooks/use-pomodoro-timer.ts` | Modificar | Propagar al estado compartido la disponibilidad o el fallo de programación, sin detener los temporizadores; permitir limpiar la alarma al tocar una notificación. |
| `src/app/_layout.tsx` | Modificar | Reproducir/detener el sonido y la vibración de la alarma visible, aplicar el apagado automático de 3 segundos y el botón «Detener», cerrar la alarma al abrir una notificación y mostrar los mensajes de indisponibilidad. |
| `src/app/(tabs)/index.tsx` | Revisar/modificar solo si se requiere | Conservar el permiso inicial y asegurar que su denegación o fallo siempre permita iniciar; mostrar el estado de aviso no disponible si el layout raíz no lo cubre en la pantalla de inicio. |
| `src/app/descanso.tsx` | Revisar/modificar solo si se requiere | Asegurar que el mismo mensaje de indisponibilidad también sea visible durante la fase de descanso. |

No se modifican `src/domain/timer.ts`, los almacenamientos, los formatos persistidos ni las transiciones de HU-002/HU-003.

## Lógica pura y persistencia

- No se añade lógica al dominio: se reutilizan las transiciones y las comprobaciones puras existentes `getPomodoroNotificationBehavior` e `isPomodoroCompletionResponse`.
- La clasificación del resultado de la operación de notificación debe permitir distinguir «programada», «suprimida en primer plano» y «no disponible»; una excepción de programación se propaga al proveedor para generar un aviso visible, no un falso éxito.
- No se añade persistencia. El ID de notificación y el estado de sesión siguen usando las estructuras ya existentes.

## Algoritmo

```text
al iniciar o reanudar una fase:
    iniciar el temporizador independientemente del permiso de notificaciones
    solicitar/programar el aviso local para el vencimiento, incluso en primer plano
    si el permiso no está concedido o la plataforma no ofrece avisos:
        exponer que el aviso del sistema no está disponible
    si la programación falla:
        exponer que no se pudo programar el aviso
    nunca pausar ni revertir el temporizador por esos resultados

al recibir una respuesta de notificación:
    validar que corresponde a una fase Pomodoro
    esperar a que la sesión esté hidratada
    detener una alarma interna activa y limpiar la respuesta pendiente
    navegar a la siguiente fase ya preparada y pausada

al terminar una fase con la app visible:
    el handler no muestra la notificación del sistema
    iniciar el tono local y la vibración
    mostrar el overlay y el botón «Detener»
    al tocar «Detener» o al cumplir 3 segundos:
        parar sonido y vibración, limpiar temporizadores y cerrar el overlay
        mostrar la siguiente fase preparada y pausada

si el tono o la vibración falla:
    detener cualquier efecto que sí se haya iniciado
    mostrar que la alarma no está disponible
    conservar intacto el estado del temporizador y la transición
```

## Interfaz

- El overlay muestra «Estudio terminado» o «Descanso terminado», una descripción, y «Detener», con la paleta institucional, `StyleSheet`, área táctil de al menos 44×44 puntos y etiqueta accesible.
- Los mensajes de permiso denegado, aviso no disponible, error de programación o alarma interna no disponible se muestran claramente en español y con `accessibilityLiveRegion="polite"`. La notificación no se presenta de nuevo como alarma del sistema mientras la app está visible.
- El aviso tocado abre la fase siguiente preparada y pausada, sin reproducir una alarma persistente.
- Aplicar la lista manual de `rn-conventions`: orientaciones vertical/horizontal, claridad del estado sin depender del color y accesibilidad. Verificar en un dispositivo Android y uno iOS, incluyendo modo silencio y ajustes de pantalla bloqueada.

## Estrategia de pruebas con Jest

1. **Servicio de alarma:** simular Expo Audio y `Vibration`; comprobar que inicia ambos efectos, que la detención elimina el reproductor y cancela la vibración, que la limpieza ocurre una sola vez y que los errores quedan disponibles para la interfaz (RF-01, RF-04, RF-06, RNF-01).
2. **Notificaciones locales:** comprobar títulos y mensaje por fase, programación mientras la app está visible, supresión de presentación en primer plano, programación en segundo plano, permiso denegado, API no soportada, excepción de programación y respuesta válida al tocar (RF-02–RF-05, RF-07, RF-08).
3. **Temporizador y transición:** ejecutar las pruebas existentes de dominio para confirmar que los avisos de indisponibilidad y la alarma no alteran el fin de fase ni dejan la siguiente fase en marcha (RNF-03).
4. **Validación automatizada:** ejecutar `npx jest`, `npx expo lint` y `npx tsc --noEmit`.
5. **Verificación manual:** en Expo Go, probar fin de estudio y descanso en primer plano; permiso concedido/denegado; transición después de detener o dejar vencer los 3 segundos; inicio en primer plano seguido de bloqueo; respuesta al tocar la notificación; fallo de programación/audio; y restricciones de silencio/pantalla bloqueada. Expo no se iniciará durante esta fase de planificación.

## Tareas

Ver [tasks.md](./tasks.md). Total: 10 tareas, en orden de dependencia.

## Cobertura de requisitos

| Requisito | Cobertura en el plan |
|---|---|
| RF-01 | Sonido, vibración, overlay y control «Detener» en el layout raíz y servicio de alarma. |
| RF-02 | Handler que suprime la notificación cuando la app está visible, aunque se programe la alarma local. |
| RF-03 | Programación local al vencer estudio o descanso, con contenido por fase y prueba manual en segundo plano. |
| RF-04 | Mensajes accesibles ante permisos/restricciones detectables y fallos de sonido, vibración o aviso. |
| RF-05 | Error de programación visible; el temporizador se conserva en curso. |
| RF-06 | Limpieza de alarma tras 3 segundos, al pulsar «Detener» o al desmontar el efecto. |
| RF-07 | Respuesta de notificación detiene la alarma y abre la fase siguiente preparada y pausada. |
| RF-08 | Explicación y permiso en el primer inicio; rechazo no bloquea el inicio. |
| RNF-01 | Pruebas de reproducción y vibración; verificación en el dispositivo con la app visible. |
| RNF-02 | Se conserva la explicación/permiso previo al inicio y el flujo de rechazo tolerante. |
| RNF-03 | Se reutiliza la transición existente sin auto-iniciar la fase siguiente. |

## Advertencias

- Los ajustes del sistema para silencio, vibración y presentación en pantalla bloqueada pueden impedir el aviso aunque la app tenga permiso. La implementación comprobará las capacidades que Expo exponga; la garantía efectiva debe validarse en cada plataforma y no se presentará como confirmada si el sistema no permite verificarla.
- `expo-audio` se usará solo para reproducción en primer plano. No se habilitarán permisos de micrófono ni reproducción de audio en segundo plano.


================================================
ðŸ“„ ARCHIVO: specs\004-notificaciones-alertas\spec.md
================================================

# Spec 004 — Recibir aviso al terminar el tiempo

Estado: implementada
HU de origen: docs/historias/HU-004.md

## Contexto y objetivo
Permitir que el estudiante reciba una señal clara cuando termina una fase de estudio o descanso, incluso si el celular está en silencio o la pantalla está bloqueada. El sistema debe avisar con una alarma perceptible cuando la aplicación está abierta, mantener el comportamiento de primer plano definido en HU-003 y, si la notificación del sistema no está disponible o no se permite, seguir funcionando sin bloquear el temporizador ni presentar un aviso falso como si hubiera sido programado correctamente.

## Usuarios
- Estudiante

## Historias de usuario
Como estudiante, quiero que la aplicación me avise cuando termine el tiempo de estudio o de descanso, incluso con el celular en silencio, para cambiar de actividad sin estar mirando la pantalla.

## Definiciones
- **Fase terminada:** el tiempo restante de la fase actual llega a cero.
- **Aplicación en primer plano:** la aplicación está visible y activa en pantalla.
- **Aplicación en segundo plano:** la aplicación no está visible, el celular está bloqueado, se cambió a otra aplicación o se cerró desde recientes.
- **Alarma activa:** señal sonora y/o vibratoria que informa que terminó la fase actual y ofrece un control para detenerla.
- **Aviso no disponible:** condición en la que el sistema operativo o los permisos del dispositivo impiden emitir la alarma o mostrar el aviso del sistema.

## Requisitos funcionales
- **RF-01:** CUANDO el temporizador llegue a cero mientras la aplicación está abierta y visible, EL SISTEMA reproducirá una alarma con sonido y vibración y mostrará un control «Detener» para que el estudiante pueda silenciarla. Origen: HU-004, escenario «Aviso con el celular en sonido»; decisiones.md, D-01 y D-05.
- **RF-02:** MIENTRAS la aplicación esté en primer plano, EL SISTEMA NO publicará una notificación del sistema adicional por la misma fase terminada, y mostrará únicamente la alarma interna de la aplicación. Origen: HU-003, decisiones.md, D-02.
- **RF-03:** CUANDO una fase termine mientras la aplicación está en segundo plano y el permiso de notificaciones está disponible, EL SISTEMA programará una notificación del sistema con el título «Estudio terminado» o «Descanso terminado» y un mensaje que indique que la siguiente fase está lista para iniciar. Origen: HU-004, escenario «Aviso con el celular en silencio»; decisiones.md, D-01 y D-06.
- **RF-04:** SI el sistema operativo o el permiso no permiten emitir sonido, vibrar o mostrar la alarma en la pantalla bloqueada, ENTONCES el temporizador continuará funcionando y EL SISTEMA informará claramente que el aviso no está disponible. Origen: HU-004, escenario «Aviso con el celular en silencio»; decisiones.md, D-03.
- **RF-05:** SI falla la programación del aviso aunque el permiso de notificaciones esté concedido, ENTONCES el temporizador continuará normalmente y EL SISTEMA mostrará un mensaje informando que no se pudo programar el aviso. Origen: HU-004, decisiones.md, D-04.
- **RF-06:** CUANDO la alarma esté activa, SI el estudiante no interactúa con ella, EL SISTEMA la detendrá automáticamente a los 3 segundos. Origen: HU-004, decisiones.md, D-05; tasks.md, Verificación, V-01.
- **RF-07:** CUANDO el estudiante toque la notificación del sistema o el botón «Detener» de la alarma, EL SISTEMA silenciará la alarma y abrirá la aplicación mostrando la siguiente fase preparada y pausada. Origen: HU-004, escenarios «Detener el aviso» y «Aviso con el celular en silencio»; decisiones.md, D-07.
- **RF-08:** CUANDO el estudiante inicie su primera sesión, EL SISTEMA explicará brevemente para qué sirve el permiso de notificaciones y lo solicitará; SI el permiso se deniega, EL SISTEMA permitirá iniciar y usar el temporizador normalmente. Origen: HU-004, escenario «Permiso de notificaciones»; decisiones.md, D-06.

## Requisitos no funcionales
- **RNF-01:** La alarma de fin de fase debe ser perceptible aunque el estudiante esté usando la aplicación: debe sonar, vibrar y mostrar una acción de cierre explícita. Origen: HU-004, escenario «Aviso con el celular en sonido»; decisiones.md, D-01.
- **RNF-02:** La solicitud de permisos para notificaciones se mantiene consistente con HU-003: se hace al iniciar la primera sesión, pero el temporizador no queda bloqueado si se niega el permiso. Origen: HU-004, escenario «Permiso de notificaciones»; decisiones.md, D-06.
- **RNF-03:** El temporizador debe conservar la lógica de transición ya definida en HU-002 y HU-003: al cerrar la alarma o tocar la notificación, la aplicación abre con la siguiente fase preparada y pausada, sin iniciarla automáticamente. Origen: HU-004, decisiones.md, D-07; HU-002, HU-003.

## Casos límite
- Si la aplicación está visible cuando termina la fase, se activa la alarma interna y no se duplica con una notificación del sistema (RF-01, RF-02).
- Si el celular está en silencio o vibración, la alarma se oye como una señal perceptible y la aplicación la muestra en la pantalla bloqueada o la siguiente vista según el caso disponible (RF-01, RF-03, RF-04).
- Si el permiso de notificaciones está denegado o el sistema no lo permite, la sesión no se bloquea y la app sigue funcionando (RF-04, RF-05, RF-08).
- Si falla la programación del aviso, la aplicación informa claramente que no se pudo programar y el estudiante puede seguir usando el temporizador (RF-05).
- Si el estudiante no interactúa con la alarma, esta se apaga sola a los 3 segundos (RF-06).
- Si el estudiante toca la notificación o el botón de detener, la aplicación vuelve a la siguiente fase preparada y pausada (RF-07).
- Si el usuario inicia la primera sesión sin permiso, la app lo explica y solicita el permiso, pero la sesión sigue arrancando aunque se rechace (RF-08).

## Fuera de alcance
- Cambiar la lógica de transición entre estudio y descanso definida en HU-002.
- Iniciar automáticamente la siguiente fase después de que termine la actual.
- Añadir servicios backend, cuentas o notificaciones push externas.

## Criterios de finalización
- Los requisitos funcionales RF-01 a RF-08 y los requisitos no funcionales RNF-01 a RNF-03 pueden verificarse con los escenarios y condiciones descritos en esta especificación.
- Cada escenario de HU-004 está cubierto por al menos un requisito funcional.
- La ausencia de permiso de notificaciones no bloquea la sesión ni la transición al siguiente estado.

## Dudas abiertas
- Ninguna.


================================================
ðŸ“„ ARCHIVO: specs\004-notificaciones-alertas\tasks.md
================================================

# Tareas: Recibir aviso al terminar el tiempo

Ejecutar en orden. Las pruebas de lógica y servicios se escriben primero; las verificaciones de interfaz se hacen manualmente en Expo Go. La instalación de `expo-audio` y el tono local fueron aprobados durante la planificación. Total: 10 tareas.

- [x] **T1. Preparar el módulo y el tono local de alarma.** RF-01, RNF-01
  - Archivos: `package.json`, `app.json`, `assets/audio/pomodoro-alarm.wav`.
  - Hecho cuando: `npx expo install expo-audio` agrega la versión compatible con SDK 57; el plugin de Audio queda configurado para reproducción sin grabación ni modo de fondo; el tono local original se puede importar y el proyecto no solicita permiso de micrófono.

- [x] **T2. Probar y encapsular sonido y vibración.** RF-01, RF-04, RF-06; RNF-01
  - Archivos: `src/notifications/pomodoro-alarm.ts`, `src/notifications/__tests__/pomodoro-alarm.test.ts`.
  - Hecho cuando: las pruebas Jest, con Audio y `Vibration` simulados, demuestran inicio y limpieza de ambos efectos, detención idempotente y propagación de fallos; el servicio permite que la interfaz informe si el sonido o la vibración no están disponibles.

- [x] **T3. Corregir programación y probar disponibilidad de notificaciones.** RF-02, RF-03, RF-04, RF-05, RF-08; RNF-02
  - Archivos: `src/notifications/pomodoro-notifications.ts`, `src/notifications/__tests__/pomodoro-notifications.test.ts`.
  - Hecho cuando: las pruebas verifican que se programa un aviso aunque la app esté visible, que el handler no lo presenta en primer plano, que el mensaje identifica estudio/descanso, que el permiso denegado permite continuar y que un error de programación no se devuelve como éxito; el test anterior que prohibía programar en primer plano queda sustituido.

- [x] **T4. Exponer errores de avisos sin interrumpir el temporizador.** RF-04, RF-05, RF-08; RNF-02
  - Archivos: `src/hooks/use-pomodoro-timer.ts`, `src/notifications/pomodoro-notifications.ts`.
  - Hecho cuando: el proveedor distingue aviso programado, no disponible y fallido; la falta de permiso o excepción se guarda como estado visible en español, el temporizador sigue corriendo y un nuevo intento exitoso limpia el mensaje previo.

- [x] **T5. Integrar la alarma en primer plano y el apagado automático.** RF-01, RF-02, RF-04, RF-06; RNF-01
  - Archivos: `src/app/_layout.tsx`, `src/notifications/pomodoro-alarm.ts`, `src/notifications/__tests__/pomodoro-alarm.test.ts`.
  - Hecho cuando: al finalizar una fase visible se reproduce el sonido y la vibración, se muestra el overlay accesible con «Detener», y la alarma se detiene al pulsar, a los 3 segundos o al desmontar; nunca aparece una notificación del sistema duplicada.

- [x] **T6. Cerrar la alarma al abrir una notificación.** RF-03, RF-07; RNF-03
  - Archivos: `src/hooks/use-pomodoro-timer.ts`, `src/app/_layout.tsx`.
  - Hecho cuando: tocar una notificación válida espera la hidratación, detiene y limpia cualquier alarma interna activa y abre la fase siguiente preparada y pausada; una respuesta ajena a Pomodoro no altera la navegación.

- [x] **T7. Mostrar el estado de disponibilidad en las pantallas.** RF-04, RF-05, RF-08; RNF-02
  - Archivos: `src/hooks/use-pomodoro-timer.ts`, `src/app/_layout.tsx`, `src/app/(tabs)/index.tsx`, `src/app/descanso.tsx`.
  - Hecho cuando: los mensajes de permiso denegado, falta de soporte o fallo de programación/alarma se anuncian claramente en español; denegar el permiso sigue permitiendo iniciar y un aviso posterior disponible elimina el estado de error.

- [x] **T8. Ejecutar pruebas, lint y comprobación de tipos.** RF-01–RF-08; RNF-01–RNF-03
  - Archivos: pruebas de `src/notifications/`, pruebas existentes de `src/domain/__tests__/timer.test.ts`.
  - Hecho cuando: pasan `npx jest`, `npx expo lint` y `npx tsc --noEmit`, incluidas las pruebas nuevas y las de transición ya existentes.

- [x] **T9. Verificar la experiencia en Android.** RF-01–RF-08; RNF-01–RNF-03
  - Archivos: `src/app/_layout.tsx`, `src/notifications/pomodoro-notifications.ts`.
  - Hecho cuando: en Expo Go se comprueban sonido/vibración con la app visible, permiso concedido y denegado, aviso tras iniciar visible y bloquear el teléfono, toque de notificación, detención manual/automática a los 3 segundos, orientación y restricciones de silencio/pantalla bloqueada; se registran los límites que impongan los ajustes del sistema.

- [x] **T10. Verificar la experiencia en iOS y cerrar la fase.** RF-01–RF-08; RNF-01–RNF-03
  - Archivos: `MEMORY.md`.
  - Hecho cuando: en Expo Go se comprueban sonido/vibración en primer plano, rechazo de permiso, fallo de programación, comienzo visible seguido de bloqueo, toque de notificación, detención manual/automática a los 3 segundos, orientación y restricciones de silencio/pantalla bloqueada; se informa qué escenarios dependieron de ajustes del sistema y se actualizan únicamente «Estado actual» y «Próximos pasos» en `MEMORY.md`.

## Verificación

El usuario corroboró manualmente en Expo Go todas las tareas (T1–T10) en Android e iOS.

- **V-01. Apagado automático de la alarma a los 3 segundos.** Decisión del usuario durante la verificación: la alarma sin interacción se detiene a los 3 segundos en lugar de los 10 segundos aprobados en la planificación. Concreta D-05 y actualiza RF-06. Cubierto por la prueba de `src/notifications/__tests__/pomodoro-alarm.test.ts`.
- **V-02. Restricciones del sistema observadas.** Los escenarios de silencio y pantalla bloqueada dependen de los ajustes de notificaciones, sonido y "No molestar" de cada dispositivo. No se reportaron restricciones adicionales durante la verificación.


================================================
ðŸ“„ ARCHIVO: specs\005-ajustar-tiempos\decisiones.md
================================================

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


================================================
ðŸ“„ ARCHIVO: specs\005-ajustar-tiempos\plan.md
================================================

# Plan 005 — Ajustar los tiempos del pomodoro

Spec: specs/005-ajustar-tiempos/spec.md (aprobada) · Decisiones: D-01 a D-12

## Resumen

Hoy la duración del estudio es una constante (`DEFAULT_FOCUS_DURATION_MS`), los descansos usan 5 y 15 minutos por defecto y la pantalla de descanso permite editar el descanso preparado con un rango fijo de 5 a 30 minutos. La meta del ciclo ya distingue entre meta activa (`activeCycleLength`) y meta configurada (`configuredCycleLength`), que se aplica tras el descanso largo, como pide HU-002.

El plan añade un modelo de ajustes con validación pura en el dominio, una función pura que aplica los ajustes guardados a la sesión actual (fase preparada frente a iniciada y meta del ciclo), un almacenamiento propio para los ajustes, la integración en el proveedor del temporizador y una pantalla de ajustes nueva. Se elimina el editor de duración de la pantalla de descanso (D-12).

## Archivos y responsabilidades

| Archivo | Acción | Responsabilidad | RF |
|---|---|---|---|
| `src/domain/settings.ts` | Crear | Tipo `PomodoroSettings`, valores por defecto, rangos permitidos, validación del formulario y aplicación de ajustes a la sesión. Solo funciones puras. | RF-02, RF-04, RF-05, RF-06, RF-07, RF-10, RF-12 |
| `src/domain/__tests__/settings.test.ts` | Crear | Pruebas de validación y de aplicación de ajustes. | Ídem |
| `src/domain/timer.ts` | Modificar | `prepareFocusAfterBreak` recibe la duración de estudio vigente; se eliminan `MIN/MAX_BREAK_DURATION_MINUTES`, `isValidBreakDuration`, `setPreparedBreakDuration` y `startBreakTimer` (rango 5–30 sustituido por D-02). | RF-04, RF-13 |
| `src/domain/__tests__/timer.test.ts` | Modificar | Retirar las pruebas del rango 5–30 y del editor de descanso; adaptar la de estudio tras el descanso. | RF-04, RF-13 |
| `src/storage/pomodoro-settings-storage.ts` | Crear | Cargar y guardar los ajustes; distinguir «sin ajustes» (valores por defecto) de «ajustes ilegibles» (error). | RF-02, RF-03, RF-11; RNF-01 |
| `src/storage/__tests__/pomodoro-settings-storage.test.ts` | Crear | Pruebas con AsyncStorage simulado. | Ídem |
| `src/hooks/use-pomodoro-timer.ts` | Modificar | Hidratar los ajustes antes de la sesión, exponer `settings`, `saveSettings`, `resetSettings` y `settingsMessage`; usar los ajustes en las transiciones; quitar `setBreakDuration` y `setConfiguredCycleLength`. | RF-02 a RF-06, RF-08, RF-10 a RF-12; RNF-02 |
| `src/app/ajustes.tsx` | Crear | Pantalla de ajustes: cuatro campos, errores por campo, Guardar, Restablecer y confirmación al salir con cambios. | RF-01, RF-07 a RF-10; RNF-03 |
| `src/app/(tabs)/index.tsx` | Modificar | Botón «Ajustes» y aviso de ajustes no cargados. | RF-01, RF-11 |
| `src/app/descanso.tsx` | Modificar | Quitar el editor de duración; añadir el botón «Ajustes». | RF-01, RF-13 |

## Funciones puras (`src/domain/settings.ts`)

```ts
type SettingsField = 'focusMinutes' | 'shortBreakMinutes' | 'longBreakMinutes' | 'cycleLength';
type PomodoroSettings = Record<SettingsField, number>;

DEFAULT_SETTINGS = { focusMinutes: 25, shortBreakMinutes: 5, longBreakMinutes: 15, cycleLength: 4 }
SETTINGS_RANGES  = { focusMinutes: [1,120], shortBreakMinutes: [1,30], longBreakMinutes: [1,60], cycleLength: [4,8] }

isValidSettings(value: unknown): value is PomodoroSettings
validateSettingsInput(input: Record<SettingsField, string>)
  -> { success: true; settings } | { success: false; errors: Partial<Record<SettingsField, string>> }
applySettingsToSession({ focusTimer, breakTimer, breakType, cycle }, settings)
  -> { focusTimer, breakTimer, cycle, cycleGoalReached: boolean }
```

- **Validación (RF-07, D-06):** cada texto debe cumplir `/^\d+$/` (rechaza vacío, signo y decimales) y estar dentro de su rango; el mensaje por campo es «Ingresa un número entero entre {mín} y {máx}.». Si hay al menos un error no se devuelve ningún ajuste.
- **Fase preparada (D-04):** un temporizador `paused` con `remainingMs === initialDurationMs`. Solo una fase preparada adopta la nueva duración.

## Persistencia

- Clave nueva `pomodoro-cotopaxi:settings:v1`, valor JSON `{ version: 1, focusMinutes, shortBreakMinutes, longBreakMinutes, cycleLength }`.
- `loadPomodoroSettings()`:
  - Sin valor guardado → `DEFAULT_SETTINGS` (RF-02).
  - JSON inválido, versión desconocida o valores fuera de rango → lanza error (RF-11).
- `savePomodoroSettings(settings)` valida con `isValidSettings` antes de escribir.
- Un valor ilegible **no se borra ni se sobrescribe** al cargar; solo se reemplaza cuando el estudiante guarda o restablece (constitución, principio 5; RNF-01).
- La sesión (`pomodoro-session-storage`) y el ciclo (`pomodoro-cycle-storage`) no cambian de formato: la duración de cada fase ya va en su `TimerState` y `configuredCycleLength` en el ciclo.

## Algoritmo

```
applySettingsToSession(sesión, ajustes):
    focusTimer = si focusTimer está preparado
                    -> createFocusTimer(ajustes.focusMinutes * 60_000)
                 si no -> sin cambios                                   (RF-04, RF-05)
    breakTimer = si breakType != null y breakTimer está preparado
                    -> createPreparedBreakTimer(minutos del tipo de descanso)
                 si no -> sin cambios                                   (RF-04, RF-05)
    ciclo.configuredCycleLength = ajustes.cycleLength
    si el ciclo no ha empezado:
        ciclo.activeCycleLength = ajustes.cycleLength
    si no, si ajustes.cycleLength <= ciclo.pomodoroCount:                (RF-06, D-05, D-09)
        ciclo.activeCycleLength = ciclo.pomodoroCount + 1
        -> al completar el próximo estudio, completePomodoroCycle da «largo»
           y el contador vuelve a cero; tras el descanso largo la meta
           activa pasa a ser la configurada
    si no:                                                               (RF-12, D-11)
        se conserva activeCycleLength hasta el siguiente ciclo
    cycleGoalReached = ciclo empezado y ajustes.cycleLength == pomodoroCount   (RF-10)

saveSettings(ajustes) en el proveedor:
    await savePomodoroSettings(ajustes)                                  (RF-03)
    dispatch('apply-settings', ajustes)  -> applySettingsToSession + limpia settingsMessage
    devolver { cycleGoalReached }

hidratación:
    ajustes = loadPomodoroSettings(); si falla -> DEFAULT_SETTINGS
              y settingsMessage = mensaje de RF-11                        (RF-11)
    sesión  = flujo actual de HU-003
    aplicar applySettingsToSession a la sesión hidratada (idempotente)

transiciones:
    completeFocusPhase(..., ajustes.shortBreakMinutes, ajustes.longBreakMinutes)
    prepareFocusAfterBreak(focusTimer, ajustes.focusMinutes)              (RF-04)
    reset-focus -> la fase vuelve a ser preparada y usa ajustes.focusMinutes
```

## Interfaz

- **Ruta nueva `/ajustes`** (`src/app/ajustes.tsx`) en el Stack raíz, con título «Ajustes». Se abre con el botón de engranaje (48×48, etiqueta «Abrir ajustes») del encabezado de las pantallas de inicio y de descanso (RF-01).
- **Formulario:** `SafeAreaView` + `KeyboardAvoidingView` + `ScrollView` con `keyboardShouldPersistTaps="handled"`. Cuatro `TextInput` con `keyboardType="number-pad"`, etiqueta con el rango («Estudio (1–120 minutos)») y `accessibilityLabel`. Los errores aparecen debajo de cada campo en Crimson `#e60023` con `accessibilityLiveRegion="polite"` (RF-07, RNF-03).
- **Botones** de al menos 44×44:
  - «Guardar»: primario, fondo `#F8A800` y texto `#100048`.
  - «Restablecer valores por defecto»: destructivo, fondo `#e60023` y texto blanco, con `Alert.alert` de confirmación (RF-08).
- **Tras guardar:**
  - Si `cycleGoalReached`, se muestra un `Alert.alert` con el mensaje de RF-10 y la pantalla se cierra al aceptar.
  - Si no, la pantalla se cierra directamente.
- **Salir con cambios sin guardar (RF-09):** `usePreventRemove(hayCambios, …)` de `expo-router/react-navigation` (verificado en SDK 57). Abre un `Alert.alert` con «Seguir editando» y «Descartar»; esta última ejecuta `navigation.dispatch(data.action)`.
- **Aviso RF-11:** tarjeta con borde Crimson en la pantalla de inicio, con el mensaje y un botón «Ir a Ajustes». Desaparece al guardar o restablecer.
- **Pantalla de descanso:** se eliminan el reloj pulsable, el formulario y sus estados; el reloj queda como `accessibilityRole="timer"` (RF-13).
- Paleta de `cotopaxi-brand`; fondo de pantalla `#F8F8F8` y campos con fondo `#FFFFFF` y texto `#1F2A2C`. Todos los textos en español.

## Decisiones técnicas

| Decisión | Elegida | Alternativa descartada |
|---|---|---|
| Dónde vive la lógica de aplicar ajustes | Función pura `applySettingsToSession` en el dominio, probada con Jest (constitución, principios 3 y 4). | Lógica dentro del reducer del hook: no se puede probar sin montar el proveedor. |
| Reducir el ciclo bajo lo completado (D-05, D-09) | Fijar `activeCycleLength = pomodoroCount + 1`, reutilizando `completePomodoroCycle` y `completePomodoroBreak` sin cambiarlas. | Una bandera nueva «forzar descanso largo» en el ciclo: cambia el formato de la sesión guardada y duplica la regla. |
| Almacenamiento | Clave JSON versionada independiente para los ajustes. | Guardar los ajustes dentro de la sesión: un error de sesión borraría los ajustes y viceversa (principio 5). |
| Ajustes ilegibles (D-10) | Se usan valores por defecto en memoria sin sobrescribir lo guardado. | Borrar el valor dañado al cargar: destruye datos que el estudiante podría recuperar. |
| Reiniciar el estudio | La fase reiniciada queda preparada y toma la duración de los ajustes vigentes (coherente con D-04). | Volver a la duración original de la fase: dejaría una fase preparada con un valor distinto al guardado. |
| Fallo al escribir los ajustes | No se aplica nada y la pantalla muestra «No se pudieron guardar los ajustes. Inténtalo de nuevo.» | Aplicar en memoria aunque no se guarde: incumple RF-03. (D-13, RF-14). |
| Bloquear la salida con cambios | `usePreventRemove` (cubre el botón atrás, el gesto y el encabezado). | Interceptar solo el botón del encabezado: el gesto de Android/iOS saltaría la confirmación. |
| Editor del descanso (D-12) | Eliminarlo junto con las funciones del rango 5–30. | Mantenerlo con los nuevos rangos: dos formas de cambiar el mismo dato. |

## Cambio tras la verificación (D-14, RF-15)

- `hasDeferredDurationChange(sesión, ajustesPrevios, ajustesNuevos)` (pura, en `settings.ts`): verdadero si hay un estudio iniciado y cambió `focusMinutes`, o un descanso iniciado y cambió la duración de su tipo.
- `saveSettings` devuelve también `durationChangeDeferred`; la pantalla de ajustes muestra el mensaje de RF-15 (junto al de RF-10 si coincide) antes de cerrarse.
- `reset-break` deja el descanso preparado con la duración vigente de su tipo, igual que `reset-focus`.
- Interfaz: `app.json` pasa a `"orientation": "default"`; en Ajustes, `KeyboardAvoidingView` con `padding` y `keyboardVerticalOffset` (altura del encabezado + margen superior) en iOS, sin `behavior` en Android (guía de teclado de Expo), y margen inferior extra en el contenido.

## Estrategia de pruebas con Jest

- **`settings.test.ts` (dominio, sin simulaciones):**
  - Validación:
    - Acepta los límites 1/120, 1/30, 1/60 y 4/8.
    - Rechaza vacío, `0`, `-5`, `2.5`, `121`, `31`, `61`, `3` y `9` con el mensaje de rango de cada campo.
    - Si hay varios errores, no devuelve ajustes.
  - Aplicación:
    - Un estudio preparado cambia y uno corriendo o pausado a mitad no cambia (RF-04, RF-05).
    - Un descanso corto o largo preparado toma su duración según el tipo.
    - Con el ciclo sin empezar, la meta se aplica de inmediato.
    - Con 6 completados y meta 5, el siguiente estudio completado da descanso largo y el contador vuelve a 0 (RF-06).
    - Con 5 completados y meta 5, `cycleGoalReached = true` (RF-10).
    - Con 2 completados, cambiar de 8 a 5 conserva la meta activa 8 y la nueva aplica tras el descanso largo (RF-12).
- **`pomodoro-settings-storage.test.ts`:**
  - Sin valor guardado devuelve los valores por defecto.
  - Guardar y cargar devuelve el mismo objeto.
  - JSON roto, versión distinta o valores fuera de rango lanzan error sin llamar a `setItem` ni `removeItem`.
  - `save` rechaza ajustes inválidos.
- **`timer.test.ts`:**
  - Se retiran las pruebas del editor 5–30.
  - `prepareFocusAfterBreak` usa la duración recibida.
  - Siguen verdes las transiciones de HU-002.
- **Interfaz:** verificación manual en Expo Go con la lista de `rn-conventions` (teclado, orientación, persistencia al cerrar y textos de fase).
- Al cerrar: `npx jest`, `npx expo lint` y `npx tsc --noEmit`.

## Cobertura de RF

| RF | Parte del plan |
|---|---|
| RF-01 | Ruta `/ajustes`, botones de acceso |
| RF-02 | `DEFAULT_SETTINGS`, `loadPomodoroSettings` sin valor |
| RF-03 | `savePomodoroSettings`, `saveSettings` |
| RF-04, RF-05 | `applySettingsToSession` (preparada frente a iniciada), transiciones con ajustes |
| RF-06, RF-10 | `applySettingsToSession` (meta del ciclo, `cycleGoalReached`), alerta tras guardar |
| RF-07 | `validateSettingsInput`, errores por campo |
| RF-08 | `resetSettings` con confirmación |
| RF-09 | `usePreventRemove` y su diálogo |
| RF-11 | Hidratación con valores por defecto y aviso en inicio |
| RF-12 | Meta activa conservada en `applySettingsToSession` |
| RF-13 | Eliminación del editor y de las funciones 5–30 |
| RNF-01 | Clave propia sin sobrescritura de datos ilegibles |
| RNF-02 | Las fases iniciadas no se modifican; marcas de tiempo intactas |
| RNF-03 | Mensajes de rango en español |


================================================
ðŸ“„ ARCHIVO: specs\005-ajustar-tiempos\spec.md
================================================

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


================================================
ðŸ“„ ARCHIVO: specs\005-ajustar-tiempos\tasks.md
================================================

# Tareas: Ajustar los tiempos del pomodoro

Ejecutar en orden. En las tareas de lógica las pruebas se escriben primero y deben fallar antes de implementar. Las de interfaz se verifican manualmente en Expo Go con la lista de `rn-conventions`. Total: 10 tareas.

- [x] **T1. Modelo de ajustes y validación del formulario.** RF-02, RF-07; RNF-03
  - Archivos: `src/domain/settings.ts`, `src/domain/__tests__/settings.test.ts`.
  - Hecho cuando: `npx jest` demuestra que `validateSettingsInput` acepta los límites de cada rango, rechaza vacío, cero, negativos, decimales y fuera de rango con «Ingresa un número entero entre {mín} y {máx}.» por campo, y no devuelve ajustes si hay algún error; `DEFAULT_SETTINGS` vale 25/5/15/4 e `isValidSettings` rechaza objetos incompletos.

- [x] **T2. Aplicar ajustes a la sesión en curso.** RF-04, RF-05, RF-06, RF-10, RF-12; RNF-02
  - Archivos: `src/domain/settings.ts`, `src/domain/__tests__/settings.test.ts`.
  - Hecho cuando: `npx jest` demuestra que `applySettingsToSession` cambia solo fases preparadas, conserva las iniciadas, aplica la meta de inmediato con el ciclo sin empezar, fuerza el descanso largo tras el siguiente estudio cuando la meta es menor o igual a lo completado, marca `cycleGoalReached` solo si es igual y conserva la meta activa cuando es mayor.

- [x] **T3. Retirar el rango 5–30 y usar la duración de estudio vigente.** RF-04, RF-13
  - Archivos: `src/domain/timer.ts`, `src/domain/__tests__/timer.test.ts`.
  - Hecho cuando: `prepareFocusAfterBreak` recibe la duración de estudio y tiene prueba; `isValidBreakDuration`, `setPreparedBreakDuration`, `startBreakTimer` y las constantes 5–30 ya no existen ni tienen pruebas; las pruebas de transición de HU-002 siguen pasando con `npx jest`.

- [x] **T4. Guardar y cargar los ajustes.** RF-02, RF-03, RF-11; RNF-01
  - Archivos: `src/storage/pomodoro-settings-storage.ts`, `src/storage/__tests__/pomodoro-settings-storage.test.ts`.
  - Hecho cuando: `npx jest` con AsyncStorage simulado demuestra que sin valor se obtienen los valores por defecto, que guardar y cargar conserva los ajustes, que JSON roto, versión distinta o valores fuera de rango lanzan error sin escribir ni borrar, y que guardar ajustes inválidos se rechaza.

- [x] **T5. Integrar los ajustes en el proveedor del temporizador.** RF-02 a RF-06, RF-08, RF-10, RF-11, RF-12, RF-14; RNF-02
  - Archivos: `src/hooks/use-pomodoro-timer.ts`.
  - Hecho cuando: el proveedor hidrata los ajustes antes de la sesión (con valores por defecto y `settingsMessage` si fallan), expone `settings`, `saveSettings`, `resetSettings` y `settingsMessage`, usa los ajustes en las transiciones y al reiniciar el estudio, y ya no expone `setBreakDuration` ni `setConfiguredCycleLength`; `npx jest` y `npx tsc --noEmit` pasan.

- [x] **T6. Pantalla de ajustes: formulario y guardado.** RF-01, RF-03, RF-07, RF-10; RNF-03
  - Archivos: `src/app/ajustes.tsx`.
  - Hecho cuando: en Expo Go la pantalla muestra los cuatro valores guardados con su rango, el teclado no tapa campos ni botones, los errores aparecen bajo cada campo inválido sin guardar nada, guardar cierra la pantalla, el mensaje de ciclo cumplido aparece cuando corresponde y los valores persisten al cerrar y abrir la app.

- [x] **T7. Restablecer y salir sin guardar.** RF-08, RF-09
  - Archivos: `src/app/ajustes.tsx`.
  - Hecho cuando: en Expo Go restablecer pide confirmación, cancelar no cambia nada y confirmar guarda 25/5/15/4; salir con cambios (botón atrás, gesto o encabezado) pide confirmación, «Seguir editando» conserva lo escrito y «Descartar» sale sin guardar; salir sin cambios no pregunta.

- [x] **T8. Acceso a ajustes, aviso de carga y pantalla de descanso.** RF-01, RF-11, RF-13
  - Archivos: `src/app/(tabs)/index.tsx`, `src/app/descanso.tsx`.
  - Hecho cuando: en Expo Go hay un botón «Ajustes» de al menos 44×44 con etiqueta accesible en inicio y en descanso; la pantalla de descanso ya no permite editar la duración; con ajustes dañados el inicio muestra el aviso de RF-11, que desaparece al guardar o restablecer; se ve bien en vertical y horizontal.

- [x] **T10. Aviso de cambio diferido, teclado y orientación.** RF-15; RNF-03
  - Archivos: `src/domain/settings.ts`, `src/domain/__tests__/settings.test.ts`, `src/hooks/use-pomodoro-timer.ts`, `src/app/ajustes.tsx`, `app.json`.
  - Hecho cuando: `npx jest` demuestra que `hasDeferredDurationChange` detecta solo cambios de la fase iniciada; en Expo Go el mensaje aparece al guardar, «Reiniciar» aplica el nuevo tiempo en estudio y descanso, el teclado no tapa «Guardar» ni «Restablecer» y la app gira con la rotación automática.

- [x] **T9. Verificación final.** RF-01–RF-15; RNF-01–RNF-03
  - Archivos: pruebas de `src/domain/` y `src/storage/`.
  - Hecho cuando: pasan `npx jest`, `npx expo lint` y `npx tsc --noEmit`, y el usuario confirma en Expo Go (Android e iOS) los escenarios de HU-005: cambiar un tiempo con y sin fase en curso, valor no válido, restablecer y persistencia al cerrar la app.


================================================
ðŸ“„ ARCHIVO: specs\006-uso-offline\decisiones.md
================================================

# Decisiones de HU-006: Usar la aplicación sin registro, sin internet y sin publicidad

## D-01: Primer inicio

- **Pregunta:** La HU pide llegar directo al temporizador la primera vez. ¿Se muestra algo adicional en ese primer inicio?
- **Respuesta:** No. La aplicación abre directamente en el temporizador, sin bienvenida, tutorial, registro ni inicio de sesión. El permiso de notificaciones se sigue pidiendo al iniciar la primera sesión, como define HU-004.
- **Motivo:** Que el estudiante empiece a estudiar sin trabas, tal como pide la historia.

## D-02: Uso de internet

- **Pregunta:** ¿La aplicación debe usar internet para algo, aunque sea opcional?
- **Respuesta:** Nunca. Todas las funciones son locales y la aplicación no realiza ninguna petición de red.
- **Motivo:** Garantizar que todo funcione igual sin datos móviles ni wifi y no consumir datos del estudiante.

## D-03: Indicador de conexión

- **Pregunta:** Cuando el celular no tiene conexión, ¿la aplicación muestra algún indicador?
- **Respuesta:** No. La aplicación se ve y funciona exactamente igual con o sin conexión.
- **Motivo:** Como nada depende de internet, un indicador solo generaría dudas innecesarias.

## D-04: Datos al reinstalar

- **Pregunta:** Si el estudiante desinstala y vuelve a instalar la aplicación, ¿qué pasa con sus ajustes y su progreso?
- **Respuesta:** Empieza de cero: se usan los valores por defecto y no se intenta recuperar nada.
- **Motivo:** Los datos viven solo en el celular; no hay cuentas ni servidores desde donde restaurarlos.

## D-05: Aviso de almacenamiento local

- **Pregunta:** ¿Se informa al estudiante en algún lugar que sus datos se guardan solo en el celular?
- **Respuesta:** Sí, con una nota fija en la pantalla de Ajustes: «Tus ajustes se guardan solo en este celular. Si desinstalas la aplicación, se borrarán.».
- **Motivo:** Que el estudiante sepa, antes de desinstalar, que perderá sus ajustes.

## D-06: Fallo al guardar el progreso

- **Pregunta:** Si falla el guardado local del progreso de la sesión (por ejemplo, almacenamiento lleno), ¿qué ve el estudiante?
- **Respuesta:** Un aviso visible: «No se pudo guardar tu progreso en el celular. El temporizador sigue funcionando.». El temporizador no se detiene.
- **Motivo:** El estudiante debe saber que su progreso podría no conservarse al cerrar la aplicación, sin que eso le impida seguir estudiando.

## D-07: Permisos y rastreo

- **Pregunta:** Además de no mostrar anuncios, ¿qué permisos puede pedir la aplicación?
- **Respuesta:** Solo el permiso de notificaciones. No se piden otros permisos (ubicación, micrófono, contactos ni rastreo publicitario) y no se incluyen herramientas de analítica ni de rastreo.
- **Motivo:** Coherente con no usar internet ni publicidad, y con pedir solo lo necesario para los avisos de HU-004.

## D-08: Borrar todos los datos

- **Pregunta:** ¿Debe existir una opción para borrar todos los datos guardados sin desinstalar la aplicación?
- **Respuesta:** No; queda fuera de alcance.
- **Motivo:** «Restablecer valores por defecto» (HU-005) y «Reiniciar» ya cubren lo necesario.

## D-09: Ubicación y cierre del aviso de fallo al guardar

- **Pregunta:** ¿Dónde se muestra el aviso de fallo al guardar el progreso y hasta cuándo?
- **Respuesta:** En la pantalla principal (temporizador de estudio), y desaparece cuando el estudiante lo cierra.
- **Motivo:** La pantalla principal es la que el estudiante ve con más frecuencia, y cerrarlo de forma explícita confirma que leyó el aviso.


================================================
ðŸ“„ ARCHIVO: specs\006-uso-offline\plan.md
================================================

# Plan 006 — Usar la aplicación sin registro, sin internet y sin publicidad

Spec: specs/006-uso-offline/spec.md (aprobada) · Decisiones: D-01 a D-09

## Resumen

La aplicación ya cumple buena parte de HU-006:
- Abre en el temporizador (`src/app/(tabs)/index.tsx`).
- No tiene cuentas ni anuncios.
- Guarda todo con AsyncStorage.
- Solo pide el permiso de notificaciones, al iniciar la primera sesión.

Al revisar el código y la configuración (`npx expo config --type introspect`) aparecieron cuatro huecos:

1. **Copia de seguridad en Android (RF-06):** `android.allowBackup` vale `true` por defecto. La copia automática de Google puede restaurar AsyncStorage al reinstalar, lo que contradice D-04.
2. **Permisos de más en Android (RF-10, D-07):** el manifiesto generado declara `READ_EXTERNAL_STORAGE`, `WRITE_EXTERNAL_STORAGE` y `SYSTEM_ALERT_WINDOW`, que la app no necesita.
3. **Fallos de guardado silenciosos (RF-08):** los fallos al guardar la sesión y el ciclo solo se registran con `console.error`.
4. **Falta la nota de almacenamiento local (RF-07).**

No hay llamadas de red en `src/`, y las dependencias de la plantilla (por ejemplo `expo-web-browser` o `expo-linking`) no se usan. Para que siga siendo así, se añaden pruebas de guardia que protegen RF-04, RF-09 y RNF-02 ante cambios futuros.

## Archivos y responsabilidades

| Archivo | Acción | Responsabilidad | RF |
|---|---|---|---|
| `app.json` | Modificar | `android.allowBackup: false`; `android.blockedPermissions` con los tres permisos sobrantes. | RF-06, RF-10 |
| `src/__tests__/offline-config.test.ts` | Crear | Guardia de configuración: copia desactivada, permisos bloqueados, sin `updates.url` y sin claves de uso de iOS. | RF-04, RF-06, RF-10; RNF-01 |
| `src/__tests__/offline-guard.test.ts` | Crear | Guardia de código y dependencias: sin APIs de red en `src/` y sin paquetes de anuncios, analítica o rastreo. | RF-04, RF-09; RNF-01, RNF-02 |
| `src/hooks/use-pomodoro-timer.ts` | Modificar | Estado `storageMessage`, acciones `storage-save-failed` y `dismiss-storage-message`; exportar el reducer para probarlo. | RF-08 |
| `src/hooks/__tests__/pomodoro-timer-reducer.test.ts` | Crear | Pruebas del aviso de guardado. | RF-08 |
| `src/app/(tabs)/index.tsx` | Modificar | Tarjeta del aviso de RF-08 con botón «Cerrar». | RF-08 |
| `src/app/ajustes.tsx` | Modificar | Nota fija de almacenamiento local. | RF-07 |

Sin cambios: el primer inicio y la ausencia de cuentas (RF-01, RF-02), y el uso sin conexión y sin indicador de red (RF-03, RF-05), porque ya se cumplen. Se verifican manualmente en T6.

## Funciones puras y estado

```
pomodoroTimerReducer (exportado solo para pruebas)
  'storage-save-failed'      -> storageMessage = MENSAJE_RF08   (los temporizadores no cambian)
  'dismiss-storage-message'  -> storageMessage = null
```

## Persistencia

- No cambia el formato de ningún dato.
- `savePomodoroSession` y `savePomodoroCycle`, cuando fallan, despachan `storage-save-failed` además de `console.error`.
- Un fallo nunca detiene ni reinicia el temporizador (RF-08).
- Los datos siguen solo en el celular; con `allowBackup: false`, Android no los copia ni los restaura (RF-06, D-04).

## Algoritmo

```
al fallar savePomodoroSession o savePomodoroCycle:
    console.error(...)
    dispatch('storage-save-failed')       # el aviso aparece o sigue visible

al tocar «Cerrar» en el aviso:
    dispatch('dismiss-storage-message')   # desaparece hasta un nuevo fallo
```

## Interfaz

- **Pantalla principal:**
  - Tarjeta con borde Crimson `#e60023`, fondo blanco y texto `#100048`, con el mensaje de RF-08 y `accessibilityLiveRegion="polite"`.
  - Botón «Cerrar» de al menos 44×44 con etiqueta «Cerrar aviso de guardado».
  - Se muestra sobre el reloj, junto al aviso de ajustes de HU-005.
- **Ajustes:** debajo de la introducción, texto secundario `#6A5751` con «Tus ajustes se guardan solo en este celular. Si desinstalas la aplicación, se borrarán.» (RF-07).
- No se añade ningún indicador de red (RF-05). Todos los textos van en español.

## Decisiones técnicas

| Decisión | Elegida | Alternativa descartada |
|---|---|---|
| Restauración al reinstalar (D-04) | `android.allowBackup: false`. iOS no restaura los datos al reinstalar desde la tienda. | Mantener la copia automática: Android podría restaurar ajustes y progreso, en contra de D-04. |
| Permisos sobrantes (D-07) | `android.blockedPermissions` para `READ_EXTERNAL_STORAGE`, `WRITE_EXTERNAL_STORAGE` y `SYSTEM_ALERT_WINDOW`, según la guía de permisos de Expo. | Dejarlos: el sistema no los pide, pero la tienda los muestra como permisos de la app. |
| Permiso `INTERNET` | Se mantiene: es un permiso normal que el sistema nunca pide al usuario, y las compilaciones de desarrollo lo necesitan para cargar el código. RF-04 se garantiza con la guardia de código. | Bloquearlo: rompe las compilaciones de desarrollo y no cambia nada visible. |
| Garantizar «sin red ni anuncios» | Pruebas de guardia en Jest que inspeccionan `src/`, `package.json` y `app.json`. | Revisión manual: no evita regresiones futuras. |
| Dependencias de plantilla sin usar | No se eliminan en esta fase; no hacen peticiones si no se llaman, y algunas son dependencias de Expo Router. | Quitarlas: riesgo de romper la navegación sin beneficio visible. |
| Probar el aviso de RF-08 | Exportar el reducer y probar sus acciones. | Montar el proveedor con dependencias simuladas: más frágil y lento. |

## Estrategia de pruebas con Jest

- **`offline-config.test.ts`** lee `app.json` y comprueba:
  - `android.allowBackup === false`.
  - `blockedPermissions` contiene los tres permisos.
  - No hay `updates.url`.
  - No hay claves `*UsageDescription` en `ios.infoPlist`.
  - Debe fallar antes de cambiar `app.json`.
- **`offline-guard.test.ts`:**
  - Recorre los `.ts` y `.tsx` de `src/` (sin `__tests__`) y no encuentra `fetch(`, `XMLHttpRequest`, `WebSocket`, `EventSource`, `openBrowserAsync` ni `Linking.openURL`.
  - Las dependencias de `package.json` no incluyen paquetes de anuncios, analítica ni rastreo (admob, ads, analytics, firebase, sentry, amplitude, mixpanel, segment, appsflyer, facebook, tracking-transparency).
  - Es una prueba de regresión: pasa desde el inicio porque el código actual ya cumple.
- **`pomodoro-timer-reducer.test.ts`:**
  - `storage-save-failed` fija el mensaje sin tocar los temporizadores.
  - `dismiss-storage-message` lo limpia.
  - Un nuevo fallo lo vuelve a mostrar.
- **Interfaz:** verificación manual en Expo Go. `allowBackup` y `blockedPermissions` no se aplican en Expo Go, así que se verifican con `npx expo config --type introspect`.
- Al cerrar: `npx jest`, `npx expo lint` y `npx tsc --noEmit`.

## Cobertura de RF

| RF | Parte del plan |
|---|---|
| RF-01, RF-02 | Sin cambios; verificación manual (T6) |
| RF-03, RF-05 | Sin cambios; verificación manual en modo avión (T6) |
| RF-04 | Guardia de código y configuración |
| RF-06 | `allowBackup: false` |
| RF-07 | Nota en Ajustes |
| RF-08 | Reducer, aviso en la pantalla principal |
| RF-09 | Guardia de dependencias |
| RF-10 | `blockedPermissions`, sin claves de uso en iOS |
| RNF-01, RNF-02 | Guardias de código, dependencias y configuración |
| RNF-03 | Persistencia actual de HU-003 y HU-005; aviso RF-08 si falla |


================================================
ðŸ“„ ARCHIVO: specs\006-uso-offline\spec.md
================================================

# Spec 006 — Usar la aplicación sin registro, sin internet y sin publicidad

Estado: implementada
HU de origen: docs/historias/HU-006.md

## Contexto y objetivo
Permitir que el estudiante empiece a estudiar apenas instala la aplicación: sin crear una cuenta, sin depender de datos móviles o wifi y sin anuncios. Todo lo que la aplicación guarda vive solo en el celular, y el estudiante debe saberlo y enterarse si ese guardado falla, sin que eso le impida seguir usando el temporizador.

## Usuarios
- Estudiante

## Historias de usuario
Como estudiante, quiero usar la aplicación apenas la instalo, sin crear una cuenta, sin datos móviles y sin anuncios, para empezar a estudiar sin trabas.

## Definiciones
- **Datos guardados:** los ajustes de tiempos (HU-005) y el progreso de la sesión y del ciclo (HU-002, HU-003).
- **Sin conexión:** el celular no tiene datos móviles ni wifi, o están desactivados.

## Requisitos funcionales
- **RF-01:** CUANDO el estudiante abra la aplicación por primera vez, EL SISTEMA mostrará directamente el temporizador, sin pantallas de registro, inicio de sesión, bienvenida ni tutorial. Origen: HU-006, escenario «Abrir la aplicación por primera vez»; decisiones.md, D-01.
- **RF-02:** EL SISTEMA no pedirá en ningún momento crear una cuenta ni iniciar sesión. Origen: HU-006, descripción y escenario «Abrir la aplicación por primera vez»; decisiones.md, D-01.
- **RF-03:** MIENTRAS el celular esté sin conexión, EL SISTEMA ofrecerá el temporizador, los avisos y los ajustes con el mismo comportamiento que con conexión. Origen: HU-006, escenario «Usarla sin conexión»; decisiones.md, D-02.
- **RF-04:** EL SISTEMA guardará los datos guardados únicamente en el celular y no realizará ninguna comunicación por internet. Origen: HU-006, escenario «Usarla sin conexión»; decisiones.md, D-02.
- **RF-05:** EL SISTEMA no mostrará ningún indicador de estado de conexión; su apariencia será la misma con o sin conexión. Origen: decisiones.md, D-03.
- **RF-06:** CUANDO el estudiante abra la aplicación después de reinstalarla, EL SISTEMA usará los valores por defecto de los ajustes y un ciclo nuevo, sin intentar recuperar datos anteriores. Origen: decisiones.md, D-04.
- **RF-07:** EL SISTEMA mostrará en la pantalla de ajustes la nota fija «Tus ajustes se guardan solo en este celular. Si desinstalas la aplicación, se borrarán.». Origen: decisiones.md, D-05.
- **RF-08:** SI falla el guardado del progreso de la sesión en el celular, ENTONCES EL SISTEMA mostrará en la pantalla principal el aviso «No se pudo guardar tu progreso en el celular. El temporizador sigue funcionando.» con un control para cerrarlo, lo mantendrá visible hasta que el estudiante lo cierre y el temporizador continuará sin detenerse. Origen: HU-006, escenario «Usarla sin conexión»; decisiones.md, D-06 y D-09.
- **RF-09:** EL SISTEMA no mostrará anuncios en ninguna de sus pantallas. Origen: HU-006, escenario «Usarla sin publicidad».
- **RF-10:** EL SISTEMA solicitará únicamente el permiso de notificaciones, en el momento definido por HU-004, y no pedirá ningún otro permiso. Origen: decisiones.md, D-01 y D-07; HU-004.

## Requisitos no funcionales
- **RNF-01:** La aplicación no consume datos móviles en ninguna circunstancia. Origen: HU-006, descripción; decisiones.md, D-02.
- **RNF-02:** La aplicación no incluye herramientas de analítica, rastreo ni publicidad. Origen: HU-006, escenario «Usarla sin publicidad»; decisiones.md, D-07.
- **RNF-03:** Los datos guardados se conservan entre cierres y reinicios de la aplicación mientras no se desinstale. Origen: HU-006, escenario «Usarla sin conexión»; constitución, principio 5.

## Casos límite
- Si el celular está en modo avión desde la instalación, el primer inicio muestra el temporizador y todo funciona (RF-01, RF-03).
- Si la conexión se pierde o recupera con el temporizador corriendo, no cambia nada visible ni el tiempo restante (RF-03, RF-05).
- Si el estudiante deniega el permiso de notificaciones, no se pide ningún otro permiso a cambio y el temporizador sigue funcionando (RF-10; HU-004).
- Si el almacenamiento del celular está lleno, el temporizador sigue corriendo y el estudiante ve el aviso de RF-08 en la pantalla principal hasta cerrarlo (RF-08).
- Si el estudiante reinstala la aplicación, ve 25/5/15/4 y «Pomodoros: 0/4» (RF-06).

## Fuera de alcance
- Opción para borrar todos los datos sin desinstalar (decisiones.md, D-08).
- Copias de seguridad, sincronización entre dispositivos o recuperación de datos tras reinstalar.
- Cuentas de usuario, servidores, actualizaciones descargadas por internet y cualquier función en línea.
- Indicadores de estado de la red.

## Criterios de finalización
- Los requisitos RF-01 a RF-10 y RNF-01 a RNF-03 pueden verificarse con los escenarios y casos límite descritos.
- Cada escenario de HU-006 está cubierto por al menos un requisito funcional.
- La aplicación completa puede usarse en modo avión desde la instalación.

## Dudas abiertas
- Ninguna.


================================================
ðŸ“„ ARCHIVO: specs\006-uso-offline\tasks.md
================================================

# Tareas: Usar la aplicación sin registro, sin internet y sin publicidad

Ejecutar en orden. Las pruebas se escriben primero; las de configuración y estado deben fallar antes de implementar. Las de interfaz se verifican manualmente en Expo Go con la lista de `rn-conventions`. Total: 6 tareas.

- [x] **T1. Desactivar la copia de seguridad y bloquear permisos sobrantes.** RF-04, RF-06, RF-10; RNF-01
  - Archivos: `src/__tests__/offline-config.test.ts`, `app.json`.
  - Hecho cuando: la prueba falla con el `app.json` actual y pasa tras fijar `android.allowBackup: false` y bloquear `READ_EXTERNAL_STORAGE`, `WRITE_EXTERNAL_STORAGE` y `SYSTEM_ALERT_WINDOW`; `npx expo config --type introspect` ya no lista esos permisos.

- [x] **T2. Guardia de red, anuncios y rastreo.** RF-04, RF-09; RNF-01, RNF-02
  - Archivos: `src/__tests__/offline-guard.test.ts`.
  - Hecho cuando: `npx jest` confirma que `src/` no usa APIs de red y que `package.json` no tiene paquetes de anuncios, analítica ni rastreo; para comprobar que la guardia funciona, se introduce temporalmente una llamada `fetch(` y la prueba falla.

- [x] **T3. Estado del aviso de fallo al guardar.** RF-08
  - Archivos: `src/hooks/use-pomodoro-timer.ts`, `src/hooks/__tests__/pomodoro-timer-reducer.test.ts`.
  - Hecho cuando: `npx jest` demuestra que `storage-save-failed` muestra el mensaje sin alterar los temporizadores, que `dismiss-storage-message` lo oculta y que un nuevo fallo lo vuelve a mostrar; los fallos de `savePomodoroSession` y `savePomodoroCycle` despachan la acción; pasa `npx tsc --noEmit`.

- [x] **T4. Aviso de fallo al guardar en la pantalla principal.** RF-08
  - Archivos: `src/app/(tabs)/index.tsx`.
  - Hecho cuando: en Expo Go, al forzar temporalmente un fallo de guardado, la pantalla principal muestra el aviso con «Cerrar» (al menos 44×44, con etiqueta accesible), el temporizador sigue corriendo y el aviso desaparece al cerrarlo.

- [x] **T5. Nota de almacenamiento local en Ajustes.** RF-07
  - Archivos: `src/app/ajustes.tsx`.
  - Hecho cuando: en Expo Go la pantalla de ajustes muestra la nota fija de RF-07, legible en vertical y horizontal y sin tapar los campos ni los botones con el teclado abierto.

- [x] **T6. Verificación final.** RF-01–RF-10; RNF-01–RNF-03
  - Archivos: pruebas de `src/`.
  - Hecho cuando: pasan `npx jest`, `npx expo lint` y `npx tsc --noEmit`, y el usuario confirma en Expo Go que:
    - Tras borrar los datos de Expo Go, el primer inicio muestra el temporizador sin registro.
    - Con la app cargada y el modo avión activado, el temporizador, los avisos y los ajustes funcionan igual y no aparece ningún indicador de red.
    - No aparece ningún anuncio.
    - Solo se pide el permiso de notificaciones.


================================================
ðŸ“„ ARCHIVO: src\app\(tabs)\index.tsx
================================================

import { useEffect, useMemo, useState } from 'react';
import { router } from 'expo-router';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActionButton } from '@/components/action-button';
import { AppIcon } from '@/components/app-icon';
import { BrandHeader } from '@/components/brand-header';
import { PhaseCard } from '@/components/phase-card';
import { ScreenFooter } from '@/components/screen-footer';
import { BRAND } from '@/constants/brand';
import { formatRemainingTime } from '@/domain/timer';
import { usePomodoroTimer } from '@/hooks/use-pomodoro-timer';

export default function HomeScreen() {
  const {
    focusTimer,
    pomodoroCount,
    cycleLength,
    breakType,
    isAlarmActive,
    isHydrated,
    hydrationError,
    hasStartedSession,
    settingsMessage,
    storageMessage,
    dismissStorageMessage,
    startFocus,
    pauseFocus,
    resetFocus,
    recoverFromHydrationError,
    requestNotificationPermission,
  } = usePomodoroTimer();
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const formattedTime = useMemo(
    () => formatRemainingTime(focusTimer.remainingMs),
    [focusTimer.remainingMs],
  );
  const isRunning = focusTimer.status === 'running';
  const isPaused = focusTimer.status === 'paused';
  const isFinished = focusTimer.status === 'finished';
  const isResuming = isPaused && focusTimer.remainingMs < focusTimer.initialDurationMs;

  useEffect(() => {
    if (breakType !== null && !isAlarmActive) {
      router.replace('/descanso');
    }
  }, [breakType, isAlarmActive]);

  const handleReset = () => {
    Alert.alert(
      'Reiniciar temporizador',
      '¿Quieres volver al tiempo inicial de concentración?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Reiniciar', style: 'destructive', onPress: resetFocus },
      ],
      { cancelable: true },
    );
  };

  const handleStart = () => {
    if (isRunning) {
      pauseFocus();
      return;
    }
    if (hasStartedSession) {
      startFocus();
      return;
    }

    Alert.alert(
      'Aviso al terminar',
      'Las notificaciones permiten avisarte cuando termine una fase si la aplicación está cerrada.',
      [
        {
          text: 'Continuar',
          onPress: () => {
            setIsRequestingPermission(true);
            requestNotificationPermission()
              .then(() => startFocus())
              .catch(() => {
                startFocus();
              })
              .finally(() => setIsRequestingPermission(false));
          },
        },
      ],
      { cancelable: false },
    );
  };

  const status = isRunning
    ? 'Sesión en curso'
    : isFinished
      ? 'Sesión finalizada'
      : isResuming
        ? 'Sesión pausada'
        : 'Listo para concentrarte';
  const openSettings = () => router.push('/ajustes');

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <BrandHeader
          rightAction={{ icon: 'settings', accessibilityLabel: 'Abrir ajustes', onPress: openSettings }}
          subtitle="Enfócate hoy, logra mañana"
          title="Temporizador"
        />

        <View style={styles.content}>
          {!isHydrated ? (
            <Text accessibilityLiveRegion="polite" style={styles.statusMessage}>
              Restaurando la sesión guardada…
            </Text>
          ) : hydrationError !== null ? (
            <View style={styles.noticeCard}>
              <Text style={styles.noticeTitle}>No se pudo restaurar la sesión.</Text>
              <Text style={styles.noticeMessage}>
                El temporizador permanecerá pausado. Detalle: {hydrationError}
              </Text>
              <ActionButton
                icon="restart"
                label="Iniciar una sesión nueva"
                onPress={recoverFromHydrationError}
              />
            </View>
          ) : (
            <>
              {storageMessage !== null && (
                <View accessibilityLiveRegion="polite" style={styles.noticeCard}>
                  <Text style={styles.noticeMessage}>{storageMessage}</Text>
                  <Pressable
                    accessibilityLabel="Cerrar aviso de guardado"
                    accessibilityRole="button"
                    hitSlop={8}
                    onPress={dismissStorageMessage}
                    style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}>
                    <AppIcon color={BRAND.midnightBlue} name="close" size={18} />
                    <Text style={styles.closeButtonText}>Cerrar</Text>
                  </Pressable>
                </View>
              )}

              {settingsMessage !== null && (
                <View accessibilityLiveRegion="polite" style={styles.noticeCard}>
                  <Text style={styles.noticeMessage}>{settingsMessage}</Text>
                  <ActionButton
                    icon="settings"
                    label="Ir a Ajustes"
                    onPress={openSettings}
                    variant="secondary"
                  />
                </View>
              )}

              <PhaseCard
                footer={
                  <View style={styles.progressPill}>
                    <AppIcon color={BRAND.orange} name="group" size={22} />
                    <Text style={styles.progressLabel}>Pomodoros:</Text>
                    <Text style={styles.progressValue}>
                      {pomodoroCount}/{cycleLength}
                    </Text>
                  </View>
                }
                phaseIcon="target"
                phaseLabel="Estudio"
                status={status}
                time={formattedTime}
              />

              <View style={styles.controls}>
                <ActionButton
                  accessibilityLabel={
                    isRunning
                      ? 'Pausar temporizador'
                      : isResuming
                        ? 'Reanudar temporizador'
                        : 'Iniciar temporizador'
                  }
                  disabled={isFinished || isRequestingPermission}
                  icon={isRunning ? 'pause' : 'play'}
                  label={
                    isRequestingPermission
                      ? 'Solicitando permiso…'
                      : isRunning
                        ? 'Pausar'
                        : isFinished
                          ? 'Finalizado'
                          : isResuming
                            ? 'Reanudar'
                            : 'Iniciar'
                  }
                  onPress={handleStart}
                />

                {!isFinished && (
                  <ActionButton
                    accessibilityLabel="Reiniciar temporizador"
                    icon="restart"
                    label="Reiniciar"
                    onPress={handleReset}
                    variant="danger"
                  />
                )}
              </View>
            </>
          )}
        </View>

        <ScreenFooter message="Puedes pausar y continuar cuando lo necesites." />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: BRAND.whitesmoke,
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
  },
  content: {
    alignSelf: 'center',
    flexGrow: 1,
    gap: 22,
    maxWidth: 560,
    paddingHorizontal: 20,
    paddingVertical: 24,
    width: '100%',
  },
  controls: {
    gap: 14,
  },
  progressPill: {
    alignItems: 'center',
    borderColor: BRAND.softWhite,
    borderRadius: 24,
    borderWidth: 2,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 22,
    paddingVertical: 8,
  },
  progressLabel: {
    color: BRAND.white,
    fontSize: 17,
    fontWeight: '600',
  },
  progressValue: {
    color: BRAND.orange,
    fontSize: 20,
    fontWeight: '800',
  },
  statusMessage: {
    color: BRAND.midnightBlue,
    fontSize: 16,
    textAlign: 'center',
  },
  noticeCard: {
    backgroundColor: BRAND.white,
    borderColor: BRAND.crimson,
    borderRadius: 20,
    borderWidth: 2,
    gap: 14,
    padding: 18,
  },
  noticeTitle: {
    color: BRAND.crimson,
    fontSize: 18,
    fontWeight: '800',
  },
  noticeMessage: {
    color: BRAND.midnightBlue,
    fontSize: 15,
  },
  closeButton: {
    alignItems: 'center',
    alignSelf: 'flex-end',
    borderColor: BRAND.midnightBlue,
    borderRadius: 22,
    borderWidth: 2,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    minHeight: 44,
    minWidth: 120,
    paddingHorizontal: 16,
  },
  closeButtonText: {
    color: BRAND.midnightBlue,
    fontSize: 16,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.8,
  },
});


================================================
ðŸ“„ ARCHIVO: src\app\ajustes.tsx
================================================

import { useEffect, useState } from 'react';
import { router, useNavigation } from 'expo-router';
import { usePreventRemove } from 'expo-router/react-navigation';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActionButton } from '@/components/action-button';
import { AppIcon, type AppIconName } from '@/components/app-icon';
import { BrandHeader } from '@/components/brand-header';
import { ScreenFooter } from '@/components/screen-footer';
import { BRAND } from '@/constants/brand';

import {
  DEFAULT_SETTINGS,
  SETTINGS_FIELDS,
  SETTINGS_RANGES,
  validateSettingsInput,
  type PomodoroSettings,
  type SettingsErrors,
  type SettingsField,
  type SettingsInput,
} from '@/domain/settings';
import { usePomodoroTimer, type SaveSettingsResult } from '@/hooks/use-pomodoro-timer';

const DEFERRED_CHANGE_MESSAGE =
  'El nuevo tiempo se aplicará cuando termine la fase en curso o al presionar «Reiniciar».';

const FIELD_LABELS: Record<
  SettingsField,
  { label: string; unit: string; icon: AppIconName; tile: string; iconColor: string }
> = {
  focusMinutes: {
    label: 'Estudio',
    unit: 'minutos',
    icon: 'target',
    tile: BRAND.midnightBlue,
    iconColor: BRAND.orange,
  },
  shortBreakMinutes: {
    label: 'Descanso corto',
    unit: 'minutos',
    icon: 'coffee',
    tile: BRAND.orange,
    iconColor: BRAND.midnightBlue,
  },
  longBreakMinutes: {
    label: 'Descanso largo',
    unit: 'minutos',
    icon: 'sofa',
    tile: BRAND.crimson,
    iconColor: BRAND.white,
  },
  cycleLength: {
    label: 'Pomodoros por ciclo',
    unit: 'pomodoros',
    icon: 'cycle',
    tile: BRAND.midnightBlue,
    iconColor: BRAND.orange,
  },
};

function toInput(settings: PomodoroSettings): SettingsInput {
  return {
    focusMinutes: String(settings.focusMinutes),
    shortBreakMinutes: String(settings.shortBreakMinutes),
    longBreakMinutes: String(settings.longBreakMinutes),
    cycleLength: String(settings.cycleLength),
  };
}

function cycleGoalMessage(cycleLength: number): string {
  return `Ya completaste los ${cycleLength} pomodoros de este ciclo. Tu próximo descanso será el descanso largo.`;
}

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { settings, saveSettings, resetSettings } = usePomodoroTimer();
  const [inputs, setInputs] = useState<SettingsInput>(() => toInput(settings));
  const [errors, setErrors] = useState<SettingsErrors>({});
  const [statusMessage, setStatusMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [exitRequested, setExitRequested] = useState(false);
  const savedInputs = toInput(settings);
  const hasChanges = SETTINGS_FIELDS.some((field) => inputs[field] !== savedInputs[field]);

  usePreventRemove(hasChanges && !exitRequested, ({ data }) => {
    Alert.alert(
      'Cambios sin guardar',
      '¿Quieres descartar los cambios que hiciste en los ajustes?',
      [
        { text: 'Seguir editando', style: 'cancel' },
        {
          text: 'Descartar',
          style: 'destructive',
          onPress: () => navigation.dispatch(data.action),
        },
      ],
      { cancelable: true },
    );
  });

  useEffect(() => {
    if (!exitRequested) {
      return;
    }

    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  }, [exitRequested]);

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  const handleResult = (
    result: SaveSettingsResult,
    savedSettings: PomodoroSettings,
    onSuccess: () => void,
  ) => {
    if (!result.success) {
      setStatusMessage(result.message);
      return;
    }

    setStatusMessage('');
    const messages = [
      result.durationChangeDeferred ? DEFERRED_CHANGE_MESSAGE : null,
      result.cycleGoalReached ? cycleGoalMessage(savedSettings.cycleLength) : null,
    ].filter((message): message is string => message !== null);
    if (messages.length > 0) {
      Alert.alert('Ajustes guardados', messages.join('\n\n'), [
        { text: 'Entendido', onPress: onSuccess },
      ]);
      return;
    }

    onSuccess();
  };

  const handleSave = async () => {
    const validation = validateSettingsInput(inputs);
    if (!validation.success) {
      setErrors(validation.errors);
      setStatusMessage('No se guardó ningún cambio. Corrige los campos marcados.');
      return;
    }

    setErrors({});
    setIsSaving(true);
    const result = await saveSettings(validation.settings);
    setIsSaving(false);
    handleResult(result, validation.settings, () => setExitRequested(true));
  };

  const handleReset = () => {
    Alert.alert(
      'Restablecer valores por defecto',
      'Los tiempos volverán a 25 minutos de estudio, 5 de descanso corto, 15 de descanso largo y 4 pomodoros por ciclo.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Restablecer',
          style: 'destructive',
          onPress: async () => {
            setIsSaving(true);
            const result = await resetSettings();
            setIsSaving(false);
            if (result.success) {
              setInputs(toInput(DEFAULT_SETTINGS));
              setErrors({});
            }
            handleResult(result, DEFAULT_SETTINGS, () =>
              setStatusMessage('Se restablecieron los valores por defecto.'),
            );
          },
        },
      ],
      { cancelable: true },
    );
  };

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoider}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <BrandHeader illustration="school" onBack={goBack} title="Ajustes" />

          <View style={styles.content}>
            <View style={styles.infoCard}>
              <View style={styles.infoIcon}>
                <AppIcon color={BRAND.white} name="info" size={22} />
              </View>
              <Text style={styles.infoText}>
                Los cambios se aplican desde la siguiente fase. La fase en curso termina con su
                tiempo original.
              </Text>
            </View>

            {SETTINGS_FIELDS.map((field) => {
              const { label, unit, icon, tile, iconColor } = FIELD_LABELS[field];
              const { min, max } = SETTINGS_RANGES[field];
              const error = errors[field];
              return (
                <View key={field} style={[styles.fieldCard, error !== undefined && styles.fieldCardError]}>
                  <View style={styles.fieldRow}>
                    <View style={[styles.fieldTile, { backgroundColor: tile }]}>
                      <AppIcon color={iconColor} name={icon} size={30} />
                    </View>
                    <Text nativeID={`${field}-label`} style={styles.label}>
                      {label} <Text style={styles.range}>({min}–{max} {unit})</Text>
                    </Text>
                    <View style={[styles.inputBox, error !== undefined && styles.inputError]}>
                      <TextInput
                        accessibilityHint={`Valor entre ${min} y ${max}`}
                        accessibilityLabel={`${label} en ${unit}`}
                        accessibilityLabelledBy={`${field}-label`}
                        autoCorrect={false}
                        keyboardType="number-pad"
                        maxLength={3}
                        onChangeText={(value) => {
                          setInputs((current) => ({ ...current, [field]: value }));
                          setErrors((current) => ({ ...current, [field]: undefined }));
                          setStatusMessage('');
                        }}
                        returnKeyType="done"
                        style={styles.input}
                        value={inputs[field]}
                      />
                      <AppIcon color={BRAND.secondaryText} name="clock" size={20} />
                    </View>
                  </View>
                  {error !== undefined && (
                    <Text accessibilityLiveRegion="polite" style={styles.errorText}>
                      {error}
                    </Text>
                  )}
                </View>
              );
            })}

            {statusMessage !== '' && (
              <Text accessibilityLiveRegion="polite" style={styles.statusMessage}>
                {statusMessage}
              </Text>
            )}

            <View style={styles.controls}>
              <ActionButton
                accessibilityLabel="Guardar ajustes"
                disabled={isSaving}
                icon="save"
                label={isSaving ? 'Guardando…' : 'Guardar'}
                layout="centered"
                onPress={handleSave}
              />
              <ActionButton
                accessibilityLabel="Restablecer valores por defecto"
                disabled={isSaving}
                icon="restart"
                label="Restablecer valores por defecto"
                layout="centered"
                onPress={handleReset}
                variant="danger"
              />
            </View>

            <View style={styles.infoCard}>
              <View style={styles.infoIcon}>
                <AppIcon color={BRAND.white} name="shield" size={22} />
              </View>
              <Text style={styles.infoText}>
                Tus ajustes se guardan solo en este celular. Si desinstalas la aplicación, se
                borrarán.
              </Text>
            </View>
          </View>

          <ScreenFooter icon="school" message="¡Tú puedes!" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: BRAND.whitesmoke,
    flex: 1,
  },
  keyboardAvoider: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
  },
  content: {
    alignSelf: 'center',
    flexGrow: 1,
    gap: 14,
    maxWidth: 560,
    paddingBottom: 24,
    paddingHorizontal: 20,
    paddingTop: 22,
    width: '100%',
  },
  infoCard: {
    alignItems: 'center',
    backgroundColor: BRAND.softMidnightTint,
    borderRadius: 18,
    flexDirection: 'row',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  infoIcon: {
    alignItems: 'center',
    backgroundColor: BRAND.midnightBlue,
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  infoText: {
    color: BRAND.midnightBlue,
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  fieldCard: {
    backgroundColor: BRAND.white,
    borderColor: BRAND.white,
    borderRadius: 20,
    borderWidth: 2,
    elevation: 2,
    gap: 8,
    padding: 12,
    shadowColor: BRAND.midnightBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  fieldCardError: {
    borderColor: BRAND.crimson,
  },
  fieldRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  fieldTile: {
    alignItems: 'center',
    borderRadius: 16,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  label: {
    color: BRAND.midnightBlue,
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
  },
  range: {
    color: BRAND.midnightBlue,
    fontSize: 14,
    fontWeight: '500',
  },
  inputBox: {
    alignItems: 'center',
    backgroundColor: BRAND.white,
    borderColor: BRAND.silver,
    borderRadius: 14,
    borderWidth: 2,
    flexDirection: 'row',
    minHeight: 52,
    paddingHorizontal: 12,
    width: 112,
  },
  input: {
    color: BRAND.black,
    flex: 1,
    fontSize: 22,
    fontWeight: '700',
    minHeight: 48,
    paddingVertical: 0,
  },
  inputError: {
    borderColor: BRAND.crimson,
  },
  errorText: {
    borderLeftColor: BRAND.crimson,
    borderLeftWidth: 4,
    color: BRAND.black,
    fontSize: 14,
    fontWeight: '600',
    paddingLeft: 8,
  },
  statusMessage: {
    color: BRAND.midnightBlue,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  controls: {
    gap: 14,
    marginTop: 8,
  },
});


================================================
ðŸ“„ ARCHIVO: src\app\descanso.tsx
================================================

import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActionButton } from '@/components/action-button';
import { BrandHeader } from '@/components/brand-header';
import { PhaseCard } from '@/components/phase-card';
import { ScreenFooter } from '@/components/screen-footer';
import { BRAND } from '@/constants/brand';
import { formatRemainingTime } from '@/domain/timer';
import { usePomodoroTimer } from '@/hooks/use-pomodoro-timer';

export default function BreakScreen() {
  const { breakTimer, breakType, isAlarmActive, startBreak, pauseBreak, resetBreak } =
    usePomodoroTimer();
  const [validationMessage, setValidationMessage] = useState('');
  const formattedTime = formatRemainingTime(breakTimer.remainingMs);
  const isRunning = breakTimer.status === 'running';
  const isPaused = breakTimer.status === 'paused';
  const hasElapsed = breakTimer.remainingMs < breakTimer.initialDurationMs;
  const breakLabel = breakType === 'long' ? 'Descanso largo' : 'Descanso corto';
  const status = isRunning
    ? 'Descanso en curso'
    : hasElapsed
      ? 'Descanso pausado'
      : 'Listo para descansar';
  const openSettings = () => router.push('/ajustes');

  useEffect(() => {
    if (!isAlarmActive && (breakType === null || breakTimer.initialDurationMs <= 0)) {
      router.replace('/(tabs)');
    }
  }, [breakTimer.initialDurationMs, breakType, isAlarmActive]);

  const handleStartBreak = () => {
    if (!startBreak()) {
      setValidationMessage('No hay un descanso preparado para iniciar.');
      return;
    }
    setValidationMessage('');
  };

  const handleResetBreak = () => {
    Alert.alert(
      'Reiniciar descanso',
      '¿Quieres volver al tiempo inicial del descanso y dejarlo pausado?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Reiniciar', style: 'destructive', onPress: resetBreak },
      ],
      { cancelable: true },
    );
  };

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <BrandHeader
          illustration="coffee"
          rightAction={{ icon: 'settings', accessibilityLabel: 'Abrir ajustes', onPress: openSettings }}
          subtitle="Recarga energía para seguir"
          title={breakLabel}
        />

        <View style={styles.content}>
          <PhaseCard
            phaseIcon="coffee"
            phaseLabel={breakLabel}
            status={status}
            time={formattedTime}
            tone="break"
          />

          <View style={styles.controls}>
            {isPaused && (
              <ActionButton
                icon="play"
                label={hasElapsed ? 'Reanudar descanso' : 'Iniciar descanso'}
                onPress={handleStartBreak}
              />
            )}

            {isRunning && <ActionButton icon="pause" label="Pausar descanso" onPress={pauseBreak} />}

            {(isRunning || (isPaused && hasElapsed)) && (
              <ActionButton
                icon="restart"
                label="Reiniciar descanso"
                onPress={handleResetBreak}
                variant="danger"
              />
            )}
          </View>

          {validationMessage !== '' && (
            <Text accessibilityLiveRegion="polite" style={styles.validationMessage}>
              {validationMessage}
            </Text>
          )}
        </View>

        <ScreenFooter message="Un buen descanso también es parte del estudio." />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: BRAND.whitesmoke,
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
  },
  content: {
    alignSelf: 'center',
    flexGrow: 1,
    gap: 22,
    maxWidth: 560,
    paddingHorizontal: 20,
    paddingVertical: 24,
    width: '100%',
  },
  controls: {
    gap: 14,
  },
  validationMessage: {
    borderLeftColor: BRAND.crimson,
    borderLeftWidth: 4,
    color: BRAND.black,
    fontSize: 15,
    fontWeight: '600',
    paddingLeft: 8,
  },
});


================================================
ðŸ“„ ARCHIVO: src\app\_layout.tsx
================================================

import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Pressable, StyleSheet, Text, View } from 'react-native';
import { router, Stack } from 'expo-router';

import { usePomodoroTimer, PomodoroTimerProvider } from '@/hooks/use-pomodoro-timer';
import {
  ALARM_AUTO_STOP_MS,
  startPomodoroAlarm,
  stopPomodoroAlarm,
} from '@/notifications/pomodoro-alarm';
import {
  addPomodoroNotificationResponseListener,
  clearPomodoroNotificationResponse,
  hasInitialPomodoroCompletionResponse,
} from '@/notifications/pomodoro-notifications';

function NotificationNavigationHandler() {
  const { breakType, hydrationError, isHydrated, reportAlarmFailure, stopAlarm } =
    usePomodoroTimer();
  const hasPendingNotification = useRef(false);
  const [notificationResponseVersion, setNotificationResponseVersion] = useState(0);

  useEffect(() => {
    if (hasInitialPomodoroCompletionResponse()) {
      hasPendingNotification.current = true;
    }

    const subscription = addPomodoroNotificationResponseListener(() => {
      hasPendingNotification.current = true;
      setNotificationResponseVersion((version) => version + 1);
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!hasPendingNotification.current || !isHydrated || hydrationError !== null) {
      return;
    }

    try {
      stopPomodoroAlarm();
    } catch (error: unknown) {
      console.error('No se pudo detener la alarma al abrir una notificación.', error);
      reportAlarmFailure();
    }
    stopAlarm();
    router.replace(breakType === null ? '/(tabs)' : '/descanso');
    clearPomodoroNotificationResponse();
    hasPendingNotification.current = false;
  }, [
    breakType,
    hydrationError,
    isHydrated,
    notificationResponseVersion,
    reportAlarmFailure,
    stopAlarm,
  ]);

  return null;
}

function PomodoroAlarmOverlay() {
  const { alarmPhase, breakType, isAlarmActive, reportAlarmFailure, stopAlarm } =
    usePomodoroTimer();
  const [appState, setAppState] = useState(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', setAppState);
    return () => subscription.remove();
  }, []);

  const closeAlarm = useCallback(() => {
    try {
      stopPomodoroAlarm();
    } catch (error: unknown) {
      console.error('No se pudo detener la alarma del temporizador.', error);
      reportAlarmFailure();
    }
    stopAlarm();
    router.replace(breakType === null ? '/(tabs)' : '/descanso');
  }, [breakType, reportAlarmFailure, stopAlarm]);

  useEffect(() => {
    if (!isAlarmActive || alarmPhase === null || appState !== 'active') {
      return undefined;
    }

    let isCurrent = true;
    startPomodoroAlarm().catch((error: unknown) => {
      if (!isCurrent) {
        return;
      }
      console.error('No se pudo iniciar la alarma del temporizador.', error);
      reportAlarmFailure();
      stopAlarm();
    });
    const timeoutId = setTimeout(closeAlarm, ALARM_AUTO_STOP_MS);

    return () => {
      isCurrent = false;
      clearTimeout(timeoutId);
      try {
        stopPomodoroAlarm();
      } catch (error: unknown) {
        console.error('No se pudo limpiar la alarma del temporizador.', error);
      }
    };
  }, [alarmPhase, appState, closeAlarm, isAlarmActive, reportAlarmFailure, stopAlarm]);

  if (!isAlarmActive || alarmPhase === null) {
    return null;
  }

  const title = alarmPhase === 'focus' ? 'Estudio terminado' : 'Descanso terminado';

  return (
    <View pointerEvents="box-none" style={styles.alarmOverlay}>
      <View style={styles.alarmCard}>
        <Text style={styles.alarmTitle}>{title}</Text>
        <Text style={styles.alarmBody}>La fase terminó. Toca detener para continuar.</Text>
        <Pressable
          accessibilityLabel="Detener alarma del temporizador"
          accessibilityRole="button"
          onPress={() => {
            stopAlarm();
            router.replace(breakType === null ? '/(tabs)' : '/descanso');
          }}
          style={({ pressed }) => [styles.alarmButton, pressed && styles.alarmButtonPressed]}>
          <Text style={styles.alarmButtonText}>Detener</Text>
        </Pressable>
      </View>
    </View>
  );
}

function NotificationAvailabilityBanner() {
  const { notificationMessage } = usePomodoroTimer();
  if (notificationMessage === null) {
    return null;
  }

  return (
    <View pointerEvents="none" style={styles.availabilityBanner}>
      <Text accessibilityLiveRegion="polite" style={styles.availabilityMessage}>
        {notificationMessage}
      </Text>
    </View>
  );
}

export default function RootLayout() {
  return (
    <PomodoroTimerProvider>
      <NotificationNavigationHandler />
      <PomodoroAlarmOverlay />
      <NotificationAvailabilityBanner />
      <Stack screenOptions={{ headerShown: false }} />
    </PomodoroTimerProvider>
  );
}

const styles = StyleSheet.create({
  alarmOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 0, 72, 0.52)',
  },
  availabilityBanner: {
    position: 'absolute',
    top: 52,
    left: 16,
    right: 16,
    zIndex: 40,
    elevation: 40,
    borderRadius: 12,
    backgroundColor: '#e60023',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  availabilityMessage: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  alarmCard: {
    width: '84%',
    maxWidth: 360,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 28,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    gap: 14,
  },
  alarmTitle: {
    color: '#100048',
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
  },
  alarmBody: {
    color: '#6A5751',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  alarmButton: {
    width: '100%',
    borderRadius: 14,
    backgroundColor: '#F8A800',
    paddingVertical: 14,
    alignItems: 'center',
  },
  alarmButtonPressed: {
    opacity: 0.8,
  },
  alarmButtonText: {
    color: '#100048',
    fontSize: 18,
    fontWeight: '700',
  },
});


================================================
ðŸ“„ ARCHIVO: src\components\action-button.tsx
================================================

import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppIcon, type AppIconName } from '@/components/app-icon';
import { BRAND } from '@/constants/brand';

type Variant = 'primary' | 'danger' | 'secondary';

interface ActionButtonProps {
  label: string;
  icon: AppIconName;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  layout?: 'row' | 'centered';
}

const VARIANTS: Record<
  Variant,
  { background: string; text: string; circle: string; icon: string }
> = {
  primary: {
    background: BRAND.orange,
    text: BRAND.midnightBlue,
    circle: BRAND.midnightBlue,
    icon: BRAND.orange,
  },
  danger: {
    background: BRAND.crimson,
    text: BRAND.white,
    circle: BRAND.softMidnight,
    icon: BRAND.white,
  },
  secondary: {
    background: BRAND.midnightBlue,
    text: BRAND.white,
    circle: BRAND.softWhite,
    icon: BRAND.white,
  },
};

export function ActionButton({
  label,
  icon,
  onPress,
  variant = 'primary',
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
  layout = 'row',
}: ActionButtonProps) {
  const colors = VARIANTS[variant];
  const isCentered = layout === 'centered';

  return (
    <Pressable
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        isCentered && styles.centeredButton,
        { backgroundColor: colors.background },
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}>
      {isCentered ? (
        <>
          <Sparks color={variant === 'primary' ? BRAND.white : BRAND.orange} side="left" />
          <AppIcon color={colors.text} name={icon} size={30} />
          <Text numberOfLines={1} style={[styles.centeredLabel, { color: colors.text }]}>
            {label}
          </Text>
          <Sparks color={variant === 'primary' ? BRAND.white : BRAND.orange} side="right" />
        </>
      ) : (
        <>
          <View style={[styles.iconCircle, { backgroundColor: colors.circle }]}>
            <AppIcon color={colors.icon} name={icon} size={26} />
          </View>
          <Text numberOfLines={1} style={[styles.label, { color: colors.text }]}>
            {label}
          </Text>
          <AppIcon color={colors.text} name="chevronRight" size={22} />
        </>
      )}
    </Pressable>
  );
}

function Sparks({ color, side }: { color: string; side: 'left' | 'right' }) {
  const sign = side === 'left' ? 1 : -1;
  return (
    <View pointerEvents="none" style={styles.sparks}>
      <View style={[styles.spark, { backgroundColor: color, transform: [{ rotate: `${35 * sign}deg` }] }]} />
      <View style={[styles.spark, { backgroundColor: color }]} />
      <View style={[styles.spark, { backgroundColor: color, transform: [{ rotate: `${-35 * sign}deg` }] }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  centeredButton: {
    justifyContent: 'center',
    paddingLeft: 22,
  },
  centeredLabel: {
    flexShrink: 1,
    fontSize: 20,
    fontWeight: '800',
  },
  sparks: {
    gap: 5,
  },
  spark: {
    borderRadius: 2,
    height: 3,
    width: 12,
  },
  button: {
    alignItems: 'center',
    borderRadius: 34,
    elevation: 4,
    flexDirection: 'row',
    gap: 16,
    minHeight: 68,
    paddingLeft: 10,
    paddingRight: 22,
    paddingVertical: 10,
    shadowColor: BRAND.midnightBlue,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
  },
  iconCircle: {
    alignItems: 'center',
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  label: {
    flex: 1,
    fontSize: 20,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  disabled: {
    opacity: 0.55,
  },
});


================================================
ðŸ“„ ARCHIVO: src\components\app-icon.tsx
================================================

import type { ComponentProps } from 'react';
import { Text } from 'react-native';
import { SymbolView } from 'expo-symbols';

type SymbolName = Exclude<ComponentProps<typeof SymbolView>['name'], string>;

const ICONS = {
  play: { ios: 'play.fill', android: 'play_arrow', web: 'play_arrow' },
  pause: { ios: 'pause.fill', android: 'pause', web: 'pause' },
  restart: { ios: 'arrow.clockwise', android: 'restart_alt', web: 'restart_alt' },
  settings: { ios: 'gearshape.fill', android: 'settings', web: 'settings' },
  chevronRight: { ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' },
  chevronLeft: { ios: 'chevron.left', android: 'chevron_left', web: 'chevron_left' },
  target: { ios: 'target', android: 'track_changes', web: 'track_changes' },
  brain: { ios: 'brain.head.profile', android: 'psychology', web: 'psychology' },
  group: { ios: 'person.3.fill', android: 'groups', web: 'groups' },
  school: { ios: 'graduationcap.fill', android: 'school', web: 'school' },
  coffee: { ios: 'cup.and.saucer.fill', android: 'coffee', web: 'coffee' },
  close: { ios: 'xmark', android: 'close', web: 'close' },
  mountain: { ios: 'mountain.2.fill', android: 'landscape', web: 'landscape' },
  check: { ios: 'checkmark', android: 'check', web: 'check' },
  info: { ios: 'info.circle.fill', android: 'info', web: 'info' },
  shield: { ios: 'checkmark.shield.fill', android: 'shield', web: 'shield' },
  sofa: { ios: 'sofa.fill', android: 'weekend', web: 'weekend' },
  cycle: { ios: 'arrow.triangle.2.circlepath', android: 'autorenew', web: 'autorenew' },
  clock: { ios: 'clock', android: 'schedule', web: 'schedule' },
  save: { ios: 'square.and.arrow.down.fill', android: 'save', web: 'save' },
} satisfies Record<string, SymbolName>;

export type AppIconName = keyof typeof ICONS;

interface AppIconProps {
  name: AppIconName;
  color: string;
  size?: number;
}

export function AppIcon({ name, color, size = 24 }: AppIconProps) {
  return (
    <SymbolView
      accessible={false}
      fallback={<Text style={{ color, fontSize: size * 0.8 }}>•</Text>}
      name={ICONS[name]}
      size={size}
      tintColor={color}
    />
  );
}


================================================
ðŸ“„ ARCHIVO: src\components\brand-header.tsx
================================================

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon, type AppIconName } from '@/components/app-icon';
import { BRAND } from '@/constants/brand';

interface HeaderAction {
  icon: AppIconName;
  accessibilityLabel: string;
  onPress: () => void;
}

interface BrandHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  leftAction?: HeaderAction;
  rightAction?: HeaderAction;
  illustration?: AppIconName;
}

function HeaderButton({ icon, accessibilityLabel, onPress }: HeaderAction) {
  return (
    <Pressable
      accessibilityHint="Abre la pantalla para cambiar los tiempos del pomodoro"
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      hitSlop={6}
      onPress={onPress}
      style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}>
      <AppIcon color={BRAND.white} name={icon} size={24} />
    </Pressable>
  );
}

export function BrandHeader({
  title,
  subtitle,
  onBack,
  leftAction,
  rightAction,
  illustration = 'school',
}: BrandHeaderProps) {
  const insets = useSafeAreaInsets();

  if (onBack !== undefined) {
    return (
      <View style={[styles.header, styles.compactHeader, { paddingTop: insets.top + 12 }]}>
        <StatusBar style="light" />
        <View pointerEvents="none" style={styles.compactIllustration}>
          <AppIcon color={BRAND.orange} name={illustration} size={72} />
        </View>
        <View style={styles.compactRow}>
          <Pressable
            accessibilityLabel="Volver"
            accessibilityRole="button"
            hitSlop={6}
            onPress={onBack}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
            <AppIcon color={BRAND.white} name="chevronLeft" size={20} />
            <Text style={styles.backText}>Volver</Text>
          </Pressable>
          <View>
            <Text accessibilityRole="header" style={styles.compactTitle}>
              {title}
            </Text>
            <View style={styles.underline} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
      <StatusBar style="light" />
      <View pointerEvents="none" style={styles.illustration}>
        <AppIcon color={BRAND.orange} name={illustration} size={88} />
      </View>

      <View style={styles.topRow}>
        {leftAction !== undefined && <HeaderButton {...leftAction} />}
        <View style={styles.brandRow}>
          <AppIcon color={BRAND.orange} name="school" size={26} />
          <Text style={styles.brand}>ACADEMIA COTOPAXI</Text>
        </View>
        {rightAction !== undefined && <HeaderButton {...rightAction} />}
      </View>

      <Text accessibilityRole="header" style={styles.title}>
        {title}
      </Text>
      <View style={styles.underline} />
      {subtitle !== undefined && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: BRAND.midnightBlue,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 96,
    overflow: 'hidden',
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  compactHeader: {
    paddingBottom: 28,
  },
  compactIllustration: {
    opacity: 0.35,
    position: 'absolute',
    right: 28,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  compactRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 20,
  },
  backButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    minHeight: 44,
    minWidth: 44,
  },
  backText: {
    color: BRAND.white,
    fontSize: 18,
    fontWeight: '700',
  },
  compactTitle: {
    color: BRAND.white,
    fontSize: 32,
    fontWeight: '800',
  },
  illustration: {
    bottom: 18,
    opacity: 0.35,
    position: 'absolute',
    right: 28,
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    minHeight: 48,
  },
  brandRow: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 10,
  },
  brand: {
    color: BRAND.white,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
  },
  headerButton: {
    alignItems: 'center',
    backgroundColor: BRAND.softWhite,
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  title: {
    color: BRAND.white,
    fontSize: 38,
    fontWeight: '800',
    marginTop: 12,
  },
  underline: {
    backgroundColor: BRAND.orange,
    borderRadius: 3,
    height: 6,
    marginTop: 4,
    width: 84,
  },
  subtitle: {
    color: BRAND.silver,
    fontSize: 15,
    marginTop: 10,
    maxWidth: '70%',
  },
  pressed: {
    opacity: 0.75,
  },
});


================================================
ðŸ“„ ARCHIVO: src\components\phase-card.tsx
================================================

import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppIcon, type AppIconName } from '@/components/app-icon';
import { BRAND } from '@/constants/brand';

interface PhaseCardProps {
  phaseLabel: string;
  phaseIcon: AppIconName;
  time: string;
  status?: string;
  tone?: 'study' | 'break';
  footer?: ReactNode;
}

export function PhaseCard({
  phaseLabel,
  phaseIcon,
  time,
  status,
  tone = 'study',
  footer,
}: PhaseCardProps) {
  const background = tone === 'study' ? BRAND.midnightBlue : BRAND.teal;

  return (
    <View
      accessibilityLabel={`${phaseLabel}. Tiempo restante ${time}${status ? `. ${status}` : ''}`}
      accessibilityRole="timer"
      style={[styles.card, { backgroundColor: background }]}>
      <View pointerEvents="none" style={styles.arc} />
      <View pointerEvents="none" style={[styles.tick, styles.tickLeftTop]} />
      <View pointerEvents="none" style={[styles.tick, styles.tickLeftBottom]} />
      <View pointerEvents="none" style={[styles.tick, styles.tickRightTop]} />
      <View pointerEvents="none" style={[styles.tick, styles.tickRightBottom]} />

      <View style={styles.phasePill}>
        <AppIcon color={BRAND.midnightBlue} name={phaseIcon} size={22} />
        <Text style={styles.phaseText}>{phaseLabel}</Text>
      </View>

      <Text adjustsFontSizeToFit numberOfLines={1} style={styles.time}>
        {time}
      </Text>

      {status !== undefined && (
        <View style={styles.statusRow}>
          <AppIcon color={BRAND.silver} name="brain" size={20} />
          <Text style={styles.status}>{status}</Text>
        </View>
      )}

      {footer !== undefined && (
        <>
          <View style={styles.divider} />
          {footer}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    borderRadius: 32,
    elevation: 6,
    gap: 14,
    overflow: 'hidden',
    paddingHorizontal: 24,
    paddingVertical: 24,
    shadowColor: BRAND.midnightBlue,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
  },
  arc: {
    alignSelf: 'center',
    borderColor: BRAND.white,
    borderRadius: 160,
    borderWidth: 6,
    height: 320,
    opacity: 0.08,
    position: 'absolute',
    top: 18,
    width: 320,
  },
  tick: {
    backgroundColor: BRAND.orange,
    borderRadius: 3,
    height: 5,
    position: 'absolute',
    width: 18,
  },
  tickLeftTop: { left: 22, top: 92, transform: [{ rotate: '45deg' }] },
  tickLeftBottom: { left: 14, top: 116, transform: [{ rotate: '-15deg' }] },
  tickRightTop: { right: 22, top: 92, transform: [{ rotate: '-45deg' }] },
  tickRightBottom: { right: 14, top: 116, transform: [{ rotate: '15deg' }] },
  phasePill: {
    alignItems: 'center',
    backgroundColor: BRAND.orange,
    borderRadius: 24,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  phaseText: {
    color: BRAND.midnightBlue,
    fontSize: 18,
    fontWeight: '800',
  },
  time: {
    color: BRAND.white,
    fontSize: 76,
    fontVariant: ['tabular-nums'],
    fontWeight: '800',
    includeFontPadding: false,
  },
  statusRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  status: {
    color: BRAND.white,
    fontSize: 16,
  },
  divider: {
    alignSelf: 'stretch',
    backgroundColor: BRAND.softWhite,
    height: 1,
  },
});


================================================
ðŸ“„ ARCHIVO: src\components\screen-footer.tsx
================================================

import { StyleSheet, Text, View } from 'react-native';

import { AppIcon, type AppIconName } from '@/components/app-icon';
import { BRAND } from '@/constants/brand';

export function ScreenFooter({
  message,
  icon = 'mountain',
}: {
  message: string;
  icon?: AppIconName;
}) {
  return (
    <View style={styles.footer}>
      <View pointerEvents="none" style={styles.blobOrange} />
      <View pointerEvents="none" style={styles.blobBlue} />
      <View style={styles.hintBlock}>
        <Text style={styles.hint}>{message}</Text>
        <View style={styles.hintUnderline} />
      </View>
      <View style={styles.mountain}>
        <AppIcon color={BRAND.midnightBlue} name={icon} size={44} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 96,
    paddingHorizontal: 24,
  },
  blobOrange: {
    backgroundColor: BRAND.orange,
    borderRadius: 90,
    bottom: -100,
    height: 180,
    left: -90,
    position: 'absolute',
    width: 180,
  },
  blobBlue: {
    backgroundColor: BRAND.midnightBlue,
    borderRadius: 80,
    bottom: -120,
    height: 160,
    left: -50,
    position: 'absolute',
    width: 160,
  },
  hintBlock: {
    alignItems: 'center',
    flex: 1,
    gap: 6,
    paddingLeft: 56,
  },
  hint: {
    color: BRAND.midnightBlue,
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  hintUnderline: {
    backgroundColor: BRAND.orange,
    borderRadius: 2,
    height: 3,
    width: 140,
  },
  mountain: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
});


================================================
ðŸ“„ ARCHIVO: src\constants\brand.ts
================================================

export const BRAND = {
  midnightBlue: '#100048',
  orange: '#F8A800',
  white: '#FFFFFF',
  whitesmoke: '#F8F8F8',
  crimson: '#e60023',
  teal: '#117a8d',
  black: '#1F2A2C',
  secondaryText: '#6A5751',
  silver: '#c5c5c5',
  softWhite: 'rgba(255, 255, 255, 0.14)',
  softMidnight: 'rgba(16, 0, 72, 0.22)',
  softMidnightTint: 'rgba(16, 0, 72, 0.06)',
} as const;


================================================
ðŸ“„ ARCHIVO: src\constants\theme.ts
================================================

/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#000000',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
  },
  dark: {
    text: '#ffffff',
    background: '#000000',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;


================================================
ðŸ“„ ARCHIVO: src\domain\settings.ts
================================================

import {
  configurePomodoroCycle,
  createFocusTimer,
  createPreparedBreakTimer,
  type BreakType,
  type PomodoroCycleState,
  type TimerState,
} from './timer';

export type SettingsField = 'focusMinutes' | 'shortBreakMinutes' | 'longBreakMinutes' | 'cycleLength';
export type PomodoroSettings = Record<SettingsField, number>;
export type SettingsInput = Record<SettingsField, string>;
export type SettingsErrors = Partial<Record<SettingsField, string>>;

export type SettingsValidationResult =
  | { success: true; settings: PomodoroSettings }
  | { success: false; errors: SettingsErrors };

export interface SettingsSession {
  focusTimer: TimerState;
  breakTimer: TimerState;
  breakType: BreakType | null;
  cycle: PomodoroCycleState;
}

export interface AppliedSettingsSession {
  focusTimer: TimerState;
  breakTimer: TimerState;
  cycle: PomodoroCycleState;
  cycleGoalReached: boolean;
}

export const SETTINGS_FIELDS: readonly SettingsField[] = [
  'focusMinutes',
  'shortBreakMinutes',
  'longBreakMinutes',
  'cycleLength',
];

export const DEFAULT_SETTINGS: PomodoroSettings = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  cycleLength: 4,
};

export const SETTINGS_RANGES: Record<SettingsField, { min: number; max: number }> = {
  focusMinutes: { min: 1, max: 120 },
  shortBreakMinutes: { min: 1, max: 30 },
  longBreakMinutes: { min: 1, max: 60 },
  cycleLength: { min: 4, max: 8 },
};

const MINUTE_MS = 60 * 1_000;

function isWithinRange(field: SettingsField, value: unknown): value is number {
  const { min, max } = SETTINGS_RANGES[field];
  return typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max;
}

export function getSettingsRangeMessage(field: SettingsField): string {
  const { min, max } = SETTINGS_RANGES[field];
  return `Ingresa un número entero entre ${min} y ${max}.`;
}

export function isValidSettings(value: unknown): value is PomodoroSettings {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;
  return SETTINGS_FIELDS.every((field) => isWithinRange(field, record[field]));
}

export function validateSettingsInput(input: SettingsInput): SettingsValidationResult {
  const errors: SettingsErrors = {};
  const parsed: Partial<PomodoroSettings> = {};

  for (const field of SETTINGS_FIELDS) {
    const text = input[field].trim();
    const value = /^\d+$/.test(text) ? Number(text) : Number.NaN;
    if (isWithinRange(field, value)) {
      parsed[field] = value;
    } else {
      errors[field] = getSettingsRangeMessage(field);
    }
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  return { success: true, settings: parsed as PomodoroSettings };
}

function isPrepared(timer: TimerState): boolean {
  return timer.status === 'paused' && timer.remainingMs === timer.initialDurationMs;
}

function applyCycleLength(
  cycle: PomodoroCycleState,
  cycleLength: number,
): { cycle: PomodoroCycleState; cycleGoalReached: boolean } {
  const configuredCycle = configurePomodoroCycle(cycle, cycleLength);
  if (!cycle.hasStarted || cycleLength > cycle.pomodoroCount) {
    return { cycle: configuredCycle, cycleGoalReached: false };
  }

  return {
    cycle: { ...configuredCycle, activeCycleLength: cycle.pomodoroCount + 1 },
    cycleGoalReached: cycleLength === cycle.pomodoroCount,
  };
}

export function hasDeferredDurationChange(
  session: SettingsSession,
  previous: PomodoroSettings,
  next: PomodoroSettings,
): boolean {
  if (session.breakType === null) {
    return (
      session.focusTimer.status !== 'finished' &&
      !isPrepared(session.focusTimer) &&
      previous.focusMinutes !== next.focusMinutes
    );
  }

  const field = session.breakType === 'long' ? 'longBreakMinutes' : 'shortBreakMinutes';
  return !isPrepared(session.breakTimer) && previous[field] !== next[field];
}

export function applySettingsToSession(
  session: SettingsSession,
  settings: PomodoroSettings,
): AppliedSettingsSession {
  const focusTimer = isPrepared(session.focusTimer)
    ? createFocusTimer(settings.focusMinutes * MINUTE_MS)
    : session.focusTimer;
  const breakTimer =
    session.breakType !== null && isPrepared(session.breakTimer)
      ? createPreparedBreakTimer(
          session.breakType === 'long' ? settings.longBreakMinutes : settings.shortBreakMinutes,
        )
      : session.breakTimer;

  return {
    focusTimer,
    breakTimer,
    ...applyCycleLength(session.cycle, settings.cycleLength),
  };
}


================================================
ðŸ“„ ARCHIVO: src\domain\timer.ts
================================================

export const DEFAULT_FOCUS_DURATION_MS = 25 * 60 * 1_000;
export const DEFAULT_SHORT_BREAK_MINUTES = 5;
export const DEFAULT_LONG_BREAK_MINUTES = 15;
export const DEFAULT_POMODORO_CYCLE_LENGTH = 4;

export type TimerPhase = 'focus' | 'break';
export type TimerStatus = 'paused' | 'running' | 'finished';
export type BreakType = 'short' | 'long';

export interface PomodoroCycleState {
  pomodoroCount: number;
  activeCycleLength: number;
  configuredCycleLength: number;
  hasStarted: boolean;
}

export interface TimerState {
  phase: TimerPhase;
  status: TimerStatus;
  initialDurationMs: number;
  remainingMs: number;
  startedAt: number | null;
}

export type BreakCompletionAction = 'start-focus' | 'return-home';

export interface FocusCompletionResult {
  cycle: PomodoroCycleState;
  breakType: BreakType;
  breakTimer: TimerState;
}

export function isValidPomodoroCycleLength(cycleLength: number): boolean {
  return Number.isInteger(cycleLength) && cycleLength > 0;
}

export function createPomodoroCycle(
  pomodoroCount = 0,
  cycleLength = DEFAULT_POMODORO_CYCLE_LENGTH,
): PomodoroCycleState {
  if (!isValidPomodoroCycleLength(cycleLength)) {
    throw new RangeError('Pomodoro cycle length must be a positive integer.');
  }

  if (!Number.isInteger(pomodoroCount) || pomodoroCount < 0 || pomodoroCount >= cycleLength) {
    throw new RangeError('Pomodoro count must be a non-negative integer below the cycle length.');
  }

  return {
    pomodoroCount,
    activeCycleLength: cycleLength,
    configuredCycleLength: cycleLength,
    hasStarted: pomodoroCount > 0,
  };
}

export function configurePomodoroCycle(
  cycle: PomodoroCycleState,
  configuredCycleLength: number,
): PomodoroCycleState {
  if (!isValidPomodoroCycleLength(configuredCycleLength)) {
    throw new RangeError('Pomodoro cycle length must be a positive integer.');
  }

  return {
    ...cycle,
    activeCycleLength: cycle.hasStarted ? cycle.activeCycleLength : configuredCycleLength,
    configuredCycleLength,
  };
}

export function startPomodoroCycle(cycle: PomodoroCycleState): PomodoroCycleState {
  return { ...cycle, hasStarted: true };
}

export function completePomodoroCycle(
  cycle: PomodoroCycleState,
): { cycle: PomodoroCycleState; breakType: BreakType } {
  const nextPomodoroCount = cycle.pomodoroCount + 1;
  const breakType =
    nextPomodoroCount >= cycle.activeCycleLength ? 'long' : 'short';

  return {
    cycle: {
      ...cycle,
      pomodoroCount: breakType === 'long' ? 0 : nextPomodoroCount,
      hasStarted: true,
    },
    breakType,
  };
}

export function completePomodoroBreak(
  cycle: PomodoroCycleState,
  breakType: BreakType,
): PomodoroCycleState {
  if (breakType === 'short') {
    return cycle;
  }

  return {
    ...cycle,
    activeCycleLength: cycle.configuredCycleLength,
    hasStarted: false,
  };
}

export function completeFocusPhase(
  focusTimer: TimerState,
  cycle: PomodoroCycleState,
  shortBreakMinutes = DEFAULT_SHORT_BREAK_MINUTES,
  longBreakMinutes = DEFAULT_LONG_BREAK_MINUTES,
): FocusCompletionResult | null {
  if (focusTimer.phase !== 'focus' || focusTimer.status !== 'finished') {
    return null;
  }

  const completion = completePomodoroCycle(cycle);
  const breakMinutes =
    completion.breakType === 'long' ? longBreakMinutes : shortBreakMinutes;

  return {
    ...completion,
    breakTimer: createPreparedBreakTimer(breakMinutes),
  };
}

function assertPositiveDuration(durationMs: number): void {
  if (!Number.isFinite(durationMs) || durationMs <= 0) {
    throw new RangeError('Timer duration must be a positive finite number.');
  }
}

function assertFiniteTimestamp(timestamp: number): void {
  if (!Number.isFinite(timestamp)) {
    throw new RangeError('Timer timestamp must be finite.');
  }
}

export function createFocusTimer(
  initialDurationMs = DEFAULT_FOCUS_DURATION_MS,
): TimerState {
  assertPositiveDuration(initialDurationMs);

  return {
    phase: 'focus',
    status: 'paused',
    initialDurationMs,
    remainingMs: initialDurationMs,
    startedAt: null,
  };
}

export function createBreakTimer(): TimerState {
  return {
    phase: 'break',
    status: 'paused',
    initialDurationMs: 0,
    remainingMs: 0,
    startedAt: null,
  };
}

export function createPreparedBreakTimer(
  minutes: number = DEFAULT_SHORT_BREAK_MINUTES,
): TimerState {
  assertPositiveDuration(minutes * 60 * 1_000);

  return {
    phase: 'break',
    status: 'paused',
    initialDurationMs: minutes * 60 * 1_000,
    remainingMs: minutes * 60 * 1_000,
    startedAt: null,
  };
}

export function prepareFocusAfterBreak(
  focusTimer: TimerState,
  focusDurationMs: number = focusTimer.initialDurationMs,
): TimerState {
  if (focusTimer.phase !== 'focus') {
    throw new TypeError('Break completion requires a focus timer.');
  }

  return createFocusTimer(focusDurationMs);
}

export function advancePomodoroCycle(completedPomodoros: number, cycleLength: number): number {
  if (!Number.isInteger(completedPomodoros) || completedPomodoros < 0) {
    return 0;
  }

  if (!Number.isInteger(cycleLength) || cycleLength <= 0) {
    return 0;
  }

  const normalizedCount = completedPomodoros % cycleLength;
  return normalizedCount === cycleLength - 1 ? 0 : normalizedCount + 1;
}

export function getNextBreakType(completedPomodoros: number, cycleLength: number): BreakType {
  return advancePomodoroCycle(completedPomodoros, cycleLength) === 0 ? 'long' : 'short';
}

export function startTimer(timer: TimerState, now: number): TimerState {
  assertFiniteTimestamp(now);

  if (timer.status !== 'paused' || timer.remainingMs <= 0) {
    return timer;
  }

  return {
    ...timer,
    status: 'running',
    startedAt: now,
  };
}

export function pauseTimer(timer: TimerState, now: number): TimerState {
  if (timer.status !== 'running') {
    return timer;
  }

  const reconciledTimer = reconcileTimer(timer, now);

  if (reconciledTimer.status === 'finished') {
    return reconciledTimer;
  }

  return {
    ...reconciledTimer,
    status: 'paused',
    startedAt: null,
  };
}

export function reconcileTimer(timer: TimerState, now: number): TimerState {
  assertFiniteTimestamp(now);

  if (timer.status !== 'running' || timer.startedAt === null) {
    return timer;
  }

  const elapsedMs = Math.max(0, now - timer.startedAt);
  const remainingMs = Math.max(0, timer.remainingMs - elapsedMs);

  if (remainingMs === 0) {
    return {
      ...timer,
      status: 'finished',
      remainingMs: 0,
      startedAt: null,
    };
  }

  return {
    ...timer,
    remainingMs,
    startedAt: now,
  };
}

export function restoreTimerFromExpiry(
  timer: TimerState,
  expiresAtEpochMs: number | null,
  nowEpochMs: number,
  monotonicNow: number,
): TimerState {
  assertFiniteTimestamp(nowEpochMs);
  assertFiniteTimestamp(monotonicNow);

  if (timer.status !== 'running') {
    return timer;
  }

  if (expiresAtEpochMs === null) {
    throw new TypeError('A running timer must have a saved expiry timestamp.');
  }
  assertFiniteTimestamp(expiresAtEpochMs);

  const remainingMs = Math.max(0, expiresAtEpochMs - nowEpochMs);
  if (remainingMs === 0) {
    return {
      ...timer,
      status: 'finished',
      remainingMs: 0,
      startedAt: null,
    };
  }

  return {
    ...timer,
    remainingMs,
    startedAt: monotonicNow,
  };
}

export function resetTimer(timer: TimerState): TimerState {
  return {
    ...timer,
    status: 'paused',
    remainingMs: timer.initialDurationMs,
    startedAt: null,
  };
}

export function getFocusTimerAfterBreak(
  focusTimer: TimerState,
  action: BreakCompletionAction,
  now: number,
): TimerState {
  if (focusTimer.phase !== 'focus') {
    throw new TypeError('Break completion requires a focus timer.');
  }

  const resetFocusTimer = resetTimer(focusTimer);
  return action === 'start-focus' ? startTimer(resetFocusTimer, now) : resetFocusTimer;
}

export function cancelReset(timer: TimerState): TimerState {
  return timer;
}

export function formatRemainingTime(remainingMs: number): string {
  const totalSeconds = Math.ceil(Math.max(0, remainingMs) / 1_000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}


================================================
ðŸ“„ ARCHIVO: src\hooks\use-color-scheme.ts
================================================

export { useColorScheme } from 'react-native';


================================================
ðŸ“„ ARCHIVO: src\hooks\use-color-scheme.web.ts
================================================

import { useSyncExternalStore } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

const subscribeToHydration = () => () => {};
const getClientHydrationSnapshot = () => true;
const getServerHydrationSnapshot = () => false;

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web
 */
export function useColorScheme() {
  const hasHydrated = useSyncExternalStore(
    subscribeToHydration,
    getClientHydrationSnapshot,
    getServerHydrationSnapshot,
  );
  const colorScheme = useRNColorScheme();

  if (hasHydrated) {
    return colorScheme;
  }

  return 'light';
}


================================================
ðŸ“„ ARCHIVO: src\hooks\use-pomodoro-timer.ts
================================================

import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type PropsWithChildren,
} from 'react';
import { AppState } from 'react-native';

import {
  completeFocusPhase,
  completePomodoroBreak,
  createBreakTimer,
  createFocusTimer,
  createPomodoroCycle,
  createPreparedBreakTimer,
  pauseTimer,
  prepareFocusAfterBreak,
  reconcileTimer,
  restoreTimerFromExpiry,
  startPomodoroCycle,
  startTimer,
  type BreakType,
  type PomodoroCycleState,
  type TimerPhase,
  type TimerState,
} from '@/domain/timer';
import {
  DEFAULT_SETTINGS,
  applySettingsToSession,
  hasDeferredDurationChange,
  type PomodoroSettings,
} from '@/domain/settings';
import { loadPomodoroCycle, savePomodoroCycle } from '@/storage/pomodoro-cycle-storage';
import {
  loadPomodoroSession,
  savePomodoroSession,
  type PomodoroSessionSnapshot,
} from '@/storage/pomodoro-session-storage';
import { loadPomodoroSettings, savePomodoroSettings } from '@/storage/pomodoro-settings-storage';
import {
  cancelPomodoroNotification,
  configurePomodoroNotificationHandler,
  requestPomodoroNotificationPermission,
  schedulePomodoroCompletionNotification,
} from '@/notifications/pomodoro-notifications';

interface PomodoroTimerContextValue {
  focusTimer: TimerState;
  breakTimer: TimerState;
  pomodoroCount: number;
  cycleLength: number;
  breakType: BreakType | null;
  isAlarmActive: boolean;
  alarmPhase: TimerPhase | null;
  notificationMessage: string | null;
  isHydrated: boolean;
  hydrationError: string | null;
  hasStartedSession: boolean;
  settings: PomodoroSettings;
  settingsMessage: string | null;
  storageMessage: string | null;
  dismissStorageMessage: () => void;
  startFocus: () => void;
  pauseFocus: () => void;
  resetFocus: () => void;
  saveSettings: (settings: PomodoroSettings) => Promise<SaveSettingsResult>;
  resetSettings: () => Promise<SaveSettingsResult>;
  startBreak: () => boolean;
  pauseBreak: () => void;
  resetBreak: () => void;
  stopAlarm: () => void;
  reportAlarmFailure: () => void;
  recoverFromHydrationError: () => void;
  requestNotificationPermission: () => Promise<boolean>;
}

export type SaveSettingsResult =
  | { success: true; cycleGoalReached: boolean; durationChangeDeferred: boolean }
  | { success: false; message: string };

export interface PomodoroTimerState {
  settings: PomodoroSettings;
  settingsMessage: string | null;
  storageMessage: string | null;
  focusTimer: TimerState;
  breakTimer: TimerState;
  cycle: PomodoroCycleState;
  breakType: BreakType | null;
  isAlarmActive: boolean;
  alarmPhase: TimerPhase | null;
  notificationStatus: 'idle' | 'scheduled' | 'unavailable' | 'failed';
  notificationMessage: string | null;
  isHydrated: boolean;
  canPersistCycle: boolean;
  canPersistSession: boolean;
  hydrationError: string | null;
  hasStartedSession: boolean;
  expiresAtEpochMs: number | null;
  notificationId: string | null;
}

export type PomodoroTimerAction =
  | { type: 'storage-save-failed' }
  | { type: 'dismiss-storage-message' }
  | { type: 'hydrate-settings'; settings: PomodoroSettings; message: string | null }
  | { type: 'apply-settings'; settings: PomodoroSettings }
  | { type: 'hydrate'; cycle: PomodoroCycleState }
  | {
      type: 'hydrate-session';
      session: PomodoroSessionSnapshot;
      nowEpochMs: number;
      monotonicNow: number;
    }
  | { type: 'hydration-failed'; message: string }
  | { type: 'recover-session' }
  | { type: 'reconcile'; now: number }
  | { type: 'start-focus'; now: number; expiresAtEpochMs: number }
  | { type: 'pause-focus'; now: number }
  | { type: 'reset-focus' }
  | { type: 'start-break'; now: number; expiresAtEpochMs: number }
  | { type: 'pause-break'; now: number }
  | { type: 'reset-break' }
  | { type: 'notification-scheduled'; expiresAtEpochMs: number; notificationId: string }
  | {
      type: 'notification-unavailable';
      expiresAtEpochMs: number | null;
      message: string;
    }
  | {
      type: 'notification-failed';
      expiresAtEpochMs: number | null;
      message: string;
    }
  | { type: 'alarm-failed'; message: string }
  | { type: 'notification-cleared'; notificationId: string }
  | { type: 'alarm-started'; phase: TimerPhase }
  | { type: 'alarm-cleared' };

const PomodoroTimerContext = createContext<PomodoroTimerContextValue | null>(null);
const TIMER_TICK_INTERVAL_MS = 250;
const MINUTE_MS = 60 * 1_000;
const SETTINGS_LOAD_FAILED_MESSAGE =
  'No se pudieron cargar tus ajustes. Se están usando los valores por defecto; puedes volver a configurarlos en Ajustes.';
const SETTINGS_SAVE_FAILED_MESSAGE = 'No se pudieron guardar los ajustes. Inténtalo de nuevo.';
export const STORAGE_SAVE_FAILED_MESSAGE =
  'No se pudo guardar tu progreso en el celular. El temporizador sigue funcionando.';

export function createInitialState(): PomodoroTimerState {
  return {
    settings: DEFAULT_SETTINGS,
    settingsMessage: null,
    storageMessage: null,
    focusTimer: createFocusTimer(),
    breakTimer: createBreakTimer(),
    cycle: createPomodoroCycle(),
    breakType: null,
    isAlarmActive: false,
    alarmPhase: null,
    notificationStatus: 'idle',
    notificationMessage: null,
    isHydrated: false,
    canPersistCycle: false,
    canPersistSession: false,
    hydrationError: null,
    hasStartedSession: false,
    expiresAtEpochMs: null,
    notificationId: null,
  };
}

function completeFocusTransition(
  state: PomodoroTimerState,
  focusTimer: TimerState,
): PomodoroTimerState {
  const completion = completeFocusPhase(
    focusTimer,
    state.cycle,
    state.settings.shortBreakMinutes,
    state.settings.longBreakMinutes,
  );
  if (completion === null) {
    return { ...state, focusTimer };
  }

  return {
    ...state,
    focusTimer,
    cycle: completion.cycle,
    breakType: completion.breakType,
    breakTimer: completion.breakTimer,
    expiresAtEpochMs: null,
    notificationId: null,
    isAlarmActive: true,
    alarmPhase: 'focus',
  };
}

function completeBreakTransition(state: PomodoroTimerState): PomodoroTimerState {
  if (state.breakType === null) {
    throw new Error('A finished break must have a prepared break type.');
  }

  return {
    ...state,
    focusTimer: prepareFocusAfterBreak(state.focusTimer, state.settings.focusMinutes * MINUTE_MS),
    breakTimer: createBreakTimer(),
    cycle: completePomodoroBreak(state.cycle, state.breakType),
    breakType: null,
    expiresAtEpochMs: null,
    notificationId: null,
    isAlarmActive: true,
    alarmPhase: 'break',
  };
}

function withSettings(state: PomodoroTimerState, settings: PomodoroSettings): PomodoroTimerState {
  const applied = applySettingsToSession(state, settings);
  return {
    ...state,
    settings,
    focusTimer: applied.focusTimer,
    breakTimer: applied.breakTimer,
    cycle: applied.cycle,
  };
}

export function pomodoroTimerReducer(
  state: PomodoroTimerState,
  action: PomodoroTimerAction,
): PomodoroTimerState {
  switch (action.type) {
    case 'storage-save-failed':
      return { ...state, storageMessage: STORAGE_SAVE_FAILED_MESSAGE };
    case 'dismiss-storage-message':
      return { ...state, storageMessage: null };
    case 'hydrate-settings':
      return { ...withSettings(state, action.settings), settingsMessage: action.message };
    case 'apply-settings':
      return {
        ...withSettings(state, action.settings),
        settingsMessage: null,
        canPersistSession: state.canPersistSession || state.isHydrated,
      };
    case 'hydrate':
      return withSettings(
        {
          ...state,
          cycle: action.cycle,
          isHydrated: true,
          canPersistCycle: true,
          hydrationError: null,
          hasStartedSession: action.cycle.hasStarted,
        },
        state.settings,
      );
    case 'hydrate-session': {
      const { session } = action;
      const focusTimer = restoreTimerFromExpiry(
        session.focusTimer,
        session.focusTimer.status === 'running' ? session.expiresAtEpochMs : null,
        action.nowEpochMs,
        action.monotonicNow,
      );
      const breakTimer = restoreTimerFromExpiry(
        session.breakTimer,
        session.breakTimer.status === 'running' ? session.expiresAtEpochMs : null,
        action.nowEpochMs,
        action.monotonicNow,
      );
      let nextState: PomodoroTimerState = {
        ...state,
        focusTimer,
        breakTimer,
        cycle: session.cycle,
        breakType: session.breakType,
        isHydrated: true,
        canPersistCycle: true,
        canPersistSession: true,
        hydrationError: null,
        hasStartedSession: session.hasStartedSession,
        expiresAtEpochMs: session.expiresAtEpochMs,
        notificationId: session.notificationId,
      };

      if (session.focusTimer.status === 'running' && focusTimer.status === 'finished') {
        nextState = completeFocusTransition(nextState, focusTimer);
      }

      if (session.breakTimer.status === 'running' && breakTimer.status === 'finished') {
        nextState = completeBreakTransition(nextState);
      }

      return withSettings(nextState, state.settings);
    }
    case 'hydration-failed':
      return { ...state, isHydrated: true, hydrationError: action.message };
    case 'recover-session':
      return withSettings(
        {
          ...createInitialState(),
          settingsMessage: state.settingsMessage,
          isHydrated: true,
          canPersistCycle: true,
          canPersistSession: true,
        },
        state.settings,
      );
    case 'reconcile': {
      if (!state.isHydrated || state.hydrationError !== null) {
        return state;
      }

      const focusTimer = reconcileTimer(state.focusTimer, action.now);
      const breakTimer = reconcileTimer(state.breakTimer, action.now);
      let nextState = { ...state, focusTimer, breakTimer };

      if (state.focusTimer.status === 'running' && focusTimer.status === 'finished') {
        nextState = completeFocusTransition(nextState, focusTimer);
      }

      if (state.breakTimer.status === 'running' && breakTimer.status === 'finished') {
        nextState = completeBreakTransition(nextState);
      }

      return nextState;
    }
    case 'start-focus': {
      if (!state.isHydrated || state.hydrationError !== null) {
        return state;
      }

      const focusTimer = startTimer(state.focusTimer, action.now);
      if (focusTimer === state.focusTimer) {
        return state;
      }

      return {
        ...state,
        focusTimer,
        cycle: startPomodoroCycle(state.cycle),
        canPersistSession: true,
        hasStartedSession: true,
        expiresAtEpochMs: action.expiresAtEpochMs,
      };
    }
    case 'pause-focus': {
      if (state.focusTimer.status !== 'running') {
        return state;
      }
      const focusTimer = pauseTimer(state.focusTimer, action.now);
      const nextState = { ...state, focusTimer };
      if (state.focusTimer.status === 'running' && focusTimer.status === 'finished') {
        return completeFocusTransition(nextState, focusTimer);
      }

      return { ...nextState, expiresAtEpochMs: null, notificationId: null };
    }
    case 'reset-focus':
      return {
        ...state,
        focusTimer: createFocusTimer(state.settings.focusMinutes * MINUTE_MS),
        canPersistSession: true,
        expiresAtEpochMs: null,
        notificationId: null,
      };
    case 'start-break': {
      if (!state.isHydrated || state.hydrationError !== null || state.breakType === null) {
        return state;
      }

      return {
        ...state,
        breakTimer: startTimer(state.breakTimer, action.now),
        canPersistSession: true,
        hasStartedSession: true,
        expiresAtEpochMs: action.expiresAtEpochMs,
      };
    }
    case 'pause-break': {
      if (state.breakTimer.status !== 'running') {
        return state;
      }

      const breakTimer = pauseTimer(state.breakTimer, action.now);
      const nextState = { ...state, breakTimer };
      if (breakTimer.status === 'finished') {
        return completeBreakTransition(nextState);
      }

      return { ...nextState, expiresAtEpochMs: null, notificationId: null };
    }
    case 'reset-break':
      if (state.breakType === null) {
        return state;
      }
      return {
        ...state,
        breakTimer: createPreparedBreakTimer(
          state.breakType === 'long'
            ? state.settings.longBreakMinutes
            : state.settings.shortBreakMinutes,
        ),
        canPersistSession: true,
        expiresAtEpochMs: null,
        notificationId: null,
      };
    case 'notification-scheduled':
      if (
        state.expiresAtEpochMs !== action.expiresAtEpochMs ||
        (state.focusTimer.status !== 'running' && state.breakTimer.status !== 'running')
      ) {
        return state;
      }
      return {
        ...state,
        notificationId: action.notificationId,
        notificationStatus: 'scheduled',
        notificationMessage: null,
      };
    case 'notification-unavailable':
    case 'notification-failed':
      if (
        action.expiresAtEpochMs !== null &&
        (state.expiresAtEpochMs !== action.expiresAtEpochMs ||
          (state.focusTimer.status !== 'running' && state.breakTimer.status !== 'running'))
      ) {
        return state;
      }
      return {
        ...state,
        notificationStatus: action.type === 'notification-unavailable' ? 'unavailable' : 'failed',
        notificationMessage: action.message,
      };
    case 'alarm-failed':
      return {
        ...state,
        notificationStatus: 'failed',
        notificationMessage: action.message,
      };
    case 'notification-cleared':
      return state.notificationId === action.notificationId
        ? { ...state, notificationId: null }
        : state;
    case 'alarm-started':
      return { ...state, isAlarmActive: true, alarmPhase: action.phase };
    case 'alarm-cleared':
      return { ...state, isAlarmActive: false, alarmPhase: null };
  }
}

export function PomodoroTimerProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(pomodoroTimerReducer, undefined, createInitialState);
  const sessionSaveQueue = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    let isMounted = true;

    async function hydrateSession() {
      try {
        const settings = await loadPomodoroSettings();
        if (isMounted) {
          dispatch({ type: 'hydrate-settings', settings, message: null });
        }
      } catch (error: unknown) {
        console.error('No se pudieron cargar los ajustes del temporizador Pomodoro.', error);
        if (isMounted) {
          dispatch({
            type: 'hydrate-settings',
            settings: DEFAULT_SETTINGS,
            message: SETTINGS_LOAD_FAILED_MESSAGE,
          });
        }
      }

      const session = await loadPomodoroSession();
      if (session !== null) {
        const nowEpochMs = Date.now();
        if (session.expiresAtEpochMs !== null && session.expiresAtEpochMs <= nowEpochMs) {
          await cancelPomodoroNotification(session.notificationId).catch((error: unknown) => {
            console.error('No se pudo cancelar el aviso de una fase vencida.', error);
          });
        }
        if (isMounted) {
          dispatch({
            type: 'hydrate-session',
            session,
            nowEpochMs,
            monotonicNow: performance.now(),
          });
        }
        return;
      }

      const { pomodoroCount, cycleLength } = await loadPomodoroCycle();
      if (isMounted) {
        dispatch({
          type: 'hydrate',
          cycle: createPomodoroCycle(pomodoroCount, cycleLength),
        });
      }
    }

    hydrateSession()
      .catch((error: unknown) => {
        console.error('No se pudo restaurar la sesión del temporizador Pomodoro.', error);
        if (isMounted) {
          dispatch({
            type: 'hydration-failed',
            message: error instanceof Error ? error.message : 'Error desconocido.',
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    configurePomodoroNotificationHandler();
  }, []);

  useEffect(() => {
    if (!state.isHydrated || !state.canPersistCycle) {
      return;
    }

    savePomodoroCycle({
      pomodoroCount: state.cycle.pomodoroCount,
      cycleLength: state.cycle.activeCycleLength,
    }).catch((error: unknown) => {
      console.error('No se pudo guardar el progreso del ciclo Pomodoro.', error);
      dispatch({ type: 'storage-save-failed' });
    });
  }, [
    state.canPersistCycle,
    state.cycle.activeCycleLength,
    state.cycle.pomodoroCount,
    state.isHydrated,
  ]);

  const focusTimerPhase = state.focusTimer.phase;
  const focusTimerStatus = state.focusTimer.status;
  const focusTimerDuration = state.focusTimer.initialDurationMs;
  const focusRemainingForStorage =
    focusTimerStatus === 'running' ? focusTimerDuration : state.focusTimer.remainingMs;
  const persistedFocusTimer = useMemo(
    () => ({
      phase: focusTimerPhase,
      status: focusTimerStatus,
      initialDurationMs: focusTimerDuration,
      remainingMs: focusRemainingForStorage,
      startedAt: focusTimerStatus === 'running' ? 0 : null,
    }),
    [focusRemainingForStorage, focusTimerDuration, focusTimerPhase, focusTimerStatus],
  );
  const breakTimerPhase = state.breakTimer.phase;
  const breakTimerStatus = state.breakTimer.status;
  const breakTimerDuration = state.breakTimer.initialDurationMs;
  const breakRemainingForStorage =
    breakTimerStatus === 'running' ? breakTimerDuration : state.breakTimer.remainingMs;
  const persistedBreakTimer = useMemo(
    () => ({
      phase: breakTimerPhase,
      status: breakTimerStatus,
      initialDurationMs: breakTimerDuration,
      remainingMs: breakRemainingForStorage,
      startedAt: breakTimerStatus === 'running' ? 0 : null,
    }),
    [breakRemainingForStorage, breakTimerDuration, breakTimerPhase, breakTimerStatus],
  );
  const sessionSnapshot = useMemo<PomodoroSessionSnapshot | null>(() => {
    if (!state.canPersistSession) {
      return null;
    }

    return {
      version: 1,
      focusTimer: persistedFocusTimer,
      breakTimer: persistedBreakTimer,
      cycle: state.cycle,
      breakType: state.breakType,
      hasStartedSession: state.hasStartedSession,
      expiresAtEpochMs: state.expiresAtEpochMs,
      notificationId: state.notificationId,
    };
  }, [
    persistedBreakTimer,
    persistedFocusTimer,
    state.breakType,
    state.canPersistSession,
    state.cycle,
    state.expiresAtEpochMs,
    state.hasStartedSession,
    state.notificationId,
  ]);

  useEffect(() => {
    if (sessionSnapshot === null) {
      return;
    }

    sessionSaveQueue.current = sessionSaveQueue.current
      .then(() => savePomodoroSession(sessionSnapshot))
      .catch((error: unknown) => {
        console.error('No se pudo guardar la sesión del temporizador Pomodoro.', error);
        dispatch({ type: 'storage-save-failed' });
      });
  }, [sessionSnapshot]);

  const runningTimer =
    state.focusTimer.status === 'running'
      ? state.focusTimer
      : state.breakTimer.status === 'running'
        ? state.breakTimer
        : null;
  const runningPhase = runningTimer?.phase ?? null;
  const notificationIdRef = useRef<string | null>(state.notificationId);

  useEffect(() => {
    notificationIdRef.current = state.notificationId;
  }, [state.notificationId]);

  useEffect(() => {
    if (!state.isHydrated || state.hydrationError !== null) {
      return;
    }

    let isCurrent = true;
    let activeNotificationId = notificationIdRef.current;

    async function synchronizeNotification() {
      await cancelPomodoroNotification(activeNotificationId);
      if (activeNotificationId !== null) {
        dispatch({ type: 'notification-cleared', notificationId: activeNotificationId });
        activeNotificationId = null;
        notificationIdRef.current = null;
      }

      if (runningPhase === null || state.expiresAtEpochMs === null) {
        return;
      }

      const notificationId = await schedulePomodoroCompletionNotification(
        runningPhase,
        state.expiresAtEpochMs,
      );
      if (!isCurrent) {
        if (notificationId.status === 'scheduled') {
          await cancelPomodoroNotification(notificationId.notificationId);
        }
        return;
      }

      if (notificationId.status === 'unavailable') {
        dispatch({
          type: 'notification-unavailable',
          expiresAtEpochMs: state.expiresAtEpochMs,
          message:
            notificationId.reason === 'permission-denied'
              ? 'Las notificaciones están desactivadas. El temporizador seguirá funcionando; puedes activar el permiso en los ajustes del dispositivo.'
              : 'Las notificaciones no están disponibles en este dispositivo. El temporizador seguirá funcionando.',
        });
        return;
      }

      activeNotificationId = notificationId.notificationId;
      notificationIdRef.current = notificationId.notificationId;
      dispatch({
        type: 'notification-scheduled',
        expiresAtEpochMs: state.expiresAtEpochMs!,
        notificationId: notificationId.notificationId,
      });
    }

    synchronizeNotification().catch((error: unknown) => {
      console.error('No se pudo programar el aviso del temporizador Pomodoro.', error);
      if (isCurrent) {
        dispatch({
          type: 'notification-failed',
          expiresAtEpochMs: state.expiresAtEpochMs,
          message: 'No se pudo programar el aviso. El temporizador seguirá funcionando.',
        });
      }
    });

    return () => {
      isCurrent = false;
      const notificationAlreadyExpiredInBackground =
        runningPhase !== null &&
        state.expiresAtEpochMs !== null &&
        AppState.currentState !== 'active' &&
        Date.now() >= state.expiresAtEpochMs;
      if (notificationAlreadyExpiredInBackground) {
        return;
      }

      cancelPomodoroNotification(activeNotificationId).catch((error: unknown) => {
        console.error('No se pudo cancelar el aviso del temporizador Pomodoro.', error);
      });
    };
  }, [
    runningPhase,
    state.breakTimer.status,
    state.expiresAtEpochMs,
    state.focusTimer.status,
    state.hydrationError,
    state.isHydrated,
  ]);

  const reconcileRunningTimers = useCallback(() => {
    dispatch({ type: 'reconcile', now: performance.now() });
  }, []);

  useEffect(() => {
    if (state.focusTimer.status !== 'running' && state.breakTimer.status !== 'running') {
      return;
    }

    const interval = setInterval(reconcileRunningTimers, TIMER_TICK_INTERVAL_MS);
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        reconcileRunningTimers();
      }
    });

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [reconcileRunningTimers, state.breakTimer.status, state.focusTimer.status]);

  const startFocus = useCallback(() => {
    dispatch({
      type: 'start-focus',
      now: performance.now(),
      expiresAtEpochMs: Date.now() + state.focusTimer.remainingMs,
    });
  }, [state.focusTimer.remainingMs]);

  const pauseFocus = useCallback(() => {
    dispatch({ type: 'pause-focus', now: performance.now() });
  }, []);

  const resetFocus = useCallback(() => {
    dispatch({ type: 'reset-focus' });
  }, []);

  const saveSettings = useCallback(
    async (settings: PomodoroSettings): Promise<SaveSettingsResult> => {
      try {
        await savePomodoroSettings(settings);
      } catch (error: unknown) {
        console.error('No se pudieron guardar los ajustes del temporizador Pomodoro.', error);
        return { success: false, message: SETTINGS_SAVE_FAILED_MESSAGE };
      }

      const session = {
        focusTimer: state.focusTimer,
        breakTimer: state.breakTimer,
        breakType: state.breakType,
        cycle: state.cycle,
      };
      const { cycleGoalReached } = applySettingsToSession(session, settings);
      const durationChangeDeferred = hasDeferredDurationChange(session, state.settings, settings);
      dispatch({ type: 'apply-settings', settings });
      return { success: true, cycleGoalReached, durationChangeDeferred };
    },
    [state.breakTimer, state.breakType, state.cycle, state.focusTimer, state.settings],
  );

  const resetSettings = useCallback(() => saveSettings(DEFAULT_SETTINGS), [saveSettings]);

  const startBreak = useCallback(() => {
    if (
      !state.isHydrated ||
      state.breakType === null ||
      state.breakTimer.status !== 'paused' ||
      state.breakTimer.remainingMs <= 0
    ) {
      return false;
    }

    dispatch({
      type: 'start-break',
      now: performance.now(),
      expiresAtEpochMs: Date.now() + state.breakTimer.remainingMs,
    });
    return true;
  }, [
    state.breakTimer.remainingMs,
    state.breakTimer.status,
    state.breakType,
    state.isHydrated,
  ]);

  const pauseBreak = useCallback(() => {
    dispatch({ type: 'pause-break', now: performance.now() });
  }, []);

  const resetBreak = useCallback(() => {
    dispatch({ type: 'reset-break' });
  }, []);

  const recoverFromHydrationError = useCallback(() => {
    if (state.hydrationError !== null) {
      dispatch({ type: 'recover-session' });
    }
  }, [state.hydrationError]);

  const requestNotificationPermission = useCallback(async () => {
    try {
      const granted = await requestPomodoroNotificationPermission();
      if (!granted) {
        dispatch({
          type: 'notification-unavailable',
          expiresAtEpochMs: null,
          message:
            'Las notificaciones están desactivadas. El temporizador seguirá funcionando; puedes activar el permiso en los ajustes del dispositivo.',
        });
      }
      return granted;
    } catch (error: unknown) {
      console.error('No se pudo solicitar permiso para notificaciones.', error);
      dispatch({
        type: 'notification-failed',
        expiresAtEpochMs: null,
        message: 'No se pudo comprobar el permiso de notificaciones. El temporizador seguirá funcionando.',
      });
      throw error;
    }
  }, []);

  const dismissStorageMessage = useCallback(() => {
    dispatch({ type: 'dismiss-storage-message' });
  }, []);

  const stopAlarm = useCallback(() => {
    dispatch({ type: 'alarm-cleared' });
  }, []);
  const reportAlarmFailure = useCallback(() => {
    dispatch({
      type: 'alarm-failed',
      message: 'No se pudo activar el sonido o la vibración de la alarma. El temporizador seguirá funcionando.',
    });
  }, []);

  const value = useMemo(
    () => ({
      focusTimer: state.focusTimer,
      breakTimer: state.breakTimer,
      pomodoroCount: state.cycle.pomodoroCount,
      cycleLength: state.cycle.activeCycleLength,
      breakType: state.breakType,
      isAlarmActive: state.isAlarmActive,
      alarmPhase: state.alarmPhase,
      notificationMessage: state.notificationMessage,
      isHydrated: state.isHydrated,
      hydrationError: state.hydrationError,
      hasStartedSession: state.hasStartedSession,
      settings: state.settings,
      settingsMessage: state.settingsMessage,
      storageMessage: state.storageMessage,
      dismissStorageMessage,
      startFocus,
      pauseFocus,
      resetFocus,
      saveSettings,
      resetSettings,
      startBreak,
      pauseBreak,
      resetBreak,
      stopAlarm,
      reportAlarmFailure,
      recoverFromHydrationError,
      requestNotificationPermission,
    }),
    [
      resetFocus,
      resetSettings,
      saveSettings,
      startBreak,
      startFocus,
      pauseFocus,
      pauseBreak,
      resetBreak,
      stopAlarm,
      reportAlarmFailure,
      recoverFromHydrationError,
      requestNotificationPermission,
      state.alarmPhase,
      state.breakTimer,
      state.breakType,
      state.cycle.activeCycleLength,
      state.cycle.pomodoroCount,
      state.focusTimer,
      state.hydrationError,
      state.hasStartedSession,
      state.isAlarmActive,
      state.isHydrated,
      state.notificationMessage,
      state.settings,
      state.settingsMessage,
      state.storageMessage,
      dismissStorageMessage,
    ],
  );

  return createElement(PomodoroTimerContext.Provider, { value }, children);
}

export function usePomodoroTimer(): PomodoroTimerContextValue {
  const context = useContext(PomodoroTimerContext);
  if (context === null) {
    throw new Error('usePomodoroTimer must be used within PomodoroTimerProvider.');
  }

  return context;
}


================================================
ðŸ“„ ARCHIVO: src\hooks\use-theme.ts
================================================

/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useTheme() {
  const scheme = useColorScheme();
  const theme = scheme === 'unspecified' ? 'light' : scheme;

  return Colors[theme];
}


================================================
ðŸ“„ ARCHIVO: src\notifications\pomodoro-alarm.ts
================================================

import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import { Vibration } from 'react-native';

const vibrationPattern = [400, 200, 400, 200, 400];
const vibrationIntervalMs = 1_600;
export const ALARM_AUTO_STOP_MS = 3_000;
const alarmAudio = require('../../assets/audio/pomodoro-alarm.wav');

let player: AudioPlayer | null = null;
let vibrationInterval: ReturnType<typeof setInterval> | null = null;
let alarmGeneration = 0;

export async function startPomodoroAlarm(): Promise<void> {
  stopPomodoroAlarm();
  const generation = ++alarmGeneration;

  try {
    await setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: false,
    });
    if (generation !== alarmGeneration) {
      return;
    }

    player = createAudioPlayer(alarmAudio, { updateInterval: 1_000 });
    player.loop = true;
    Vibration.vibrate(vibrationPattern);
    vibrationInterval = setInterval(() => {
      Vibration.vibrate(vibrationPattern);
    }, vibrationIntervalMs);
    player.play();
  } catch (error: unknown) {
    if (generation === alarmGeneration) {
      stopPomodoroAlarm();
    }
    throw error;
  }
}

export function stopPomodoroAlarm(): void {
  alarmGeneration += 1;

  if (player === null && vibrationInterval === null) {
    return;
  }

  if (vibrationInterval !== null) {
    clearInterval(vibrationInterval);
    vibrationInterval = null;
  }

  const activePlayer = player;
  player = null;

  try {
    Vibration.cancel();
  } finally {
    activePlayer?.remove();
  }
}


================================================
ðŸ“„ ARCHIVO: src\notifications\pomodoro-notifications.ts
================================================

import { AppState, Platform } from 'react-native';
import { cancelScheduledNotificationAsync } from 'expo-notifications/build/cancelScheduledNotificationAsync';
import { getPermissionsAsync, requestPermissionsAsync } from 'expo-notifications/build/NotificationPermissions';
import {
  setNotificationHandler,
  type NotificationHandler,
} from 'expo-notifications/build/NotificationsHandler';
import {
  SchedulableTriggerInputTypes,
  type NotificationBehavior,
  type NotificationResponse,
} from 'expo-notifications/build/Notifications.types';
import {
  addNotificationResponseReceivedListener,
  clearLastNotificationResponse,
  getLastNotificationResponse,
} from 'expo-notifications/build/NotificationsEmitter';
import type { EventSubscription } from 'expo-modules-core';
import { scheduleNotificationAsync } from 'expo-notifications/build/scheduleNotificationAsync';

import type { TimerPhase } from '@/domain/timer';

export function getPomodoroNotificationBehavior(
  isForeground: boolean,
): NotificationBehavior {
  return {
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: !isForeground,
    shouldShowList: !isForeground,
  };
}

export function configurePomodoroNotificationHandler(): void {
  const handler: NotificationHandler = {
    handleNotification: async () =>
      getPomodoroNotificationBehavior(AppState.currentState === 'active'),
  };
  setNotificationHandler(handler);
}

export type PomodoroNotificationScheduleResult =
  | { status: 'scheduled'; notificationId: string }
  | { status: 'unavailable'; reason: 'unsupported' | 'permission-denied' };

export async function requestPomodoroNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return false;
  }

  const currentPermission = await getPermissionsAsync();
  if (currentPermission.granted || currentPermission.status === 'granted') {
    return true;
  }

  const requestedPermission = await requestPermissionsAsync();
  return requestedPermission.granted || requestedPermission.status === 'granted';
}

export async function schedulePomodoroCompletionNotification(
  phase: TimerPhase,
  expiresAtEpochMs: number,
): Promise<PomodoroNotificationScheduleResult> {
  if (Platform.OS === 'web') {
    return { status: 'unavailable', reason: 'unsupported' };
  }
  if (!Number.isFinite(expiresAtEpochMs) || expiresAtEpochMs <= Date.now()) {
    throw new RangeError('Notification expiry must be a finite future timestamp.');
  }

  const permission = await getPermissionsAsync();
  if (!permission.granted && permission.status !== 'granted') {
    return { status: 'unavailable', reason: 'permission-denied' };
  }

  const notificationId = await scheduleNotificationAsync({
    content: {
      title: phase === 'focus' ? 'Estudio terminado' : 'Descanso terminado',
      body: 'La fase siguiente está lista para iniciar.',
      data: { type: 'pomodoro-phase-complete', phase },
    },
    trigger: {
      type: SchedulableTriggerInputTypes.DATE,
      date: new Date(expiresAtEpochMs),
    },
  });
  return { status: 'scheduled', notificationId };
}

export async function cancelPomodoroNotification(notificationId: string | null): Promise<void> {
  if (notificationId !== null) {
    await cancelScheduledNotificationAsync(notificationId);
  }
}

export function isPomodoroCompletionResponse(
  response: NotificationResponse | null,
): boolean {
  const data = response?.notification.request.content.data;
  return (
    data?.type === 'pomodoro-phase-complete' &&
    (data.phase === 'focus' || data.phase === 'break')
  );
}

export function hasInitialPomodoroCompletionResponse(): boolean {
  return isPomodoroCompletionResponse(getLastNotificationResponse());
}

export function addPomodoroNotificationResponseListener(
  listener: () => void,
): EventSubscription {
  return addNotificationResponseReceivedListener((response) => {
    if (isPomodoroCompletionResponse(response)) {
      listener();
    }
  });
}

export function clearPomodoroNotificationResponse(): void {
  clearLastNotificationResponse();
}


================================================
ðŸ“„ ARCHIVO: src\storage\pomodoro-cycle-storage.ts
================================================

import AsyncStorage from '@react-native-async-storage/async-storage';

import { DEFAULT_POMODORO_CYCLE_LENGTH, isValidPomodoroCycleLength } from '@/domain/timer';

export const POMODORO_COUNT_STORAGE_KEY = 'pomodoro-cotopaxi:cycle-count';
export const ACTIVE_CYCLE_LENGTH_STORAGE_KEY = 'pomodoro-cotopaxi:active-cycle-length';

export interface StoredPomodoroCycle {
  pomodoroCount: number;
  cycleLength: number;
}

function parseStoredInteger(value: string | null, fieldName: string, defaultValue: number): number {
  if (value === null) {
    return defaultValue;
  }

  if (!/^(0|[1-9]\d*)$/.test(value)) {
    throw new TypeError(`Stored ${fieldName} must be a non-negative integer.`);
  }

  const parsedValue = Number(value);
  if (!Number.isSafeInteger(parsedValue)) {
    throw new RangeError(`Stored ${fieldName} exceeds the supported integer range.`);
  }

  return parsedValue;
}

export async function loadPomodoroCycle(): Promise<StoredPomodoroCycle> {
  const [storedCount, storedCycleLength] = await Promise.all([
    AsyncStorage.getItem(POMODORO_COUNT_STORAGE_KEY),
    AsyncStorage.getItem(ACTIVE_CYCLE_LENGTH_STORAGE_KEY),
  ]);
  const pomodoroCount = parseStoredInteger(storedCount, 'Pomodoro count', 0);
  const cycleLength = parseStoredInteger(
    storedCycleLength,
    'active cycle length',
    DEFAULT_POMODORO_CYCLE_LENGTH,
  );

  if (!isValidPomodoroCycleLength(cycleLength)) {
    throw new RangeError('Stored active cycle length must be a positive integer.');
  }

  if (pomodoroCount >= cycleLength) {
    throw new RangeError('Stored Pomodoro count must be below the active cycle length.');
  }

  return { pomodoroCount, cycleLength };
}

export async function savePomodoroCycle(cycle: StoredPomodoroCycle): Promise<void> {
  if (
    !Number.isInteger(cycle.pomodoroCount) ||
    cycle.pomodoroCount < 0 ||
    !isValidPomodoroCycleLength(cycle.cycleLength) ||
    cycle.pomodoroCount >= cycle.cycleLength
  ) {
    throw new RangeError('Pomodoro cycle data is invalid.');
  }

  await Promise.all([
    AsyncStorage.setItem(POMODORO_COUNT_STORAGE_KEY, String(cycle.pomodoroCount)),
    AsyncStorage.setItem(ACTIVE_CYCLE_LENGTH_STORAGE_KEY, String(cycle.cycleLength)),
  ]);
}


================================================
ðŸ“„ ARCHIVO: src\storage\pomodoro-session-storage.ts
================================================

import AsyncStorage from '@react-native-async-storage/async-storage';

import type { BreakType, PomodoroCycleState, TimerPhase, TimerState } from '@/domain/timer';

export const POMODORO_SESSION_STORAGE_KEY = 'pomodoro-cotopaxi:session:v1';
const POMODORO_SESSION_VERSION = 1;

export interface PomodoroSessionSnapshot {
  version: 1;
  focusTimer: TimerState;
  breakTimer: TimerState;
  cycle: PomodoroCycleState;
  breakType: BreakType | null;
  hasStartedSession: boolean;
  expiresAtEpochMs: number | null;
  notificationId: string | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isTimerState(value: unknown, phase: TimerPhase): value is TimerState {
  if (!isRecord(value) || value.phase !== phase) {
    return false;
  }

  const { status, initialDurationMs, remainingMs, startedAt } = value;
  if (
    (status !== 'paused' && status !== 'running' && status !== 'finished') ||
    !isFiniteNumber(initialDurationMs) ||
    initialDurationMs < 0 ||
    (phase === 'focus' && initialDurationMs === 0) ||
    !isFiniteNumber(remainingMs) ||
    remainingMs < 0
  ) {
    return false;
  }

  if (status === 'running') {
    return remainingMs > 0 && isFiniteNumber(startedAt);
  }

  if (startedAt !== null) {
    return false;
  }

  return status !== 'finished' || remainingMs === 0;
}

function isPomodoroCycleState(value: unknown): value is PomodoroCycleState {
  return (
    isRecord(value) &&
    Number.isInteger(value.pomodoroCount) &&
    typeof value.pomodoroCount === 'number' &&
    value.pomodoroCount >= 0 &&
    Number.isInteger(value.activeCycleLength) &&
    typeof value.activeCycleLength === 'number' &&
    value.activeCycleLength > 0 &&
    value.pomodoroCount < value.activeCycleLength &&
    Number.isInteger(value.configuredCycleLength) &&
    typeof value.configuredCycleLength === 'number' &&
    value.configuredCycleLength > 0 &&
    typeof value.hasStarted === 'boolean'
  );
}

function isPomodoroSessionSnapshot(value: unknown): value is PomodoroSessionSnapshot {
  if (
    !isRecord(value) ||
    value.version !== POMODORO_SESSION_VERSION ||
    !isTimerState(value.focusTimer, 'focus') ||
    !isTimerState(value.breakTimer, 'break') ||
    !isPomodoroCycleState(value.cycle) ||
    (value.breakType !== null && value.breakType !== 'short' && value.breakType !== 'long') ||
    typeof value.hasStartedSession !== 'boolean' ||
    (value.breakType === null && value.breakTimer.status === 'running') ||
    (value.breakType !== null &&
      (value.breakTimer.initialDurationMs <= 0 || value.focusTimer.status === 'running')) ||
    (value.expiresAtEpochMs !== null && !isFiniteNumber(value.expiresAtEpochMs)) ||
    (value.notificationId !== null && typeof value.notificationId !== 'string')
  ) {
    return false;
  }

  const runningTimerCount =
    Number(value.focusTimer.status === 'running') + Number(value.breakTimer.status === 'running');

  return (
    runningTimerCount <= 1 &&
    (runningTimerCount === 1
      ? value.expiresAtEpochMs !== null
      : value.expiresAtEpochMs === null && value.notificationId === null)
  );
}

function assertValidSnapshot(value: unknown): asserts value is PomodoroSessionSnapshot {
  if (
    isRecord(value) &&
    value.version === POMODORO_SESSION_VERSION &&
    isTimerState(value.focusTimer, 'focus') &&
    isTimerState(value.breakTimer, 'break') &&
    (value.focusTimer.status === 'running' || value.breakTimer.status === 'running') &&
    value.expiresAtEpochMs === null
  ) {
    throw new TypeError('A running session must have an expiry timestamp.');
  }

  if (!isPomodoroSessionSnapshot(value)) {
    throw new TypeError('Pomodoro session is invalid.');
  }
}

export async function loadPomodoroSession(): Promise<PomodoroSessionSnapshot | null> {
  const storedValue = await AsyncStorage.getItem(POMODORO_SESSION_STORAGE_KEY);
  if (storedValue === null) {
    return null;
  }

  const parsedValue: unknown = JSON.parse(storedValue);
  if (
    isRecord(parsedValue) &&
    parsedValue.version !== POMODORO_SESSION_VERSION
  ) {
    throw new TypeError('Unsupported Pomodoro session version.');
  }

  if (!isPomodoroSessionSnapshot(parsedValue)) {
    throw new TypeError('Stored Pomodoro session is invalid.');
  }

  return parsedValue;
}

export async function savePomodoroSession(session: PomodoroSessionSnapshot): Promise<void> {
  assertValidSnapshot(session);
  await AsyncStorage.setItem(POMODORO_SESSION_STORAGE_KEY, JSON.stringify(session));
}


================================================
ðŸ“„ ARCHIVO: src\storage\pomodoro-settings-storage.ts
================================================

import AsyncStorage from '@react-native-async-storage/async-storage';

import { DEFAULT_SETTINGS, isValidSettings, type PomodoroSettings } from '@/domain/settings';

export const POMODORO_SETTINGS_STORAGE_KEY = 'pomodoro-cotopaxi:settings:v1';
const POMODORO_SETTINGS_VERSION = 1;

export async function loadPomodoroSettings(): Promise<PomodoroSettings> {
  const storedValue = await AsyncStorage.getItem(POMODORO_SETTINGS_STORAGE_KEY);
  if (storedValue === null) {
    return DEFAULT_SETTINGS;
  }

  const parsedValue: unknown = JSON.parse(storedValue);
  if (
    typeof parsedValue !== 'object' ||
    parsedValue === null ||
    (parsedValue as { version?: unknown }).version !== POMODORO_SETTINGS_VERSION
  ) {
    throw new TypeError('Unsupported Pomodoro settings version.');
  }

  if (!isValidSettings(parsedValue)) {
    throw new TypeError('Stored Pomodoro settings are invalid.');
  }

  const { focusMinutes, shortBreakMinutes, longBreakMinutes, cycleLength } = parsedValue;
  return { focusMinutes, shortBreakMinutes, longBreakMinutes, cycleLength };
}

export async function savePomodoroSettings(settings: PomodoroSettings): Promise<void> {
  if (!isValidSettings(settings)) {
    throw new RangeError('Pomodoro settings are invalid.');
  }

  await AsyncStorage.setItem(
    POMODORO_SETTINGS_STORAGE_KEY,
    JSON.stringify({ version: POMODORO_SETTINGS_VERSION, ...settings }),
  );
}


================================================
ðŸ“„ ARCHIVO: tsconfig.json
================================================

{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": [
        "./src/*"
      ],
      "@/assets/*": [
        "./assets/*"
      ]
    }
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
    ".expo/types/**/*.ts",
    "expo-env.d.ts"
  ]
}
