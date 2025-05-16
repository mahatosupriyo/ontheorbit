"use client"

import { useState } from "react"
import PricingCard from "../pricingcard/pricingcard"
import styles from "./pricingsection.module.scss"

export default function PricingSection() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  const plans = [
    {
      id: 1,
      name: "Orbit Base",
      tier: "Free Plan",
      price: 0,
      features: [
        "Access to selected introductory video lessons",
        "A digital version of one magazine issue",
        "Weekly design updates",
      ],
      cta: "Get Started",
      popular: false,
    },
    {
      id: 2,
      name: "Orbit Studio",
      tier: "Premium Plan",
      price: 4499,
      features: [
        "All free features + full video course access",
        "Monthly digital magazines",
        "Feedback from senior designers (monthly)",
        "Access to the Design Toolkit (fonts, grids, color palettes)",
        "Guided missions with portfolio-building checkpoints",
      ],
      cta: "Upgrade Now",
      popular: true,
    },
    {
      id: 3,
      name: "Orbit Elite",
      tier: "Exclusive Plan",
      price: 6499,
      features: [
        "All Premium features",
        "Physical kit (magazine, design prompts, sketch cards)",
        "1:1 monthly live mentorship or group calls",
        "Exclusive real-world design briefs (from brands/startups)",
        "Early access to new tools",
        "Portfolio & career review service",
      ],
      cta: "Join Elite",
      popular: false,
    },
  ]

  return (
    <div className={styles.pricingContainer}>
      {plans.map((plan) => (
        <PricingCard
          key={plan.id}
          plan={plan}
          isHovered={hoveredCard === plan.id}
          onMouseEnter={() => setHoveredCard(plan.id)}
          onMouseLeave={() => setHoveredCard(null)}
        />
      ))}
    </div>
  )
}
