"use client"

import React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, Loader2, ArrowRightLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { translateText } from "@/lib/translation-service"
import type { Message, Role, ThemeColors } from "@/types/chat"

export function TranslationChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [role, setRole] = useState<Role>("patient")

  const chatRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    setIsTyping(true)

    // Add message immediately
    const messageId = Date.now().toString()
    setMessages((prev) => [
      ...prev,
      {
        id: messageId,
        sender: role,
        originalText: input,
        translatedText: "",
        timestamp: new Date(),
      },
    ])

    try {
      // Get translation
      const targetLanguage = role === "patient" ? "English" : "Dagbani"
      const translatedText = await translateText(input, targetLanguage)

      // Update message with translation
      setMessages((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, translatedText } : msg)))
    } catch (error) {
      console.error("Translation error:", error)
      // Handle error - maybe show an error message to the user
    } finally {
      setInput("")
      setIsTyping(false)
    }
  }

  const toggleRole = () => {
    setRole((prev) => (prev === "patient" ? "doctor" : "patient"))
  }

  // Get theme colors based on current role
  const themeColors = getThemeColors(role)

  return (
    <Card className="mx-auto flex w-full max-w-2xl flex-col overflow-hidden border-0 bg-white shadow-xl">
      <ChatHeader role={role} themeColors={themeColors} toggleRole={toggleRole} />

      <ChatMessages ref={chatRef} messages={messages} role={role} themeColors={themeColors} isTyping={isTyping} />

      <ChatInput
        input={input}
        setInput={setInput}
        handleSubmit={handleSubmit}
        role={role}
        themeColors={themeColors}
        isTyping={isTyping}
      />
    </Card>
  )
}

// Chat Header Component
interface ChatHeaderProps {
  role: Role
  themeColors: ThemeColors
  toggleRole: () => void
}

function ChatHeader({ role, themeColors, toggleRole }: ChatHeaderProps) {
  return (
    <div className={`flex items-center justify-between border-b bg-gradient-to-r ${themeColors.gradient} p-4`}>
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src="/placeholder.svg?height=40&width=40" alt={role === "patient" ? "Patient" : "Doctor"} />
          <AvatarFallback className={`${themeColors.avatarBg} ${themeColors.avatarText}`}>
            {role === "patient" ? "P" : "D"}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-semibold text-white">{role === "patient" ? "Patient" : "Doctor"}</h2>
          <p className={`text-xs ${themeColors.headerText}`}>{role === "patient" ? "Dagbani" : "English"}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Label htmlFor="role-switch" className="hidden text-xs font-medium text-white sm:block">
          {role === "patient" ? "Switch to Doctor" : "Switch to Patient"}
        </Label>
        <Switch
          id="role-switch"
          checked={role === "doctor"}
          onCheckedChange={toggleRole}
          className="data-[state=checked]:bg-white/20 data-[state=unchecked]:bg-white/20"
        />
      </div>
    </div>
  )
}

// Chat Messages Component
interface ChatMessagesProps {
  messages: Message[]
  role: Role
  themeColors: ThemeColors
  isTyping: boolean
}

const ChatMessages = React.forwardRef<HTMLDivElement, ChatMessagesProps>(
  ({ messages, role, themeColors, isTyping }, ref) => {
    return (
      <div ref={ref} className="flex-1 overflow-y-auto p-4" style={{ minHeight: "60vh", maxHeight: "60vh" }}>
        {messages.length === 0 ? (
          <EmptyState role={role} themeColors={themeColors} />
        ) : (
          <div className="space-y-4">
            {messages.map((message) => {
              // Determine if this message is from the current user or the other party
              const isCurrentUser = message.sender === role

              // For the current user, show their original message
              // For the other party, show the translated message
              const textToShow = isCurrentUser ? message.originalText : message.translatedText

              // Don't show messages that don't have translations yet (except current user's latest message)
              if (!isCurrentUser && !message.translatedText) return null

              return (
                <div
                  key={message.id}
                  className={cn(
                    "flex max-w-[85%] flex-col rounded-2xl p-3 overflow-hidden",
                    isCurrentUser
                      ? `ml-auto bg-gradient-to-r ${themeColors.messageBg} text-white`
                      : "bg-gray-100 text-gray-800",
                  )}
                >
                  <p className="mb-1 break-words overflow-wrap-anywhere">{textToShow}</p>
                  <div className="mt-1 text-right">
                    <span className="text-xs opacity-70">{formatTime(message.timestamp)}</span>
                  </div>
                </div>
              )
            })}
            {isTyping && (
              <div className="flex max-w-[85%] items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm text-gray-500">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Translating...</span>
              </div>
            )}
          </div>
        )}
      </div>
    )
  },
)
ChatMessages.displayName = "ChatMessages"

// Empty State Component
function EmptyState({ role, themeColors }: { role: Role; themeColors: ThemeColors }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
      <div className={`rounded-full bg-gradient-to-r ${themeColors.gradient} p-3 text-white`}>
        <ArrowRightLeft className="h-6 w-6" />
      </div>
      <div>
        <h3 className="text-lg font-medium text-gray-800">Start a conversation</h3>
        <p className="text-sm text-gray-500">
          {role === "patient"
            ? "Type in Dagbani to communicate with your doctor"
            : "Type in English to communicate with your patient"}
        </p>
      </div>
    </div>
  )
}

// Chat Input Component
interface ChatInputProps {
  input: string
  setInput: (input: string) => void
  handleSubmit: (e: React.FormEvent) => Promise<void>
  role: Role
  themeColors: ThemeColors
  isTyping: boolean
}

function ChatInput({ input, setInput, handleSubmit, role, themeColors, isTyping }: ChatInputProps) {
  return (
    <div className="border-t p-3">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={role === "patient" ? "Type in Dagbani..." : "Type in English..."}
          className={`min-h-[60px] flex-1 resize-none rounded-xl border-gray-200 bg-gray-50 p-3 text-sm shadow-sm focus-visible:ring-1 focus-visible:${themeColors.ringFocus}`}
        />
        <Button
          type="submit"
          size="icon"
          className={`h-auto rounded-xl bg-gradient-to-r ${themeColors.gradient} transition-all hover:${themeColors.hoverGradient}`}
          disabled={isTyping || !input.trim()}
        >
          {isTyping ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
        </Button>
      </form>
    </div>
  )
}

// Helper Functions
function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

function getThemeColors(role: Role): ThemeColors {
  return role === "patient"
    ? {
        gradient: "from-purple-600 to-indigo-600",
        hoverGradient: "from-purple-700 to-indigo-700",
        messageBg: "from-purple-500 to-indigo-500",
        ringFocus: "ring-purple-500",
        avatarBg: "bg-purple-200",
        avatarText: "text-purple-700",
        headerText: "text-purple-100",
      }
    : {
        gradient: "from-emerald-600 to-teal-600",
        hoverGradient: "from-emerald-700 to-teal-700",
        messageBg: "from-emerald-500 to-teal-500",
        ringFocus: "ring-teal-500",
        avatarBg: "bg-emerald-200",
        avatarText: "text-emerald-700",
        headerText: "text-emerald-100",
      }
}

