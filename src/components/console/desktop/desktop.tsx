import type React from "react"
import styles from "./desktop.module.scss"

interface DesktopProps {
  children: React.ReactNode
}

const Desktop: React.FC<DesktopProps> = ({ children }) => {
  return <div className={styles.desktop}>{children}</div>
}

export default Desktop
