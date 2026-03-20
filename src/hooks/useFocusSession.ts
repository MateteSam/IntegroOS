import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';

export interface FocusSession {
    id: string;
    startTime: Date;
    endTime?: Date;
    duration: number; // in seconds
    breaks: number;
    projectId?: string;
    projectName?: string;
    status: 'active' | 'paused' | 'completed' | 'interrupted';
}

interface FocusConfig {
    focusDuration: number; // minutes
    breakDuration: number; // minutes
    enableSounds: boolean;
    enableNotifications: boolean;
}

const DEFAULT_CONFIG: FocusConfig = {
    focusDuration: 25,
    breakDuration: 5,
    enableSounds: true,
    enableNotifications: true
};

const STORAGE_KEY = 'integro-focus-sessions';
const CONFIG_KEY = 'integro-focus-config';

// Simple notification sound (base64 encoded beep)
const playNotificationSound = () => {
    try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 440; // A4 note
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
        console.warn('Could not play notification sound:', e);
    }
};

export function useFocusSession() {
    const [currentSession, setCurrentSession] = useState<FocusSession | null>(null);
    const [config, setConfig] = useState<FocusConfig>(DEFAULT_CONFIG);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [isOnBreak, setIsOnBreak] = useState(false);
    const [todayFocusTime, setTodayFocusTime] = useState(0); // total seconds today
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Load config from localStorage
    useEffect(() => {
        try {
            const savedConfig = localStorage.getItem(CONFIG_KEY);
            if (savedConfig) {
                setConfig({ ...DEFAULT_CONFIG, ...JSON.parse(savedConfig) });
            }
        } catch (e) {
            console.warn('Failed to load focus config:', e);
        }
    }, []);

    // Load today's focus time
    useEffect(() => {
        try {
            const savedSessions = localStorage.getItem(STORAGE_KEY);
            if (savedSessions) {
                const sessions: FocusSession[] = JSON.parse(savedSessions);
                const today = new Date().toDateString();
                const todaySessions = sessions.filter(s =>
                    new Date(s.startTime).toDateString() === today
                );
                const totalSeconds = todaySessions.reduce((acc, s) => acc + s.duration, 0);
                setTodayFocusTime(totalSeconds);
            }
        } catch (e) {
            console.warn('Failed to load focus sessions:', e);
        }
    }, []);

    // Timer effect
    useEffect(() => {
        if (currentSession?.status === 'active' && !isOnBreak) {
            timerRef.current = setInterval(() => {
                setElapsedSeconds(prev => {
                    const newValue = prev + 1;

                    // Check if focus session duration reached
                    if (newValue >= config.focusDuration * 60) {
                        // Focus period complete - time for break
                        if (config.enableSounds) {
                            playNotificationSound();
                        }
                        if (config.enableNotifications) {
                            toast.success('🎉 Focus session complete! Time for a break.', {
                                duration: 5000,
                            });
                        }
                        setIsOnBreak(true);
                        return 0; // Reset for break timer
                    }

                    return newValue;
                });
            }, 1000);
        } else if (isOnBreak && currentSession?.status === 'active') {
            timerRef.current = setInterval(() => {
                setElapsedSeconds(prev => {
                    const newValue = prev + 1;

                    // Check if break duration reached
                    if (newValue >= config.breakDuration * 60) {
                        if (config.enableSounds) {
                            playNotificationSound();
                        }
                        if (config.enableNotifications) {
                            toast.info('⏰ Break over! Ready to focus again?', {
                                duration: 5000,
                            });
                        }
                        setIsOnBreak(false);
                        return 0;
                    }

                    return newValue;
                });
            }, 1000);
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [currentSession?.status, isOnBreak, config]);

    const startSession = useCallback((projectId?: string, projectName?: string) => {
        const newSession: FocusSession = {
            id: `focus-${Date.now()}`,
            startTime: new Date(),
            duration: 0,
            breaks: 0,
            projectId,
            projectName,
            status: 'active'
        };

        setCurrentSession(newSession);
        setElapsedSeconds(0);
        setIsOnBreak(false);

        toast.success('🎯 Focus session started!', {
            description: projectName ? `Working on: ${projectName}` : 'Stay focused!',
        });
    }, []);

    const pauseSession = useCallback(() => {
        if (currentSession) {
            setCurrentSession(prev => prev ? { ...prev, status: 'paused' } : null);
            toast.info('⏸️ Session paused');
        }
    }, [currentSession]);

    const resumeSession = useCallback(() => {
        if (currentSession) {
            setCurrentSession(prev => prev ? { ...prev, status: 'active' } : null);
            toast.info('▶️ Session resumed');
        }
    }, [currentSession]);

    const endSession = useCallback(() => {
        if (currentSession) {
            const finalSession: FocusSession = {
                ...currentSession,
                endTime: new Date(),
                duration: Math.floor(
                    (new Date().getTime() - new Date(currentSession.startTime).getTime()) / 1000
                ),
                status: 'completed'
            };

            // Save to localStorage
            try {
                const savedSessions = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
                savedSessions.unshift(finalSession);
                // Keep only last 100 sessions
                localStorage.setItem(STORAGE_KEY, JSON.stringify(savedSessions.slice(0, 100)));

                // Update today's focus time
                setTodayFocusTime(prev => prev + finalSession.duration);
            } catch (e) {
                console.warn('Failed to save session:', e);
            }

            setCurrentSession(null);
            setElapsedSeconds(0);
            setIsOnBreak(false);

            const minutes = Math.floor(finalSession.duration / 60);
            toast.success(`✅ Session complete! You focused for ${minutes} minutes.`);
        }
    }, [currentSession]);

    const skipBreak = useCallback(() => {
        setIsOnBreak(false);
        setElapsedSeconds(0);
        toast.info('↩️ Skipping break - back to focus mode!');
    }, []);

    const updateConfig = useCallback((newConfig: Partial<FocusConfig>) => {
        setConfig(prev => {
            const updated = { ...prev, ...newConfig };
            try {
                localStorage.setItem(CONFIG_KEY, JSON.stringify(updated));
            } catch (e) {
                console.warn('Failed to save config:', e);
            }
            return updated;
        });
    }, []);

    // Format seconds to mm:ss
    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Calculate progress percentage
    const getProgress = (): number => {
        const targetSeconds = isOnBreak
            ? config.breakDuration * 60
            : config.focusDuration * 60;
        return (elapsedSeconds / targetSeconds) * 100;
    };

    return {
        // Session state
        currentSession,
        isActive: currentSession?.status === 'active',
        isPaused: currentSession?.status === 'paused',
        isOnBreak,
        elapsedSeconds,

        // Actions
        startSession,
        pauseSession,
        resumeSession,
        endSession,
        skipBreak,

        // Config
        config,
        updateConfig,

        // Stats
        todayFocusTime,
        formatTime,
        getProgress,

        // Formatted values
        formattedElapsed: formatTime(elapsedSeconds),
        formattedToday: formatTime(todayFocusTime),
        progressPercent: getProgress()
    };
}
