import type { ReactNode } from "react"

export interface DockItem {
  id: string
  icon: ReactNode
  label: string
  content: ReactNode
}

// Update the AppData interface to include a minimized state
export interface AppData {
  id: string
  title: string
  icon: ReactNode
  content: ReactNode
  minimized?: boolean
}
