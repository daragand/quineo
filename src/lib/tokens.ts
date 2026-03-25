/**
 * Design tokens Quineo — valeurs JS pour les contextes où
 * les classes Tailwind ne suffisent pas (SVG fills, canvas, styles inline dynamiques).
 */

export const colors = {
  navy:         '#0b1220',
  navyLight:    '#111c31',
  navyMid:      '#1a2e4a',

  bg:           '#f4f5f9',
  card:         '#ffffff',

  amber:        '#EF9F27',
  amberDark:    '#2C1500',
  amberBg:      '#FFF8EE',

  qblue:        '#185FA5',
  qblueBg:      '#EEF4FC',
  qblueText:    '#0C447C',

  qgreen:       '#3B6D11',
  qgreenBg:     '#EAF3DE',
  qgreenText:   '#27500A',
  qgreenLive:   '#48BB78',

  qred:         '#A32D2D',
  qredBg:       '#FCEBEB',

  orange:       '#854F0B',
  orangeBg:     '#FAEEDA',

  purple:       '#534AB7',
  purpleBg:     '#EEEDFE',

  textPrimary:   '#0b1220',
  textSecondary: '#4a5568',
  textMuted:     '#8a95a3',
  textHint:      '#b0bcc8',
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
