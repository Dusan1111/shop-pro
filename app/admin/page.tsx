import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/session'

export default async function AdminPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value

  if (!token) {
    redirect('/login')
  }

  const payload = verifyToken(token)
  if (!payload) {
    redirect('/login')
  }

  // If super admin, redirect to manage-companies
  if (payload.isSuperAdmin) {
    redirect('/admin/manage-companies')
  }

  // Regular users go to their default admin page (e.g., products or categories)
  redirect('/admin/manage-products')
}
