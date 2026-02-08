import { forwardRef } from 'react';
import { NavLink as RouterNavLink } from 'react-router-dom';



const NavLink = forwardRef(
  (
    {
      className,
      activeClassName,
      pendingClassName,
      ...props
    },
    ref
  ) => {
    return (
      <RouterNavLink
        ref={ref}
        className={({ isActive, isPending }) =>
          cn(
            className,
            isActive && activeClassName,
            isPending && pendingClassName
          )
        }
        {...props}
      />
    );
  }
);

NavLink.displayName = 'NavLink';

export { NavLink };