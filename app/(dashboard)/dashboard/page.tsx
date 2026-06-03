import { DashboardClient } from './DashboardClient'

const PERSONAL_USER_ID = process.env.PERSONAL_USER_ID ?? '00000000-0000-0000-0000-000000000001'

export const dynamic = 'force-dynamic'

export default function DashboardPage() {
  return <DashboardClient userId={PERSONAL_USER_ID} />
}
