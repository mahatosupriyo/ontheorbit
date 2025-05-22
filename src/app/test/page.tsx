"use client"

import Overlay from "@/components/overlay/overlay"
import { Info, Maximize, Menu } from "lucide-react"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 gap-8">
      <h1 className="text-3xl font-bold mb-4">Overlay Component Demo</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        <div className="flex flex-col items-center gap-4 p-6 border rounded-lg">
          <h2 className="text-xl font-semibold">Basic Usage</h2>
          <p className="text-gray-600 mb-4 text-center">Simple overlay with default button</p>

          <Overlay>
            <div className="p-4">
              <p>This overlay uses the default button and styling.</p>
              <p className="mt-4">Click outside or the X to close.</p>
            </div>
          </Overlay>
        </div>

        <div className="flex flex-col items-center gap-4 p-6 border rounded-lg">
          <h2 className="text-xl font-semibold">Custom Button</h2>
          <p className="text-gray-600 mb-4 text-center">Overlay with custom button text and icon</p>

          <Overlay
            buttonText="Open Info"
            buttonIcon={<Info size={18} />}
            buttonClassName="bg-purple-600 hover:bg-purple-700"
          >
            <div className="p-4">
              <p>This overlay has a custom button with an icon.</p>
              <p className="mt-4">The button styling is also customized.</p>
            </div>
          </Overlay>
        </div>

        <div className="flex flex-col items-center gap-4 p-6 border rounded-lg">
          <h2 className="text-xl font-semibold">Full Screen Desktop</h2>
          <p className="text-gray-600 mb-4 text-center">Overlay that's full screen on all devices</p>

          <Overlay
            fullScreenOnDesktop={true}
            buttonText="Open Full Screen"
            buttonIcon={<Maximize size={18} />}
            buttonClassName="bg-green-600 hover:bg-green-700"
          >
            <div className="p-4">
              <p>This overlay is full screen on both mobile and desktop.</p>
              <p className="mt-4">It's useful for immersive content or complex forms.</p>
            </div>
          </Overlay>
        </div>

        <div className="flex flex-col items-center gap-4 p-6 border rounded-lg">
          <h2 className="text-xl font-semibold">Mobile Menu Example</h2>
          <p className="text-gray-600 mb-4 text-center">Typical mobile menu implementation</p>

          <Overlay
            buttonText="Menu"
            buttonIcon={<Menu size={18} />}
            buttonClassName="bg-gray-800 hover:bg-gray-900"
          >
            <div className="p-4">
              <ul className="space-y-4">
                <li className="p-2 border-b">Home</li>
                <li className="p-2 border-b">About</li>
                <li className="p-2 border-b">Services</li>
                <li className="p-2 border-b">Portfolio</li>
                <li className="p-2">Contact</li>
              </ul>
            </div>
          </Overlay>
        </div>
      </div>
    </main>
  )
}
