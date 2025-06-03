import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

const inputVariants = cva(
  "block w-full rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-300 ease-in-out",
  {
    variants: {
      variant: {
        default: "bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-400"
      },
      sizeVariant: {
        default: "px-3 py-2",
        large: "px-4 py-3 text-base"
      }
    },
    defaultVariants: {
      variant: "default",
      sizeVariant: "default"
    }
  }
);

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, sizeVariant, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(inputVariants({ variant, sizeVariant }), className)}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input, inputVariants };
