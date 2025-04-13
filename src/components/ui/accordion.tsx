"use client";

import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDownIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import Spinner from "../spinner";

function Accordion({
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />;
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("border-b last:border-b-0", className)}
      {...props}
    />
  );
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  const [prevDisabled, setPrevDisabled] = useState(props.disabled);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    // If disabled state changed
    if (prevDisabled !== props.disabled) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        setPrevDisabled(props.disabled);
      }, 300); // Match this to the duration in CSS

      return () => clearTimeout(timer);
    }
  }, [props.disabled, prevDisabled]);

  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium transition-all outline-none focus-visible:ring-[3px] [&[data-state=open]>svg]:rotate-180",
          className
        )}
        {...props}
      >
        {children}
        <div className="my-auto text-primary pointer-events-none size-5 shrink-0 translate-y-0.5 -translate-x-5 transition-transform duration-200 relative flex items-center justify-center">
          <div className={`absolute inset-0 transition-all duration-300 ease-in-out flex items-center justify-center ${(props.disabled || isTransitioning) ?
              (prevDisabled ? 'opacity-100 scale-100' : 'opacity-0 scale-0') :
              'opacity-0 scale-0'
            }`}>
            <Spinner className="ml-0.5" />
          </div>

          <div className={`transition-all duration-300 ease-in-out flex items-center justify-center ${(!props.disabled || isTransitioning) ?
              (!prevDisabled ? 'opacity-100 scale-100' : 'opacity-0 scale-0') :
              'opacity-0 scale-0'
            }`}>
            <ChevronDownIcon />
          </div>
        </div>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="translate-x-2 data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm"
      {...props}
    >
      <div className={cn("pt-0 pb-4", className)}>{children}</div>
    </AccordionPrimitive.Content>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
