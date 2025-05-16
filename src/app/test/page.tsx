"use client"

import { useState } from "react"
import Desktop from "@/components/console/desktop/desktop"
import Dock from "@/components/console/dock/dock"
import { AppWindow } from "@/components/console/appwindow/appwindow"
import type { AppData, DockItem } from "@/types"
import { Terminal, Home, Layers, Settings, Folder } from "lucide-react"

export default function Page() {
  const [openApps, setOpenApps] = useState<AppData[]>([])
  const [activeAppId, setActiveAppId] = useState<string | null>(null)

  const dockItems: DockItem[] = [
    {
      id: "home",
      icon: <Home className="h-6 w-6" />,
      label: "Home",
      content: (
        <div className="flex h-full items-center justify-center">
          <h1 className="text-2xl font-bold">Welcome to OS Web</h1>
        </div>
      ),
    },
    {
      id: "terminal",
      icon: <Terminal className="h-6 w-6" />,
      label: "Terminal",
      content: (
        <div className="bg-black text-green-400 p-4 h-full font-mono">
          <p>user@os-web:~$ _</p>
        </div>
      ),
    },
    {
      id: "files",
      icon: <Folder className="h-6 w-6" />,
      label: "Files",
      content: (
        <div className="p-4">
          <h2 className="text-xl mb-4">File Explorer</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="p-3 border rounded-md flex items-center gap-2">
                <Folder className="h-5 w-5 text-gray-400" />
                <span>Folder {i + 1}</span>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: "apps",
      icon: <Layers className="h-6 w-6" />,
      label: "Apps",
      content: (
        <div className="p-4">
          <h2 className="text-xl mb-4">Applications</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="p-3 border rounded-md flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-md bg-gradient-to-br from-teal-400 to-blue-600 flex items-center justify-center">
                  <span className="text-white font-bold">{i + 1}</span>
                </div>
                <span>App {i + 1}</span>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: "settings",
      icon: <Settings className="h-6 w-6" />,
      label: "Settings",
      content: (
        <div className="p-4">
          <h2 className="text-xl mb-4">Settings</h2>
          <div className="space-y-4">
            <div className="p-3 border rounded-md">
              <h3 className="font-medium">Display</h3>
              <div className="mt-2 flex items-center gap-2">
                <span>Theme:</span>
                <select className="border rounded px-2 py-1">
                  <option>Dark</option>
                  <option>Light</option>
                  <option>System</option>
                </select>
              </div>
            </div>
            <div className="p-3 border rounded-md">
              <h3 className="font-medium">Appearance</h3>
              <div className="mt-2 flex items-center gap-2">
                <span>Dock Position:</span>
                <select className="border rounded px-2 py-1">
                  <option>Bottom</option>
                  <option>Left</option>
                  <option>Right</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ]

  const handleAppOpen = (item: DockItem) => {
    // Check if app is already open
    const existingAppIndex = openApps.findIndex((app) => app.id === item.id)

    if (existingAppIndex >= 0) {
      // If app is already open but minimized, restore it
      if (openApps[existingAppIndex].minimized) {
        setOpenApps((prev) => prev.map((app) => (app.id === item.id ? { ...app, minimized: false } : app)))
      }
      // Make it active
      setActiveAppId(item.id)
    } else {
      // Otherwise, open the app
      const newApp: AppData = {
        id: item.id,
        title: item.label,
        icon: item.icon,
        content: item.content,
        minimized: false,
      }

      setOpenApps((prev) => [...prev, newApp])
      setActiveAppId(item.id)
    }
  }

  const handleAppClose = (id: string) => {
    setOpenApps((prev) => prev.filter((app) => app.id !== id))

    // If we're closing the active app, set the last app as active
    if (activeAppId === id) {
      const remainingApps = openApps.filter((app) => app.id !== id)
      if (remainingApps.length > 0) {
        setActiveAppId(remainingApps[remainingApps.length - 1].id)
      } else {
        setActiveAppId(null)
      }
    }
  }

  const handleAppFocus = (id: string) => {
    setActiveAppId(id)
  }

  const handleAppMinimize = (id: string) => {
    setOpenApps((prev) => prev.map((app) => (app.id === id ? { ...app, minimized: true } : app)))

    // If we're minimizing the active app, set the last visible app as active
    if (activeAppId === id) {
      const visibleApps = openApps.filter((app) => app.id !== id && !app.minimized)

      if (visibleApps.length > 0) {
        setActiveAppId(visibleApps[visibleApps.length - 1].id)
      } else {
        setActiveAppId(null)
      }
    }
  }

  // Get lists of open and minimized app IDs for the dock
  const openAppIds = openApps.map((app) => app.id)
  const minimizedAppIds = openApps.filter((app) => app.minimized).map((app) => app.id)

  return (
    <Desktop>
      <div className="relative h-full w-full overflow-hidden">
        {/* App Windows */}
        <div className="absolute inset-0 p-4">
          {openApps.map((app) => (
            <AppWindow
              key={app.id}
              app={app}
              isActive={activeAppId === app.id}
              onClose={() => handleAppClose(app.id)}
              onFocus={() => handleAppFocus(app.id)}
              onMinimize={() => handleAppMinimize(app.id)}
            />
          ))}
        </div>

        {/* Dock */}
        <Dock items={dockItems} openApps={openAppIds} minimizedApps={minimizedAppIds} onItemClick={handleAppOpen} />
      </div>
    </Desktop>
  )
}
