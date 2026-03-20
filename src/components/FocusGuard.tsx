import React from 'react';
import { useFocusSession } from '@/hooks/useFocusSession';
import { useProjectRegistry } from '@/contexts/ProjectRegistry';
import { Button } from '@/components/ui/button';
import {
    Play,
    Pause,
    Square,
    Coffee,
    Timer,
    SkipForward,
    Settings,
    Target,
    Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export const FocusGuard: React.FC = () => {
    const {
        currentSession,
        isActive,
        isPaused,
        isOnBreak,
        startSession,
        pauseSession,
        resumeSession,
        endSession,
        skipBreak,
        config,
        updateConfig,
        formattedElapsed,
        formattedToday,
        progressPercent
    } = useFocusSession();

    const { activeProject } = useProjectRegistry();

    const handleStartSession = () => {
        startSession(activeProject?.id, activeProject?.displayName);
    };

    // If no session is active, show compact start button
    if (!currentSession) {
        return (
            <div className="flex items-center gap-3">
                <Button
                    onClick={handleStartSession}
                    variant="ghost"
                    size="sm"
                    className="h-9 gap-2 text-muted-foreground hover:text-foreground hover:bg-primary/10"
                >
                    <Target className="w-4 h-4" />
                    <span className="text-xs font-medium">Start Focus</span>
                </Button>

                {/* Today's focus time */}
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Zap className="w-3 h-3" />
                    <span>{formattedToday} today</span>
                </div>
            </div>
        );
    }

    return (
        <div className={cn(
            "flex items-center gap-4 px-4 py-2 rounded-xl border transition-all duration-300",
            isOnBreak
                ? "bg-success/10 border-success/30"
                : "bg-primary/10 border-primary/30"
        )}>
            {/* Progress Ring & Timer */}
            <div className="relative flex items-center justify-center w-12 h-12">
                {/* Background circle */}
                <svg className="absolute w-full h-full -rotate-90">
                    <circle
                        cx="24"
                        cy="24"
                        r="20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        className="text-muted/20"
                    />
                    <circle
                        cx="24"
                        cy="24"
                        r="20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeDasharray={`${progressPercent * 1.256} 125.6`}
                        strokeLinecap="round"
                        className={cn(
                            "transition-all duration-1000",
                            isOnBreak ? "text-success" : "text-primary"
                        )}
                    />
                </svg>

                {/* Icon */}
                <div className="relative z-10">
                    {isOnBreak ? (
                        <Coffee className={cn("w-5 h-5", isOnBreak ? "text-success" : "text-primary")} />
                    ) : (
                        <Timer className={cn("w-5 h-5 text-primary", isActive && "animate-pulse")} />
                    )}
                </div>
            </div>

            {/* Session Info */}
            <div className="flex flex-col">
                <span className={cn(
                    "text-lg font-mono font-bold tracking-tighter",
                    isOnBreak ? "text-success" : "text-primary"
                )}>
                    {formattedElapsed}
                </span>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                    {isOnBreak ? 'Break Time' : (isPaused ? 'Paused' : 'Focus Mode')}
                </span>
            </div>

            {/* Project Badge */}
            {currentSession.projectName && (
                <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-background/50 rounded-lg border border-border/50">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-xs font-medium truncate max-w-[120px]">
                        {currentSession.projectName}
                    </span>
                </div>
            )}

            {/* Controls */}
            <div className="flex items-center gap-1.5 ml-auto">
                {isOnBreak ? (
                    <Button
                        onClick={skipBreak}
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 rounded-lg hover:bg-success/20"
                        title="Skip break"
                    >
                        <SkipForward className="w-4 h-4 text-success" />
                    </Button>
                ) : (
                    <>
                        {isActive ? (
                            <Button
                                onClick={pauseSession}
                                variant="ghost"
                                size="icon"
                                className="w-8 h-8 rounded-lg hover:bg-primary/20"
                                title="Pause session"
                            >
                                <Pause className="w-4 h-4 text-primary" />
                            </Button>
                        ) : (
                            <Button
                                onClick={resumeSession}
                                variant="ghost"
                                size="icon"
                                className="w-8 h-8 rounded-lg hover:bg-primary/20"
                                title="Resume session"
                            >
                                <Play className="w-4 h-4 text-primary" />
                            </Button>
                        )}
                    </>
                )}

                <Button
                    onClick={endSession}
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 rounded-lg hover:bg-destructive/20"
                    title="End session"
                >
                    <Square className="w-4 h-4 text-destructive" />
                </Button>

                {/* Settings Popover */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8 rounded-lg"
                            title="Focus settings"
                        >
                            <Settings className="w-4 h-4 text-muted-foreground" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80" align="end">
                        <div className="space-y-4">
                            <h4 className="font-semibold text-sm">Focus Settings</h4>

                            <div className="space-y-3">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs">Focus Duration</Label>
                                        <span className="text-xs text-muted-foreground">{config.focusDuration} min</span>
                                    </div>
                                    <Slider
                                        value={[config.focusDuration]}
                                        onValueChange={([value]) => updateConfig({ focusDuration: value })}
                                        min={5}
                                        max={60}
                                        step={5}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs">Break Duration</Label>
                                        <span className="text-xs text-muted-foreground">{config.breakDuration} min</span>
                                    </div>
                                    <Slider
                                        value={[config.breakDuration]}
                                        onValueChange={([value]) => updateConfig({ breakDuration: value })}
                                        min={1}
                                        max={15}
                                        step={1}
                                    />
                                </div>

                                <div className="flex items-center justify-between pt-2">
                                    <Label htmlFor="sounds" className="text-xs">Sound notifications</Label>
                                    <Switch
                                        id="sounds"
                                        checked={config.enableSounds}
                                        onCheckedChange={(checked) => updateConfig({ enableSounds: checked })}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <Label htmlFor="toasts" className="text-xs">Toast notifications</Label>
                                    <Switch
                                        id="toasts"
                                        checked={config.enableNotifications}
                                        onCheckedChange={(checked) => updateConfig({ enableNotifications: checked })}
                                    />
                                </div>
                            </div>

                            <div className="pt-2 border-t">
                                <p className="text-[10px] text-muted-foreground">
                                    Today: {formattedToday} focused
                                </p>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    );
};

export default FocusGuard;
