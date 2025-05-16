"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { X, Minus, Square } from "lucide-react"
import type { AppData } from "@/types"
import styles from "./appwindow.module.scss"
import { cn } from "@/lib/utils"

interface AppWindowProps {
  app: AppData
  isActive: boolean
  onClose: () => void
  onFocus: () => void
  onMinimize: () => void
}

export const AppWindow: React.FC<AppWindowProps> = ({ app, isActive, onClose, onFocus, onMinimize }) => {
  const [position, setPosition] = useState({ x: 50, y: 50 })
  const [size, setSize] = useState({ width: 800, height: 500 })
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [isMaximized, setIsMaximized] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0 })
  const [initialSize, setInitialSize] = useState({ width: 0, height: 0 })
  const [preMaximizeState, setPreMaximizeState] = useState({
    position: { x: 0, y: 0 },
    size: { width: 0, height: 0 },
  })

  const windowRef = useRef<HTMLDivElement>(null)

  // Handle window dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && !isMaximized) {
        const newX = e.clientX - dragOffset.x
        const newY = e.clientY - dragOffset.y
        setPosition({ x: newX, y: newY })
      }

      if (isResizing && !isMaximized) {
        const newWidth = initialSize.width + (e.clientX - resizeStart.x)
        const newHeight = initialSize.height + (e.clientY - resizeStart.y)
        setSize({
          width: Math.max(300, newWidth),
          height: Math.max(200, newHeight),
        })
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      setIsResizing(false)
    }

    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, isResizing, dragOffset, resizeStart, initialSize, isMaximized])

  const handleTitleBarMouseDown = (e: React.MouseEvent) => {
    if (isMaximized) return

    // Prevent dragging when clicking on window controls
    if ((e.target as HTMLElement).closest(`.${styles.windowControls}`)) {
      return
    }

    setIsDragging(true)
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    })
  }

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsResizing(true)
    setResizeStart({ x: e.clientX, y: e.clientY })
    setInitialSize({ width: size.width, height: size.height })
  }

  const handleMaximize = () => {
    if (!isMaximized) {
      // Save current state before maximizing
      setPreMaximizeState({
        position: { ...position },
        size: { ...size },
      })

      setIsMaximized(true)
    } else {
      // Restore previous state
      setPosition(preMaximizeState.position)
      setSize(preMaximizeState.size)
      setIsMaximized(false)
    }
  }

  const handleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation()
    onMinimize()
  }

  const windowStyle = isMaximized
    ? { top: 0, left: 0, width: "100%", height: "100%", borderRadius: 0 }
    : {
        top: `${position.y}px`,
        left: `${position.x}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
      }

  // Don't render if minimized
  if (app.minimized) {
    return null
  }

  return (
    <div
      ref={windowRef}
      className={cn(styles.appWindow, isActive && styles.active, isMaximized && styles.maximized)}
      style={windowStyle}
      onClick={onFocus}
    >
      <div className={styles.titleBar} onMouseDown={handleTitleBarMouseDown} onDoubleClick={handleMaximize}>
        <div className={styles.appInfo}>
          <div className={styles.appIcon}>{app.icon}</div>
          <div className={styles.appTitle}>{app.title}</div>
        </div>

        <div className={styles.windowControls}>
          <button
            className={cn(styles.windowControl, styles.minimizeButton)}
            onClick={handleMinimize}
            aria-label="Minimize"
          >
            <Minus size={14} />
          </button>
          <button
            className={cn(styles.windowControl, styles.maximizeButton)}
            onClick={handleMaximize}
            aria-label="Maximize"
          >
            <Square size={14} />
          </button>
          <button className={cn(styles.windowControl, styles.closeButton)} onClick={onClose} aria-label="Close">
            <X size={14} />
          </button>
        </div>
      </div>

      <div className={styles.appContent}>{app.content}</div>

      {!isMaximized && <div className={styles.resizeHandle} onMouseDown={handleResizeMouseDown} />}
    </div>
  )
}
