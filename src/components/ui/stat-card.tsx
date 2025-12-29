import React from 'react';
import { Card, CardContent } from './card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  iconColor?: string;
  iconBackground?: string;
  trend?: {
    value: string;
    direction: 'up' | 'down' | 'neutral';
  };
  loading?: boolean;
}

/**
 * StatCard component for displaying metric information
 */
export const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ 
    title, 
    value, 
    icon: Icon, 
    iconColor = 'text-blue-400',
    iconBackground = 'bg-blue-500/20',
    trend,
    loading = false,
    className,
    ...props 
  }, ref) => {
    return (
      <Card
        ref={ref}
        className={cn(
          "overflow-hidden",
          className
        )}
        {...props}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">{title}</p>
              {loading ? (
                <div className="h-8 w-24 bg-gray-700/50 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-white">{value}</p>
              )}
            </div>
            
            {Icon && (
              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", iconBackground)}>
                <Icon className={cn("w-6 h-6", iconColor)} />
              </div>
            )}
          </div>
          
          {trend && !loading && (
            <div className="flex items-center mt-2">
              {trend.direction === 'up' && (
                <>
                  <svg 
                    className="w-4 h-4 text-green-400 mr-1" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M5 15l7-7 7 7" 
                    />
                  </svg>
                  <span className="text-green-400 text-sm">{trend.value}</span>
                </>
              )}
              
              {trend.direction === 'down' && (
                <>
                  <svg 
                    className="w-4 h-4 text-red-400 mr-1" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M19 9l-7 7-7-7" 
                    />
                  </svg>
                  <span className="text-red-400 text-sm">{trend.value}</span>
                </>
              )}
              
              {trend.direction === 'neutral' && (
                <>
                  <svg 
                    className="w-4 h-4 text-gray-400 mr-1" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M5 12h14" 
                    />
                  </svg>
                  <span className="text-gray-400 text-sm">{trend.value}</span>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
);

StatCard.displayName = 'StatCard';

export default StatCard;