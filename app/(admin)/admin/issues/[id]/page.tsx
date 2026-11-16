'use client'

import { useState, useEffect, useCallback, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, CheckCircle, XCircle, AlertTriangle, Clock,
  Users, Lock, MessageSquare, Send, ShieldAlert, GitBranch, Wrench
} from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { StatusBadge, UrgencyBadge } from '@/components/ui/Badge'
import { Dialog } from '@/components/ui/Dialog'
import {
  formatDateTime, timeAgo, ISSUE_URGENCIES,
  STATUS_TRANSITIONS, canTransitionTo
} from '@/lib/utils'
import type { Issue, IssueUpdate, IssueStatus, IssueUrgency, MaintenanceTeam } from '@/types/database'

interface PageProps {
  params: Promise<{ id: string }>
}

export const dynamic = 'force-dynamic'

export default function AdminIssueDetailPage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()
  const supabase = createClient()

  const [issue, setIssue] = useState<Issue | null>(null)
  const [updates, setUpdates] = useState<IssueUpdate[]>([])
  const [teams, setTeams] = useState<MaintenanceTeam[]>([])
  const [loading, setLoading] = useState(true)
  const [currentAdminId, setCurrentAdminId] = useState<string | null>(null)

  // Status Action Modals
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [targetStatus, setTargetStatus] = useState<IssueStatus | null>(null)
  const [statusNote, setStatusNote] = useState('')
  const [statusLoading, setStatusLoading] = useState(false)

  // Update Forms
  const [officialMessage, setOfficialMessage] = useState('')
  const [submittingOfficial, setSubmittingOfficial] = useState(false)
  const [internalNote, setInternalNote] = useState('')
  const [submittingInternal, setSubmittingInternal] = useState(false)

  // Triage Controls
  const [selectedUrgency, setSelectedUrgency] = useState<IssueUrgency | ''>('')
  const [selectedTeam, setSelectedTeam] = useState<string>('')
  const [duplicateId, setDuplicateId] = useState('')
  const [savingTriage, setSavingTriage] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    setCurrentAdminId(user?.id ?? null)

    // Load issue
    const { data: issueData } = await supabase
      .from('issues')
      .select('*, reporter:profiles!created_by(id, full_name, email), assigned_team:maintenance_teams(id, name)')
      .eq('id', id)
      .single()

    if (issueData) {
      const iss = issueData as unknown as Issue
      setIssue(iss)
      setSelectedUrgency(iss.urgency)
      setSelectedTeam(iss.assigned_team_id || '')
      setDuplicateId(iss.duplicate_of || '')
    }

    // Load maintenance teams
    const { data: teamsData } = await supabase.from('maintenance_teams').select('*').order('name')
    setTeams((teamsData as MaintenanceTeam[]) ?? [])

    // Load all updates including internal notes (authorized for admins)
    const { data: updatesData } = await supabase
      .from('issue_updates')
      .select('*, author:profiles!author_id(full_name, role)')
      .eq('issue_id', id)
      .order('created_at', { ascending: true })

    setUpdates((updatesData as unknown as IssueUpdate[]) ?? [])
    setLoading(false)
  }, [id, supabase])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Save quick triage adjustments (Urgency, Team assignment, Duplicate link)
  async function handleSaveTriage() {
    if (!issue || !currentAdminId) return
    setSavingTriage(true)

    const updatesObj: Partial<Issue> = {
      urgency: selectedUrgency as IssueUrgency,
      assigned_team_id: selectedTeam || null,
      duplicate_of: duplicateId.trim() || null,
      updated_at: new Date().toISOString(),
    }

    const { error: err } = await supabase
      .from('issues')
      .update(updatesObj as any)
      .eq('id', issue.id)

    if (!err) {
      // Record assignment / priority audit note if changed
      if (selectedUrgency !== issue.urgency) {
        await supabase.from('issue_updates').insert({
          issue_id: issue.id,
          author_id: currentAdminId,
          update_type: 'priority_change',
          message: `Priority changed from ${issue.urgency} to ${selectedUrgency}`,
          old_value: issue.urgency,
          new_value: selectedUrgency,
          is_internal: false,
        })
      }

      if (selectedTeam !== (issue.assigned_team_id || '')) {
        const teamObj = teams.find(t => t.id === selectedTeam)
        const teamName = teamObj ? teamObj.name : 'Unassigned'
        await supabase.from('issue_updates').insert({
          issue_id: issue.id,
          author_id: currentAdminId,
          update_type: 'assignment',
          message: `Issue assigned to ${teamName}`,
          new_value: teamName,
          is_internal: false,
        })
      }

      await loadData()
    } else {
      alert('Failed to save triage adjustments: ' + err.message)
    }

    setSavingTriage(false)
  }

  // Handle status transition execution
  async function handleExecuteStatusTransition() {
    if (!issue || !targetStatus || !currentAdminId) return

    // Validation for notes
    if ((targetStatus === 'Rejected' || targetStatus === 'Resolved' || targetStatus === 'In Progress' && issue.status === 'Closed') && !statusNote.trim()) {
      alert(`A detailed note/reason is required to transition to ${targetStatus}.`)
      return
    }

    setStatusLoading(true)

    const now = new Date().toISOString()
    const issueUpdateFields: any = {
      status: targetStatus,
      updated_at: now,
    }

    if (targetStatus === 'Resolved') {
      issueUpdateFields.resolved_at = now
    } else if (targetStatus === 'Closed') {
      issueUpdateFields.closed_at = now
    }

    const { error: updateErr } = await supabase
      .from('issues')
      .update(issueUpdateFields)
      .eq('id', issue.id)

    if (!updateErr) {
      // Determine update_type
      let updateType: any = 'status_change'
      if (targetStatus === 'Resolved') updateType = 'resolution'
      if (targetStatus === 'Rejected') updateType = 'rejection'
      if (issue.status === 'Closed' && targetStatus === 'In Progress') updateType = 'reopening'

      // Log to issue_updates audit table
      await supabase.from('issue_updates').insert({
        issue_id: issue.id,
        author_id: currentAdminId,
        update_type: updateType,
        message: statusNote.trim() || `Status updated from ${issue.status} to ${targetStatus}.`,
        old_value: issue.status,
        new_value: targetStatus,
        is_internal: false,
      })

      // Send in-app notification to reporter
      if (issue.created_by) {
        await supabase.from('notifications').insert({
          user_id: issue.created_by,
          issue_id: issue.id,
          title: `Issue status changed: ${targetStatus}`,
          message: statusNote.trim() || `Your report "${issue.title}" is now ${targetStatus}.`,
          type: 'status_change',
        })
      }

      setStatusModalOpen(false)
      setStatusNote('')
      setTargetStatus(null)
      await loadData()
    } else {
      alert('Error updating status: ' + updateErr.message)
    }

    setStatusLoading(false)
  }

  // Submit official public progress update
  async function handleAddOfficialUpdate(e: React.FormEvent) {
    e.preventDefault()
    if (!officialMessage.trim() || !currentAdminId || !issue) return
    setSubmittingOfficial(true)

    const { error: err } = await supabase.from('issue_updates').insert({
      issue_id: issue.id,
      author_id: currentAdminId,
      update_type: 'comment',
      message: officialMessage.trim(),
      is_internal: false,
    })

    if (!err) {
      // Notify reporter
      await supabase.from('notifications').insert({
        user_id: issue.created_by,
        issue_id: issue.id,
        title: 'New Official Progress Update',
        message: officialMessage.trim(),
        type: 'official_update',
      })
      setOfficialMessage('')
      await loadData()
    } else {
      alert('Failed to post update: ' + err.message)
    }

    setSubmittingOfficial(false)
  }

  // Submit internal note
  async function handleAddInternalNote(e: React.FormEvent) {
    e.preventDefault()
    if (!internalNote.trim() || !currentAdminId || !issue) return
    setSubmittingInternal(true)

    const { error: err } = await supabase.from('issue_updates').insert({
      issue_id: issue.id,
      author_id: currentAdminId,
      update_type: 'comment',
      message: internalNote.trim(),
      is_internal: true,
    })

    if (!err) {
      setInternalNote('')
      await loadData()
    } else {
      alert('Failed to save internal note: ' + err.message)
    }

    setSubmittingInternal(false)
  }

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto space-y-4">
        <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
        <div className="h-64 bg-white rounded-xl border p-6 space-y-4">
          <div className="h-8 w-1/3 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    )
  }

  if (!issue) {
    return (
      <div className="p-12 text-center">
        <p className="text-gray-500">Issue not found.</p>
        <Link href="/admin/issues" className="text-teal-700 underline text-sm mt-2 inline-block">
          Return to issue management
        </Link>
      </div>
    )
  }

  const allowedNextStatuses = STATUS_TRANSITIONS[issue.status] || []

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Back button */}
      <Link
        href="/admin/issues"
        className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 transition-colors"
      >
        <ArrowLeft size={14} /> Back to Issue Table
      </Link>

      {/* Main Grid: Details & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Issue Details, Timeline & Updates */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs text-gray-400">#{issue.id.slice(0, 8)}</span>
                  <StatusBadge status={issue.status} />
                  <UrgencyBadge urgency={issue.urgency} />
                  <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                    {issue.category}
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug">
                  {issue.title}
                </h1>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-xs sm:text-sm text-gray-700 whitespace-pre-line leading-relaxed">
              {issue.description}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs text-gray-500">
              <div>
                <span className="block text-gray-400">Building</span>
                <strong className="text-gray-800">{issue.building}</strong>
              </div>
              <div>
                <span className="block text-gray-400">Location</span>
                <strong className="text-gray-800">{issue.room_location}</strong>
              </div>
              <div>
                <span className="block text-gray-400">Reporter</span>
                <strong className="text-gray-800">{issue.reporter?.full_name || 'Anonymous'}</strong>
              </div>
              <div>
                <span className="block text-gray-400">Reported</span>
                <strong className="text-gray-800">{timeAgo(issue.created_at)}</strong>
              </div>
            </div>
          </div>

          {/* Timeline & Audit Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-6">
            <h2 className="font-semibold text-base text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
              <Clock size={16} className="text-teal-700" />
              Complete Action &amp; Audit Timeline
            </h2>

            <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
              {/* Creation Entry */}
              <div className="relative pl-5">
                <span className="absolute -left-5 top-1.5 w-3.5 h-3.5 rounded-full bg-blue-500 ring-4 ring-white" />
                <div className="text-xs">
                  <span className="font-semibold text-gray-900">Issue Submitted by Reporter</span>
                  <span className="text-gray-400 ml-2">{formatDateTime(issue.created_at)}</span>
                  <p className="text-gray-600 mt-1">Initial status: Open &bull; Urgency: {issue.urgency}</p>
                </div>
              </div>

              {/* Updates List */}
              {updates.map((upd) => (
                <div key={upd.id} className="relative pl-5">
                  <span className={`absolute -left-5 top-1.5 w-3.5 h-3.5 rounded-full ring-4 ring-white ${
                    upd.is_internal ? 'bg-purple-600' :
                    upd.update_type === 'resolution' ? 'bg-emerald-600' :
                    upd.update_type === 'rejection' ? 'bg-red-600' : 'bg-teal-600'
                  }`} />
                  <div className="text-xs space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900 capitalize">
                        {upd.update_type.replace('_', ' ')}
                      </span>
                      {upd.is_internal && (
                        <span className="bg-purple-100 text-purple-800 text-[10px] px-1.5 py-0.5 rounded font-semibold flex items-center gap-1">
                          <Lock size={10} /> Internal Note
                        </span>
                      )}
                      {upd.author && (
                        <span className="text-gray-500 text-[11px]">
                          by {upd.author.full_name} ({upd.author.role})
                        </span>
                      )}
                      <span className="text-gray-400 text-[10px] ml-auto">
                        {formatDateTime(upd.created_at)}
                      </span>
                    </div>
                    <div className={`p-3 rounded-xl border text-xs whitespace-pre-line leading-relaxed ${
                      upd.is_internal
                        ? 'bg-purple-50/50 border-purple-100 text-purple-900'
                        : 'bg-gray-50 border-gray-100 text-gray-800'
                    }`}>
                      {upd.message}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add Updates / Notes Tabs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Official Progress Update Form */}
            <form onSubmit={handleAddOfficialUpdate} className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <MessageSquare size={16} className="text-teal-700" />
                <span>Post Official Public Update</span>
              </div>
              <p className="text-[11px] text-gray-500">
                Visible to the student reporter and the campus community. Triggers in-app notification.
              </p>
              <textarea
                rows={3}
                required
                value={officialMessage}
                onChange={(e) => setOfficialMessage(e.target.value)}
                placeholder="e.g. Electricians have arrived on site and parts are being installed..."
                className="w-full text-xs border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
              <Button type="submit" size="sm" loading={submittingOfficial} className="w-full">
                <Send size={13} /> Publish Official Update
              </Button>
            </form>

            {/* Internal Note Form */}
            <form onSubmit={handleAddInternalNote} className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <Lock size={16} className="text-purple-700" />
                <span>Add Internal Admin Note</span>
              </div>
              <p className="text-[11px] text-gray-500">
                Confidential administrative note. Completely hidden from students and faculty.
              </p>
              <textarea
                rows={3}
                required
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
                placeholder="e.g. Waiting on invoice approval from facilities budget code 401..."
                className="w-full text-xs border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
              <Button
                type="submit"
                size="sm"
                variant="outline"
                loading={submittingInternal}
                className="w-full text-purple-700 border-purple-200 hover:bg-purple-50"
              >
                <Lock size={13} /> Save Internal Note
              </Button>
            </form>
          </div>
        </div>

        {/* Right Column (1 col): Workflow & Triage Controls */}
        <div className="space-y-6">
          {/* Status Workflow Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
            <h3 className="font-semibold text-gray-900 text-sm border-b border-gray-100 pb-2">
              Status Workflow Transitions
            </h3>

            <div className="text-xs text-gray-500">
              Current state: <strong className="text-gray-900">{issue.status}</strong>
            </div>

            <div className="space-y-2">
              {allowedNextStatuses.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No further transitions permitted from this state.</p>
              ) : (
                allowedNextStatuses.map((st) => (
                  <Button
                    key={st}
                    variant={st === 'Resolved' ? 'success' : st === 'Rejected' ? 'danger' : 'outline'}
                    size="sm"
                    className="w-full justify-start text-xs"
                    onClick={() => {
                      setTargetStatus(st)
                      setStatusModalOpen(true)
                    }}
                  >
                    Transition to &rarr; <strong>{st}</strong>
                  </Button>
                ))
              )}
            </div>
          </div>

          {/* Triage Adjustments Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
            <h3 className="font-semibold text-gray-900 text-sm border-b border-gray-100 pb-2">
              Triage &amp; Assignment
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Adjust Urgency Level
                </label>
                <select
                  value={selectedUrgency}
                  onChange={(e) => setSelectedUrgency(e.target.value as IssueUrgency)}
                  className="w-full h-9 px-3 border border-gray-300 rounded-lg text-xs bg-white text-gray-700 focus:ring-2 focus:ring-teal-500"
                >
                  {ISSUE_URGENCIES.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Assign Maintenance Team
                </label>
                <select
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value)}
                  className="w-full h-9 px-3 border border-gray-300 rounded-lg text-xs bg-white text-gray-700 focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">-- Unassigned --</option>
                  {teams.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Link Duplicate Canonical Issue ID
                </label>
                <input
                  type="text"
                  placeholder="UUID of canonical issue"
                  value={duplicateId}
                  onChange={(e) => setDuplicateId(e.target.value)}
                  className="w-full h-9 px-3 border border-gray-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <Button
                size="sm"
                className="w-full mt-2"
                onClick={handleSaveTriage}
                loading={savingTriage}
              >
                Apply Triage Changes
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Transition Modal with Mandatory Reason/Notes */}
      <Dialog
        open={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title={`Change Status to ${targetStatus}`}
        description={`Record notes for transitioning issue #${issue.id.slice(0, 8)} to ${targetStatus}.`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {targetStatus === 'Rejected' ? 'Reason for Rejection (Mandatory)' :
               targetStatus === 'Resolved' ? 'Resolution Summary Notes (Mandatory)' :
               targetStatus === 'In Progress' && issue.status === 'Closed' ? 'Reason for Reopening (Mandatory)' :
               'Transition Notes / Instructions'}
            </label>
            <textarea
              rows={4}
              required
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              placeholder={
                targetStatus === 'Rejected' ? 'State clearly why this report cannot be addressed...' :
                targetStatus === 'Resolved' ? 'Describe the work completed and verification performed...' :
                'Enter transition details...'
              }
              className="w-full text-xs border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setStatusModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              variant={targetStatus === 'Resolved' ? 'success' : targetStatus === 'Rejected' ? 'danger' : 'primary'}
              onClick={handleExecuteStatusTransition}
              loading={statusLoading}
            >
              Confirm Transition
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
