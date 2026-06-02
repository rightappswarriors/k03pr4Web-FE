"use client";

import * as React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";

function Separator({
  className,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      className={`h-px w-full bg-gray-200 ${className}`}
      {...props}
    />
  );
}

export { Separator };