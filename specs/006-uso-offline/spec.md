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
