import { ArrowRight, Shield } from 'lucide-react'

export function BKScreen({ children, className = '' }) {
  return <main className={`screen ${className}`}>{children}</main>
}

export function BKCard({ children, className = '' }) {
  return <section className={`bk-card ${className}`}>{children}</section>
}

export function BKButton({ children, variant = 'primary', icon: Icon, className = '', ...props }) {
  const ComponentIcon = Icon || (variant === 'primary' ? ArrowRight : null)
  return (
    <button className={`btn-${variant} ${className}`} {...props}>
      <span>{children}</span>
      {ComponentIcon && <ComponentIcon size={18} strokeWidth={2.4} aria-hidden="true" />}
    </button>
  )
}

export function BKBadge({ children, tone = 'green', className = '' }) {
  return <span className={`bk-badge bk-badge-${tone} ${className}`}>{children}</span>
}

export function BKStat({ label, value, detail, className = '' }) {
  return (
    <div className={`bk-stat ${className}`}>
      <span className="bk-stat-label">{label}</span>
      <strong className="bk-stat-value">{value}</strong>
      {detail && <span className="bk-stat-detail">{detail}</span>}
    </div>
  )
}

export function BKBrand({ compact = false }) {
  return (
    <div className={`bk-brand${compact ? ' compact' : ''}`}>
      <span className="bk-mark"><Shield size={compact ? 17 : 23} fill="currentColor" /></span>
      <span>Ball<span>Knowledge</span></span>
    </div>
  )
}
