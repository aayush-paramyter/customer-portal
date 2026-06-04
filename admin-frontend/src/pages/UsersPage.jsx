import { useCallback, useEffect, useState } from 'react'
import { fetchCrmUsers, fetchPortalAdmins, togglePortalAdmin } from '../api/crmClient'
import AdminLayout from '../components/AdminLayout'

function isSystemAdmin(user) {
  const role = String(user.role || '').toLowerCase()
  return role === 'system_admin' || role === 'system admin'
}

function displayName(user) {
  return user.fullname || [user.first_name, user.last_name].filter(Boolean).join(' ') || user.username
}

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [adminIds, setAdminIds] = useState(new Set())
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [togglingId, setTogglingId] = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    Promise.all([fetchCrmUsers(), fetchPortalAdmins()])
      .then(([userList, admins]) => {
        setUsers(Array.isArray(userList) ? userList : [])
        setAdminIds(new Set((admins || []).map((a) => a.user_id)))
        setError('')
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const onToggle = async (user) => {
    if (isSystemAdmin(user)) return
    const enabled = !adminIds.has(user.id)
    setTogglingId(user.id)
    setError('')
    try {
      await togglePortalAdmin(user.id, enabled)
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setTogglingId(null)
    }
  }

  return (
    <AdminLayout 
      title="User Management"
      subtitle="CRM employees who can access this Customer Portal admin area."
    >
      {error && (
        <div className="alert-error" role="alert">
          <span className="material-symbols-outlined">error</span>
          <span>{error}</span>
        </div>
      )}

      {/* ── Table ── */}
      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Portal Admin Access</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="table-empty">
                  <span className="material-symbols-outlined spin" style={{ fontSize: 28, color: 'var(--color-primary)' }}>progress_activity</span>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={4} className="table-empty">
                  <span className="material-symbols-outlined" style={{ fontSize: 40, color: 'var(--color-outline)', display: 'block', marginBottom: 8 }}>inbox</span>
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => {
                const sysAdmin = isSystemAdmin(user)
                const hasAccess = sysAdmin || adminIds.has(user.id)
                return (
                  <tr key={user.id} className="data-table-row">
                    <td className="table-cell-subject">{displayName(user)}</td>
                    <td className="table-cell-muted">{user.email || '—'}</td>
                    <td className="table-cell-muted">{String(user.role || '—')}</td>
                    <td>
                      {sysAdmin ? (
                        <span className="table-badge badge-blue">Always (system admin)</span>
                      ) : (
                        <div className="flex items-center gap-sm">
                          <input
                            id={`user-toggle-${user.id}`}
                            checked={hasAccess}
                            disabled={togglingId === user.id}
                            onChange={() => onToggle(user)}
                            type="checkbox"
                          />
                          <label 
                            htmlFor={`user-toggle-${user.id}`} 
                            className="font-medium text-body-md" 
                            style={{ cursor: 'pointer', margin: 0, userSelect: 'none' }}
                          >
                            {hasAccess ? 'Enabled' : 'Disabled'}
                          </label>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  )
}
