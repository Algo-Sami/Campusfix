import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import AdminLayoutComponent from '@/components/layout/AdminLayout'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/admin')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    // Access denied for non-admin
    redirect('/dashboard?error=admin_access_required')
  }

  return <AdminLayoutComponent profile={profile}>{children}</AdminLayoutComponent>
}
