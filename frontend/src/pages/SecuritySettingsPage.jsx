import { useState } from 'react'
import PortalLayout from '../components/PortalLayout'

function PasswordInput({ id, label, value, onChange, placeholder }) {
  const [show, setShow] = useState(false)
  return (
    <div className="form-group">
      <label className="form-label" htmlFor={id}>{label}</label>
      <div className="form-input-icon-wrap">
        <input
          id={id}
          className="form-input"
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          style={{ paddingRight: 44 }}
          autoComplete="new-password"
        />
        <button
          type="button"
          className="form-input-icon-btn"
          onClick={() => setShow(v => !v)}
          aria-label={show ? 'Hide password' : 'Show password'}
          tabIndex={-1}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--color-text-tertiary)' }}>
            {show ? 'visibility_off' : 'visibility_off'}
          </span>
        </button>
      </div>
    </div>
  )
}

function RequirementRow({ met, label }) {
  return (
    <li className={`pwd-req-item${met ? ' pwd-req-item--met' : ''}`}>
      <span className="material-symbols-outlined pwd-req-icon">
        {met ? 'check_circle' : 'radio_button_unchecked'}
      </span>
      <span>{label}</span>
    </li>
  )
}

export default function SecuritySettingsPage() {
  const [current,  setCurrent]  = useState('')
  const [newPwd,   setNewPwd]   = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [loading,  setLoading]  = useState(false)
  const [success,  setSuccess]  = useState(false)
  const [error,    setError]    = useState('')

  const reqs = {
    length:    newPwd.length >= 8,
    uppercase: /[A-Z]/.test(newPwd),
    lowercase: /[a-z]/.test(newPwd),
    number:    /\d/.test(newPwd),
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (newPwd !== confirm) {
      setError('New passwords do not match.')
      return
    }
    if (!Object.values(reqs).every(Boolean)) {
      setError('Password does not meet all requirements.')
      return
    }
    setLoading(true)
    await new Promise(r => setTimeout(r, 700))
    setLoading(false)
    setSuccess(true)
    setCurrent(''); setNewPwd(''); setConfirm('')
    setTimeout(() => setSuccess(false), 4000)
  }

  return (
    <PortalLayout
      title="Security Settings"
      subtitle="Manage your account security and password preferences."
    >
      <div className="form-page-wrap">
        <div className="form-card" id="security-settings-panel">

          {/* ── Change Password section ── */}
          <div className="security-section-header">
            <div>
              <h3 className="security-section-title">Change Password</h3>
              <p className="security-section-sub">Ensure your account is using a long, random password to stay secure.</p>
            </div>
          </div>

          <div className="form-divider" />

          <form onSubmit={handleSubmit} id="change-password-form">
            <PasswordInput
              id="currentPassword"
              label="Current Password"
              value={current}
              onChange={e => setCurrent(e.target.value)}
              placeholder="Enter current password"
            />
            <PasswordInput
              id="newPassword"
              label="New Password"
              value={newPwd}
              onChange={e => setNewPwd(e.target.value)}
              placeholder="Enter new password"
            />
            <PasswordInput
              id="confirmPassword"
              label="Confirm New Password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="Confirm new password"
            />

            {/* Password requirements */}
            <div className="pwd-requirements-box">
              <p className="pwd-req-heading">Password Requirements:</p>
              <ul className="pwd-req-list">
                <RequirementRow met={reqs.length}    label="At least 8 characters long" />
                <RequirementRow met={reqs.uppercase} label="Contains an uppercase letter" />
                <RequirementRow met={reqs.lowercase} label="Contains a lowercase letter" />
                <RequirementRow met={reqs.number}    label="Contains a number" />
              </ul>
            </div>

            {error   && <div className="alert-error">{error}</div>}
            {success && (
              <div className="alert-success">
                <span className="material-symbols-outlined" style={{ fontSize: 18, verticalAlign: 'middle', marginRight: 6 }}>check_circle</span>
                Password updated successfully.
              </div>
            )}

            <div className="form-actions">
              <button
                type="button"
                className="btn-ghost"
                onClick={() => { setCurrent(''); setNewPwd(''); setConfirm(''); setError('') }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading || !current}
                id="update-password-btn"
              >
                {loading ? (
                  <><span className="material-symbols-outlined spin" style={{ fontSize: 17, verticalAlign: 'middle', marginRight: 5 }}>progress_activity</span>Updating…</>
                ) : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </PortalLayout>
  )
}
