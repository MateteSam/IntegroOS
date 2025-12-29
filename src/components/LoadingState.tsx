import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, Sparkles, Brain, Rocket, Clock } from 'lucide-react';

type LoadingStateProps = {
  progress?: number;
  message?: string;
  title?: string;
  stage?: string;
  estimatedTime?: number;
};

const getStageIcon = (stage?: string) => {
  switch (stage) {
    case 'analyzing':
      return Brain;
    case 'generating':
      return Sparkles;
    case 'finalizing':
      return Rocket;
    default:
      return Loader2;
  }
};

export const LoadingState: React.FC<LoadingStateProps> = ({
  progress,
  message = "Generating your brand assets...",
  title = "AI at Work",
  stage,
  estimatedTime
}) => {
  const Icon = getStageIcon(stage);

  const getStageLabel = () => {
    if (!stage) return null;
    const labels: Record<string, string> = {
      'analyzing': 'Analyzing Input',
      'generating': 'Creating Assets',
      'refining': 'Refining Details',
      'finalizing': 'Finalizing'
    };
    return labels[stage] || stage;
  };

  const stages = ['analyzing', 'generating', 'refining', 'finalizing'];
  const currentStageIndex = stage ? stages.indexOf(stage) : 0;

  return (
    <Card className="w-full max-w-md mx-auto p-8 space-y-6 glass">
      {/* Header */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="absolute inset-0 animate-pulse bg-primary/20 rounded-full blur-xl" />
          <Icon className="w-12 h-12 text-primary animate-spin relative glow" />
        </div>
        <div className="text-center space-y-1">
          <h3 className="text-xl font-semibold gradient-text">{title}</h3>
          {getStageLabel() && (
            <p className="text-sm text-muted-foreground">{getStageLabel()}</p>
          )}
        </div>
      </div>

      {/* Stage Progress */}
      <div className="flex justify-between items-center gap-2">
        {stages.map((s, idx) => (
          <div key={s} className="flex items-center flex-1">
            <div
              className={`h-2 rounded-full flex-1 transition-all duration-500 ${
                idx <= currentStageIndex
                  ? 'bg-gradient-to-r from-primary to-primary/80'
                  : 'bg-muted'
              }`}
            />
            {idx < stages.length - 1 && <div className="w-2" />}
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      {progress !== undefined && (
        <div className="space-y-2">
          <Progress value={progress} className="h-3" />
          <p className="text-sm text-center text-muted-foreground">
            {Math.round(progress)}% Complete
          </p>
        </div>
      )}

      {/* Message */}
      <p className="text-sm text-center text-muted-foreground animate-pulse">
        {message}
      </p>

      {/* Estimated Time */}
      {estimatedTime && (
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>Estimated time: {estimatedTime}s</span>
        </div>
      )}
    </Card>
  );
};
