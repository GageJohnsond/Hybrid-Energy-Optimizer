"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

const SECTIONS = [
  { id: "key-takeaways", label: "Key Takeaways" },
  { id: "current-vs-optimized", label: "Current vs Optimized" },
  { id: "source-breakdown", label: "Source Breakdown" },
  { id: "regional-context", label: "Regional Context" },
  { id: "what-this-means", label: "What This Means" },
  { id: "methodology", label: "Methodology" },
]

export function ScrollspyNavigation() {
  const [activeSection, setActiveSection] = useState("")

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      {
        rootMargin: "-20% 0px -80% 0px",
        threshold: 0.1,
      },
    )

    SECTIONS.forEach(({ id }) => {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  return (
    <nav className="hidden lg:block fixed left-8 top-1/2 -translate-y-1/2 z-50">
      <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg p-4 shadow-lg max-w-xs">
        <div className="text-xs font-medium text-muted-foreground mb-3 px-3">Contents</div>
        <ul className="space-y-1">
          {SECTIONS.map(({ id, label }) => (
            <li key={id}>
              <button
                onClick={() => scrollToSection(id)}
                className={cn(
                  "block w-full text-left px-3 py-2 text-sm rounded-md transition-all duration-200",
                  "hover:bg-muted/50 hover:text-foreground",
                  activeSection === id
                    ? "bg-primary text-primary-foreground font-medium shadow-sm"
                    : "text-muted-foreground",
                )}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
