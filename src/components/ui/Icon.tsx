import { type ComponentType, type SVGProps } from 'react'

type HeroIconComponent = ComponentType<SVGProps<SVGSVGElement> & { title?: string }>

interface IconProps {
  icon: HeroIconComponent
  size?: number
  className?: string
  /** aria-label pour les icônes interactives seules (sans texte adjacent) */
  label?: string
  /** true = aria-hidden, à utiliser quand un texte adjacent décrit l'action */
  decorative?: boolean
}

export function Icon({
  icon: IconComponent,
  size = 16,
  className = '',
  label,
  decorative = false,
}: IconProps) {
  return (
    <IconComponent
      style={{ width: size, height: size, flexShrink: 0 }}
      className={className}
      aria-hidden={decorative ? 'true' : undefined}
      aria-label={!decorative ? label : undefined}
      role={!decorative ? 'img' : undefined}
    />
  )
}
