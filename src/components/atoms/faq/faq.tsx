"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from 'lucide-react'
import styles from "./faq.module.scss"

interface FAQItemProps {
  question: string
  answer: string
}

const FAQItem = ({ question, answer }: FAQItemProps) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={styles.faqItem}>
      <button
        className={`${styles.question} ${isOpen ? styles.open : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span>{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className={styles.icon}
        >
          <ChevronDown />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={styles.answer}
          >
            <div className={styles.answerContent}>{answer}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function FAQ() {
  const faqs = [
    {
      question: "What is Next.js?",
      answer:
        "Next.js is a React framework that enables features such as server-side rendering and static site generation. It's designed to help you build high-performance web applications with the best developer experience.",
    },
    {
      question: "How do I get started with Next.js?",
      answer:
        "You can get started with Next.js by using create-next-app. Simply run 'npx create-next-app@latest' in your terminal and follow the prompts to create a new Next.js project.",
    },
    {
      question: "What is Server Side Rendering (SSR)?",
      answer:
        "Server Side Rendering is the process of rendering web pages on the server instead of in the browser. This can improve performance and SEO by sending fully rendered HTML to the client.",
    },
    {
      question: "What are the key features of Next.js?",
      answer:
        "Next.js includes features like the App Router, Server Components, server-side rendering, static site generation, API routes, and built-in optimizations for images, fonts, and more.",
    },
  ]

  return (
    <div className={styles.faqContainer}>
      <h2 className={styles.title}>Frequently Asked Questions</h2>
      <div className={styles.faqList}>
        {faqs.map((faq, index) => (
          <FAQItem key={index} question={faq.question} answer={faq.answer} />
        ))}
      </div>
    </div>
  )
}
