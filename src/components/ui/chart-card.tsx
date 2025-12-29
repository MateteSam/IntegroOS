import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './card';
import { cn } from '@/lib/utils';

export interface ChartCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  loading?: boolean;
  fullHeight?: boolean;
  headerAction?: React.ReactNode;
  footerAction?: React.ReactNode;
}

/**
 * ChartCard component for displaying data visualizations
 */
export const ChartCard = React.forwardRef<HTMLDivElement, ChartCardProps>(
  ({ 
    title, 
    description, 
    loading = false,
    fullHeight = false,
    headerAction,
    footerAction,
    className,
    children,
    ...props 
  }, ref) => {
    return (
      <Card
        ref={ref}
        className={cn(
          "overflow-hidden",
          fullHeight && "h-full flex flex-col",
          className
        )}
        {...props}
      >
        <CardHeader className={cn(
          "flex flex-row items-center justify-between",
          !description && "pb-2"
        )}>
          <div>
            {loading ? (
              <>
                <div className="h-7 w-40 bg-gray-700/50 animate-pulse rounded mb-2"></div>
                {description && (
                  <div className="h-5 w-64 bg-gray-700/50 animate-pulse rounded"></div>
                )}
              </>
            ) : (
              <>
                <CardTitle className="text-white">{title}</CardTitle>
                {description && (
                  <CardDescription className="text-gray-400">
                    {description}
                  </CardDescription>
                )}
              </>
            )}
          </div>
          
          {headerAction && (
            <div className="ml-4">
              {headerAction}
            </div>
          )}
        </CardHeader>
        
        <CardContent className={cn(
          "pb-6",
          fullHeight && "flex-1 flex flex-col",
          loading && "flex items-center justify-center min-h-[200px]"
        )}>
          {loading ? (
            <div className="w-full h-full min-h-[200px] bg-gray-700/50 animate-pulse rounded"></div>
          ) : (
            children
          )}
        </CardContent>
        
        {footerAction && (
          <div className="px-6 pb-6 mt-auto">
            {footerAction}
          </div>
        )}
      </Card>
    );
  }
);

ChartCard.displayName = 'ChartCard';

export default ChartCard;