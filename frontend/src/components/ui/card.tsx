import * as React from "react";

import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  shadcn-style Card family                                           */
/*  Card, CardHeader, CardTitle, CardDescription, CardContent,         */
/*  CardFooter, CardAction                                             */
/* ------------------------------------------------------------------ */

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    /** Back-compat with the legacy Card API used across the dashboard. */
    padded?: boolean;
    hoverable?: boolean;
    as?: "div" | "section" | "article";
  }
>(
  (
    {
      className,
      padded = true,
      hoverable = false,
      as = "div",
      children,
      ...props
    },
    ref
  ) => {
    const Comp = as as keyof JSX.IntrinsicElements;
    return React.createElement(
      Comp,
      {
        ref,
        className: cn(
          "rounded-xl border border-border bg-card/80 text-card-foreground shadow-card",
          padded && "p-5",
          hoverable &&
            "transition-colors hover:border-border-strong hover:bg-surface-elevated",
          className
        ),
        ...props
      },
      children
    );
  }
);
Card.displayName = "Card";

/**
 * Back-compat `CardHeader` with `title`/`description`/`action` props.
 * When used with children (shadcn-style), it just lays out the children in a
 * flex column. When used with props (legacy), it renders a titled header.
 */
const CardHeader = React.forwardRef<
  HTMLDivElement,
  Omit<React.HTMLAttributes<HTMLDivElement>, "title"> & {
    title?: React.ReactNode;
    description?: React.ReactNode;
    action?: React.ReactNode;
  }
>(({ className, title, description, action, children, ...props }, ref) => {
  if (title !== undefined || description !== undefined || action !== undefined) {
    return (
      <div
        ref={ref}
        className={cn(
          "mb-4 flex items-start justify-between gap-3",
          className
        )}
        {...props}
      >
        <div>
          {title ? (
            <h3 className="text-sm font-semibold leading-none tracking-tight text-foreground">
              {title}
            </h3>
          ) : null}
          {description ? (
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    );
  }
  return (
    <div
      ref={ref}
      className={cn("flex flex-col gap-1.5 p-6", className)}
      {...props}
    >
      {children}
    </div>
  );
});
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-sm font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-xs text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardAction = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
      className
    )}
    {...props}
  />
));
CardAction.displayName = "CardAction";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("px-6 pb-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center px-6 pb-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction
};
