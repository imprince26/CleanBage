import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/button';

export const PageHeader = ({
  title,
  description,
  actionLabel,
  actionOnClick,
  backLabel,
  backOnClick,
  className,
}) => {
  return (
    <div className={cn('mb-6', className)}>
      <div className="flex items-center justify-between">
        <div>
          {title && (
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          )}
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {backLabel && backOnClick && (
            <Button variant="outline" onClick={backOnClick}>
              {backLabel}
            </Button>
          )}
          {actionLabel && actionOnClick && (
            <Button onClick={actionOnClick}>
              {actionLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};