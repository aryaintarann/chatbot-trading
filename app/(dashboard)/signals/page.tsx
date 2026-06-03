import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SignalsClient } from './SignalsClient'

export const dynamic = 'force-dynamic'

export default async function SignalsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return <SignalsClient userId={user.id} />
}
