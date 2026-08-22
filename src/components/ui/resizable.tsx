"use client"

import * as React from "react"
import { GripVerticalIcon } from "lucide-react"
import * as ResizablePrimitive from "react-resizable-panels"

import { cn } from "@/lib/utils"

function ResizablePanelGroup({
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelGroup>) {
  return (
    <ResizablePrimitive.PanelGroup
      data-slot="resizable-panel-group"
      className={cn(
        "flex h-full w-full data-[panel-group-direction=vertical]:flex-col",
        className
      )}
      {...props}
    />
  )
}

function ResizablePanel({
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.Panel>) {
  return <ResizablePrimitive.Panel data-slot="resizable-panel" {...props} />
}

function ResizableHandle({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> & {
  withHandle?: boolean
}) {
  return (
    <ResizablePrimitive.PanelResizeHandle
      data-slot="resizable-handle"
      className={cn(
        "relative flex items-center justify-center select-none transition-colors data-[panel-group-direction=horizontal]:w-2 data-[panel-group-direction=vertical]:h-2 data-[panel-group-direction=vertical]:w-full cursor-row-resize data-[panel-group-direction=horizontal]:cursor-col-resize group",
        className
      )}
      {...props}
    >
      {/* Subtle LeetCode-style drag pill */}
      <div className="rounded-full bg-neutral-300/70 dark:bg-neutral-700/70 group-hover:bg-neutral-400 dark:group-hover:bg-neutral-500 transition-colors data-[panel-group-direction=vertical]:w-7 data-[panel-group-direction=vertical]:h-1 data-[panel-group-direction=horizontal]:w-1 data-[panel-group-direction=horizontal]:h-7" />
    </ResizablePrimitive.PanelResizeHandle>
  )
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
