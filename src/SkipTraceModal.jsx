import React, { useState, useEffect } from 'react'
import { X, Plus, Trash2, User, Phone, Mail, Users } from 'lucide-react'

export default function SkipTraceModal({ leadId, defendantName, existingContact, onClose, onSave }) {
  const [contact, setContact] = useState({
    full_name: defendantName || '',
    age: '',
    phones: [{ number: '', type: 'mobile' }],
    emails: [{ email: '', type: 'personal' }],
    address: '',
    city: '',
    state: '',
    zip: '',
    notes: ''
  })
  
  const [relatives, setRelatives] = useState([])
  const [showRelatives, setShowRelatives] = useState(false)

  // Load existing contact data when modal opens
  useEffect(() => {
    if (existingContact) {
      console.log('📋 Loading existing contact:', existingContact)
      setContact({
        full_name: existingContact.full_name || defendantName || '',
        age: existingContact.age || '',
        phones: existingContact.phones && existingContact.phones.length > 0 
          ? existingContact.phones.map(p => ({ number: p.phone_number, type: p.phone_type }))
          : [{ number: '', type: 'mobile' }],
        emails: existingContact.emails && existingContact.emails.length > 0
          ? existingContact.emails.map(e => ({ email: e.email_address, type: e.email_type }))
          : [{ email: '', type: 'personal' }],
        address: existingContact.addresses && existingContact.addresses.length > 0 
          ? existingContact.addresses[0].street_address 
          : '',
        city: existingContact.addresses && existingContact.addresses.length > 0 
          ? existingContact.addresses[0].city 
          : '',
        state: existingContact.addresses && existingContact.addresses.length > 0 
          ? existingContact.addresses[0].state 
          : '',
        zip: existingContact.addresses && existingContact.addresses.length > 0 
          ? existingContact.addresses[0].zip_code 
          : '',
        notes: existingContact.notes || ''
      })
    }
  }, [existingContact, defendantName])

  const addPhone = () => {
    setContact({ ...contact, phones: [...contact.phones, { number: '', type: 'mobile' }] })
  }

  const removePhone = (index) => {
    setContact({ ...contact, phones: contact.phones.filter((_, i) => i !== index) })
  }

  const updatePhone = (index, field, value) => {
    const newPhones = [...contact.phones]
    newPhones[index][field] = value
    setContact({ ...contact, phones: newPhones })
  }

  const addEmail = () => {
    setContact({ ...contact, emails: [...contact.emails, { email: '', type: 'personal' }] })
  }

  const removeEmail = (index) => {
    setContact({ ...contact, emails: contact.emails.filter((_, i) => i !== index) })
  }

  const updateEmail = (index, field, value) => {
    const newEmails = [...contact.emails]
    newEmails[index][field] = value
    setContact({ ...contact, emails: newEmails })
  }

  const addRelative = () => {
    setRelatives([...relatives, { name: '', relationship: '', phones: [{ number: '', type: 'mobile' }], emails: [] }])
  }

  const removeRelative = (index) => {
    setRelatives(relatives.filter((_, i) => i !== index))
  }

  const updateRelative = (index, field, value) => {
    const newRelatives = [...relatives]
    newRelatives[index][field] = value
    setRelatives(newRelatives)
  }

  const addRelativePhone = (relIndex) => {
    const newRelatives = [...relatives]
    newRelatives[relIndex].phones.push({ number: '', type: 'mobile' })
    setRelatives(newRelatives)
  }

  const updateRelativePhone = (relIndex, phoneIndex, field, value) => {
    const newRelatives = [...relatives]
    newRelatives[relIndex].phones[phoneIndex][field] = value
    setRelatives(newRelatives)
  }

  const handleSave = () => {
    console.log('🔵 handleSave called')
    console.log('🔵 Contact object:', contact)
    console.log('🔵 Contact.full_name:', contact.full_name)
    console.log('🔵 Contact.phones:', contact.phones)
    console.log('🔵 Contact.emails:', contact.emails)
    console.log('🔵 Contact.address:', contact.address)
    console.log('🔵 Relatives array:', relatives)
    
    // Validate
    if (!contact.full_name.trim()) {
      alert('Name is required')
      return
    }
    
    const dataToSend = { contact, relatives }
    console.log('✅ Validation passed')
    console.log('✅ Sending this data to onSave:', dataToSend)
    console.log('✅ Type of onSave:', typeof onSave)
    
    onSave(dataToSend)
    console.log('✅ onSave has been called')
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <User className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Additional Lead Details</h2>
              <p className="text-sm text-slate-400">Add or update contact information</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Basic Info */}
          <div className="bg-slate-900/50 rounded-xl p-4 space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <User className="w-5 h-5 text-amber-400" />
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">Full Name *</label>
                <input
                  value={contact.full_name}
                  onChange={e => setContact({ ...contact, full_name: e.target.value })}
                  placeholder="John Smith"
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Age</label>
                <input
                  type="number"
                  value={contact.age}
                  onChange={e => setContact({ ...contact, age: e.target.value })}
                  placeholder="45"
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Phone Numbers */}
          <div className="bg-slate-900/50 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Phone className="w-5 h-5 text-amber-400" />
                Phone Numbers *
              </h3>
              <button onClick={addPhone} className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm flex items-center gap-1">
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
            {contact.phones.map((phone, index) => (
              <div key={index} className="flex gap-2">
                <input
                  value={phone.number}
                  onChange={e => updatePhone(index, 'number', e.target.value)}
                  placeholder="(305) 555-1234"
                  className="flex-1 px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
                />
                <select
                  value={phone.type}
                  onChange={e => updatePhone(index, 'type', e.target.value)}
                  className="px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="mobile">Mobile</option>
                  <option value="home">Home</option>
                  <option value="work">Work</option>
                  <option value="other">Other</option>
                </select>
                {contact.phones.length > 1 && (
                  <button onClick={() => removePhone(index)} className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg">
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Emails */}
          <div className="bg-slate-900/50 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-amber-400" />
                Email Addresses
              </h3>
              <button onClick={addEmail} className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm flex items-center gap-1">
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
            {contact.emails.map((email, index) => (
              <div key={index} className="flex gap-2">
                <input
                  value={email.email}
                  onChange={e => updateEmail(index, 'email', e.target.value)}
                  placeholder="john@email.com"
                  type="email"
                  className="flex-1 px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
                />
                <select
                  value={email.type}
                  onChange={e => updateEmail(index, 'type', e.target.value)}
                  className="px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="personal">Personal</option>
                  <option value="work">Work</option>
                  <option value="other">Other</option>
                </select>
                {contact.emails.length > 1 && (
                  <button onClick={() => removeEmail(index)} className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg">
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Address */}
          <div className="bg-slate-900/50 rounded-xl p-4 space-y-4">
            <h3 className="text-lg font-semibold text-white">Current Address</h3>
            <input
              value={contact.address}
              onChange={e => setContact({ ...contact, address: e.target.value })}
              placeholder="123 Main St"
              className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
            />
            <div className="grid grid-cols-3 gap-4">
              <input
                value={contact.city}
                onChange={e => setContact({ ...contact, city: e.target.value })}
                placeholder="Miami"
                className="px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
              />
              <input
                value={contact.state}
                onChange={e => setContact({ ...contact, state: e.target.value })}
                placeholder="FL"
                maxLength={2}
                className="px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
              />
              <input
                value={contact.zip}
                onChange={e => setContact({ ...contact, zip: e.target.value })}
                placeholder="33101"
                className="px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="bg-slate-900/50 rounded-xl p-4 space-y-4">
            <h3 className="text-lg font-semibold text-white">Notes</h3>
            <textarea
              value={contact.notes}
              onChange={e => setContact({ ...contact, notes: e.target.value })}
              placeholder="Additional notes..."
              rows={3}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white resize-none focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Relatives Section */}
          <div className="bg-slate-900/50 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" />
                Relatives & Associates
              </h3>
              <button onClick={() => setShowRelatives(!showRelatives)} className="text-sm text-amber-400 hover:text-amber-300">
                {showRelatives ? 'Hide' : 'Show'}
              </button>
            </div>
            
            {showRelatives && (
              <>
                {relatives.map((relative, relIndex) => (
                  <div key={relIndex} className="p-4 bg-slate-800 rounded-lg space-y-3 border border-slate-700">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-white">Relative {relIndex + 1}</h4>
                      <button onClick={() => removeRelative(relIndex)} className="p-1 hover:bg-red-500/20 text-red-400 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        value={relative.name}
                        onChange={e => updateRelative(relIndex, 'name', e.target.value)}
                        placeholder="Name"
                        className="px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"
                      />
                      <select
                        value={relative.relationship}
                        onChange={e => updateRelative(relIndex, 'relationship', e.target.value)}
                        className="px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"
                      >
                        <option value="">Relationship...</option>
                        <option value="spouse">Spouse</option>
                        <option value="parent">Parent</option>
                        <option value="child">Child</option>
                        <option value="sibling">Sibling</option>
                        <option value="associate">Associate</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    {relative.phones.map((phone, phoneIndex) => (
                      <input
                        key={phoneIndex}
                        value={phone.number}
                        onChange={e => updateRelativePhone(relIndex, phoneIndex, 'number', e.target.value)}
                        placeholder="Phone"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"
                      />
                    ))}
                    <button onClick={() => addRelativePhone(relIndex)} className="text-xs text-amber-400 hover:text-amber-300">
                      + Add Phone
                    </button>
                  </div>
                ))}
                <button onClick={addRelative} className="w-full py-2 border-2 border-dashed border-slate-600 hover:border-amber-500 text-slate-400 hover:text-amber-400 rounded-lg text-sm transition-colors">
                  + Add Relative/Associate
                </button>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-slate-700 bg-slate-900/30">
          <p className="text-sm text-slate-400">* Required fields</p>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium">
              Cancel
            </button>
            <button onClick={handleSave} className="px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-lg font-medium">
              Save to CRM
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
