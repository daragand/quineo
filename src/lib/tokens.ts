/**
 * Design tokens Quinova — valeurs JS pour les contextes où
 * les classes Tailwind ne suffisent pas (SVG fills, canvas, styles inline dynamiques).
 */

export const colors = {
  navy:         '#0D1E2C',
  navyLight:    '#1A3045',
  navyMid:      '#243858',

  bg:           '#F4FAFD',
  card:         '#ffffff',

  amber:        '#FFD84D',
  amberDark:    '#5C3A00',
  amberBg:      '#FFF7D6',

  qblue:        '#4A90B8',
  qblueBg:      '#E5F3FA',
  qblueText:    '#2F72A0',

  qgreen:       '#0F6E56',
  qgreenBg:     '#D8F6F1',
  qgreenText:   '#0A4D3B',
  qgreenLive:   '#2BBFA4',

  qred:         '#A32D2D',
  qredBg:       '#FCEBEB',

  orange:       '#B84000',
  orangeBg:     '#FFF0EA',

  purple:       '#534AB7',
  purpleBg:     '#EEEDFE',

  textPrimary:   '#0D1E2C',
  textSecondary: '#4A6880',
  textMuted:     '#9AB5C8',
  textHint:      '#C8DFF0',
} as const

export const layout = {
  sidebarWidth: 180,
  topbarHeight: 49,
} as const

export const radius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 14,
} as const
