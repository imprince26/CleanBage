import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/button';

export const EmptyState = ({
  icon,
  title,
  description,
  actionLabel,
  actionOnClick,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center',
        className
      )}
    >
      {icon && (
        <div className="mb-4 text-muted-foreground">
          {icon}
        </div>
      )}
      {title && (
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
      )}
      {description && (
        <p className="text-sm text-muted-foreground mb-4 max-w-md">
          {description}
        </p>
      )}
      {actionLabel && actionOnClick && (
        <Button onClick={actionOnClick}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};