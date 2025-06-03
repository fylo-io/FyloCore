"use client";
import { cn } from "@/lib/utils";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import * as React from "react";

const TooltipProvider = TooltipPrimitive.Provider;
const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 0, ...props }, ref) => (
  <TooltipPrimitive.Portal container={document.body}>
    <TooltipPrimitive.Content
      arrowPadding={5}
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        //* Base styles: layout and appearance
        "bg-[#1E1E1E] rounded-[5px] px-2 py-1 text-xs font-normal text-white z-50 overflow-hidden",
        //* Animation states: enter and exit
        // "animate-in fade-in-0 zoom-in-95",
        // "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
        // //* Slide-in by side
        // "data-[side=bottom]:slide-in-from-top-2",
        // "data-[side=top]:slide-in-from-bottom-2",
        // "data-[side=left]:slide-in-from-right-2",
        // "data-[side=right]:slide-in-from-left-2",
        // "data-[state=closed]:animate-out",
        // "data-[state=closed]:fade-out-0",
        // "data-[state=closed]:zoom-out-95",
        // opsiyonel: kapanışta yana kaydırma
        // "data-[state=closed][data-side=bottom]:slide-out-to-top-2",
        // "data-[state=closed][data-side=top]:slide-out-to-bottom-2",

        className
      )}
      {...props}
    />
  </TooltipPrimitive.Portal>
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
