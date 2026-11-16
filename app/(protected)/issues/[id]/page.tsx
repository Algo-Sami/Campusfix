'use client'

import { useState, useEffect, useCallback, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, ThumbsUp, MapPin, Calendar, Clock,
  Edit2, Trash2, CheckCircle2, MessageSquare, AlertTriangle, Star
} from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/Button'
import { StatusBadge, UrgencyBadge } from '@/components/ui/Badge'
import { ConfirmDialog } from '@/components/ui/Dialog'
import { formatDateTime, timeAgo, getCategoryIcon } from '@/lib/utils'
import type { Issue, IssueUpdate, IssueFeedback } from '@/types/database'

interface PageProps {
  params: Promise<{ id: string }>
}

export const dynamic = 'force-dynamic'

export default function IssueDetailPage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()
  const supabase = createClient()

  const [issue, setIssue] = useState<Issue | null>(null)
  const [updates, setUpdates] = useState<IssueUpdate[]>([])
  const [feedback, setFeedback] = useState<IssueFeedback | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [upvoted, setUpvoted] = useState(false)
  const [upvoteCount, setUpvoteCount] = useState(0)
  const [upvoting, setUpvoting] = useState(false)

  // Modals / Feedback state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Resolution feedback form
  const [rating, setRating] = useState<number>(5)
  const [isFixed, setIsFixed] = useState<boolean>(true)
  const [feedbackComment, setFeedbackComment] = useState('')
  const [submittingFeedback, setSubmittingFeedback] = useState(false)
  const [feedbackSuccess, setFeedbackSuccess] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    setCurrentUserId(user?.id ?? null)

    // Fetch issue details
    const { data: issueData, error: issueErr } = await supabase
      .from('issues')
      .select('*, reporter:profiles!created_by(id, full_name, email)')
      .eq('id', id)
      .single()

    if (issueErr || !issueData) {
      setError('Issue not found or you do not have permission to view it.')
      setLoading(false)
      return
    }

    setIssue(issueData as unknown as Issue)

    // Upvote status and count
    const [upvoteCountRes, userUpvoteRes] = await Promise.all([
      supabase.from('issue_upvotes').select('id', { count: 'exact', head: true }).eq('issue_id', id),
      user ? supabase.from('issue_upvotes').select('id').eq('issue_id', id).eq('user_id', user.id).single() : Promise.resolve({ data: null })
    ])

    setUpvoteCount(upvoteCountRes.count ?? 0)
    setUpvoted(!!userUpvoteRes.data)

    // Public timeline updates (hide internal notes from ordinary users)
    const { data: updatesData } = await supabase
      .from('issue_updates')
      .select('*, author:profiles!author_id(full_name, role)')
      .eq('issue_id', id)
      .eq('is_internal', false)
      .order('created_at', { ascending: true })

    setUpdates((updatesData as unknown as IssueUpdate[]) ?? [])

    // Feedback status if resolved/closed
    if (user && (issueData.status === 'Resolved' || issueData.status === 'Closed')) {
      const { data: feedbackData } = await supabase
        .from('issue_feedback')
        .select('*')
        .eq('issue_id', id)
        .eq('user_id', user.id)
        .maybeSingle()

      if (feedbackData) {
        setFeedback(feedbackData as IssueFeedback)
      }
    }

    setLoading(false)
  }, [id, supabase])

  useEffect(() => {
    loadData()
  }, [loadData])

  async function handleToggleUpvote() {
    if (!currentUserId || upvoting) return
    setUpvoting(true)

    if (upvoted) {
      await supabase.from('issue_upvotes').delete().match({ issue_id: id, user_id: currentUserId })
      setUpvoted(false)
      setUpvoteCount(prev => Math.max(0, prev - 1))
    } else {
      await supabase.from('issue_upvotes').insert({ issue_id: id, user_id: currentUserId })
      setUpvoted(true)
      setUpvoteCount(prev => prev + 1)
    }
    setUpvoting(false)
  }

  async function handleDeleteIssue() {
    setDeleting(true)
    const { error: delErr } = await supabase
      .from('issues')
      .delete()
      .eq('id', id)
      .eq('status', 'Open')
      .eq('created_by', currentUserId!)

    setDeleting(false)
    setDeleteModalOpen(false)

    if (delErr) {
      alert('Unable to delete: ' + delErr.message)
    } else {
      router.push('/my-issues')
    }
  }

  async function handleSubmitFeedback(e: React.FormEvent) {
    e.preventDefault()
    if (!currentUserId || submittingFeedback) return
    setSubmittingFeedback(true)

    const { error: fbErr } = await supabase.from('issue_feedback').insert({
      issue_id: id,
      user_id: currentUserId,
      rating,
      is_resolved: isFixed,
      comment: feedbackComment.trim() || null,
    })

    setSubmittingFeedback(false)
    if (!fbErr) {
      setFeedbackSuccess(true)
      setFeedback({
        id: 'new',
        issue_id: id,
        user_id: currentUserId,
        rating,
        is_resolved: isFixed,
        comment: feedbackComment.trim() || null,
        created_at: new Date().toISOString()
      })
    } else {
      alert('Failed to submit feedback: ' + fbErr.message)
    }
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
        <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
        <div className="h-40 bg-white rounded-xl border p-6 space-y-4">
          <div className="h-8 w-2/3 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-1/3 bg-gray-100 rounded animate-pulse" />
        </div>
      </div>
    )
  }

  if (error || !issue) {
    return (
      <div className="p-8 text-center max-w-lg mx-auto">
        <AlertTriangle size={36} className="text-amber-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Issue Not Found</h2>
        <p className="text-sm text-gray-500 mb-6">{error || 'This issue does not exist or has been removed.'}</p>
        <Link href="/issues">
          <Button variant="outline">
            <ArrowLeft size={16} /> Back to Campus Issues
          </Button>
        </Link>
      </div>
    )
  }

  const isReporter = currentUserId === issue.created_by
  const canEditOrDelete = isReporter && issue.status === 'Open'

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <Link
        href="/issues"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Campus Issues
      </Link>

      {/* Main Issue Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-6">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-md border border-teal-100 flex items-center gap-1.5">
                {getCategoryIcon(issue.category)} {issue.category}
              </span>
              <StatusBadge status={issue.status} />
              <UrgencyBadge urgency={issue.urgency} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-snug">
              {issue.title}
            </h1>
            <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
              <span className="flex items-center gap-1">
                <MapPin size={13} className="text-gray-400" />
                {issue.building} &middot; {issue.room_location}
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={13} className="text-gray-400" />
                Reported {formatDateTime(issue.created_at)}
              </span>
              {issue.duplicate_of && (
                <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Duplicate of{' '}
                  <Link href={`/issues/${issue.duplicate_of}`} className="underline font-medium">
                    #{issue.duplicate_of.slice(0, 8)}
                  </Link>
                </span>
              )}
            </div>
          </div>

          {/* Action buttons (Upvote + Edit/Delete for reporter) */}
          <div className="flex items-center gap-2 self-start">
            <button
              onClick={handleToggleUpvote}
              disabled={upvoting}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                upvoted
                  ? 'bg-teal-50 border-teal-200 text-teal-700 shadow-sm'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <ThumbsUp size={16} className={upvoted ? 'fill-teal-600 text-teal-600' : 'text-gray-500'} />
              <span>{upvoteCount} {upvoteCount === 1 ? 'Upvote' : 'Upvotes'}</span>
            </button>

            {canEditOrDelete && (
              <>
                <Link href={`/issues/${issue.id}/edit`}>
                  <Button variant="outline" size="sm" title="Edit issue while Open">
                    <Edit2 size={15} />
                    <span className="hidden sm:inline">Edit</span>
                  </Button>
                </Link>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setDeleteModalOpen(true)}
                  title="Delete issue"
                >
                  <Trash2 size={15} />
                  <span className="hidden sm:inline">Delete</span>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="border-t border-gray-100 pt-5">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-2">Description</h2>
          <p className="text-gray-700 text-sm sm:text-base leading-relaxed whitespace-pre-line">
            {issue.description}
          </p>
        </div>

        {/* Resolution info banner if resolved or closed */}
        {(issue.status === 'Resolved' || issue.status === 'Closed') && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-emerald-900 space-y-1">
            <div className="flex items-center gap-2 font-semibold">
              <CheckCircle2 size={18} className="text-emerald-600" />
              <span>This issue has been {issue.status.toLowerCase()}</span>
            </div>
            {issue.resolved_at && (
              <p className="text-xs text-emerald-700">
                Resolved on {formatDateTime(issue.resolved_at)}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Resolution Feedback Card (For reporter after resolution) */}
      {isReporter && (issue.status === 'Resolved' || issue.status === 'Closed') && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <h3 className="font-semibold text-gray-900 text-base flex items-center gap-2">
            <Star size={18} className="text-amber-500 fill-amber-500" />
            Resolution Feedback
          </h3>

          {feedback ? (
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-sm space-y-2">
              <p className="font-medium text-gray-800">
                You rated this resolution: <span className="text-amber-600">{'★'.repeat(feedback.rating || 5)}</span>
              </p>
              <p className="text-gray-600">
                Was the problem fixed? <strong>{feedback.is_resolved ? 'Yes' : 'No'}</strong>
              </p>
              {feedback.comment && (
                <p className="text-gray-600 italic">&ldquo;{feedback.comment}&rdquo;</p>
              )}
            </div>
          ) : feedbackSuccess ? (
            <div className="bg-emerald-50 text-emerald-800 rounded-xl p-4 text-sm font-medium">
              Thank you for submitting your feedback!
            </div>
          ) : (
            <form onSubmit={handleSubmitFeedback} className="space-y-4">
              <p className="text-sm text-gray-600">
                As the reporter of this issue, please confirm if the maintenance work completely resolved your issue.
              </p>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Did the maintenance team fix the problem?
                </label>
                <div className="flex items-center gap-4">
                  <label className="inline-flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input
                      type="radio"
                      name="isFixed"
                      checked={isFixed === true}
                      onChange={() => setIsFixed(true)}
                      className="text-teal-600 focus:ring-teal-500"
                    />
                    Yes, it is fixed
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input
                      type="radio"
                      name="isFixed"
                      checked={isFixed === false}
                      onChange={() => setIsFixed(false)}
                      className="text-teal-600 focus:ring-teal-500"
                    />
                    No, problem persists
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Rate handling experience
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRating(s)}
                      className={`text-2xl transition-transform hover:scale-110 ${
                        s <= rating ? 'text-amber-400' : 'text-gray-200'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Optional Comments
                </label>
                <textarea
                  rows={2}
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  placeholder="Any feedback on the response time or quality of fix..."
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <Button type="submit" loading={submittingFeedback} size="sm">
                Submit Feedback
              </Button>
            </form>
          )}
        </div>
      )}

      {/* Timeline Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <h2 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
            <Clock size={18} className="text-teal-600" />
            Issue Timeline &amp; Updates
          </h2>
          <span className="text-xs text-gray-400">
            {updates.length + 1} event{updates.length === 0 ? '' : 's'}
          </span>
        </div>

        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
          {/* Initial Report Event */}
          <div className="relative pl-6">
            <span className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-blue-500 ring-4 ring-white flex items-center justify-center text-white text-[10px]">
              &bull;
            </span>
            <div className="text-sm">
              <span className="font-medium text-gray-900">Issue Reported</span>
              <p className="text-xs text-gray-400 mt-0.5">
                {timeAgo(issue.created_at)} &middot; {formatDateTime(issue.created_at)}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Reported with status <strong className="text-blue-700">Open</strong> and urgency <strong className="text-gray-800">{issue.urgency}</strong>.
              </p>
            </div>
          </div>

          {/* Sequential Updates */}
          {updates.map((update) => {
            const isStatusChange = update.update_type === 'status_change'
            const isResolution = update.update_type === 'resolution'
            const isRejection = update.update_type === 'rejection'

            let dotColor = 'bg-teal-500'
            if (isStatusChange) dotColor = 'bg-amber-500'
            if (isResolution) dotColor = 'bg-emerald-500'
            if (isRejection) dotColor = 'bg-red-500'

            return (
              <div key={update.id} className="relative pl-6">
                <span className={`absolute -left-6 top-1 w-5 h-5 rounded-full ${dotColor} ring-4 ring-white flex items-center justify-center text-white text-[10px]`}>
                  &bull;
                </span>
                <div className="text-sm space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-gray-900 capitalize">
                      {update.update_type.replace('_', ' ')}
                    </span>
                    {update.author && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        {update.author.full_name} ({update.author.role})
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">
                    {timeAgo(update.created_at)} &middot; {formatDateTime(update.created_at)}
                  </p>
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-gray-700 text-xs sm:text-sm mt-1 whitespace-pre-line">
                    {update.message}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteIssue}
        title="Delete Issue Report"
        description="Are you sure you want to delete this issue? This action cannot be undone. Only Open issues can be deleted."
        confirmLabel="Delete Issue"
        variant="danger"
        loading={deleting}
      />
    </div>
  )
}
