export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'student' | 'faculty' | 'admin' | 'maintenance'
export type IssueStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed' | 'Rejected'
export type IssueUrgency = 'Low' | 'Medium' | 'High' | 'Critical'
export type IssueCategory = 'IT & Wi-Fi' | 'Electrical' | 'Plumbing' | 'Lab Equipment' | 'Furniture'
export type UpdateType = 'comment' | 'status_change' | 'assignment' | 'resolution' | 'rejection' | 'priority_change' | 'reopening' | 'created'

export interface Profile {
  id: string
  full_name: string
  email: string
  role: UserRole
  department: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Issue {
  id: string
  created_by: string
  title: string
  description: string
  category: IssueCategory
  building: string
  room_location: string
  urgency: IssueUrgency
  status: IssueStatus
  assigned_team_id: string | null
  assigned_to: string | null
  duplicate_of: string | null
  created_at: string
  updated_at: string
  resolved_at: string | null
  closed_at: string | null
  // Computed/joined fields
  upvote_count?: number
  user_has_upvoted?: boolean
  reporter?: Profile
  assigned_team?: MaintenanceTeam
  assignee?: Profile
}

export interface IssueUpvote {
  id: string
  issue_id: string
  user_id: string
  created_at: string
}

export interface IssueUpdate {
  id: string
  issue_id: string
  author_id: string
  update_type: UpdateType
  message: string
  old_value: string | null
  new_value: string | null
  is_internal: boolean
  created_at: string
  author?: Profile
}

export interface Notification {
  id: string
  user_id: string
  issue_id: string | null
  title: string
  message: string
  type: string
  is_read: boolean
  created_at: string
  issue?: Issue
}

export interface Building {
  id: string
  name: string
  code: string | null
  created_at: string
}

export interface MaintenanceTeam {
  id: string
  name: string
  description: string | null
  created_at: string
}

export interface IssueFeedback {
  id: string
  issue_id: string
  user_id: string
  rating: number | null
  is_resolved: boolean | null
  comment: string | null
  created_at: string
}

export interface ContactMessage {
  id: string
  full_name: string
  email: string
  subject: string
  message: string
  created_at: string
}

export interface AuditLog {
  id: string
  actor_id: string | null
  action: string
  table_name: string
  record_id: string | null
  old_data: Json | null
  new_data: Json | null
  created_at: string
  actor?: Profile
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Partial<Profile>
        Update: Partial<Profile>
        Relationships: []
      }
      issues: {
        Row: Issue
        Insert: Partial<Issue>
        Update: Partial<Issue>
        Relationships: []
      }
      issue_upvotes: {
        Row: IssueUpvote
        Insert: Partial<IssueUpvote>
        Update: Partial<IssueUpvote>
        Relationships: []
      }
      issue_updates: {
        Row: IssueUpdate
        Insert: Partial<IssueUpdate>
        Update: Partial<IssueUpdate>
        Relationships: []
      }
      notifications: {
        Row: Notification
        Insert: Partial<Notification>
        Update: Partial<Notification>
        Relationships: []
      }
      buildings: {
        Row: Building
        Insert: Partial<Building>
        Update: Partial<Building>
        Relationships: []
      }
      maintenance_teams: {
        Row: MaintenanceTeam
        Insert: Partial<MaintenanceTeam>
        Update: Partial<MaintenanceTeam>
        Relationships: []
      }
      issue_feedback: {
        Row: IssueFeedback
        Insert: Partial<IssueFeedback>
        Update: Partial<IssueFeedback>
        Relationships: []
      }
      contact_messages: {
        Row: ContactMessage
        Insert: Partial<ContactMessage>
        Update: Partial<ContactMessage>
        Relationships: []
      }
      audit_logs: {
        Row: AuditLog
        Insert: Partial<AuditLog>
        Update: Partial<AuditLog>
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
