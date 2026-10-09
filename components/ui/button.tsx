import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-[7px] whitespace-nowrap cursor-pointer no-underline font-semibold text-sm leading-tight rounded-md border border-transparent transition-[background-color,border-color,box-shadow] duration-150 disabled:opacity-45 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        primary:
          "bg-accent border-accent text-white hover:bg-accent-700 hover:border-accent-700 active:bg-accent-800",
        secondary:
          "bg-white border-neutral-300 text-text hover:bg-neutral-100 hover:border-neutral-400",
        ghost: "text-accent-700 px-2 hover:bg-accent-100 border-transparent",
        inverse:
          "bg-white border-white text-accent-900 hover:bg-accent-100 hover:border-accent-100",
        "inverse-ghost":
          "bg-transparent border-accent-500 text-white hover:bg-white/10",
      },
      size: {
        default: "px-4 py-[9px]",
        icon: "size-9 p-0",
      },
      block: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, block, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, block }), className)}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export type LinkButtonProps = React.AnchorHTMLAttributes<HTMLAnchorElement> &
  VariantProps<typeof buttonVariants>;

export const LinkButton = React.forwardRef<HTMLAnchorElement, LinkButtonProps>(
  ({ className, variant, size, block, ...props }, ref) => {
    return (
      <a
        ref={ref}
        className={cn(buttonVariants({ variant, size, block }), className)}
        {...props}
      />
    );
  },
);
LinkButton.displayName = "LinkButton";

export { buttonVariants };
