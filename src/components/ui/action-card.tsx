import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from './card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

export interface ActionCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  icon?: LucideIcon;
  iconColor?: string;
  iconBackground?: string;
  loading?: boolean;
  footer?: React.ReactNode;
  badge?: React.ReactNode;
  onClick?: () => void;
}

/**
 * ActionCard component for interactive card elements
 */
export const ActionCard = React.forwardRef<HTMLDivElement, ActionCardProps>(
  ({ 
    title, 
    description, 
    icon: Icon,
    iconColor = 'text-white',
    iconBackground = 'bg-gradient-to-r from-blue-500 to-purple-600',
    loading = false,
    footer,
    badge,
    onClick,
    className,
    children,
    ...props 
  }, ref) => {
    return (
      <Card
        ref={ref}
        className={cn(
          "overflow-hidden transition-all duration-300",
          onClick && "cursor-pointer hover:scale-[1.02] hover:shadow-lg",
          className
        )}
        onClick={onClick}
        {...props}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            {Icon && (
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110",
                iconBackground
              )}>
                <Icon className={cn("w-6 h-6", iconColor)} />
              </div>
            )}
            
            {badge && (
              <div>
                {badge}
              </div>
            )}
          </div>
          
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
        </CardHeader>
        
        {children && (
          <CardContent>
            {loading ? (
              <div className="w-full h-24 bg-gray-700/50 animate-pulse rounded"></div>
            ) : (
              children
            )}
          </CardContent>
        )}
        
        {footer && (
          <CardFooter>
            {footer}
          </CardFooter>
        )}
      </Card>
    );
  }
);

ActionCard.displayName = 'ActionCard';

export default ActionCard;