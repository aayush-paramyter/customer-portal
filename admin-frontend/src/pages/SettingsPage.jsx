import { useEffect, useState } from 'react'
import { fetchPortalSettings, updatePortalSettings } from '../api/crmClient'
import AdminLayout from '../components/AdminLayout'

export default function SettingsPage() {
  const [settings, setSettings] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchPortalSettings()
      .then(setSettings)
      .catch((err) => setError(err.message))
  }, [])

  const saveSettings = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess(false)
    try {
      await updatePortalSettings({
        auth_method: settings.auth_method,
        allow_case_creation: settings.allow_case_creation,
        allow_case_comments: settings.allow_case_comments,
      })
      setSuccess(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (!settings) {
    return (
      <AdminLayout title="Settings">
        <div className="flex flex-col items-center justify-center py-2xl">
          <span className="material-symbols-outlined spin text-[40px]" style={{ color: 'var(--color-primary)' }}>progress_activity</span>
          <p className="text-body-md text-on-surface-variant mt-sm">Loading portal settings...</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout 
      title="Settings"
      subtitle="Configure how your customers sign in and use the client portal."
    >
      {error && (
        <div className="alert-error" role="alert">
          <span className="material-symbols-outlined">error</span>
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert-success" role="alert">
          <span className="material-symbols-outlined">check_circle</span>
          <span>Portal settings updated successfully.</span>
        </div>
      )}

      <div className="form-card max-w-[600px]">
        <div className="form-section-header">
          <span className="material-symbols-outlined form-section-icon">display_settings</span>
          <h3 className="form-section-title">Client Portal Configuration</h3>
        </div>
        <form onSubmit={saveSettings} className="flex flex-col gap-lg mt-md">
          <div className="form-group">
            <label className="form-label" htmlFor="authMethod">Sign-in Method</label>
            <div className="form-select-wrap">
              <select
                id="authMethod"
                className="form-select"
                value={settings.auth_method}
                onChange={(e) => setSettings((s) => ({ ...s, auth_method: e.target.value }))}
              >
                <option value="both">Email + Magic Link</option>
                <option value="password">Password Only</option>
                <option value="magic_link">Magic Link Only</option>
              </select>
              <span className="material-symbols-outlined form-select-icon">expand_more</span>
            </div>
          </div>

          <div className="flex flex-col gap-md">
            <div className="flex items-center gap-sm">
              <input
                id="allowCaseCreation"
                checked={settings.allow_case_creation}
                type="checkbox"
                onChange={(e) => setSettings((s) => ({ ...s, allow_case_creation: e.target.checked }))}
              />
              <label 
                htmlFor="allowCaseCreation" 
                className="font-medium text-body-md" 
                style={{ cursor: 'pointer', margin: 0, userSelect: 'none' }}
              >
                Allow customers to create cases
              </label>
            </div>

            <div className="flex items-center gap-sm">
              <input
                id="allowCaseComments"
                checked={settings.allow_case_comments}
                type="checkbox"
                onChange={(e) => setSettings((s) => ({ ...s, allow_case_comments: e.target.checked }))}
              />
              <label 
                htmlFor="allowCaseComments" 
                className="font-medium text-body-md" 
                style={{ cursor: 'pointer', margin: 0, userSelect: 'none' }}
              >
                Allow customers to comment on cases
              </label>
            </div>
          </div>

          <button className="btn-primary w-full flex items-center justify-center gap-xs mt-sm" disabled={saving} type="submit">
            {saving ? (
              <>
                <span className="material-symbols-outlined spin text-[20px]">progress_activity</span>
                <span>Saving…</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[20px]">save</span>
                <span>Save Settings</span>
              </>
            )}
          </button>
        </form>
      </div>
    </AdminLayout>
  )
}
