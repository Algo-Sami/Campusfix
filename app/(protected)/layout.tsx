import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import DashboardLayout from '@/components/layout/DashboardLayout'

export const dynamic = 'force-dynamic'

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    // Profile creation might have failed — sign out for safety
    redirect('/login?error=no_profile')
  }

  if (profile.role === 'admin') {
    redirect('/admin')
  }

  return <DashboardLayout profile={profile}>{children}</DashboardLayout>
}
