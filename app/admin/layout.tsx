import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/session'
import styles from "./admin.module.scss"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value

  if (!token) {
    redirect('/login')
  }

  const payload = verifyToken(token)

  if (!payload) {
    redirect('/login')
  }

  // If super admin, redirect to manage-companies unless already there
  if (payload.isSuperAdmin) {
    // Allow access to manage-companies page only
    // This will be handled by each individual page
  }

  return (
    <div className={styles.adminLayout}>
      <main className={styles.mainContent}>{children}</main>
    </div>
  )
}
