import React from 'react';
import { NavLink as RouterNavLink, NavLinkProps } from 'react-router-dom';
import { cn } from '@/lib/utils';

/**
 * Enhanced NavLink component that applies active styles automatically
 * Use this for navigation links to get consistent active state styling
 */
export const NavLink: React.FC<NavLinkProps & { className?: string }> = ({ 
  className,
  children,
  ...props 
}) => {
  return (
    <RouterNavLink
      {...props}
      className={({ isActive }) =>
        cn(
          'transition-colors',
          isActive 
            ? 'bg-muted text-primary font-medium' 
            : 'hover:bg-muted/50',
          className
        )
      }
    >
      {children}
    </RouterNavLink>
  );
};
