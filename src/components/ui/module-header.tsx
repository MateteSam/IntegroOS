import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';

interface ModuleHeaderProps {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  onBack: () => void;
  breadcrumbs?: { label: string; onClick?: () => void }[];
}

export const ModuleHeader: React.FC<ModuleHeaderProps> = ({
  title,
  description,
  icon: Icon,
  onBack,
  breadcrumbs = []
}) => {
  return (
    <div className="mb-6 space-y-4">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="text-foreground/70 hover:text-foreground hover:bg-foreground/10"
          aria-label="Back to dashboard"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Dashboard
        </Button>
      </div>

      {breadcrumbs.length > 0 && (
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink onClick={onBack} className="cursor-pointer">
                Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {index === breadcrumbs.length - 1 ? (
                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink onClick={crumb.onClick} className="cursor-pointer">
                      {crumb.label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      )}

      <div className="flex items-center gap-4">
        {Icon && (
          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-primary to-primary/70 flex items-center justify-center">
            <Icon className="w-6 h-6 text-primary-foreground" />
          </div>
        )}
        <div>
          <h1 className="text-3xl font-bold text-foreground">{title}</h1>
          {description && (
            <p className="text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
};
