import { cn, getStatusColor, getUrgencyColor } from '@/lib/utils'
import type { IssueStatus, IssueUrgency } from '@/types/database'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'status' | 'urgency' | 'outline'
  status?: IssueStatus
  urgency?: IssueUrgency
  children: React.ReactNode
}

export function Badge({ className, variant = 'default', status, urgency, children, ...props }: BadgeProps) {
  let colorClass = ''

  if (variant === 'status' && status) {
    colorClass = getStatusColor(status)
  } else if (variant === 'urgency' && urgency) {
    colorClass = getUrgencyColor(urgency)
  } else {
    colorClass = 'bg-gray-100 text-gray-700 border-gray-200'
  }

  return (
    <span
      className={cn('badge', colorClass, className)}
      {...props}
    >
      {children}
    </span>
  )
}

export function StatusBadge({ status }: { status: IssueStatus }) {
  return <Badge variant="status" status={status}>{status}</Badge>
}

export function UrgencyBadge({ urgency }: { urgency: IssueUrgency }) {
  return <Badge variant="urgency" urgency={urgency}>{urgency}</Badge>
}
