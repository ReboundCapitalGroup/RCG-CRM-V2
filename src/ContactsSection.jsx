import React, { useState } from 'react'
import { Phone, Mail, MapPin, Users, Calendar } from 'lucide-react'

export default function ContactsSection({ contacts, lead, onSkipTrace }) {
  const [selectedTarget, setSelectedTarget] = useState('')

  // Parse defendants from lead
  const defendants = lead?.defendants ? lead.defendants.split(';').map(d => d.trim()).filter(Boolean) : []
  
  // Build dropdown options
  const traceOptions = [
    ...defendants.map(def => ({ value: `defendant:${def}`, label: `Defendant: ${def}`, name: def, type: 'defendant' })),
    { value: `address:${lead?.property_address}`, label: `Property: ${lead?.property_address}`, name: lead?.property_address, type: 'address' }
  ].filter(opt => opt.name)

  const handleSkipTrace = () => {
    if (!selectedTarget) {
      alert('Please select who/what to skip trace')
      return
    }

    const selected = traceOptions.find(opt => opt.value === selectedTarget)
    onSkipTrace(selected)
  }

  // Show contacts if they exist
  if (contacts && contacts.length > 0) {
    return (
      <div className="space-y-4">
        {contacts.map(contact => (
          <div key={contact.id} className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/30">
            {/* Contact Header */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-lg font-bold text-white">{contact.full_name}</h4>
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                    contact.contact_type === 'defendant' ? 'bg-amber-500/20 text-amber-400' :
                    contact.contact_type === 'relative' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-slate-500/20 text-slate-400'
                  }`}>
                    {contact.contact_type}
                  </span>
                </div>
                {contact.age && <p className="text-slate-400 text-sm">Age: {contact.age}</p>}
                {contact.relationship && (
                  <p className="text-slate-400 text-sm capitalize">Relationship: {contact.relationship}</p>
                )}
              </div>
              {contact.skip_traced && (
                <div className="flex items-center gap-1 text-xs text-emerald-400">
                  <Calendar className="w-3 h-3" />
                  Skip Traced
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Phone Numbers */}
              {contact.phones && contact.phones.length > 0 && (
                <div>
                  <h5 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-amber-400" />
                    Phones ({contact.phones.length})
                  </h5>
                  <div className="space-y-1">
                    {contact.phones.map(phone => (
                      <div key={phone.id} className="flex items-center justify-between p-2 bg-slate-800/50 rounded text-sm">
                        <div>
                          <a href={`tel:${phone.phone_number}`} className="text-white hover:text-amber-400 font-medium">
                            {phone.phone_number}
                          </a>
                          <span className="text-slate-500 text-xs ml-2">({phone.phone_type})</span>
                        </div>
                        {phone.is_verified && (
                          <span className="text-xs text-emerald-400">✓</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Emails */}
              {contact.emails && contact.emails.length > 0 && (
                <div>
                  <h5 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-amber-400" />
                    Emails ({contact.emails.length})
                  </h5>
                  <div className="space-y-1">
                    {contact.emails.map(email => (
                      <div key={email.id} className="p-2 bg-slate-800/50 rounded text-sm">
                        <a href={`mailto:${email.email_address}`} className="text-white hover:text-amber-400 font-medium break-all">
                          {email.email_address}
                        </a>
                        <span className="text-slate-500 text-xs ml-2">({email.email_type})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Address */}
            {(contact.current_address || contact.current_city) && (
              <div className="mt-3 pt-3 border-t border-slate-700/30">
                <h5 className="text-sm font-semibold text-slate-300 mb-1 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-400" />
                  Address
                </h5>
                <p className="text-white text-sm">
                  {contact.current_address && <span>{contact.current_address}<br /></span>}
                  {contact.current_city && <span>{contact.current_city}</span>}
                  {contact.current_state && <span>, {contact.current_state}</span>}
                  {contact.current_zip && <span> {contact.current_zip}</span>}
                </p>
              </div>
            )}

            {/* Relatives */}
            {contact.relatives && contact.relatives.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-700/30">
                <h5 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-400" />
                  Relatives ({contact.relatives.length})
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {contact.relatives.map(relative => (
                    <div key={relative.id} className="p-2 bg-slate-800/30 rounded text-sm">
                      <p className="text-white font-medium">{relative.relative?.full_name || 'Unknown'}</p>
                      {relative.relationship_type && (
                        <p className="text-slate-400 text-xs capitalize">{relative.relationship_type}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {contact.notes && (
              <div className="mt-3 pt-3 border-t border-slate-700/30">
                <h5 className="text-sm font-semibold text-slate-300 mb-1">Notes</h5>
                <p className="text-slate-400 text-sm">{contact.notes}</p>
              </div>
            )}
          </div>
        ))}

        {/* Add Another Contact */}
        <div className="bg-slate-900/30 rounded-lg p-4 border border-slate-700/30">
          <h4 className="text-sm font-semibold text-slate-300 mb-3">Skip Trace Another Contact</h4>
          
          {/* Defendants List */}
          {defendants.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-slate-400 mb-2">Defendants:</p>
              <div className="space-y-1">
                {defendants.map((def, i) => (
                  <p key={i} className="text-white text-sm">• {def}</p>
                ))}
              </div>
            </div>
          )}

          {/* Property Address */}
          {lead?.property_address && (
            <div className="mb-4">
              <p className="text-xs text-slate-400 mb-1">Property Address:</p>
              <p className="text-white text-sm">{lead.property_address}</p>
            </div>
          )}

          {/* Dropdown Selector */}
          <div className="space-y-3">
            <select 
              value={selectedTarget}
              onChange={e => setSelectedTarget(e.target.value)}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-600 text-white rounded-lg focus:outline-none focus:border-amber-500"
            >
              <option value="">Select who/what to skip trace...</option>
              {traceOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <button
              onClick={handleSkipTrace}
              disabled={!selectedTarget}
              className="w-full py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              Skip Trace Selected
            </button>
          </div>
        </div>
      </div>
    )
  }

  // No contacts yet - show initial skip trace section
  return (
    <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/30">
      <div className="text-center mb-4">
        <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <p className="text-slate-400 mb-4">No contacts added yet</p>
      </div>

      {/* Defendants List */}
      {defendants.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-semibold text-slate-300 mb-2">Defendants:</p>
          <div className="space-y-1">
            {defendants.map((def, i) => (
              <p key={i} className="text-white text-sm">• {def}</p>
            ))}
          </div>
        </div>
      )}

      {/* Property Address */}
      {lead?.property_address && (
        <div className="mb-4">
          <p className="text-sm font-semibold text-slate-300 mb-2">Property Address:</p>
          <p className="text-white text-sm">{lead.property_address}</p>
        </div>
      )}

      {/* Dropdown Selector */}
      <div className="space-y-3">
        <select 
          value={selectedTarget}
          onChange={e => setSelectedTarget(e.target.value)}
          className="w-full px-4 py-2 bg-slate-800 border border-slate-600 text-white rounded-lg focus:outline-none focus:border-amber-500"
        >
          <option value="">Select who/what to skip trace...</option>
          {traceOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <button
          onClick={handleSkipTrace}
          disabled={!selectedTarget}
          className="w-full py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
        >
          Skip Trace Selected
        </button>
      </div>
    </div>
  )
}
