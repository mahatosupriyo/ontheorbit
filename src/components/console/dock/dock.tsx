"use client"

import type React from "react"
import type { DockItem } from "@/types"
import styles from "./dock.module.scss"
import { cn } from "@/lib/utils"

interface DockProps {
  items: DockItem[]
  openApps: string[]
  minimizedApps: string[]
  onItemClick: (item: DockItem) => void
}

const Dock: React.FC<DockProps> = ({ items, openApps, minimizedApps, onItemClick }) => {
  return (
    <div className={styles.dockContainer}>
      <div className={styles.dock}>
        {items.map((item) => {
          const isOpen = openApps.includes(item.id)
          const isMinimized = minimizedApps.includes(item.id)

          return (
            <button
              key={item.id}
              className={cn(styles.dockItem, isOpen && styles.open, isMinimized && styles.minimized)}
              onClick={() => onItemClick(item)}
              aria-label={item.label}
            >
              <div className={styles.dockIcon}>{item.icon}</div>
              {isOpen && <div className={styles.runningIndicator} />}
              <span className={styles.dockTooltip}>{item.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default Dock
