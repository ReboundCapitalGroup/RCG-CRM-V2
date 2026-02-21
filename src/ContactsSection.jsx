import React from 'react'
import { Phone, Mail, MapPin, Users, Calendar } from 'lucide-react'

export default function ContactsSection({ contacts, onSkipTrace }) {
  if (!contacts || contacts.length === 0) {
    return (
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <div className="text-center py-8">
          <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 mb-4">No contacts added yet</p>
          <button
            onClick={onSkipTrace}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-lg font-medium"
          >
            Additional Details This Lead
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {contacts.map(contact => (
        <div key={contact.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          {/* Contact Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-bold text-white">{contact.full_name}</h3>
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
                Additional Detailsd
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Phone Numbers */}
            {contact.phones && contact.phones.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-amber-400" />
                  Phone Numbers ({contact.phones.length})
                </h4>
                <div className="space-y-2">
                  {contact.phones.map(phone => (
                    <div key={phone.id} className="flex items-center justify-between p-2 bg-slate-900/50 rounded-lg">
                      <div>
                        <a href={`tel:${phone.phone_number}`} className="text-white hover:text-amber-400 font-medium">
                          {phone.phone_number}
                        </a>
                        <span className="text-slate-500 text-xs ml-2">({phone.phone_type})</span>
                      </div>
                      {phone.is_verified && (
                        <span className="text-xs text-emerald-400">✓ Verified</span>
                      )}
                      {phone.is_disconnected && (
                        <span className="text-xs text-red-400">Disconnected</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Emails */}
            {contact.emails && contact.emails.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-amber-400" />
                  Email Addresses ({contact.emails.length})
                </h4>
                <div className="space-y-2">
                  {contact.emails.map(email => (
                    <div key={email.id} className="flex items-center justify-between p-2 bg-slate-900/50 rounded-lg">
                      <div>
                        <a href={`mailto:${email.email_address}`} className="text-white hover:text-amber-400 font-medium break-all">
                          {email.email_address}
                        </a>
                        <span className="text-slate-500 text-xs ml-2">({email.email_type})</span>
                      </div>
                      {email.is_verified && (
                        <span className="text-xs text-emerald-400">✓ Verified</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Address */}
          {(contact.current_address || contact.current_city) && (
            <div className="mt-4 pt-4 border-t border-slate-700/50">
              <h4 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400" />
                Current Address
              </h4>
              <p className="text-white">
                {contact.current_address && <span>{contact.current_address}<br /></span>}
                {contact.current_city && <span>{contact.current_city}</span>}
                {contact.current_state && <span>, {contact.current_state}</span>}
                {contact.current_zip && <span> {contact.current_zip}</span>}
              </p>
            </div>
          )}

          {/* Relatives */}
          {contact.relatives && contact.relatives.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-700/50">
              <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                Relatives & Associates ({contact.relatives.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {contact.relatives.map(relative => (
                  <div key={relative.id} className="p-2 bg-slate-900/30 rounded-lg text-sm">
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
            <div className="mt-4 pt-4 border-t border-slate-700/50">
              <h4 className="text-sm font-semibold text-slate-300 mb-2">Notes</h4>
              <p className="text-slate-400 text-sm">{contact.notes}</p>
            </div>
          )}
        </div>
      ))}

      {/* Add Another Contact Button */}
      <button
        onClick={onSkipTrace}
        className="w-full py-3 border-2 border-dashed border-slate-600 hover:border-amber-500 text-slate-400 hover:text-amber-400 rounded-xl font-medium transition-colors"
      >
        + Additional Details Another Contact
      </button>
    </div>
  )
}
