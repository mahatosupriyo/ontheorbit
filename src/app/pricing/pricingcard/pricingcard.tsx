"use client"

import type React from "react"

import { Check } from "lucide-react"
import { useRef, useState } from "react"
import styles from "./pricingcard.module.scss"

interface PlanProps {
  id: number
  name: string
  tier: string
  price: number
  features: string[]
  cta: string
  popular: boolean
}

// Interface if the types in the pricing card

interface PricingCardProps {
  plan: PlanProps
  isHovered: boolean
  onMouseEnter: () => void
  onMouseLeave: () => void
}

// on mouse enter and exit animations

export default function PricingCard({ plan, isHovered, onMouseEnter, onMouseLeave }: PricingCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return

    const rect = cardRef.current.getBoundingClientRect()
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  // Handling the function in the mouse enter and exit

  return (
    <div
      ref={cardRef}
      className={`${styles.card} ${isHovered ? styles.hovered : ""} ${plan.popular ? styles.popular : ""}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onMouseMove={handleMouseMove}
      style={
        {
          "--mouse-x": `${mousePosition.x}px`,
          "--mouse-y": `${mousePosition.y}px`,
        } as React.CSSProperties
      }
    >
      <div className={styles.cardBorder}></div>
      <div className={styles.cardContent}>
        {/* pricing badge */}
        {plan.popular && <div className={styles.popularBadge}>Most Popular</div>}

        <div className={styles.header}>
          {/* pricing header component */}
          <h3 className={styles.tier}>{plan.tier}</h3>
          <h2 className={styles.name}>{plan.name}</h2>
        </div>

        <div className={styles.pricing}>

          {/* pricing currency */}
          <span className={styles.currency}>₹</span>
          <span className={styles.amount}>{plan.price}</span>
        </div>

        <ul className={styles.features}>
          {/* plan features */}
          {plan.features.map((feature, index) => (
            <li key={index} className={styles.feature}>
              <Check className={styles.checkIcon} size={18} />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <button className={styles.ctaButton}>{plan.cta}</button>
      </div>
    </div>
  )
}
