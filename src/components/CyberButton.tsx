import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';

interface CyberButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  children: React.ReactNode;
}

const CyberButton = forwardRef<HTMLButtonElement, CyberButtonProps>(
  ({ variant = 'primary', children, className, ...props }, ref) => {
    const variantStyles = {
      primary: 'bg-primary hover:bg-primary/90 text-primary-foreground cyber-glow hover:cyber-glow border-2 border-primary',
      secondary: 'bg-secondary hover:bg-secondary/90 text-secondary-foreground border-2 border-primary/50 hover:border-primary',
      danger: 'bg-destructive hover:bg-destructive/90 text-destructive-foreground alert-glow border-2 border-destructive',
    };

    return (
      <Button
        ref={ref}
        className={cn(
          'font-orbitron font-bold uppercase tracking-wider transition-all duration-300 transform hover:scale-105',
          variantStyles[variant],
          className
        )}
        {...props}
      >
        {children}
      </Button>
    );
  }
);

CyberButton.displayName = 'CyberButton';

export default CyberButton;
