import { HTMLAttributes, ReactNode, forwardRef } from 'react';

/**
 * Card component props
 */
export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Card content
   */
  children: ReactNode;
  /**
   * Add hover effect
   * @default false
   */
  hover?: boolean;
  /**
   * Add border
   * @default true
   */
  bordered?: boolean;
}

/**
 * Card Header props
 */
export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

/**
 * Card Body props
 */
export interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

/**
 * Card Footer props
 */
export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

/**
 * Card component - Container for content with optional sections
 *
 * @component
 * @example
 * ```tsx
 * <Card>
 *   <CardHeader>
 *     <h3>Card Title</h3>
 *   </CardHeader>
 *   <CardBody>
 *     <p>Card content goes here</p>
 *   </CardBody>
 *   <CardFooter>
 *     <Button>Action</Button>
 *   </CardFooter>
 * </Card>
 * ```
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, hover = false, bordered = true, className = '', ...props }, ref) => {
    const baseStyles =
      'rounded-lg bg-white dark:bg-gray-900 shadow-sm transition-shadow';
    const borderStyles = bordered
      ? 'border border-gray-200 dark:border-gray-800'
      : '';
    const hoverStyles = hover
      ? 'hover:shadow-md cursor-pointer'
      : '';

    const classes = [baseStyles, borderStyles, hoverStyles, className]
      .filter(Boolean)
      .join(' ');

    return (
      <div ref={ref} className={classes} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

/**
 * Card Header - Optional header section for cards
 *
 * @component
 */
export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ children, className = '', ...props }, ref) => {
    const classes = [
      'px-6 py-4 border-b border-gray-200 dark:border-gray-800',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div ref={ref} className={classes} {...props}>
        {children}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

/**
 * Card Body - Main content section for cards
 *
 * @component
 */
export const CardBody = forwardRef<HTMLDivElement, CardBodyProps>(
  ({ children, className = '', ...props }, ref) => {
    const classes = ['px-6 py-4', className].filter(Boolean).join(' ');

    return (
      <div ref={ref} className={classes} {...props}>
        {children}
      </div>
    );
  }
);

CardBody.displayName = 'CardBody';

/**
 * Card Footer - Optional footer section for cards
 *
 * @component
 */
export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ children, className = '', ...props }, ref) => {
    const classes = [
      'px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 rounded-b-lg',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div ref={ref} className={classes} {...props}>
        {children}
      </div>
    );
  }
);

CardFooter.displayName = 'CardFooter';

export default Card;
