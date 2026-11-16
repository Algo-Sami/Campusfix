# CampusFix — Core User Flows

## 1. Student / Faculty Journey

```mermaid
flowchart TD
    A[Public Landing Page /] --> B{Signed In?}
    B -- No --> C[Sign Up / Login]
    B -- Yes --> D[Student Dashboard /dashboard]
    C --> E[Trigger creates Student Profile]
    E --> D
    D --> F[Browse Feed /issues]
    D --> G[Report Issue /issues/new]
    D --> H[My Reports /my-issues]
    D --> I[Notifications /notifications]
    
    G --> J[Step 1: Duplicate Search]
    J -- Match Found --> K[Upvote Existing Issue]
    J -- Unique --> L[Step 2: Fill Details & Submit]
    L --> M[Issue Detail /issues/:id]
    
    F --> N[Filter & Upvote Issues]
    N --> M
    
    M -- If Open --> O[Edit / Delete Issue]
    M -- If Resolved --> P[Submit Resolution Feedback]
```

---

## 2. Administrator Triage & Resolution Journey

```mermaid
flowchart TD
    AdminLogin[Admin Login] --> RoleCheck{Role == 'admin'?}
    RoleCheck -- No --> Denied[Redirect to /dashboard]
    RoleCheck -- Yes --> AdminDash[/admin - Overview & KPIs]
    
    AdminDash --> Triage[/admin/issues - Triage Table]
    AdminDash --> Analytics[/admin/analytics - Performance]
    AdminDash --> Users[/admin/users - Role Control]
    AdminDash --> Settings[/admin/settings - Campus Config]
    
    Triage --> Detail[/admin/issues/:id - Control Center]
    Detail --> Action1[Adjust Urgency / Priority]
    Detail --> Action2[Assign Maintenance Team]
    Detail --> Action3[Post Official Public Update]
    Detail --> Action4[Save Confidential Internal Note]
    Detail --> Action5[Change Status with Mandatory Notes]
    
    Action5 --> Notif[In-App Notification Sent to Reporter]
```

---

## 3. Issue Status State Machine

```mermaid
stateDiagram-v2
    [*] --> Open: User reports issue
    Open --> In_Progress: Admin assigns team & starts work
    Open --> Rejected: Admin rejects (Reason mandatory)
    In_Progress --> Resolved: Admin completes fix (Notes mandatory)
    In_Progress --> Rejected: Cannot fix / duplicate (Reason mandatory)
    Resolved --> Closed: Verified / timeout
    Resolved --> In_Progress: Reopened (Reporter unconfirmed)
    Closed --> In_Progress: Admin reopened (Reason mandatory)
    Rejected --> [*]: Terminal state
    Closed --> [*]: Archived
```
