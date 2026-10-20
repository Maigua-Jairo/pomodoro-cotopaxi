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
