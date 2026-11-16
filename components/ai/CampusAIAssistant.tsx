'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  RotateCcw,
  Maximize2,
  Minimize2,
  Loader2,
} from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

interface ReportData {
  title: string
  description: string
  category: string
  building: string
  room_location: string
  urgency: string
}

const QUICK_PROMPTS = [
  'Report an AC leak in Science Complex Room 204',
  'Is Wi-Fi reported down in Central Library?',
  'How do upvotes help prioritize repairs?',
  'Who handles broken desks and chairs?',
]

export function CampusAIAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Track submission state for report cards
  const [submittingReport, setSubmittingReport] = useState<string | null>(null)
  const [submittedReports, setSubmittedReports] = useState<Record<string, { id: string; title: string }>>({})
  const [authError, setAuthError] = useState(false)

  // Auto scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen, isLoading])

  async function sendMessage(textToSend?: string) {
    const text = textToSend || input
    if (!text.trim() || isLoading) return

    setErrorMessage(null)
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text.trim(),
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages }),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || `Server responded with status ${res.status}`)
      }

      if (!res.body) throw new Error('No response stream received')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let assistantContent = ''
      const assistantMessageId = `assistant-${Date.now()}`

      // Create empty assistant message
      setMessages((prev) => [
        ...prev,
        { id: assistantMessageId, role: 'assistant', content: '' },
      ])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        assistantContent += chunk

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, content: assistantContent }
              : msg
          )
        )
      }
    } catch (err: any) {
      setErrorMessage(
        err.message?.includes('API key')
          ? 'Gemini API key is not configured. Please add GOOGLE_GENERATIVE_AI_API_KEY to your environment.'
          : err.message || 'Something went wrong. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault()
    sendMessage()
  }

  function handleQuickPrompt(promptText: string) {
    sendMessage(promptText)
  }

  function handleReset() {
    setMessages([])
    setErrorMessage(null)
    setAuthError(false)
  }

  async function handleConfirmSubmit(report: ReportData, cardKey: string) {
    setSubmittingReport(cardKey)
    setAuthError(false)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setAuthError(true)
        setSubmittingReport(null)
        return
      }

      const { data: newIssue, error: insertError } = await supabase
        .from('issues')
        .insert({
          created_by: user.id,
          title: report.title,
          description: report.description,
          category: report.category,
          building: report.building,
          room_location: report.room_location,
          urgency: report.urgency,
          status: 'Open',
        })
        .select('id, title')
        .single()

      if (insertError) {
        throw insertError
      }

      // Record audit update
      await supabase.from('issue_updates').insert({
        issue_id: newIssue.id,
        author_id: user.id,
        update_type: 'created',
        message: 'Issue reported conversationally via CampusFix AI Assistant',
      })

      setSubmittedReports((prev) => ({
        ...prev,
        [cardKey]: { id: newIssue.id, title: newIssue.title },
      }))
    } catch (err: any) {
      alert(`Could not submit issue: ${err.message || 'Unknown error'}`)
    } finally {
      setSubmittingReport(null)
    }
  }

  // Parse ```campusfix-report ... ``` blocks
  function renderMessageContent(content: string, msgId: string) {
    const reportBlockRegex = /```campusfix-report\s*([\s\S]*?)```/g
    const parts = []
    let lastIndex = 0
    let match

    while ((match = reportBlockRegex.exec(content)) !== null) {
      // Push preceding text
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          value: content.substring(lastIndex, match.index),
        })
      }

      // Parse JSON inside block
      try {
        const reportJson = JSON.parse(match[1].trim()) as ReportData
        parts.push({
          type: 'report',
          data: reportJson,
          rawKey: `${msgId}-${match.index}`,
        })
      } catch {
        parts.push({
          type: 'text',
          value: match[0],
        })
      }

      lastIndex = match.index + match[0].length
    }

    if (lastIndex < content.length) {
      parts.push({
        type: 'text',
        value: content.substring(lastIndex),
      })
    }

    return (
      <div className="space-y-3">
        {parts.map((p, idx) => {
          if (p.type === 'report' && p.data) {
            const cardKey = p.rawKey || `report-${idx}`
            const submitted = submittedReports[cardKey]
            const isSubmitting = submittingReport === cardKey

            return (
              <div
                key={cardKey}
                className="p-4 bg-slate-900/90 border border-teal-500/40 rounded-2xl shadow-xl space-y-3 my-2 text-slate-100"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-teal-500/20 flex items-center justify-center text-teal-400">
                      <Wrench size={13} />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-teal-400">
                      Prepared Maintenance Report
                    </span>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {p.data.urgency} Urgency
                  </span>
                </div>

                <div>
                  <h4 className="font-semibold text-white text-sm">{p.data.title}</h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{p.data.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/50">
                  <div>
                    <span className="text-slate-400">Category:</span>
                    <p className="font-medium text-white">{p.data.category}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Location:</span>
                    <p className="font-medium text-white truncate">
                      {p.data.building} ({p.data.room_location})
                    </p>
                  </div>
                </div>

                {submitted ? (
                  <div className="flex items-center justify-between p-2.5 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs">
                    <div className="flex items-center gap-1.5 font-medium">
                      <CheckCircle2 size={15} className="text-emerald-400" />
                      <span>Issue #{submitted.id.slice(0, 8)} Submitted!</span>
                    </div>
                    <Link
                      href={`/issues/${submitted.id}`}
                      className="inline-flex items-center gap-1 text-emerald-300 hover:text-white font-semibold underline text-xs"
                    >
                      View Report <ExternalLink size={12} />
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2 pt-1">
                    {authError && (
                      <div className="p-2 bg-amber-950/60 border border-amber-500/40 rounded-lg text-amber-200 text-xs flex items-center justify-between">
                        <span>Please sign in to submit reports.</span>
                        <Link href="/login" className="underline font-bold text-amber-300">
                          Sign In
                        </Link>
                      </div>
                    )}
                    <button
                      onClick={() => handleConfirmSubmit(p.data, cardKey)}
                      disabled={isSubmitting}
                      className="w-full py-2.5 px-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-semibold text-xs rounded-xl shadow-lg hover:shadow-teal-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          <span>Submitting to Maintenance...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={14} />
                          <span>Confirm & Submit Report</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )
          }

          return (
            <div key={idx} className="whitespace-pre-wrap">
              {p.value}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <>
      {/* Floating Action Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-medium text-sm rounded-full shadow-2xl hover:shadow-teal-500/30 hover:scale-105 active:scale-95 transition-all duration-200 border border-teal-400/30 group"
          aria-label="Open CampusFix AI Assistant"
        >
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
            <Sparkles size={14} className="text-white" />
          </div>
          <span>Ask CampusFix AI</span>
          <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
        </button>
      )}

      {/* Floating Chat Window */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex flex-col bg-slate-900/95 backdrop-blur-xl border border-slate-700/60 rounded-3xl shadow-2xl text-slate-100 overflow-hidden transition-all duration-300 animate-fade-in ${
            isExpanded
              ? 'w-[95vw] sm:w-[680px] h-[85vh] max-h-[800px]'
              : 'w-[95vw] sm:w-[420px] h-[600px] max-h-[90vh]'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/60">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-md">
                <Sparkles size={18} className="text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm text-white">CampusFix AI</h3>
                  <span className="px-1.5 py-0.5 text-[10px] font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full">
                    Online
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Campus Assistant & Smart Reporter</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleReset}
                title="Reset conversation"
                className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <RotateCcw size={15} />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? 'Restore size' : 'Expand window'}
                className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors hidden sm:block"
              >
                {isExpanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close chat"
                className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X size={17} />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm scrollbar-thin scrollbar-thumb-slate-700">
            {/* Welcome banner if empty */}
            {messages.length === 0 && (
              <div className="flex flex-col items-center text-center py-6 px-3">
                <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mb-3">
                  <Bot size={28} className="text-teal-400" />
                </div>
                <h4 className="font-semibold text-white text-base mb-1">
                  Hi! How can I help with campus facilities today?
                </h4>
                <p className="text-xs text-slate-400 max-w-xs mb-5 leading-relaxed">
                  Ask me about building hours, maintenance progress, or describe an issue and I will draft a report for you!
                </p>

                {/* Quick Prompts */}
                <div className="w-full space-y-2">
                  <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider text-left pl-1">
                    Try asking:
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {QUICK_PROMPTS.map((p, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleQuickPrompt(p)}
                        className="text-left px-3 py-2 text-xs bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-700/50 hover:border-teal-500/40 transition-all duration-150 flex items-center justify-between group"
                      >
                        <span className="truncate">{p}</span>
                        <Sparkles size={12} className="text-teal-400/60 group-hover:text-teal-400 shrink-0 ml-2" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Conversation Messages */}
            {messages.map((m) => {
              const isUser = m.role === 'user'

              return (
                <div
                  key={m.id}
                  className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-7 h-7 rounded-lg bg-teal-500/20 border border-teal-500/30 flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles size={13} className="text-teal-400" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? 'bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-br-sm'
                        : 'bg-slate-800/90 text-slate-200 border border-slate-700/50 rounded-bl-sm'
                    }`}
                  >
                    {isUser ? (
                      <div className="whitespace-pre-wrap">{m.content}</div>
                    ) : (
                      renderMessageContent(m.content, m.id)
                    )}
                  </div>

                  {isUser && (
                    <div className="w-7 h-7 rounded-lg bg-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                      <User size={13} className="text-slate-300" />
                    </div>
                  )}
                </div>
              )
            })}

            {isLoading && (
              <div className="flex gap-3 items-center text-slate-400 text-xs pl-1">
                <div className="w-7 h-7 rounded-lg bg-teal-500/20 border border-teal-500/30 flex items-center justify-center shrink-0">
                  <Sparkles size={13} className="text-teal-400 animate-spin" />
                </div>
                <span className="animate-pulse">CampusFix AI is typing...</span>
              </div>
            )}

            {errorMessage && (
              <div className="p-3 bg-red-950/50 border border-red-700/50 rounded-xl text-red-300 text-xs space-y-1">
                <p className="font-semibold">Unable to complete request</p>
                <p className="text-[11px] text-red-400">{errorMessage}</p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form
            onSubmit={handleFormSubmit}
            className="p-3 border-t border-slate-800 bg-slate-900/80 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question or describe an issue to report..."
              className="flex-1 bg-slate-800/90 border border-slate-700/70 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="w-9 h-9 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white flex items-center justify-center shadow-md disabled:opacity-40 disabled:cursor-not-allowed hover:from-teal-500 hover:to-emerald-500 transition-all shrink-0"
              aria-label="Send message"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </>
  )
}
