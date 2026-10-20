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
