import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { IssueStatus, IssueUrgency } from '@/types/database'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function timeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return formatDate(dateString)
}

export function getStatusColor(status: IssueStatus): string {
  const colors: Record<IssueStatus, string> = {
    Open: 'bg-blue-100 text-blue-800 border-blue-200',
    'In Progress': 'bg-amber-100 text-amber-800 border-amber-200',
    Resolved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    Closed: 'bg-gray-100 text-gray-700 border-gray-200',
    Rejected: 'bg-red-100 text-red-800 border-red-200',
  }
  return colors[status] || 'bg-gray-100 text-gray-700'
}

export function getUrgencyColor(urgency: IssueUrgency): string {
  const colors: Record<IssueUrgency, string> = {
    Low: 'bg-green-100 text-green-800 border-green-200',
    Medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    High: 'bg-orange-100 text-orange-800 border-orange-200',
    Critical: 'bg-red-100 text-red-800 border-red-200',
  }
  return colors[urgency] || 'bg-gray-100 text-gray-700'
}

export function getUrgencyDot(urgency: IssueUrgency): string {
  const colors: Record<IssueUrgency, string> = {
    Low: 'bg-green-500',
    Medium: 'bg-yellow-500',
    High: 'bg-orange-500',
    Critical: 'bg-red-500',
  }
  return colors[urgency] || 'bg-gray-500'
}

export function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    'IT & Wi-Fi': '📡',
    Electrical: '⚡',
    Plumbing: '🔧',
    'Lab Equipment': '🔬',
    Furniture: '🪑',
  }
  return icons[category] || '📋'
}

export const ISSUE_CATEGORIES = ['IT & Wi-Fi', 'Electrical', 'Plumbing', 'Lab Equipment', 'Furniture'] as const
export const ISSUE_URGENCIES = ['Low', 'Medium', 'High', 'Critical'] as const
export const ISSUE_STATUSES = ['Open', 'In Progress', 'Resolved', 'Closed', 'Rejected'] as const

export const STATUS_TRANSITIONS: Record<IssueStatus, IssueStatus[]> = {
  Open: ['In Progress', 'Rejected'],
  'In Progress': ['Resolved', 'Rejected'],
  Resolved: ['Closed', 'In Progress'],
  Closed: ['In Progress'],
  Rejected: [],
}

export function canTransitionTo(current: IssueStatus, next: IssueStatus): boolean {
  return STATUS_TRANSITIONS[current]?.includes(next) ?? false
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}
