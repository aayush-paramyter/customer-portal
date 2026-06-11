import { contactDisplayName, contactInitials } from '../hooks/usePortalProfile'

export default function PortalUserSummary({ profile, loading = false }) {
  if (loading) {
    return (
      <div className="flex items-center gap-sm">
        <div className="w-8 h-8 rounded-full bg-surface-container-highest animate-pulse shrink-0" />
        <div className="flex flex-col gap-1 min-w-0">
          <div className="h-3 w-24 bg-surface-container-highest rounded animate-pulse" />
          <div className="h-2 w-16 bg-surface-container-highest rounded animate-pulse" />
        </div>
      </div>
    )
  }

  if (!profile) return null

  const name = contactDisplayName(profile)
  const company = profile.account_name || ''

  return (
    <div className="flex items-center gap-sm min-w-0">
      <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-label-md shrink-0">
        {contactInitials(profile)}
      </div>
      <div className="flex flex-col overflow-hidden min-w-0">
        <span className="font-label-md text-label-md font-bold truncate">{name}</span>
        {company ? (
          <span className="font-mono-sm text-mono-sm text-secondary truncate text-xs">{company}</span>
        ) : null}
      </div>
    </div>
  )
}
