'use client'

import { useState, useEffect, useCallback } from 'react'
import { Settings, Building2, Wrench, Plus, Trash2, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ISSUE_CATEGORIES, ISSUE_URGENCIES } from '@/lib/utils'
import type { Building, MaintenanceTeam } from '@/types/database'

export default function AdminSettingsPage() {
  const supabase = createClient()

  const [teams, setTeams] = useState<MaintenanceTeam[]>([])
  const [buildings, setBuildings] = useState<Building[]>([])
  const [newTeamName, setNewTeamName] = useState('')
  const [newTeamDesc, setNewTeamDesc] = useState('')
  const [newBuildingName, setNewBuildingName] = useState('')
  const [newBuildingCode, setNewBuildingCode] = useState('')
  const [savingTeam, setSavingTeam] = useState(false)
  const [savingBuilding, setSavingBuilding] = useState(false)

  const loadData = useCallback(async () => {
    const [tRes, bRes] = await Promise.all([
      supabase.from('maintenance_teams').select('*').order('name'),
      supabase.from('buildings').select('*').order('name'),
    ])

    setTeams((tRes.data as MaintenanceTeam[]) ?? [])
    setBuildings((bRes.data as Building[]) ?? [])
  }, [supabase])

  useEffect(() => {
    loadData()
  }, [loadData])

  async function handleAddTeam(e: React.FormEvent) {
    e.preventDefault()
    if (!newTeamName.trim()) return
    setSavingTeam(true)

    const { error } = await supabase.from('maintenance_teams').insert({
      name: newTeamName.trim(),
      description: newTeamDesc.trim() || null,
    })

    if (!error) {
      setNewTeamName('')
      setNewTeamDesc('')
      await loadData()
    } else {
      alert('Failed to add team: ' + error.message)
    }

    setSavingTeam(false)
  }

  async function handleAddBuilding(e: React.FormEvent) {
    e.preventDefault()
    if (!newBuildingName.trim()) return
    setSavingBuilding(true)

    const { error } = await supabase.from('buildings').insert({
      name: newBuildingName.trim(),
      code: newBuildingCode.trim() || null,
    })

    if (!error) {
      setNewBuildingName('')
      setNewBuildingCode('')
      await loadData()
    } else {
      alert('Failed to add building: ' + error.message)
    }

    setSavingBuilding(false)
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Campus Configuration &amp; Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage campus facilities directory, maintenance teams, and service response targets.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Maintenance Teams */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-base font-semibold text-gray-900 border-b border-gray-100 pb-3">
            <Wrench size={18} className="text-teal-700" />
            <span>Maintenance Teams</span>
          </div>

          <form onSubmit={handleAddTeam} className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <Input
              label="Team Name"
              placeholder="e.g. Electrical Services, HVAC Crew"
              required
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
            />
            <Input
              label="Description (Optional)"
              placeholder="e.g. Handles power outages, wiring, lighting"
              value={newTeamDesc}
              onChange={(e) => setNewTeamDesc(e.target.value)}
            />
            <Button type="submit" size="sm" loading={savingTeam}>
              <Plus size={14} /> Add Maintenance Team
            </Button>
          </form>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {teams.map((t) => (
              <div key={t.id} className="p-3 border border-gray-100 rounded-xl flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-xs text-gray-900">{t.name}</h4>
                  {t.description && <p className="text-[11px] text-gray-500 mt-0.5">{t.description}</p>}
                </div>
              </div>
            ))}
            {teams.length === 0 && (
              <p className="text-xs text-gray-400 py-3 text-center">No maintenance teams registered yet.</p>
            )}
          </div>
        </div>

        {/* Buildings Directory */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-base font-semibold text-gray-900 border-b border-gray-100 pb-3">
            <Building2 size={18} className="text-teal-700" />
            <span>Campus Buildings Directory</span>
          </div>

          <form onSubmit={handleAddBuilding} className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <Input
              label="Building Name"
              placeholder="e.g. Engineering Hall"
              required
              value={newBuildingName}
              onChange={(e) => setNewBuildingName(e.target.value)}
            />
            <Input
              label="Building Code (Optional)"
              placeholder="e.g. ENG-01"
              value={newBuildingCode}
              onChange={(e) => setNewBuildingCode(e.target.value)}
            />
            <Button type="submit" size="sm" loading={savingBuilding}>
              <Plus size={14} /> Add Campus Building
            </Button>
          </form>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {buildings.map((b) => (
              <div key={b.id} className="p-3 border border-gray-100 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-semibold text-xs text-gray-900">{b.name}</span>
                  {b.code && <span className="ml-2 font-mono text-[10px] text-gray-400">({b.code})</span>}
                </div>
              </div>
            ))}
            {buildings.length === 0 && (
              <p className="text-xs text-gray-400 py-3 text-center">No buildings saved in database.</p>
            )}
          </div>
        </div>
      </div>

      {/* Service Response Targets / SLA Guidelines */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-3">
        <h3 className="font-semibold text-base text-gray-900">
          Campus Service Response Targets (SLAs)
        </h3>
        <p className="text-xs text-gray-500">
          Institutional maintenance response goals by urgency level:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
          <div className="border border-red-200 bg-red-50/50 rounded-xl p-3">
            <div className="text-xs font-bold text-red-800">Critical</div>
            <div className="text-lg font-bold text-red-900 mt-1">&lt; 4 Hours</div>
            <p className="text-[10px] text-red-700 mt-0.5">Safety hazard, major blackout, gas/water leak</p>
          </div>

          <div className="border border-orange-200 bg-orange-50/50 rounded-xl p-3">
            <div className="text-xs font-bold text-orange-800">High</div>
            <div className="text-lg font-bold text-orange-900 mt-1">&lt; 24 Hours</div>
            <p className="text-[10px] text-orange-700 mt-0.5">Classroom AC failure, lab equipment disruption</p>
          </div>

          <div className="border border-yellow-200 bg-yellow-50/50 rounded-xl p-3">
            <div className="text-xs font-bold text-yellow-800">Medium</div>
            <div className="text-lg font-bold text-yellow-900 mt-1">&lt; 3 Days</div>
            <p className="text-[10px] text-yellow-700 mt-0.5">Broken furniture, Wi-Fi dead zone, minor fixtures</p>
          </div>

          <div className="border border-green-200 bg-green-50/50 rounded-xl p-3">
            <div className="text-xs font-bold text-green-800">Low</div>
            <div className="text-lg font-bold text-green-900 mt-1">&lt; 7 Days</div>
            <p className="text-[10px] text-green-700 mt-0.5">Cosmetic issues, non-urgent scheduled repairs</p>
          </div>
        </div>
      </div>
    </div>
  )
}
