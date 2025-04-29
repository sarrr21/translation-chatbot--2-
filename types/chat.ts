export type Role = "patient" | "doctor"

export interface Message {
  id: string
  sender: Role
  originalText: string
  translatedText: string
  timestamp: Date
}

export interface ThemeColors {
  gradient: string
  hoverGradient: string
  messageBg: string
  ringFocus: string
  avatarBg: string
  avatarText: string
  headerText: string
}

