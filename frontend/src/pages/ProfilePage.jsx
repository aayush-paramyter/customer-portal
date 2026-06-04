import { useState } from 'react'
import PortalLayout from '../components/PortalLayout'

const US_STATES = [
  'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut',
  'Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa',
  'Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan',
  'Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada',
  'New Hampshire','New Jersey','New Mexico','New York','North Carolina',
  'North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island',
  'South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont',
  'Virginia','Washington','West Virginia','Wisconsin','Wyoming',
]

export default function ProfilePage() {
  const [firstName,  setFirstName]  = useState('Sarah')
  const [lastName,   setLastName]   = useState('Johnson')
  const [phone,      setPhone]      = useState('+1 9876543210')
  const [addressLine,setAddressLine]= useState('')
  const [apartment,  setApartment]  = useState('')
  const [state,      setState]      = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [saved,      setSaved]      = useState(false)
  const [loading,    setLoading]    = useState(false)

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 600))
    setSaved(true)
    setLoading(false)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <PortalLayout
      title="My Profile"
      subtitle="Manage your personal information and preferences."
    >
      <div className="form-page-wrap">
        <form className="form-card" onSubmit={handleSave} id="profile-form">

          {/* ── Contact Information ── */}
          <div className="form-section-header">
            <span className="material-symbols-outlined form-section-icon">person</span>
            <div>
              <h3 className="form-section-title">Contact Information</h3>
            </div>
          </div>

          {/* Avatar row */}
          <div className="profile-avatar-row">
            <div className="profile-avatar">SJ</div>
            <div className="profile-avatar-info">
              <button type="button" className="btn-outline btn-sm" id="change-photo-btn">
                Change Photo
              </button>
              <p className="profile-avatar-hint">Sarah Jenkins · Enterprise Solutions</p>
            </div>
          </div>

          <div className="form-divider" />

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label" htmlFor="firstName">First Name</label>
              <input
                id="firstName"
                className="form-input"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                placeholder="First name"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="lastName">Last Name</label>
              <input
                id="lastName"
                className="form-input"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                placeholder="Last name"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <div className="form-input-with-badge">
              <input
                id="email"
                className="form-input"
                defaultValue="sarah@xyz.com"
                readOnly
                style={{ paddingRight: 140 }}
              />
              <span className="form-input-badge">
                <span className="material-symbols-outlined" style={{ fontSize: 13, verticalAlign: 'middle', marginRight: 3 }}>lock</span>
                Contact manager to change
              </span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="phone">Phone Number</label>
            <input
              id="phone"
              className="form-input"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
              type="tel"
            />
          </div>

          {/* ── Mailing Address ── */}
          <div className="form-section-header" style={{ marginTop: 8 }}>
            <span className="material-symbols-outlined form-section-icon">location_on</span>
            <div>
              <h3 className="form-section-title">Mailing Address</h3>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="addressLine">Address Line</label>
            <input
              id="addressLine"
              className="form-input"
              value={addressLine}
              onChange={e => setAddressLine(e.target.value)}
              placeholder="Street address"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="apartment">Apartment/Suite</label>
            <input
              id="apartment"
              className="form-input"
              value={apartment}
              onChange={e => setApartment(e.target.value)}
              placeholder="Apt, suite, unit, etc. (optional)"
            />
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label" htmlFor="state">State / Province</label>
              <div className="form-select-wrap">
                <select
                  id="state"
                  className="form-select"
                  value={state}
                  onChange={e => setState(e.target.value)}
                >
                  <option value="">Select state…</option>
                  {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <span className="material-symbols-outlined form-select-icon">expand_more</span>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="postalCode">Postal Code</label>
              <input
                id="postalCode"
                className="form-input"
                value={postalCode}
                onChange={e => setPostalCode(e.target.value)}
                placeholder="ZIP / Postal code"
              />
            </div>
          </div>

          {/* ── Company (read-only) ── */}
          <div className="form-section-header" style={{ marginTop: 8 }}>
            <span className="material-symbols-outlined form-section-icon">business</span>
            <div>
              <h3 className="form-section-title">Company</h3>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="company">Company Name</label>
            <input id="company" className="form-input" defaultValue="Enterprise Solutions" readOnly />
          </div>

          {saved && (
            <div className="alert-success">
              <span className="material-symbols-outlined" style={{ fontSize: 18, verticalAlign: 'middle', marginRight: 6 }}>check_circle</span>
              Profile updated successfully.
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="btn-ghost" onClick={() => {}}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading} id="save-profile-btn">
              {loading ? (
                <><span className="material-symbols-outlined spin" style={{ fontSize: 17, verticalAlign: 'middle', marginRight: 5 }}>progress_activity</span>Saving…</>
              ) : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </PortalLayout>
  )
}
